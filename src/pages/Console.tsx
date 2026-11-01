import { useState } from 'react'
import Badge from '../components/Badge'
import Button from '../components/Button'
import Card from '../components/Card'
import { Empty, ErrorState, Loading } from '../components/States'
import { postChat } from '../api/client'
import type { ChatResponse } from '../types'

interface Msg { role: 'user' | 'assistant'; content: string }

export default function ConsolePage() {
  const [sessionId] = useState(() => 'session-' + Math.random().toString(36).slice(2))
  const [messages, setMessages] = useState<Msg[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<ChatResponse | null>(null)

  async function send() {
    const text = input.trim()
    if (!text) return
    setInput('')
    setMessages((m) => [...m, { role: 'user', content: text }])
    setLoading(true)
    setError(null)
    try {
      const r = await postChat(sessionId, text)
      setResult(r)
      setMessages((m) => [...m, { role: 'assistant', content: r.answer }])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Chat failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <Card>
        <h2 className="mb-3 text-lg font-extrabold text-ink">Agent Chat</h2>
        <div className="mb-3 h-72 overflow-auto rounded-card border border-line bg-cream p-3">
          {messages.length === 0 && <Empty label="Ask about two records, e.g. Are REC-014 and REC-097 the same person?" />}
          {messages.map((m, i) => (
            <div key={i} className={`mb-2 rounded-btn p-2 text-sm ${m.role === 'user' ? 'bg-lavender/40' : 'bg-white'}`}>
              <span className="font-bold">{m.role === 'user' ? 'Officer' : 'Agent'}:</span> {m.content}
            </div>
          ))}
          {loading && <Loading label="Thinking..." />}
        </div>
        {error && <ErrorState label={error} />}
        <div className="flex gap-2">
          <input
            className="flex-1 rounded-btn border border-line bg-white px-3 py-2 text-sm"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') send() }}
            placeholder="Type a message..."
          />
          <Button onClick={send} disabled={loading}>Send</Button>
        </div>
      </Card>

      <div className="space-y-6">
        <Card>
          <h2 className="mb-3 text-lg font-extrabold text-ink">Verdict</h2>
          {!result && <Empty label="No verdict yet." />}
          {result && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge label={result.verdict} />
                <span className="text-sm font-semibold text-muted">{result.answer}</span>
              </div>
              <div>
                <div className="text-xs font-bold uppercase text-muted">Evidence for</div>
                <ul className="list-disc pl-5 text-sm text-ink">
                  {result.evidence_for.map((e, i) => <li key={i}>{e}</li>)}
                </ul>
              </div>
              <div>
                <div className="text-xs font-bold uppercase text-muted">Evidence against</div>
                <ul className="list-disc pl-5 text-sm text-ink">
                  {result.evidence_against.map((e, i) => <li key={i}>{e}</li>)}
                </ul>
              </div>
              <div className="text-sm"><span className="font-bold">Policy cited:</span> {result.policy_cited}</div>
              <div className="text-sm"><span className="font-bold">Next step:</span> {result.next_step}</div>
            </div>
          )}
        </Card>

        <Card>
          <details>
            <summary className="cursor-pointer text-lg font-extrabold text-ink">Tool trace</summary>
            <div className="mt-3 space-y-1 font-mono text-xs text-muted">
              {!result && <Empty label="No trace yet." />}
              {result?.trace.map((t, i) => <div key={i}>{t}</div>)}
            </div>
          </details>
        </Card>

        {result && result.retrieved_chunks.length > 0 && (
          <Card>
            <h2 className="mb-3 text-lg font-extrabold text-ink">Retrieved chunks</h2>
            <div className="space-y-2">
              {result.retrieved_chunks.map((c, i) => (
                <div key={i} className="rounded-btn border border-line bg-cream p-3 text-sm">
                  <div className="font-bold text-ink">{c.doc} <span className="text-muted">({c.score})</span></div>
                  <div className="text-muted">{c.text}</div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
