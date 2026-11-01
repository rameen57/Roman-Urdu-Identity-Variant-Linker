import { useEffect, useState } from 'react'
import Badge from '../components/Badge'
import Card from '../components/Card'
import { Empty, Loading } from '../components/States'
import { getLinks, getRecords } from '../api/client'
import type { LinkItem, RecordItem } from '../types'

export default function DashboardPage() {
  const [records, setRecords] = useState<RecordItem[]>([])
  const [links, setLinks] = useState<LinkItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getRecords(), getLinks()])
      .then(([r, l]) => { setRecords(r); setLinks(l) })
      .finally(() => setLoading(false))
  }, [])

  const confirmed = links.filter((l) => l.relation === 'confirmed_same').length
  const rejected = links.filter((l) => l.relation === 'rejected_same').length

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card><div className="text-xs font-bold uppercase text-muted">Records</div><div className="text-3xl font-extrabold text-ink">{records.length}</div></Card>
        <Card><div className="text-xs font-bold uppercase text-muted">Confirmed links</div><div className="text-3xl font-extrabold text-ink">{confirmed}</div></Card>
        <Card><div className="text-xs font-bold uppercase text-muted">Rejected links</div><div className="text-3xl font-extrabold text-ink">{rejected}</div></Card>
        <Card><div className="text-xs font-bold uppercase text-muted">Candidate pairs</div><div className="text-3xl font-extrabold text-ink">3</div></Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="mb-3 text-lg font-extrabold text-ink">Recent activity</h2>
          {loading && <Loading />}
          {!loading && links.length === 0 && <Empty label="No activity yet." />}
          <div className="space-y-2">
            {links.slice(0, 5).map((l, i) => (
              <div key={i} className="flex items-center justify-between rounded-btn border border-line bg-cream p-3 text-sm">
                <span className="font-mono">{l.record_a} ↔ {l.record_b}</span>
                <Badge label={l.relation === 'confirmed_same' ? 'Likely same' : 'Hard conflict'} />
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <h2 className="mb-3 text-lg font-extrabold text-ink">Quick start</h2>
          <div className="space-y-2 text-sm text-muted">
            <div>1. Open Console and ask: "Are REC-014 and REC-097 the same person?"</div>
            <div>2. Review suggested matches and confirm or reject.</div>
            <div>3. Inspect memory graph and knowledge base.</div>
          </div>
        </Card>
      </div>
    </div>
  )
}
