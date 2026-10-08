import api from "./client"
import type { ApiResponse } from "../types/auth"
import type {
  CreateVPNClientPayload,
  CreateVPNClientResponse,
  UpdateVPNClientPayload,
  VPNClient,
  VPNClientListParams,
  VPNClientListResponse,
} from "../types/vpn-client"

export async function getVPNClients(
  params: VPNClientListParams = {},
): Promise<VPNClientListResponse> {
  const { data } = await api.get<ApiResponse<VPNClientListResponse>>("/web/vpn-client/", {
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

export async function getAllVPNClients(): Promise<VPNClient[]> {
  const { data } = await api.get<ApiResponse<VPNClient[]>>("/web/vpn-client/list")
  return data.results
}

export async function getVPNClient(id: string): Promise<VPNClient> {
  const { data } = await api.get<ApiResponse<VPNClient>>(`/web/vpn-client/find/${id}`)
  return data.results
}

export async function createVPNClient(
  payload: CreateVPNClientPayload,
): Promise<CreateVPNClientResponse> {
  const { data } = await api.post<ApiResponse<CreateVPNClientResponse>>(
    "/web/vpn-client/create",
    payload,
  )
  return data.results
}

export async function updateVPNClient(
  id: string,
  payload: UpdateVPNClientPayload,
): Promise<VPNClient> {
  const { data } = await api.put<ApiResponse<VPNClient>>(
    `/web/vpn-client/update/${id}`,
    payload,
  )
  return data.results
}

export async function deleteVPNClient(id: string): Promise<void> {
  await api.delete(`/web/vpn-client/delete/${id}`)
}

export async function downloadVPNClientConfig(id: string, filename = "client.ovpn"): Promise<void> {
  const response = await api.get<Blob>(`/web/vpn-client/download-config/${id}`, {
    responseType: "blob",
  })

  const blob = new Blob([response.data], { type: "application/x-openvpn-profile" })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.setAttribute("download", filename.endsWith(".ovpn") ? filename : `${filename}.ovpn`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}

export async function sendVPNClientConfigEmail(id: string): Promise<void> {
  await api.post(`/web/vpn-client/send-email/${id}`)
}
