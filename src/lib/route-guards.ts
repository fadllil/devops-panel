import { redirect } from "@tanstack/react-router"
import { useAuthStore } from "../stores/auth-store"

/**
 * Route guard for protected routes - redirects to login if not authenticated
 */
export const protectedRouteGuard = async () => {
  const { isAuthenticated, user } = useAuthStore.getState()

  if (!isAuthenticated || !user) {
    throw redirect({
      to: "/login",
      replace: true,
    })
  }

  return { user }
}

/**
 * Route guard with required permission check
 */
export const permissionRouteGuard = (requiredPermission: string) => async () => {
  const { isAuthenticated, user } = useAuthStore.getState()

  if (!isAuthenticated || !user) {
    throw redirect({
      to: "/login",
      replace: true,
    })
  }

  const isSuperadmin = user.data_role?.name === "Superadmin"
  const permissions = user.data_role?.permission_codes || []

  if (!isSuperadmin && !permissions.includes(requiredPermission)) {
    // Redirect to dashboard if user has insufficient permission
    throw redirect({
      to: "/",
      replace: true,
    })
  }

  return { user }
}

/**
 * Route guard for login route - redirects to dashboard if already authenticated
 */
export const publicRouteGuard = async () => {
  const { isAuthenticated } = useAuthStore.getState()

  if (isAuthenticated) {
    throw redirect({
      to: "/",
      replace: true,
    })
  }
}
