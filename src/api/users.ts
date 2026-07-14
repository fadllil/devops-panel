import api from "./client"
import type {
  ApiResponse,
  CreateUserPayload,
  UpdateUserPayload,
  UserListParams,
  UserListResponse,
  UserSummary,
} from "../types/auth"

export async function getUsers(params: UserListParams = {}): Promise<UserListResponse> {
  const { data } = await api.get<ApiResponse<UserListResponse>>("/web/user/", {
    params: {
      page: params.page ?? 1,
      size: params.size ?? 10,
      search: params.search ?? "",
      sort_field: params.sort_field ?? "created_at",
      sort_by: params.sort_by ?? "DESC",
    },
  })

  return data.results
}

export async function createUser(payload: CreateUserPayload): Promise<UserSummary> {
  const { data } = await api.post<ApiResponse<UserSummary>>("/web/user/create", payload)
  return data.results
}

export async function updateUser(id: string, payload: UpdateUserPayload): Promise<UserSummary> {
  const { data } = await api.put<ApiResponse<UserSummary>>(`/web/user/update/${id}`, payload)
  return data.results
}

export async function deleteUser(id: string): Promise<void> {
  await api.delete(`/web/user/delete/${id}`)
}

export async function updateUserPassword(
  id: string,
  payload: { password: string; confirm_password: string },
): Promise<void> {
  await api.put(`/web/user/update-password/${id}`, payload)
}
