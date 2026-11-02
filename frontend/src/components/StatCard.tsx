import Card from './Card'

export default function StatCard({ label, value, delta, className = '' }: { label: string; value: React.ReactNode; delta?: string; className?: string }) {
  return (
    <Card className={className}>
      <div className="text-xs font-semibold uppercase text-muted">{label}</div>
      <div className="text-2xl font-bold text-text tabular-nums mt-1">{value}</div>
      {delta && <span className="text-xs text-accent font-semibold mt-0.5 block">{delta}</span>}
    </Card>
  )
}
