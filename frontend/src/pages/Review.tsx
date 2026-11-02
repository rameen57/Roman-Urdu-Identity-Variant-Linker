import { useEffect, useState } from 'react'
import Card from '../components/Card'
import Button from '../components/Button'
import Pill from '../components/Pill'
import { getHumanReadableLabel, getRecordContext } from '../utils/formatters'
import { getLinks, getRecords, saveLink } from '../api/client'
import type { LinkItem, RecordItem } from '../types'

const suggested = [
  { a: 'REC-014', b: 'REC-097', score: 0.96 },
  { a: 'REC-014', b: 'REC-205', score: 0.97 },
  { a: 'REC-332', b: 'REC-341', score: 0.95 },
  { a: 'REC-410', b: 'REC-418', score: 0.93 },
  { a: 'REC-501', b: 'REC-509', score: 0.92 },
  { a: 'REC-014', b: 'REC-131', score: 0.84 },
  { a: 'REC-600', b: 'REC-601', score: 0.84 },
]

export default function ReviewPage() {
  const [records, setRecords] = useState<RecordItem[]>([])
  const [links, setLinks] = useState<LinkItem[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState<string | null>(null)

  async function refresh() {
    const [r, l] = await Promise.all([getRecords(), getLinks()])
    setRecords(r); setLinks(l)
  }

  useEffect(() => { refresh().finally(() => setLoading(false)) }, [])

  const rec = (id: string) => records.find((x) => x.record_id === id) ?? ({ record_id: id, name: id, father_name: '', birth_year: 0, city: '' } as RecordItem)

  async function decide(a: string, b: string, score: number, relation: 'confirmed_same' | 'rejected_same') {
    setBusy(`${a}-${b}`)
    try {
      await saveLink({ record_a: a, record_b: b, relation, score, evidence: 'Officer decision via Link Review' })
      await refresh()
    } catch (e) {
      alert('Save failed')
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <h2 className="mb-3 text-lg font-bold text-text">Suggested matches</h2>
        {loading && <div className="h-64 flex items-center justify-center text-muted">Loading…</div>}
        {!loading && suggested.map((s) => {
          const ra = rec(s.a), rb = rec(s.b)
          const already = links.some(l => (l.record_a === s.a && l.record_b === s.b) || (l.record_a === s.b && l.record_b === s.a))
          return (
            <div key={`${s.a}-${s.b}`} className="mb-3 rounded-xl border border-track bg-inset p-4">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
                <div>
                  <div className="font-bold text-text">{ra.name}</div>
                  <div className="text-xs text-muted">{ra.city}, {ra.birth_year}</div>
                  <span className="text-[10px] font-mono text-muted ml-2">ID: {s.a}</span>
                </div>
                <span className="text-xs font-bold">vs</span>
                <div>
                  <div className="font-bold text-text">{rb.name}</div>
                  <div className="text-xs text-muted">{rb.city}, {rb.birth_year}</div>
                  <span className="text-[10px] font-mono text-muted ml-2">ID: {s.b}</span>
                </div>
                <Pill label={s.score >= 0.92 ? 'Likely same' : s.score >= 0.75 ? 'Possible' : 'Hard conflict'} variant={s.score >= 0.92 ? 'success' : 'warn'} />
              </div>
              <div className="text-xs text-muted mb-3">Combined score: {s.score}</div>
              <div className="flex gap-2">
                <Button variant="success" disabled={busy === `${s.a}-${s.b}` || already} onClick={() => decide(s.a, s.b, s.score, 'confirmed_same')}>Confirm same</Button>
                <Button variant="warn" disabled={busy === `${s.a}-${s.b}` || already} onClick={() => decide(s.a, s.b, s.score, 'rejected_same')}>Reject</Button>
                {already && <span className="text-xs text-accent font-bold">Saved</span>}
              </div>
            </div>
          )
        })}
      </Card>

      <Card>
        <h2 className="mb-3 text-lg font-bold text-text">Saved links</h2>
        {links.length === 0 && <p className="text-muted py-4">No links saved.</p>}
        {links.map((l, i) => {
          const ra = rec(l.record_a), rb = rec(l.record_b)
          return (
            <div key={i} className="mb-2 rounded-xl border border-inset bg-surface p-3">
              <div className="flex items-center justify-between">
                <div className="font-bold text-text">{getHumanReadableLabel(ra)} ↔ {getHumanReadableLabel(rb)}</div>
                <Pill label={l.relation === 'confirmed_same' ? 'Confirmed' : 'Rejected'} variant={l.relation === 'confirmed_same' ? 'success' : 'warn'} />
              </div>
              <div className="text-xs text-muted mt-1">{getRecordContext(ra)}</div>
              <div className="text-xs text-muted">{l.evidence}</div>
              <div className="text-[10px] font-mono text-muted mt-1">Internal mapping: {l.record_a} ↔ {l.record_b}</div>
            </div>
          )
        })}
      </Card>
    </div>
  )
}
