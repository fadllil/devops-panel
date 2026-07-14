export function ProtectedPageLoader() {
  return (
    <div className="flex min-h-screen bg-background">
      <aside className="w-full max-w-[280px] border-r border-border bg-card md:min-h-screen">
        <div className="p-4">
          <div className="mb-6 h-20 rounded-xl bg-muted/40 animate-pulse" />
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-10 rounded-lg bg-muted/40 animate-pulse" />
            ))}
          </div>
        </div>
      </aside>

      <section className="flex-1 p-4 md:p-8">
        <div className="grid gap-4 xl:grid-cols-[420px_1fr]">
          <div className="rounded-lg border border-border bg-card p-6">
            <div className="mb-4 h-6 w-32 rounded bg-muted/40 animate-pulse" />
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-9 rounded bg-muted/40 animate-pulse" />
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card p-6">
            <div className="mb-4 h-6 w-40 rounded bg-muted/40 animate-pulse" />
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-12 rounded bg-muted/40 animate-pulse" />
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
