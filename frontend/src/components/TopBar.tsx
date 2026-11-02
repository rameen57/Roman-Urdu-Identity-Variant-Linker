import Pill from './Pill'

export default function TopBar() {
  return (
    <header className="h-16 border-b border-track bg-surface/95 backdrop-blur flex items-center justify-between px-6">
      <div className="text-sm font-semibold text-text">Records Office Agent Console</div>
      <div className="flex items-center gap-3">
        <Pill label="Mock mode" variant="muted" />
        <span className="text-[10px] text-muted">{import.meta.env.VITE_API_URL ?? 'http://localhost:8000'}</span>
      </div>
    </header>
  )
}
