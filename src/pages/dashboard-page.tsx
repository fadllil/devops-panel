import { useNavigate } from "@tanstack/react-router"

import { Badge } from "#components/ui/badge"
import { Button } from "#components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "#components/ui/card"
import { Sidebar } from "../components/sidebar"
import { logoutUser } from "../api/auth"
import { useAuthStore } from "../stores/auth-store"

export function DashboardPage() {
  const state = useAuthStore()
  const user = state.user!
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await logoutUser(user.id)
    } finally {
      state.clearCredentials()
      window.localStorage.removeItem("devops-access-token")
      window.localStorage.removeItem("devops-user-id")
      void navigate({ to: "/login" })
    }
  }

  return (
    <main className="flex min-h-screen bg-background text-foreground bg-muted">
      <Sidebar active="dashboard" />

      <section className="flex-1 p-4 md:p-8">
        <Card>
          <CardHeader className="flex flex-row items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                Dashboard Panel
              </p>
              <CardTitle className="mt-2 text-2xl">Selamat datang, {user.username}</CardTitle>
            </div>

            <Button variant="outline" onClick={handleLogout}>
              Logout
            </Button>
          </CardHeader>

          <CardContent className="grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-border bg-muted/20 p-4">
              <div className="text-sm text-muted-foreground">Username</div>
              <div className="mt-2 font-medium">{user.username}</div>
            </div>
            <div className="rounded-xl border border-border bg-muted/20 p-4">
              <div className="text-sm text-muted-foreground">Email</div>
              <div className="mt-2 font-medium">{user.email}</div>
            </div>
            <div className="rounded-xl border border-border bg-muted/20 p-4">
              <div className="text-sm text-muted-foreground">Role</div>
              <div className="mt-2 font-medium">
                <Badge variant="secondary">{user.id_role}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  )
}
