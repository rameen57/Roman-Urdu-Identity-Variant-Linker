import { useEffect, useState } from 'react'
import Card from '../components/Card'
import HeroCard from '../components/HeroCard'
import StatCard from '../components/StatCard'
import AlertBanner from '../components/AlertBanner'
import { getDashboard, getLinks } from '../api/client'
import Pill from '../components/Pill'

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null)
  const [links, setLinks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getDashboard(), getLinks()])
      .then(([s, l]) => { setStats(s); setLinks(l) })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="h-64 flex items-center justify-center text-muted">Loading dashboard…</div>

  const verdicts = stats?.verdict_counts ?? { 'Likely same': 0, Possible: 0, Unlikely: 0, 'Hard conflict': 0 }
  const total = (Object.values(verdicts) as any[]).reduce((a: any, b: any) => a + b, 0) || 1

  return (
    <div className="space-y-6">
      <HeroCard
        title="Identity Variant Linker"
        subtitle="Review and confirm candidate record matches before they are written to long-term memory."
        buttonLabel="Go to Link Review"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Registry records" value={stats?.records ?? 0} />
          <StatCard label="Confirmed links" value={stats?.confirmed ?? 0} delta="+2 vs last week" />
          <StatCard label="Pending reviews" value={stats?.pending_reviews ?? 0} />
          <StatCard label="Rejected links" value={stats?.rejected ?? 0} />
        </div>
      </HeroCard>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <h2 className="mb-3 text-lg font-bold text-text">Recent decisions</h2>
          {links.length === 0 && <p className="text-muted">No decisions recorded yet.</p>}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-track text-muted">
                <tr><th className="py-2">Record A</th><th className="py-2">Record B</th><th className="py-2">Decision</th><th className="py-2">Score</th><th className="py-2">Date</th></tr>
              </thead>
              <tbody>
                {links.slice(0, 8).map((l, i) => (
                  <tr key={i} className="border-b border-inset">
                    <td className="py-2 font-mono text-xs">{l.record_a}</td>
                    <td className="py-2 font-mono text-xs">{l.record_b}</td>
                    <td className="py-2"><Pill label={l.relation === 'confirmed_same' ? 'Confirmed' : 'Rejected'} variant={l.relation === 'confirmed_same' ? 'success' : 'warn'} /></td>
                    <td className="py-2 font-mono text-xs">{l.score}</td>
                    <td className="py-2 text-xs text-muted">{l.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card>
          <h2 className="mb-3 text-lg font-bold text-text">Verdict distribution</h2>
          <div className="space-y-2">
            {Object.entries(verdicts).map(([v, c]) => {
              const pct = Math.round((Number(c) / total) * 100)
              return (
                <div key={v} className="flex items-center gap-3">
                  <span className="w-16 text-[11px] text-muted">{v}</span>
                  <div className="flex-1 h-3 bg-track rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition ${v === 'Likely same' ? 'bg-accent' : v === 'Hard conflict' ? 'bg-warn' : 'bg-inset'}`} style={{ width: `${pct}%` }} />
                  </div>
                  <span className="w-8 text-[11px] font-bold text-text tabular-nums">{pct}%</span>
                </div>
              )
            })}
          </div>
        </Card>
      </div>

      <AlertBanner message="Groq API key not configured — running in deterministic mock mode. Set GROQ_API_KEY in backend/.env to enable LLM reasoning." type="warn" icon={<span className="text-xs font-bold">⚠</span>} />
    </div>
  )
}
