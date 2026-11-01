export default function TopBar() {
  return (
    <header className="flex h-16 items-center justify-between border-b border-line bg-white/80 px-6 backdrop-blur">
      <div className="text-sm font-semibold text-muted">Fictional Records Office</div>
      <div className="rounded-full bg-mint px-3 py-1 text-xs font-bold text-ink">Mock mode: {import.meta.env.VITE_USE_MOCK !== 'false' ? 'on' : 'off'}</div>
    </header>
  )
}
