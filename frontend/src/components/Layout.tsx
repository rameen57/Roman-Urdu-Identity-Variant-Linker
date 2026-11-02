import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import TopBar from './TopBar'

export default function Layout() {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto bg-bg p-6">
          <Outlet />
        </main>
        <div className="border-t border-track px-6 py-3 text-[11px] text-muted">All data and rules are fictional demonstration data.</div>
      </div>
    </div>
  )
}
