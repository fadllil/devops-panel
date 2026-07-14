import axios, { type InternalAxiosRequestConfig } from "axios"
import { useAuthStore } from "../stores/auth-store"

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "/api"

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
})

api.interceptors.request.use((config) => {
  if (typeof window === "undefined") {
    return config
  }

  const token = window.localStorage.getItem("devops-access-token")
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as
      | (InternalAxiosRequestConfig & { _retry?: boolean })
      | undefined

    if (!originalRequest || !error.response) {
      return Promise.reject(error)
    }

    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      const userId = window.localStorage.getItem("devops-user-id")
      const accessToken = window.localStorage.getItem("devops-access-token")

      if (!userId || !accessToken) {
        return Promise.reject(error)
      }

      try {
        const refreshResponse = await axios.get<{
          results: { token: string }
        }>(`${API_BASE_URL}/auth/refresh/${userId}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          withCredentials: true,
        })

        const nextToken = refreshResponse.data.results.token
        window.localStorage.setItem("devops-access-token", nextToken)

        originalRequest.headers = {
          ...originalRequest.headers,
          Authorization: `Bearer ${nextToken}`,
        } as typeof originalRequest.headers

        return api(originalRequest)
      } catch (refreshError) {
        useAuthStore.getState().clearCredentials()
        if (typeof window !== "undefined") {
          window.localStorage.removeItem("devops-access-token")
          window.localStorage.removeItem("devops-user-id")
          window.location.replace("/login")
        }
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  },
)

export default api
export { API_BASE_URL }
