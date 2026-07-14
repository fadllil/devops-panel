import api from "./client"
import type { ApiResponse, RoleListParams, RoleListResponse, RoleSummary } from "../types/auth"

export async function getRoles(): Promise<RoleSummary[]> {
  const { data } = await api.get<ApiResponse<RoleSummary[]>>("/web/role/list")
  return data.results
}

export async function getRolePage(params: RoleListParams = {}): Promise<RoleListResponse> {
  const { data } = await api.get<ApiResponse<RoleListResponse>>("/web/role/", {
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

export async function createRole(payload: { name: string }): Promise<RoleSummary> {
  const { data } = await api.post<ApiResponse<RoleSummary>>("/web/role/create", payload)
  return data.results
}

export async function updateRole(id: string, payload: { name: string }): Promise<RoleSummary> {
  const { data } = await api.put<ApiResponse<RoleSummary>>(`/web/role/update/${id}`, payload)
  return data.results
}

export async function deleteRole(id: string): Promise<void> {
  await api.delete(`/web/role/delete/${id}`)
}
