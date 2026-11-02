export function Loading({ label = 'Loading...' }: { label?: string }) {
  return <div className="py-8 text-center text-sm font-semibold text-muted">{label}</div>
}

export function Empty({ label = 'No data.' }: { label?: string }) {
  return <div className="py-8 text-center text-sm text-muted">{label}</div>
}

export function ErrorState({ label = 'Something went wrong.' }: { label?: string }) {
  return <div className="rounded-card border border-rose bg-rose/30 p-4 text-sm text-ink">{label}</div>
}
