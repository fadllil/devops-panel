import { useAuthStore } from "../stores/auth-store"

export function usePermission() {
  const user = useAuthStore((state) => state.user)

  const isSuperadmin = user?.data_role?.name === "Superadmin"
  const permissionCodes = user?.data_role?.permission_codes || []
  const permissionSet = new Set(permissionCodes)

  const can = (permissionCode: string): boolean => {
    if (!user) return false
    if (isSuperadmin) return true
    return permissionSet.has(permissionCode)
  }

  const canAny = (codes: string[]): boolean => {
    if (!user) return false
    if (isSuperadmin) return true
    return codes.some((code) => permissionSet.has(code))
  }

  const canAll = (codes: string[]): boolean => {
    if (!user) return false
    if (isSuperadmin) return true
    return codes.every((code) => permissionSet.has(code))
  }

  return {
    can,
    canAny,
    canAll,
    isSuperadmin,
    roleName: user?.data_role?.name || "",
    permissions: permissionCodes,
  }
}
