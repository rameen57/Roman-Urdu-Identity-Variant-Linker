export type Verdict = 'Likely same' | 'Possible' | 'Unlikely' | 'Hard conflict'

export interface RecordItem {
  record_id: string
  name: string
  father_name: string
  birth_year: number
  city: string
  phonetic_key?: string
}

export interface RetrievedChunk {
  doc: string
  score: number
  text: string
}

export interface ChatResponse {
  answer: string
  verdict: Verdict
  evidence_for: string[]
  evidence_against: string[]
  policy_cited: string
  next_step: string
  trace: string[]
  retrieved_chunks: RetrievedChunk[]
  suggested_link?: any
}

export interface LinkItem {
  record_a: string
  record_b: string
  relation: 'confirmed_same' | 'rejected_same'
  score: number
  evidence: string
  confirmed_by?: string
  date?: string
}

export interface SaveLinkInput {
  record_a: string
  record_b: string
  relation: 'confirmed_same' | 'rejected_same'
  score: number
  evidence: string
}

export interface SaveLinkResponse { saved: boolean; total_links: number }

export interface McpTool { name: string; description: string; input_schema?: Record<string, unknown> }
export interface McpResource { name: string; description?: string; uri?: string }
export interface McpPrompt { name: string; description?: string }
export interface McpCapabilities { tools: McpTool[]; resources: McpResource[]; prompts: McpPrompt[] }

export interface CallLogEntry {
  id: string; timestamp: string; toolName: string; type: string; status: string;
  input: any; output: any; latency: string;
}

export interface MemoryMessage { role: string; content: string }
export interface CandidatePair { record_a: string; record_b: string; score?: number; note?: string }
export interface MemoryResponse { stm: MemoryMessage[]; working_set: CandidatePair[]; ltm?: any }

export interface KnowledgeChunk { text: string; score?: number }
export interface KnowledgeDoc { id: string; title: string; category?: string; score?: number; snippets?: string[]; chunks?: KnowledgeChunk[] }

export interface DashboardStats {
  records: number; pending_reviews: number; confirmed: number; rejected: number;
  verdict_counts: Record<string, number>; matches_per_day: any[];
}
