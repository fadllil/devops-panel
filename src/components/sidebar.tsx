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

type SidebarProps = {
  active: "dashboard" | "users" | "roles" | "profile" | "vpn-servers" | "vpn-clients"
}

const links = [
  {
    key: "dashboard" as const,
    label: "Dashboard",
    icon: LayoutDashboard,
    path: "/",
  },
  {
    key: "vpn-servers" as const,
    label: "VPN Servers",
    icon: Server,
    path: "/vpn-servers",
  },
  {
    key: "vpn-clients" as const,
    label: "VPN Clients",
    icon: KeyRound,
    path: "/vpn-clients",
  },
  {
    key: "users" as const,
    label: "Users",
    icon: Users,
    path: "/users",
  },
  {
    key: "roles" as const,
    label: "Roles",
    icon: Shield,
    path: "/roles",
  },
  {
    key: "profile" as const,
    label: "Profile",
    icon: UserCircle2,
    path: "/profile",
  },
]

export function Sidebar({ active }: SidebarProps) {
  const navigate = useNavigate()

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
          {links.map((link) => {
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
