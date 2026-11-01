import { NavLink } from 'react-router-dom'

const nav = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/console', label: 'Console' },
  { to: '/records', label: 'Records' },
  { to: '/review', label: 'Review' },
  { to: '/memory', label: 'Memory' },
  { to: '/mcp', label: 'MCP' },
  { to: '/knowledge', label: 'Knowledge' },
]

export default function Sidebar() {
  return (
    <aside className="w-60 shrink-0 border-r border-line bg-white/70 backdrop-blur">
      <div className="px-5 py-6">
        <div className="text-lg font-extrabold text-ink">Identity Variant Linker</div>
        <div className="text-xs text-muted">Console</div>
      </div>
      <nav className="px-3 pb-6">
        {nav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `mb-1 block rounded-btn px-3 py-2 text-sm font-semibold transition ${
                isActive ? 'bg-lavender text-ink' : 'text-muted hover:bg-cream'
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
