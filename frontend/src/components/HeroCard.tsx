import Card from './Card'
import Button from './Button'

export default function HeroCard({ title, subtitle, children, button, buttonLabel = 'Go to Link Review' }: { title: string; subtitle: string; children?: React.ReactNode; button?: React.ReactNode; buttonLabel?: string }) {
  return (
    <Card className="bg-accent text-ink shadow-soft">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-ink/80">Dashboard</div>
          <h1 className="text-3xl font-bold mt-1">{title}</h1>
          <p className="text-ink/70 mt-1">{subtitle}</p>
        </div>
        {button ?? <Button variant="primary">{buttonLabel}</Button>}
      </div>
      {children && <div className="mt-4">{children}</div>}
    </Card>
  )
}
