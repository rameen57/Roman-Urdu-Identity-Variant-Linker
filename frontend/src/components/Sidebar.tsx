import { NavLink } from 'react-router-dom'

const icons: Record<string, React.ReactNode> = {
  dashboard: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>,
  console: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>,
  records: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>,
  review: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/></svg>,
  memory: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>,
  mcp: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"/></svg>,
  knowledge: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/></svg>,
}

export default function Sidebar() {
  const items = [
    { to: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
    { to: '/console', label: 'Agent Console', icon: 'console' },
    { to: '/records', label: 'Records', icon: 'records' },
    { to: '/review', label: 'Link Review', icon: 'review' },
    { to: '/memory', label: 'Memory', icon: 'memory' },
    { to: '/mcp', label: 'MCP Inspector', icon: 'mcp' },
    { to: '/knowledge', label: 'Knowledge Base', icon: 'knowledge' },
  ]
  return (
    <aside className="w-64 shrink-0 border-r border-track flex flex-col">
      <div className="px-5 py-6 border-b border-track">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-accent text-ink flex items-center justify-center font-bold text-xs">IVL</div>
          <div className="font-extrabold text-text tracking-tight">Identity Variant Linker</div>
        </div>
        <div className="text-[10px] text-muted mt-2">Fictional Records Office</div>
      </div>
      <nav className="flex-1 px-2 py-3 overflow-y-auto">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `mb-1 block flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm font-semibold transition ${isActive ? 'bg-surface text-accent' : 'text-muted hover:text-text hover:bg-inset'}`
            }
          >
            {icons[item.icon]}
            <span className="flex-1">{item.label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="px-5 py-4 border-t border-track text-[10px] text-muted">
        All data and rules are fictional demonstration data.
      </div>
    </aside>
  )
}
