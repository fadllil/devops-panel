import api from "./client"
import type { ApiResponse } from "../types/auth"
import type {
  CreateVPNServerPayload,
  UpdateVPNServerPayload,
  VPNServer,
  VPNServerListParams,
  VPNServerListResponse,
} from "../types/vpn-server"

export async function getVPNServers(
  params: VPNServerListParams = {},
): Promise<VPNServerListResponse> {
  const { data } = await api.get<ApiResponse<VPNServerListResponse>>("/web/vpn-server/", {
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

export async function getAllVPNServers(): Promise<VPNServer[]> {
  const { data } = await api.get<ApiResponse<VPNServer[]>>("/web/vpn-server/list")
  return data.results
}

export async function getVPNServer(id: string): Promise<VPNServer> {
  const { data } = await api.get<ApiResponse<VPNServer>>(`/web/vpn-server/find/${id}`)
  return data.results
}

export async function createVPNServer(
  payload: CreateVPNServerPayload,
): Promise<VPNServer> {
  const { data } = await api.post<ApiResponse<VPNServer>>("/web/vpn-server/create", payload)
  return data.results
}

export async function updateVPNServer(
  id: string,
  payload: UpdateVPNServerPayload,
): Promise<VPNServer> {
  const { data } = await api.put<ApiResponse<VPNServer>>(`/web/vpn-server/update/${id}`, payload)
  return data.results
}

export async function deleteVPNServer(id: string): Promise<void> {
  await api.delete(`/web/vpn-server/delete/${id}`)
}
