import api from "./client"
import type { ApiResponse, ResourcePermissions } from "../types/auth"

export async function getPermissionList(): Promise<ResourcePermissions[]> {
  const { data } = await api.get<ApiResponse<ResourcePermissions[]>>("/web/permission/list")
  return data.results
}
