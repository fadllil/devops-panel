import { useNavigate } from "@tanstack/react-router"
import { useState, type FormEvent } from "react"
import { LockKeyhole, ShieldCheck } from "lucide-react"
import { toast } from "sonner"

import { Button } from "#components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "#components/ui/card"
import { Input } from "#components/ui/input"
import { Sidebar } from "../components/sidebar"
import { updateUserPassword } from "../api/users"
import { useAuthStore } from "../stores/auth-store"

export function ProfilePage() {
  const user = useAuthStore((state) => state.user)
  const navigate = useNavigate()
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [submitting, setSubmitting] = useState(false)

  if (!user) {
    return null
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (password.length < 8) {
      toast.error("Password minimal 8 karakter")
      return
    }

    if (password !== confirmPassword) {
      toast.error("Konfirmasi password tidak cocok")
      return
    }

    setSubmitting(true)

    try {
      await updateUserPassword(user.id, {
        password,
        confirm_password: confirmPassword,
      })

      toast.success("Password berhasil diperbarui")
      setPassword("")
      setConfirmPassword("")
      void navigate({ to: "/" })
    } catch (error) {
      toast.error("Gagal memperbarui password")
      console.error(error)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="flex min-h-screen bg-background text-foreground bg-muted">
      <Sidebar active="profile" />

      <section className="flex-1 p-4 md:p-8">
        <div className="grid gap-4 xl:grid-cols-[360px_1fr]">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-primary/10 p-3 text-primary">
                  <ShieldCheck className="size-5" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Profil Saya</p>
                  <CardTitle>{user.username}</CardTitle>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <div>
                <p className="mb-1 text-xs uppercase tracking-[0.2em]">Email</p>
                <p className="font-medium text-foreground">{user.email}</p>
              </div>
              <div>
                <p className="mb-1 text-xs uppercase tracking-[0.2em]">Role</p>
                <p className="font-medium text-foreground">{user.id_role}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ubah Password</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div>
                  <label className="mb-1 block text-sm text-muted-foreground">Password Baru</label>
                  <div className="relative">
                    <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="Minimal 8 karakter"
                      className="pl-9"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-sm text-muted-foreground">Konfirmasi Password</label>
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    placeholder="Ulangi password"
                    required
                  />
                </div>

                <Button type="submit" disabled={submitting}>
                  {submitting ? "Menyimpan..." : "Simpan Password"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  )
}
