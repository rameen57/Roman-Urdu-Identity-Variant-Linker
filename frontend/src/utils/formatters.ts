import type { RecordItem } from '../types'

export const getHumanReadableLabel = (record: RecordItem) => {
  const location = record.city ? ` • ${record.city}` : ''
  const birthYear = record.birth_year ? ` (${record.birth_year})` : ''
  return `${record.name}${location}${birthYear}`
}

export const getRecordContext = (record: RecordItem) => {
  return `${record.name} (ID: ${record.record_id} • ${record.city} • ${record.birth_year})`
}

export const getRecordName = (id: string, records: RecordItem[]) => {
  return records.find((r) => r.record_id === id)?.name ?? id
}
EOF