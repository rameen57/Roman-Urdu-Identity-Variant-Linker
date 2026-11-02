import Footer from './Footer'
import Sidebar from './Sidebar'
import TopBar from './TopBar'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-cream">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar />
        <main className="flex-1 overflow-auto">
          <div className="mx-auto max-w-[1200px] px-6 py-6">{children}</div>
        </main>
        <Footer />
      </div>
    </div>
  )
}
