import type { RecordItem } from '../types'

export const getHumanReadableLabel = (record: RecordItem) => {
  const location = record.city ? ` • ${record.city}` : ''
  const birthYear = record.birth_year ? ` (${record.birth_year})` : ''
  return `${record.name}${location}${birthYear}`
}

export const getRecordContext = (record: RecordItem) =>
  `${record.name} (ID: ${record.record_id} • ${record.city} • ${record.birth_year})`

export const getRecordName = (id: string, records: RecordItem[]) =>
  records.find((r) => r.record_id === id)?.name ?? id

export const verdictPill = (verdict: string) => {
  const map: Record<string, { bg: string; text: string; icon: string }> = {
    'Likely same': { bg: 'bg-accent', text: 'text-ink', icon: '\u2713' },
    Possible: { bg: 'bg-inset border border-accent', text: 'text-accent', icon: '\u2753' },
    Unlikely: { bg: 'bg-inset', text: 'text-muted', icon: '\u2212' },
    'Hard conflict': { bg: 'bg-warn', text: 'text-ink', icon: '\u26A0' },
  }
  return map[verdict] ?? map['Unlikely']
}
