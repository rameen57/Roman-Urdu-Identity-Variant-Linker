import type { Verdict } from '../types'

const colors: Record<Verdict, string> = {
  'Likely same': 'bg-mint',
  'Possible': 'bg-peach',
  'Unlikely': 'bg-sky',
  'Hard conflict': 'bg-rose',
}

export default function Badge({ label }: { label: string }) {
  const bg = colors[label as Verdict] ?? 'bg-lavender'
  return <span className={`inline-block rounded-full px-3 py-1 text-xs font-bold text-ink ${bg}`}>{label}</span>
}
