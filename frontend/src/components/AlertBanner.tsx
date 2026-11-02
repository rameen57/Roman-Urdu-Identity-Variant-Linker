import Card from './Card'

export default function AlertBanner({ message, type = 'warn', icon }: { message: string; type?: 'warn' | 'info'; icon?: React.ReactNode }) {
  return (
    <Card className={`p-3 flex items-start gap-3 ${type === 'warn' ? 'bg-warn/20 border border-warn/50 text-ink' : 'border border-track text-text'}`}>
    {icon}
    <div>{message}</div>
    </Card>
  )
}
