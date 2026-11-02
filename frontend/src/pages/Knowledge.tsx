import { useEffect, useState } from 'react'
import Card from '../components/Card'
import Button from '../components/Button'
import Pill from '../components/Pill'
import { getKnowledge } from '../api/client'
import type { KnowledgeDoc } from '../types'

export default function KnowledgePage() {
  const [docs, setDocs] = useState<KnowledgeDoc[]>([])
  const [tab, setTab] = useState<'official' | 'user'>('official')
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState({ name: '', city: '', birth_year: '', note: '' })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getKnowledge().then(setDocs).finally(() => setLoading(false))
  }, [])

  const official = docs.filter((d) => d.category === 'Official SOP')
  const user = docs.filter((d) => d.category === 'User Ingested')
  const shown = tab === 'official' ? official : user

  function addRecord() {
    if (!form.name) return
    const id = `U${docs.length + 1}`
    const entry: KnowledgeDoc = {
      id,
      title: `User Record: ${form.name}`,
      category: 'User Ingested',
      score: 0.9,
      snippets: [form.note || 'Submitted by officer at runtime.', `Primary Alias: ${form.name} | City: ${form.city} | Year: ${form.birth_year}`],
    }
    setDocs((d) => [...d, entry])
    setAdding(false)
    setForm({ name: '', city: '', birth_year: '', note: '' })
  }

  return (
    <div className="space-y-6">
      <Card>
        <h2 className="mb-3 text-lg font-bold text-text">Knowledge base</h2>
        <div className="flex gap-2 mb-4">
          <Button variant={tab === 'official' ? 'primary' : 'ghost'} onClick={() => setTab('official')}>Official SOP documents</Button>
          <Button variant={tab === 'user' ? 'primary' : 'ghost'} onClick={() => setTab('user')}>User-ingested records</Button>
          <Button onClick={() => setAdding(!adding)}>{adding ? 'Cancel' : '+ Add record'}</Button>
        </div>
        {loading && <div className="h-48 flex items-center justify-center text-muted">Loading…</div>}
        {!loading && shown.length === 0 && <p className="text-muted text-sm">No documents in this category.</p>}
        <div className="space-y-3">
          {shown.map((d) => (
            <div key={d.id} className="rounded-xl border border-inset bg-inset p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="font-bold text-text">{d.id} — {d.title}</div>
                <Pill label={d.category ?? 'User Ingested'} variant={d.category === 'Official SOP' ? 'info' : 'success'} />
              </div>
              <div className="text-xs text-muted mb-2">{Math.round((d.score ?? 0) * 100)}% match</div>
              <div className="space-y-1">
                {(d.snippets ?? d.chunks?.map((c) => c.text) ?? []).map((s, i) => (
                  <div key={i} className="text-sm text-text">{s}</div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {adding && (
        <Card>
          <h2 className="mb-3 text-lg font-bold text-text">Add custom record</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input className="rounded-xl border border-inset bg-inset px-3 py-2 text-sm text-text focus:outline-none focus:ring-1 focus:ring-accent" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <input className="rounded-xl border border-inset bg-inset px-3 py-2 text-sm text-text focus:outline-none focus:ring-1 focus:ring-accent" placeholder="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
            <input className="rounded-xl border border-inset bg-inset px-3 py-2 text-sm text-text focus:outline-none focus:ring-1 focus:ring-accent" placeholder="Birth year" value={form.birth_year} onChange={(e) => setForm({ ...form, birth_year: e.target.value })} />
            <input className="rounded-xl border border-inset bg-inset px-3 py-2 text-sm text-text focus:outline-none focus:ring-1 focus:ring-accent col-span-2" placeholder="Note / alias" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
          </div>
          <div className="mt-3 flex gap-2">
            <Button variant="primary" onClick={addRecord} disabled={!form.name}>Ingest record</Button>
            <Button variant="ghost" onClick={() => setAdding(false)}>Cancel</Button>
          </div>
        </Card>
      )}
    </div>
  )
}
