import api from "./client"
import type { ApiResponse, LoginRequest, LoginResponse, UserSummary } from "../types/auth"

export async function loginUser(payload: LoginRequest): Promise<LoginResponse> {
  const { data } = await api.post<ApiResponse<LoginResponse>>(
    "/auth/login",
    payload,
  )

  return data.results
}

export async function logoutUser(userId: string): Promise<void> {
  await api.get(`/auth/logout/${userId}`)
}

export async function getUsers(): Promise<UserSummary[]> {
  const { data } = await api.get<ApiResponse<UserSummary[]>>("/web/user/list")
  return data.results
}
