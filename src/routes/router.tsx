import { useEffect, useState } from "react"
import { Outlet, createRootRoute, createRoute, createRouter } from "@tanstack/react-router"
import { Toaster } from "sonner"

import { ProtectedPageLoader } from "../components/protected-page-loader"
import { ThemeToggle } from "../components/theme-toggle"
import { DashboardPage } from "../pages/dashboard-page"
import { LoginPage } from "../pages/login-page"
import { NotFoundPage } from "../pages/not-found-page"
import { ProfilePage } from "../pages/profile-page"
import { RolesPage } from "../pages/roles-page"
import { UsersPage } from "../pages/users-page"
import { VPNClientsPage } from "../pages/vpn-clients-page"
import { VPNServersPage } from "../pages/vpn-servers-page"
import { protectedRouteGuard, publicRouteGuard } from "../lib/route-guards"

function AppShell() {
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    const defaultTheme =
      (import.meta.env.VITE_DEFAULT_THEME as "light" | "dark") || "dark"

    if (typeof window === "undefined") {
      return defaultTheme
    }

    const savedTheme = window.localStorage.getItem("devops-theme")
    return savedTheme === "light" || savedTheme === "dark" ? savedTheme : defaultTheme
  })

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark")
    window.localStorage.setItem("devops-theme", theme)
  }, [theme])

  return (
    <>
      <ThemeToggle theme={theme} onToggle={() => setTheme(theme === "dark" ? "light" : "dark")} />
      <Outlet />
      <Toaster richColors position="top-right" />
    </>
  )
}

const rootRoute = createRootRoute({
  component: AppShell,
})

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: LoginPage,
  beforeLoad: publicRouteGuard,
})

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: DashboardPage,
  beforeLoad: protectedRouteGuard,
  pendingComponent: ProtectedPageLoader,
})

const vpnServersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/vpn-servers",
  component: VPNServersPage,
  beforeLoad: protectedRouteGuard,
  pendingComponent: ProtectedPageLoader,
})

const vpnClientsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/vpn-clients",
  component: VPNClientsPage,
  beforeLoad: protectedRouteGuard,
  pendingComponent: ProtectedPageLoader,
})

const usersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/users",
  component: UsersPage,
  beforeLoad: protectedRouteGuard,
  pendingComponent: ProtectedPageLoader,
})

const rolesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/roles",
  component: RolesPage,
  beforeLoad: protectedRouteGuard,
  pendingComponent: ProtectedPageLoader,
})

const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/profile",
  component: ProfilePage,
  beforeLoad: protectedRouteGuard,
  pendingComponent: ProtectedPageLoader,
})

const notFoundRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "*",
  component: NotFoundPage,
})

const routeTree = rootRoute.addChildren([
  loginRoute,
  dashboardRoute,
  vpnServersRoute,
  vpnClientsRoute,
  usersRoute,
  rolesRoute,
  profileRoute,
  notFoundRoute,
])

export const router = createRouter({
  routeTree,
  defaultPreload: "intent",
})
