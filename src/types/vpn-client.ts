import type { PageMetadata } from "./auth"

export type VPNClient = {
  id: string
  server_id: string
  username: string
  email: string
  static_ip: string
  cert_serial: string
  is_active: boolean
  expires_at?: string
  last_connected_at?: string
  last_disconnected_at?: string
  bytes_sent: number
  bytes_received: number
  last_ip?: string
  description?: string
  created_at: string
  updated_at: string
}

export type CreateVPNClientPayload = {
  server_id: string
  username: string
  password: string
  email: string
  static_ip?: string
  description?: string
}

export type CreateVPNClientResponse = VPNClient & {
  ovpn_content?: string
}

export type UpdateVPNClientPayload = {
  server_id: string
  username: string
  password?: string
  email: string
  static_ip?: string
  is_active: boolean
  description?: string
}

export type VPNClientListParams = {
  page?: number
  size?: number
  search?: string
  sort_field?: string
  sort_by?: string
}

export type VPNClientListResponse = {
  data: VPNClient[]
  paging: PageMetadata
}
