import type {
  ChatResponse, DashboardStats, KnowledgeDoc, LinkItem, McpCapabilities,
  MemoryResponse, RecordItem, SaveLinkInput, SaveLinkResponse,
} from '../types'
import { mockChat, mockKnowledge, mockLinks, mockMcpCapabilities, mockMemory, mockRecords, mockSaveLink } from '../mocks/data'

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'
const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false'

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, init)
  if (!res.ok) throw new Error(`Request failed: ${res.status}`)
  return res.json() as Promise<T>
}

export async function getHealth() { if (USE_MOCK) return { status: 'ok', groq_configured: true }; return request('/api/health') }
export async function getRecords(): Promise<RecordItem[]> { if (USE_MOCK) return [...mockRecords]; return request<RecordItem[]>('/api/records') }
export async function getLinks(): Promise<LinkItem[]> { if (USE_MOCK) return [...mockLinks]; return request<LinkItem[]>('/api/links') }
export async function saveLink(input: SaveLinkInput): Promise<SaveLinkResponse> {
  if (USE_MOCK) {
    mockLinks.push({ ...input, confirmed_by: 'officer', date: new Date().toISOString().slice(0, 10) })
    return mockSaveLink()
  }
  return request<SaveLinkResponse>('/api/links', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(input) })
}
export async function getMcpCapabilities(): Promise<McpCapabilities> { if (USE_MOCK) return mockMcpCapabilities; return request<McpCapabilities>('/api/mcp/capabilities') }
export async function getMemory(sessionId: string): Promise<MemoryResponse> { if (USE_MOCK) return mockMemory; return request<MemoryResponse>(`/api/memory/${sessionId}`) }
export async function getKnowledge(): Promise<KnowledgeDoc[]> { if (USE_MOCK) return [...mockKnowledge]; return request<KnowledgeDoc[]>('/api/knowledge') }
export async function getDashboard(): Promise<DashboardStats> { if (USE_MOCK) return { records: mockRecords.length, pending_reviews: 3, confirmed: mockLinks.filter(l => l.relation === 'confirmed_same').length, rejected: mockLinks.filter(l => l.relation === 'rejected_same').length, verdict_counts: { 'Likely same': 2, Possible: 1, Unlikely: 1, 'Hard conflict': 0 }, matches_per_day: [] }; return request<DashboardStats>('/api/dashboard') }
export async function postChat(sessionId: string, message: string): Promise<ChatResponse> {
  if (USE_MOCK) return mockChat(message)
  return request<ChatResponse>('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ session_id: sessionId, message }) })
}
