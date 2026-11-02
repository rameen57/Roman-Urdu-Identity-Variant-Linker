import { useEffect, useState } from 'react'
import Card from '../components/Card'
import Button from '../components/Button'
import Pill from '../components/Pill'
import { getMcpCapabilities } from '../api/client'
import { initialCallLogs } from '../mocks/data'
import type { CallLogEntry, McpCapabilities } from '../types'

export default function McpPage() {
  const [caps, setCaps] = useState<McpCapabilities | null>(null)
  const [loading, setLoading] = useState(true)
  const [logs, setLogs] = useState<CallLogEntry[]>(initialCallLogs)

  useEffect(() => {
    getMcpCapabilities()
      .then(setCaps)
      .finally(() => setLoading(false))
  }, [])

  const append = (tool: string) => {
    setLogs((l) => [
      { id: `call-${Date.now()}`, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }), toolName: tool, type: 'MCP_TOOL_CALL', status: 'SUCCESS', input: { demo: true }, output: { ok: true }, latency: '15ms' },
      ...l,
    ])
  }

  return (
    <div className="space-y-6">
      <Card>
        <h2 className="mb-3 text-lg font-bold text-text">Discovered MCP capabilities</h2>
        {loading && <div className="h-48 flex items-center justify-center text-muted">Loading…</div>}
        {!loading && caps && (
          <div className="space-y-2">
            {caps.tools.map((t) => (
              <div key={t.name} className="rounded-xl border border-inset bg-inset p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono font-bold text-accent text-xs">{t.name}</span>
                  <Button onClick={() => append(t.name)} className="text-[10px] px-2 py-1">Log call</Button>
                </div>
                <div className="text-xs text-muted">{t.description}</div>
                {t.input_schema && <div className="mt-1 font-mono text-xs text-muted bg-surface p-1 rounded">{JSON.stringify(t.input_schema)}</div>}
              </div>
            ))}
          </div>
        )}
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <h2 className="mb-3 text-lg font-bold text-text">Resources</h2>
          {(caps?.resources ?? []).length === 0 && <p className="text-muted text-sm">No resources.</p>}
          {caps?.resources.map((r) => (
            <div key={r.name} className="mb-2 rounded-xl border border-inset bg-inset p-3 text-sm">
              <div className="font-mono font-bold text-accent">{r.name}</div>
              <div className="text-xs text-muted">{r.description}</div>
              {r.uri && <div className="text-[10px] font-mono text-muted mt-1">{r.uri}</div>}
            </div>
          ))}
        </Card>
        <Card>
          <h2 className="mb-3 text-lg font-bold text-text">Prompts</h2>
          {(caps?.prompts ?? []).length === 0 && <p className="text-muted text-sm">No prompts.</p>}
          {caps?.prompts.map((p) => (
            <div key={p.name} className="mb-2 rounded-xl border border-inset bg-inset p-3 text-sm">
              <div className="font-mono font-bold text-accent">{p.name}</div>
              <div className="text-xs text-muted">{p.description}</div>
            </div>
          ))}
        </Card>
      </div>

      <Card>
        <h2 className="mb-3 text-lg font-bold text-text">Call log</h2>
        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          {logs.length === 0 && <p className="text-muted text-sm">No calls logged yet.</p>}
          {logs.map((e) => (
            <div key={e.id} className="rounded-xl border border-inset bg-inset p-3 cursor-pointer group">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="px-1.5 py-0.5 rounded bg-inset text-[10px] font-bold">{e.type === 'MCP_TOOL_CALL' ? 'MCP TOOL' : 'API'}</span>
                  <span className="font-mono font-bold text-accent text-xs">{e.toolName}</span>
                  <span className="text-[10px] text-muted">{e.timestamp}</span>
                </div>
                <Pill label={e.status} variant={e.status === '200 OK' || e.status === 'SUCCESS' ? 'success' : 'warn'} />
              </div>
              <div className="text-xs text-muted mb-1">Latency {e.latency}</div>
              <div className="font-mono text-[10px] text-muted bg-surface p-1 rounded border border-inset/50 max-h-24 overflow-hidden group-hover:max-h-96">
                <div>in: {JSON.stringify(e.input)}</div>
                <div>out: {JSON.stringify(e.output)}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
