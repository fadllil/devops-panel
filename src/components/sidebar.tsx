import { useNavigate } from "@tanstack/react-router"
import {
  KeyRound,
  LayoutDashboard,
  Server,
  Shield,
  UserCircle2,
  Users,
} from "lucide-react"

import { Button } from "#components/ui/button"
import { usePermission } from "../hooks/use-permission"

type SidebarProps = {
  active: "dashboard" | "users" | "roles" | "profile" | "vpn-servers" | "vpn-clients"
}

type NavLink = {
  key: SidebarProps["active"]
  label: string
  icon: typeof LayoutDashboard
  path: string
  permission: string | null
}

const links: NavLink[] = [
  {
    key: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    path: "/",
    permission: null,
  },
  {
    key: "vpn-servers",
    label: "VPN Servers",
    icon: Server,
    path: "/vpn-servers",
    permission: "vpn_servers:read",
  },
  {
    key: "vpn-clients",
    label: "VPN Clients",
    icon: KeyRound,
    path: "/vpn-clients",
    permission: "vpn_clients:read",
  },
  {
    key: "users",
    label: "Users",
    icon: Users,
    path: "/users",
    permission: "users:read",
  },
  {
    key: "roles",
    label: "Roles",
    icon: Shield,
    path: "/roles",
    permission: "roles:read",
  },
  {
    key: "profile",
    label: "Profile",
    icon: UserCircle2,
    path: "/profile",
    permission: null,
  },
]

export function Sidebar({ active }: SidebarProps) {
  const navigate = useNavigate()
  const { can } = usePermission()

  const visibleLinks = links.filter(
    (link) => link.permission === null || can(link.permission),
  )

  return (
    <aside className="w-full max-w-[280px] border-r border-border bg-card text-card-foreground md:min-h-screen">
      <div className="p-4">
        <div className="mb-6 rounded-xl bg-muted/60 px-4 py-3">
          <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
            DevOps Panel
          </p>
          <h2 className="mt-1 text-lg font-semibold">OpenVPN</h2>
        </div>

        <nav className="space-y-2">
          {visibleLinks.map((link) => {
            const Icon = link.icon
            const isActive = active === link.key

            return (
              <Button
                key={link.key}
                type="button"
                variant={isActive ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => void navigate({ to: link.path })}
              >
                <Icon className="mr-2 size-4" />
                {link.label}
              </Button>
            )
          })}
        </nav>
      </div>
    </aside>
  )
}
