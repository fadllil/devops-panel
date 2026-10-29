import type { ReactNode } from "react"
import { usePermission } from "../hooks/use-permission"

type CanProps = {
  do: string | string[]
  match?: "any" | "all"
  children: ReactNode
  fallback?: ReactNode
}

export function Can({ do: permission, match = "any", children, fallback = null }: CanProps) {
  const { can, canAny, canAll } = usePermission()

  if (Array.isArray(permission)) {
    const isAllowed = match === "all" ? canAll(permission) : canAny(permission)
    return isAllowed ? <>{children}</> : <>{fallback}</>
  }

  return can(permission) ? <>{children}</> : <>{fallback}</>
}
