import { useEffect, useState } from 'react'
import Card from '../components/Card'
import { Empty, ErrorState, Loading } from '../components/States'
import { getMcpCapabilities } from '../api/client'
import type { CallLogEntry, McpCapabilities } from '../types'

export default function McpPage() {
  const [caps, setCaps] = useState<McpCapabilities | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [log, setLog] = useState<CallLogEntry[]>([])

  useEffect(() => {
    getMcpCapabilities()
      .then(setCaps)
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed'))
      .finally(() => setLoading(false))
  }, [])

  function simulate(tool: string) {
    setLog((l) => [
      { id: String(Date.now()), tool, args: { demo: true }, result: { ok: true }, timestamp: new Date().toLocaleTimeString() },
      ...l,
    ])
  }

  return (
    <div className="space-y-6">
      <Card>
        <h2 className="mb-3 text-lg font-extrabold text-ink">Tools</h2>
        {loading && <Loading />}
        {error && <ErrorState label={error} />}
        {!loading && !error && (
          <div className="space-y-2">
            {caps?.tools.map((t) => (
              <div key={t.name} className="rounded-btn border border-line bg-cream p-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-sm font-bold text-ink">{t.name}</span>
                  <button onClick={() => simulate(t.name)} className="text-xs font-bold text-muted underline">Log call</button>
                </div>
                <div className="text-sm text-muted">{t.description}</div>
                {t.input_schema && <div className="mt-1 font-mono text-xs text-muted">{JSON.stringify(t.input_schema)}</div>}
              </div>
            ))}
          </div>
        )}
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="mb-3 text-lg font-extrabold text-ink">Resources</h2>
          {(caps?.resources ?? []).length === 0 && <Empty label="No resources." />}
          {caps?.resources.map((r) => (
            <div key={r.name} className="mb-2 rounded-btn border border-line bg-cream p-3 text-sm">
              <div className="font-mono font-bold text-ink">{r.name}</div>
              <div className="text-muted">{r.description}</div>
              {r.uri && <div className="font-mono text-xs text-muted">{r.uri}</div>}
            </div>
          ))}
        </Card>
        <Card>
          <h2 className="mb-3 text-lg font-extrabold text-ink">Prompts</h2>
          {(caps?.prompts ?? []).length === 0 && <Empty label="No prompts." />}
          {caps?.prompts.map((p) => (
            <div key={p.name} className="mb-2 rounded-btn border border-line bg-cream p-3 text-sm">
              <div className="font-mono font-bold text-ink">{p.name}</div>
              <div className="text-muted">{p.description}</div>
            </div>
          ))}
        </Card>
      </div>

      <Card>
        <h2 className="mb-3 text-lg font-extrabold text-ink">Call log</h2>
        {log.length === 0 && <Empty label="No calls logged yet." />}
        <div className="space-y-2">
          {log.map((e) => (
            <div key={e.id} className="rounded-btn border border-line bg-cream p-3 font-mono text-xs text-muted">
              <div className="font-bold text-ink">{e.tool} @ {e.timestamp}</div>
              <div>args: {JSON.stringify(e.args)}</div>
              <div>result: {JSON.stringify(e.result)}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
