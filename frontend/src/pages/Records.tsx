import { useEffect, useState } from 'react'
import Card from '../components/Card'
import { getRecords } from '../api/client'
import type { RecordItem } from '../types'

export default function RecordsPage() {
  const [records, setRecords] = useState<RecordItem[]>([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getRecords().then(setRecords).finally(() => setLoading(false))
  }, [])

  const filtered = records.filter((r) =>
    [r.record_id, r.name, r.father_name, r.city, r.phonetic_key].join(' ').toLowerCase().includes(query.toLowerCase())
  )

  return (
    <Card>
      <div className="flex items-center justify-between gap-3 mb-4">
        <h2 className="text-lg font-bold text-text">Records</h2>
        <div className="relative w-64">
          <input className="rounded-xl border border-inset bg-inset pl-9 pr-3 py-2 text-sm text-text placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-accent" placeholder="Search records…" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
      </div>
      {loading && <div className="h-64 flex items-center justify-center text-muted">Loading records…</div>}
      {!loading && filtered.length === 0 && <p className="text-muted py-4">No records found.</p>}
      {!loading && filtered.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="border-b border-track text-muted">
              <tr>
                <th className="py-3">ID</th><th className="py-3">Name</th><th className="py-3">Father</th><th className="py-3">Year</th><th className="py-3">City</th><th className="py-3">Phonetic key</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.record_id} className="border-b border-inset">
                  <td className="py-2 font-mono text-xs">{r.record_id}</td>
                  <td className="py-2">{r.name}</td>
                  <td className="py-2">{r.father_name}</td>
                  <td className="py-2 font-mono text-xs">{r.birth_year}</td>
                  <td className="py-2">{r.city}</td>
                  <td className="py-2 font-mono text-xs text-muted">{r.phonetic_key}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  )
}
