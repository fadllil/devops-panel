import { Moon, Sun } from "lucide-react"

import { Button } from "#components/ui/button"

type ThemeToggleProps = {
  theme: "light" | "dark"
  onToggle: () => void
}

export function ThemeToggle({ theme, onToggle }: ThemeToggleProps) {
  const isDark = theme === "dark"

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={onToggle}
      className="fixed right-4 top-4 z-50"
    >
      {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
      <span className="ml-2 hidden sm:inline">{isDark ? "Light" : "Dark"}</span>
    </Button>
  )
}
