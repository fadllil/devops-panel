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
