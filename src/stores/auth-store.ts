import { create } from "zustand"
import { persist } from "zustand/middleware"

import type { UserProfile } from "../types/auth"

type AuthStoreState = {
  user: UserProfile | null
  token: string | null
  isAuthenticated: boolean
  setCredentials: (user: UserProfile, token: string) => void
  clearCredentials: () => void
}

export const useAuthStore = create<AuthStoreState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      setCredentials: (user, token) =>
        set({ user, token, isAuthenticated: true }),
      clearCredentials: () =>
        set({ user: null, token: null, isAuthenticated: false }),
    }),
    {
      name: "devops-auth-store",
    },
  ),
)
