import { useEffect, useState } from 'react'
import Card from '../components/Card'
import { Empty, ErrorState, Loading } from '../components/States'
import { getKnowledge } from '../api/client'
import type { KnowledgeDoc } from '../types'

export default function KnowledgePage() {
  const [docs, setDocs] = useState<KnowledgeDoc[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getKnowledge()
      .then(setDocs)
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <Card>
      <h2 className="mb-3 text-lg font-extrabold text-ink">Knowledge base</h2>
      {loading && <Loading />}
      {error && <ErrorState label={error} />}
      {!loading && !error && docs.length === 0 && <Empty label="No documents." />}
      <div className="space-y-4">
        {docs.map((d) => (
          <div key={d.id} className="rounded-card border border-line bg-cream p-4">
            <div className="mb-2 font-bold text-ink">{d.id} — {d.title}</div>
            <div className="space-y-2">
              {d.chunks.map((c, i) => (
                <div key={i} className="rounded-btn bg-white p-3 text-sm">
                  {c.score !== undefined && <span className="mr-2 font-mono text-xs text-muted">score {c.score}</span>}
                  <span className="text-ink">{c.text}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
