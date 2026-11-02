import { useEffect, useState } from 'react'
import Card from '../components/Card'
import { getLinks, getMemory, getRecords } from '../api/client'
import type { LinkItem, MemoryResponse, RecordItem } from '../types'

export default function MemoryPage() {
  const [memory, setMemory] = useState<MemoryResponse | null>(null)
  const [links, setLinks] = useState<LinkItem[]>([])
  const [records, setRecords] = useState<RecordItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getMemory('session-1'), getLinks(), getRecords()])
      .then(([m, l, r]) => { setMemory(m); setLinks(l); setRecords(r) })
      .finally(() => setLoading(false))
  }, [])

  const nodeIds = Array.from(new Set([...records.map((r) => r.record_id), ...links.flatMap((l) => [l.record_a, l.record_b])]))
  const pos = (i: number, n: number) => {
    const angle = (2 * Math.PI * i) / Math.max(n, 1)
    const r = 110
    return { x: 150 + r * Math.cos(angle), y: 150 + r * Math.sin(angle) }
  }

  if (loading) return <div className="h-80 flex items-center justify-center text-muted">Loading memory…</div>

  return (
    <div className="space-y-6">
      <Card>
        <h2 className="mb-3 text-lg font-bold text-text">Short-term memory</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="text-[10px] font-semibold uppercase text-muted mb-2">Messages</div>
            <div className="space-y-1">
              {(memory?.stm ?? []).length === 0 && <p className="text-muted text-sm">No messages.</p>}
              {memory?.stm.map((m, i) => (
                <div key={i} className="rounded-xl bg-inset p-2 text-sm">
                  <span className="font-bold text-accent text-xs uppercase">{m.role}</span>: {m.content}
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="text-[10px] font-semibold uppercase text-muted mb-2">Working set</div>
            <div className="space-y-1">
              {(memory?.working_set ?? []).length === 0 && <p className="text-muted text-sm">No candidate pairs.</p>}
              {memory?.working_set.map((c, i) => (
                <div key={i} className="rounded-xl bg-inset p-2 text-sm font-mono text-xs">{c.record_a} ↔ {c.record_b} {c.score !== undefined ? `(${c.score})` : ''}</div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <h2 className="mb-3 text-lg font-bold text-text">Long-term memory graph</h2>
        <div className="relative w-full h-[420px]">
          <svg className="w-full h-full" viewBox="0 0 300 300">
            {links.map((l, i) => {
              const ai = nodeIds.indexOf(l.record_a)
              const bi = nodeIds.indexOf(l.record_b)
              if (ai < 0 || bi < 0) return null
              const a = pos(ai, nodeIds.length), b = pos(bi, nodeIds.length)
              return <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={l.relation === 'confirmed_same' ? '#A7ABFF' : '#FF9D73'} strokeWidth={l.relation === 'confirmed_same' ? 4 : 3} strokeDasharray={l.relation === 'confirmed_same' ? '0' : '6,4'} />
            })}
            {nodeIds.map((id, i) => {
              const p = pos(i, nodeIds.length)
              const rec = records.find((r) => r.record_id === id)
              return (
                <g key={id}>
                  <circle cx={p.x} cy={p.y} r={20} fill="#363740" stroke="#A7ABFF" strokeWidth={2} />
                  <text x={p.x} y={p.y + 4} textAnchor="middle" fontSize={10} fontWeight={700} fill="#FFFFFF">{rec?.name?.split(' ')[0] ?? id}</text>
                </g>
              )
            })}
          </svg>
          <div className="absolute bottom-2 left-2 flex gap-2">
            <span className="px-2 py-1 rounded-full bg-accent text-ink text-[10px] font-bold">Confirmed</span>
            <span className="px-2 py-1 rounded-full bg-warn/20 border border-warn text-ink text-[10px] font-bold">Rejected</span>
          </div>
        </div>
        <div className="mt-2 text-xs text-muted">Nodes: records. Lavender edges = confirmed same; peach dashed = rejected.</div>
      </Card>
    </div>
  )
}
