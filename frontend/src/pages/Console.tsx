import { useState } from 'react'
import Card from '../components/Card'
import Button from '../components/Button'
import Pill from '../components/Pill'
import { postChat } from '../api/client'
import type { ChatResponse } from '../types'

interface Msg { role: 'user' | 'assistant'; content: string }

const quickPrompts = [
  'Are REC-014 and REC-097 the same person?',
  'Compare REC-332 and REC-341',
  'Check REC-501 vs REC-509',
  'Are REC-600 and REC-601 the same person?',
]

export default function ConsolePage() {
  const [sessionId] = useState(() => 'session-' + Math.random().toString(36).slice(2, 8))
  const [messages, setMessages] = useState<Msg[]>([{ role: 'assistant', content: 'Welcome. Ask me to compare two records, e.g. REC-014 and REC-097.' }])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<ChatResponse | null>(null)

  async function send(text?: string) {
    const msg = text ?? input.trim()
    if (!msg) return
    setInput('')
    setMessages((m) => [...m, { role: 'user', content: msg }])
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const r = await postChat(sessionId, msg)
      setResult(r)
      setMessages((m) => [...m, { role: 'assistant', content: r.answer }])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Chat failed')
      setMessages((m) => [...m, { role: 'assistant', content: 'Error: ' + (e instanceof Error ? e.message : 'Chat failed') }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-12">
      <div className="lg:col-span-7 space-y-4">
        <Card>
          <h2 className="mb-3 text-lg font-bold text-text">Agent Console</h2>
          <div className="h-[420px] overflow-y-auto rounded-xl border border-inset bg-inset p-3 mb-3">
            {messages.map((m, i) => (
              <div key={i} className={`mb-2 rounded-xl p-3 text-sm ${m.role === 'user' ? 'bg-accent/20 text-ink' : 'bg-surface border border-track text-text'}`}>
                <span className="font-bold text-xs uppercase">{m.role === 'user' ? 'Officer' : 'Agent'}:</span> {m.content}
              </div>
            ))}
            {loading && <div className="text-xs text-muted italic">Thinking…</div>}
          </div>
          {error && <div className="p-2 rounded-xl bg-warn/20 text-ink text-xs">{error}</div>}
          <div className="flex gap-2 mb-2">
            {quickPrompts.map((q) => (
              <button key={q} onClick={() => send(q)} className="flex-1 rounded-xl border border-inset bg-inset px-3 py-2 text-xs text-left text-muted hover:text-text hover:border-track">{q}</button>
            ))}
          </div>
          <div className="flex gap-2">
            <input className="flex-1 rounded-xl border border-inset bg-inset px-3 py-2 text-sm text-text placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-accent" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') send() }} placeholder="Type a message…" />
            <Button onClick={send} disabled={loading}>Send</Button>
          </div>
        </Card>
      </div>

      <div className="lg:col-span-5 space-y-4">
        <Card>
          <h2 className="mb-3 text-lg font-bold text-text">Verdict</h2>
          {!result ? (
            <p className="text-muted text-sm">No verdict yet. Send a message to compare two records.</p>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Pill label={result.verdict} variant={result.verdict === 'Likely same' ? 'success' : result.verdict === 'Hard conflict' ? 'warn' : 'info'} />
                <span className="text-xs font-bold text-text">{result.answer}</span>
              </div>
              <div>
                <div className="text-[10px] font-semibold uppercase text-muted mb-1">Evidence for</div>
                <ul className="list-disc pl-4 text-sm text-text space-y-1">{result.evidence_for.map((e, i) => <li key={i}>{e}</li>)}</ul>
              </div>
              <div>
                <div className="text-[10px] font-semibold uppercase text-muted mb-1">Evidence against</div>
                <ul className="list-disc pl-4 text-sm text-text space-y-1">{result.evidence_against.map((e, i) => <li key={i}>{e}</li>)}</ul>
              </div>
              <div className="text-xs text-muted">{result.policy_cited}</div>
              <div className="text-xs text-muted">{result.next_step}</div>
              {result.suggested_link && (
                <div className="mt-3 flex gap-2">
                  <Button onClick={() => {}} variant="primary">Confirm same</Button>
                  <Button onClick={() => {}} variant="warn">Reject</Button>
                </div>
              )}
            </div>
          )}
        </Card>

        <Card>
          <details className="cursor-pointer">
            <summary className="text-lg font-bold text-text">Tool trace</summary>
            <div className="mt-2 space-y-1 font-mono text-xs text-muted">
              {!result ? <p className="text-muted">No trace yet.</p> : result.trace.map((t, i) => <div key={i}>{t}</div>)}
            </div>
          </details>
        </Card>

        <Card>
          <h2 className="mb-3 text-lg font-bold text-text">Retrieved policy chunks</h2>
          {!result || result.retrieved_chunks.length === 0 ? (
            <p className="text-muted text-sm">No chunks retrieved.</p>
          ) : (
            <div className="space-y-2">
              {result.retrieved_chunks.map((c, i) => (
                <div key={i} className="rounded-xl border border-inset bg-inset p-3 text-sm">
                  <div className="font-bold text-xs uppercase text-accent">{c.doc}</div>
                  <div className="text-xs text-muted">{c.text}</div>
                  <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-accent/20 text-accent text-[10px] font-bold">{Math.round(c.score * 100)}% match</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
