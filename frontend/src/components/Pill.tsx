export default function Pill({ label, variant = 'info', className = '' }: { label: string; variant?: 'info' | 'success' | 'warn' | 'muted'; className?: string }) {
  const styles: Record<string, string> = {
    info: 'bg-inset border border-track text-muted',
    success: 'bg-accent text-ink',
    warn: 'bg-warn text-ink',
    muted: 'bg-inset text-muted',
  }
  return <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold border ${styles[variant]} ${className}`}>{label}</span>
}
