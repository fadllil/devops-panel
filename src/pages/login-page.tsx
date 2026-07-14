import { useNavigate } from "@tanstack/react-router"
import { useEffect, useState, type SubmitEvent } from "react"
import { toast } from "sonner"

import { Button } from "#components/ui/button"
import { loginUser } from "../api/auth"
import { useAuthStore } from "../stores/auth-store"

export function LoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
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
    <section className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl shadow-slate-950/40">
        <div className="mb-6">
          <p className="text-sm font-medium uppercase tracking-[0.28em] text-cyan-300">
            DevOps Panel
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-white">
            OpenVPN User Management
          </h1>
          <p className="mt-2 text-sm text-slate-300">
            Masuk untuk mengelola akun OpenVPN, role, dan akses pengguna internal.
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <label className="block text-sm text-slate-200">
            <span className="mb-2 block">Username</span>
            <input
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none ring-0 transition focus:border-cyan-400"
              placeholder="admin"
              required
            />
          </label>

          <label className="block text-sm text-slate-200">
            <span className="mb-2 block">Password</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none ring-0 transition focus:border-cyan-400"
              placeholder="••••••••"
              required
            />
          </label>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Memproses..." : "Masuk"}
          </Button>
        </form>
      </div>
    </section>
  )
}
