import { useEffect, useState } from 'react'
import Card from '../components/Card'
import { Empty, ErrorState, Loading } from '../components/States'
import { getLinks, getMemory, getRecords } from '../api/client'
import type { LinkItem, MemoryResponse, RecordItem } from '../types'

export default function MemoryPage() {
  const [memory, setMemory] = useState<MemoryResponse | null>(null)
  const [links, setLinks] = useState<LinkItem[]>([])
  const [records, setRecords] = useState<RecordItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([getMemory('session-1'), getLinks(), getRecords()])
      .then(([m, l, r]) => { setMemory(m); setLinks(l); setRecords(r) })
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed'))
      .finally(() => setLoading(false))
  }, [])

  const nodeIds = Array.from(new Set([...records.map((r) => r.record_id), ...links.flatMap((l) => [l.record_a, l.record_b])]))
  const pos = (i: number, n: number) => {
    const angle = (2 * Math.PI * i) / Math.max(n, 1)
    const r = 120
    return { x: 160 + r * Math.cos(angle), y: 160 + r * Math.sin(angle) }
  }

  return (
    <div className="space-y-6">
      <Card>
        <h2 className="mb-3 text-lg font-extrabold text-ink">Short-term memory</h2>
        {loading && <Loading />}
        {error && <ErrorState label={error} />}
        {!loading && !error && (
          <>
            <div className="mb-2 text-xs font-bold uppercase text-muted">Messages</div>
            <div className="mb-4 space-y-1">
              {(memory?.stm ?? []).length === 0 && <Empty label="No messages." />}
              {memory?.stm.map((m, i) => (
                <div key={i} className="rounded-btn bg-cream p-2 text-sm"><span className="font-bold">{m.role}:</span> {m.content}</div>
              ))}
            </div>
            <div className="mb-2 text-xs font-bold uppercase text-muted">Working set</div>
            <div className="space-y-1">
              {(memory?.working_set ?? []).length === 0 && <Empty label="No candidate pairs." />}
              {memory?.working_set.map((c, i) => (
                <div key={i} className="rounded-btn bg-cream p-2 text-sm font-mono">{c.record_a} ↔ {c.record_b} {c.score !== undefined && `(${c.score})`}</div>
              ))}
            </div>
          </>
        )}
      </Card>

      <Card>
        <h2 className="mb-3 text-lg font-extrabold text-ink">Long-term memory graph</h2>
        {loading && <Loading />}
        {!loading && (
          <svg width="320" height="320" className="mx-auto">
            {links.map((l, i) => {
              const ai = nodeIds.indexOf(l.record_a)
              const bi = nodeIds.indexOf(l.record_b)
              if (ai < 0 || bi < 0) return null
              const a = pos(ai, nodeIds.length)
              const b = pos(bi, nodeIds.length)
              return <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={l.relation === 'confirmed_same' ? '#B7E4C7' : '#F4A6B7'} strokeWidth={3} />
            })}
            {nodeIds.map((id, i) => {
              const p = pos(i, nodeIds.length)
              return (
                <g key={id}>
                  <circle cx={p.x} cy={p.y} r={22} fill="#CDB4DB" />
                  <text x={p.x} y={p.y + 4} textAnchor="middle" fontSize={10} fontWeight={700} fill="#3D3550">{id}</text>
                </g>
              )
            })}
          </svg>
        )}
        <div className="mt-2 text-center text-xs text-muted">Green = confirmed same, rose = rejected.</div>
      </Card>
    </div>
  )
}
