import type { PageMetadata } from "./auth"

export type VPNServer = {
  id: string
  name: string
  ip_address: string
  port: number
  protocol: string
  ssh_host: string
  ssh_port: number
  ssh_user: string
  ssh_key: string
  agent_api_url: string
  agent_token: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export type CreateVPNServerPayload = {
  name: string
  ip_address: string
  port: number
  protocol: string
  ssh_host: string
  ssh_port: number
  ssh_user: string
  ssh_key: string
  agent_api_url: string
  agent_token: string
  is_active: boolean
}

export type UpdateVPNServerPayload = CreateVPNServerPayload

export type VPNServerListParams = {
  page?: number
  size?: number
  search?: string
  sort_field?: string
  sort_by?: string
}

export type VPNServerListResponse = {
  data: VPNServer[]
  paging: PageMetadata
}
