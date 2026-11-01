import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import ConsolePage from './pages/Console'
import KnowledgePage from './pages/Knowledge'
import McpPage from './pages/Mcp'
import MemoryPage from './pages/Memory'
import RecordsPage from './pages/Records'
import ReviewPage from './pages/Review'

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/console" replace />} />
          <Route path="/console" element={<ConsolePage />} />
          <Route path="/records" element={<RecordsPage />} />
          <Route path="/review" element={<ReviewPage />} />
          <Route path="/memory" element={<MemoryPage />} />
          <Route path="/mcp" element={<McpPage />} />
          <Route path="/knowledge" element={<KnowledgePage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}
