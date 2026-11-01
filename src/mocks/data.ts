import type {
  ChatResponse,
  KnowledgeDoc,
  LinkItem,
  McpCapabilities,
  MemoryResponse,
  RecordItem,
  Verdict,
} from '../types'

export const mockRecords: RecordItem[] = [
  { record_id: 'REC-014', name: 'Muhammad Ali Khan', father_name: 'Abdul Rahman Khan', birth_year: 1988, city: 'Lahore', phonetic_key: 'mmmd al xn' },
  { record_id: 'REC-097', name: 'Mohammed Alee Khaan', father_name: 'Abdul Rehman Khan', birth_year: 1988, city: 'Lahor', phonetic_key: 'mmmd al xn' },
  { record_id: 'REC-131', name: 'Muhammad Ahmed Khan', father_name: 'Saeed Khan', birth_year: 1991, city: 'Multan', phonetic_key: 'mmmd amd xn' },
]

export const mockLinks: LinkItem[] = [
  { record_a: 'REC-014', record_b: 'REC-097', relation: 'confirmed_same', score: 0.96, evidence: 'Phonetic keys equal; father name and birth year agree', confirmed_by: 'officer', date: '2026-11-03' },
]

export const mockMcpCapabilities: McpCapabilities = {
  tools: [
    { name: 'phonetic_key', description: 'Normalise a name into a phonetic key.', input_schema: { name: 'string' } },
    { name: 'name_similarity', description: 'Compare two Roman-Urdu names and return phonetic, spelling and combined scores.', input_schema: { name_a: 'string', name_b: 'string' } },
    { name: 'compare_records', description: 'Compare two records field by field.', input_schema: { record_a: 'object', record_b: 'object' } },
    { name: 'validate_fictional_id', description: 'Validate a fictional FRO id.', input_schema: { id_value: 'string' } },
    { name: 'resolve_city', description: 'Look up a Pakistani city with Open-Meteo geocoding.', input_schema: { city: 'string' } },
    { name: 'compare_cities', description: 'Decide if two city spellings are the same place.', input_schema: { city_a: 'string', city_b: 'string' } },
    { name: 'search_candidates', description: 'Find local registry records whose name sounds similar.', input_schema: { name: 'string' } },
    { name: 'save_link', description: 'Save an officer-confirmed decision.', input_schema: { record_a: 'string', record_b: 'string', relation: 'string', score: 'number', evidence: 'string' } },
    { name: 'get_links', description: 'Past confirmed or rejected links for a record.', input_schema: { record_id: 'string' } },
  ],
  resources: [
    { name: 'matching_thresholds', description: 'Current threshold table as text.', uri: 'policy://matching-thresholds' },
  ],
  prompts: [
    { name: 'review_candidate_match', description: 'Reusable review template for a candidate match.' },
  ],
}

export const mockMemory: MemoryResponse = {
  stm: [
    { role: 'user', content: 'Are REC-014 and REC-097 the same person?' },
    { role: 'assistant', content: 'Likely same person; awaiting officer confirmation.' },
  ],
  working_set: [
    { record_a: 'REC-014', record_b: 'REC-097', score: 0.96, note: 'Phonetic keys equal' },
  ],
}

export const mockKnowledge: KnowledgeDoc[] = [
  { id: 'D1', title: 'Naming Conventions Handbook', chunks: [{ text: 'Names are stored as given name, father name and family name.', score: 0.81 }] },
  { id: 'D2', title: 'Roman-Urdu Transliteration Rules', chunks: [{ text: 'Variant families: aa/a, ee/i, kh/x and others.', score: 0.84 }] },
  { id: 'D3', title: 'Records Office Matching SOP', chunks: [{ text: 'Likely same when combined >= 0.92 and all tokens phonetically equal.', score: 0.87 }] },
  { id: 'D4', title: 'Alias Confirmation and Rejection Policy', chunks: [{ text: 'Only an officer may confirm or reject a link.', score: 0.79 }] },
  { id: 'D5', title: 'Fictional ID Format Specification', chunks: [{ text: 'IDs follow FRO-DD-NNNNNN-C with a check digit.', score: 0.73 }] },
  { id: 'D6', title: 'Abbreviations and Honorifics Guide', chunks: [{ text: 'Muhd, Md and Mohammed normalise to Muhammad.', score: 0.76 }] },
  { id: 'D7', title: 'Ambiguity Playbook', chunks: [{ text: 'Common names and near-misses require supporting fields.', score: 0.71 }] },
]

const verdictByPair: Record<string, { verdict: Verdict; score: number }> = {
  'REC-014|REC-097': { verdict: 'Likely same', score: 0.96 },
  'REC-097|REC-014': { verdict: 'Likely same', score: 0.96 },
  'REC-014|REC-131': { verdict: 'Possible', score: 0.84 },
  'REC-131|REC-014': { verdict: 'Possible', score: 0.84 },
  'REC-097|REC-131': { verdict: 'Possible', score: 0.82 },
  'REC-131|REC-097': { verdict: 'Possible', score: 0.82 },
}

export function mockChat(message: string): ChatResponse {
  const ids = message.match(/REC-\d+/g) ?? []
  const a = ids[0] ?? 'REC-014'
  const b = ids[1] ?? 'REC-097'
  const key = `${a}|${b}`
  const info = verdictByPair[key] ?? { verdict: 'Possible' as Verdict, score: 0.8 }
  const recA = mockRecords.find((r) => r.record_id === a)
  const recB = mockRecords.find((r) => r.record_id === b)
  const nameA = recA?.name ?? a
  const nameB = recB?.name ?? b
  const likely = info.verdict === 'Likely same'
  return {
    answer: `${a} (${nameA}) and ${b} (${nameB}) are ${info.verdict.toLowerCase()} the same person.`,
    verdict: info.verdict,
    evidence_for: likely
      ? ['Phonetic keys are equal', 'Father name and birth year agree', 'Cities resolve to the same place']
      : ['Names share a family name', 'Some phonetic overlap'],
    evidence_against: likely
      ? ['Spelling score is 0.89, so the spellings differ']
      : ['Name tokens differ phonetically', 'Supporting fields do not fully agree'],
    policy_cited: 'Records Office Matching SOP',
    next_step: 'Ask the officer to confirm before saving the link',
    trace: ['Selected tool: name_similarity', 'Selected tool: compare_records', 'Selected tool: compare_cities'],
    retrieved_chunks: [{ doc: 'Records Office Matching SOP', score: 0.87, text: 'Likely same when combined >= 0.92 and all tokens phonetically equal.' }],
  }
}

export function mockSaveLink(): { saved: boolean; total_links: number } {
  return { saved: true, total_links: mockLinks.length + 1 }
}
