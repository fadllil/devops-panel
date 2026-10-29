export type ApiResponse<T> = {
  message: string
  results: T
  code: number
}

export type PermissionItem = {
  id: string
  code: string
  resource: string
  action: string
  description: string
  created_at?: string
}

export type ResourcePermissions = {
  resource: string
  permissions: PermissionItem[]
}

export type RoleDetail = {
  id: string
  name: string
  description?: string
  created_at: string
  updated_at: string
  permissions?: PermissionItem[]
  permission_codes?: string[]
}

export type UserProfile = {
  id: string
  username: string
  email: string
  id_role: string
  is_active: boolean
  created_at?: string | number
  updated_at?: string | number
  data_role?: RoleDetail | null
}

export type LoginRequest = {
  username: string
  password: string
}

export type LoginResponse = UserProfile & {
  token: string
}

export type UserSummary = {
  id: string
  username: string
  email: string
  id_role: string
  is_active: boolean
  created_at: string
  updated_at: string
  data_role?: RoleDetail | null
}

export type PageMetadata = {
  page: number
  size: number
  total_item: number
  total_page: number
}

export type UserListResponse = {
  data: UserSummary[]
  paging: PageMetadata
}

export type UserListParams = {
  page?: number
  size?: number
  search?: string
  sort_field?: string
  sort_by?: string
}

export type RoleSummary = {
  id: string
  name: string
  description?: string
  created_at: string
  updated_at: string
  permissions?: PermissionItem[]
  permission_codes?: string[]
}

export type RoleListResponse = {
  data: RoleSummary[]
  paging: PageMetadata
}

export type RoleListParams = {
  page?: number
  size?: number
  search?: string
  sort_field?: string
  sort_by?: string
}

export type CreateRolePayload = {
  name: string
  description?: string
  permission_ids?: string[]
}

export type UpdateRolePayload = {
  name: string
  description?: string
  permission_ids?: string[]
}

export type CreateUserPayload = {
  username: string
  password: string
  email: string
  id_role: string
}

export type UpdateUserPayload = {
  username: string
  email: string
  id_role: string
  is_active: boolean
}
