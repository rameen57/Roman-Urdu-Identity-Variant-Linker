import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import DashboardPage from './pages/Dashboard'
import ConsolePage from './pages/Console'
import RecordsPage from './pages/Records'
import ReviewPage from './pages/Review'
import MemoryPage from './pages/Memory'
import McpPage from './pages/Mcp'
import KnowledgePage from './pages/Knowledge'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="console" element={<ConsolePage />} />
          <Route path="records" element={<RecordsPage />} />
          <Route path="review" element={<ReviewPage />} />
          <Route path="memory" element={<MemoryPage />} />
          <Route path="mcp" element={<McpPage />} />
          <Route path="knowledge" element={<KnowledgePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
