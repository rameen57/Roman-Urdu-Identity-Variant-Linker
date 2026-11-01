import { useEffect, useState } from 'react'
import Card from '../components/Card'
import { Empty, ErrorState, Loading } from '../components/States'
import { getRecords } from '../api/client'
import type { RecordItem } from '../types'

export default function RecordsPage() {
  const [records, setRecords] = useState<RecordItem[]>([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getRecords()
      .then(setRecords)
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed'))
      .finally(() => setLoading(false))
  }, [])

  const filtered = records.filter((r) =>
    [r.record_id, r.name, r.father_name, r.city, r.phonetic_key].join(' ').toLowerCase().includes(query.toLowerCase())
  )

  return (
    <Card>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-lg font-extrabold text-ink">Records</h2>
        <input
          className="rounded-btn border border-line bg-white px-3 py-2 text-sm"
          placeholder="Search records..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      {loading && <Loading />}
      {error && <ErrorState label={error} />}
      {!loading && !error && filtered.length === 0 && <Empty label="No records found." />}
      {!loading && !error && filtered.length > 0 && (
        <div className="overflow-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-line text-muted">
                <th className="py-2">ID</th>
                <th className="py-2">Name</th>
                <th className="py-2">Father</th>
                <th className="py-2">Year</th>
                <th className="py-2">City</th>
                <th className="py-2">Phonetic key</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.record_id} className="border-b border-line">
                  <td className="py-2 font-mono">{r.record_id}</td>
                  <td className="py-2">{r.name}</td>
                  <td className="py-2">{r.father_name}</td>
                  <td className="py-2">{r.birth_year}</td>
                  <td className="py-2">{r.city}</td>
                  <td className="py-2 font-mono text-muted">{r.phonetic_key}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  )
}
