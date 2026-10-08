import { useNavigate } from "@tanstack/react-router"
import { useEffect, useState, type SubmitEvent } from "react"
import { Eye, EyeOff, Loader2, Lock, ShieldCheck, User } from "lucide-react"
import { toast } from "sonner"

import { Badge } from "#components/ui/badge"
import { Button } from "#components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "#components/ui/card"
import { Input } from "#components/ui/input"
import { Label } from "#components/ui/label"
import { loginUser } from "../api/auth"
import { useAuthStore } from "../stores/auth-store"

export function LoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const setCredentials = useAuthStore((state) => state.setCredentials)
  const navigate = useNavigate()

  useEffect(() => {
    if (isAuthenticated) {
      void navigate({ to: "/" })
    }
  }, [isAuthenticated, navigate])

  const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)

    try {
      const result = await loginUser({ username, password })

      const user = {
        id: result.id,
        username: result.username,
        email: result.email,
        id_role: result.id_role,
        is_active: result.is_active,
        created_at: result.created_at,
        updated_at: result.updated_at,
        data_role: result.data_role,
      }

      setCredentials(user, result.token)
      window.localStorage.setItem("devops-access-token", result.token)
      window.localStorage.setItem("devops-user-id", result.id)

      toast.success("Login berhasil")
      void navigate({ to: "/" })
    } catch (error) {
      toast.error("Login gagal. Periksa username dan password Anda.")
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="relative flex min-h-screen items-center justify-center bg-background px-4 py-12 transition-colors duration-200">
      {/* Background ambient lighting for light and dark themes */}
      <div
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,var(--primary)/0.07,transparent_70%)]"
        aria-hidden="true"
      />

      <Card className="w-full max-w-md border-border bg-card/95 shadow-xl shadow-foreground/5 backdrop-blur-sm sm:rounded-2xl">
        <CardHeader className="space-y-4 pb-6">
          <div className="flex items-center justify-between">
            <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20">
              <ShieldCheck className="size-6" />
            </div>
            <Badge
              variant="outline"
              className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground"
            >
              DevOps Panel
            </Badge>
          </div>

          <div className="space-y-1.5">
            <CardTitle className="text-2xl font-bold tracking-tight text-card-foreground">
              OpenVPN Management
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Masuk untuk mengelola akun OpenVPN, role, dan akses pengguna internal.
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <div className="relative">
                <User className="pointer-events-none absolute left-3 top-3 size-4 text-muted-foreground" />
                <Input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  autoFocus
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  className="h-10 pl-9"
                  placeholder="Masukkan username"
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-3 size-4 text-muted-foreground" />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="h-10 pl-9 pr-10"
                  placeholder="••••••••"
                  required
                  disabled={isSubmitting}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
                  aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </Button>
              </div>
            </div>

            <Button
              type="submit"
              className="mt-2 h-10 w-full font-medium"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Memproses...
                </>
              ) : (
                "Masuk ke Panel"
              )}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="justify-center border-t border-border/60 py-3.5 text-xs text-muted-foreground">
          <p className="flex items-center gap-1.5 font-medium opacity-80">
            <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Sistem Aman &bull; Akses Internal Terbatas
          </p>
        </CardFooter>
      </Card>
    </section>
  )
}
