import { Link } from "@tanstack/react-router"

import { Button } from "#components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "#components/ui/card"

export function NotFoundPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 text-foreground">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">404</p>
          <CardTitle className="text-3xl">Halaman tidak ditemukan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            URL yang Anda buka tidak tersedia atau belum dibuat di panel admin ini.
          </p>
          <Link to="/">
            <Button type="button">Kembali ke Dashboard</Button>
          </Link>
        </CardContent>
      </Card>
    </main>
  )
}
