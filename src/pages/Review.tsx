import { useEffect, useState } from 'react'
import Badge from '../components/Badge'
import Button from '../components/Button'
import Card from '../components/Card'
import { Empty, ErrorState, Loading } from '../components/States'
import { getLinks, getRecords, saveLink } from '../api/client'
import type { LinkItem, RecordItem } from '../types'

const suggested = [
  { a: 'REC-014', b: 'REC-097', score: 0.96, verdict: 'Likely same' as const },
  { a: 'REC-014', b: 'REC-131', score: 0.84, verdict: 'Possible' as const },
]

export default function ReviewPage() {
  const [records, setRecords] = useState<RecordItem[]>([])
  const [links, setLinks] = useState<LinkItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState<string | null>(null)

  async function refresh() {
    const [r, l] = await Promise.all([getRecords(), getLinks()])
    setRecords(r)
    setLinks(l)
  }

  useEffect(() => {
    refresh().catch((e) => setError(e instanceof Error ? e.message : 'Failed')).finally(() => setLoading(false))
  }, [])

  function nameOf(id: string) {
    return records.find((r) => r.record_id === id)?.name ?? id
  }

  async function decide(a: string, b: string, score: number, relation: 'confirmed_same' | 'rejected_same') {
    setBusy(`${a}-${b}`)
    try {
      await saveLink({ record_a: a, record_b: b, relation, score, evidence: 'Officer decision via review page' })
      await refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed')
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <h2 className="mb-3 text-lg font-extrabold text-ink">Suggested matches</h2>
        {loading && <Loading />}
        {error && <ErrorState label={error} />}
        {!loading && !error && suggested.map((s) => (
          <div key={`${s.a}-${s.b}`} className="mb-3 rounded-card border border-line bg-cream p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="font-bold text-ink">{nameOf(s.a)} <span className="text-muted">({s.a})</span></div>
                <div className="text-sm text-muted">vs {nameOf(s.b)} ({s.b})</div>
              </div>
              <Badge label={s.verdict} />
            </div>
            <div className="mt-2 text-sm text-muted">Combined score: {s.score}</div>
            <div className="mt-3 flex gap-2">
              <Button variant="success" disabled={busy === `${s.a}-${s.b}`} onClick={() => decide(s.a, s.b, s.score, 'confirmed_same')}>Confirm same</Button>
              <Button variant="danger" disabled={busy === `${s.a}-${s.b}`} onClick={() => decide(s.a, s.b, s.score, 'rejected_same')}>Reject</Button>
            </div>
          </div>
        ))}
      </Card>

      <Card>
        <h2 className="mb-3 text-lg font-extrabold text-ink">Saved links</h2>
        {links.length === 0 && <Empty label="No links saved." />}
        {links.map((l, i) => (
          <div key={i} className="mb-2 rounded-btn border border-line bg-cream p-3 text-sm">
            <span className="font-mono">{l.record_a}</span> / <span className="font-mono">{l.record_b}</span>
            <div className="text-muted">relation: {l.relation}, score: {l.score}</div>
            <div className="text-muted">{l.evidence}</div>
          </div>
        ))}
      </Card>
    </div>
  )
}
