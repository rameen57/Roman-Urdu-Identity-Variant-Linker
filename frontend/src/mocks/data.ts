import type { CallLogEntry, ChatResponse, KnowledgeDoc, LinkItem, McpCapabilities, MemoryResponse, RecordItem, Verdict } from '../types'

export const mockRecords: RecordItem[] = [
  { record_id: 'REC-014', name: 'Muhammad Ali Khan', father_name: 'Abdul Rahman Khan', birth_year: 1988, city: 'Lahore', phonetic_key: 'mmmd al xn' },
  { record_id: 'REC-097', name: 'Mohammed Alee Khaan', father_name: 'Abdul Rehman Khan', birth_year: 1988, city: 'Lahor', phonetic_key: 'mmmd al xn' },
  { record_id: 'REC-131', name: 'Muhammad Ahmed Khan', father_name: 'Saeed Khan', birth_year: 1991, city: 'Multan', phonetic_key: 'mmmd amd xn' },
  { record_id: 'REC-205', name: 'Muhd. Ali Khan', father_name: 'Abdul Rehman', birth_year: 1988, city: 'Lahaur', phonetic_key: 'mmmd al xn' },
  { record_id: 'REC-219', name: 'Muhammad Aly Khan', father_name: 'Abdul Rahman Khan', birth_year: 1987, city: 'Lahore', phonetic_key: 'mmmd al xn' },
  { record_id: 'REC-332', name: 'Hussain Raza', father_name: 'Ghulam Raza', birth_year: 1990, city: 'Karachi', phonetic_key: 'hssn rj' },
  { record_id: 'REC-341', name: 'Husain Reza', father_name: 'Ghulam Raza', birth_year: 1990, city: 'Karachee', phonetic_key: 'hsn rj' },
  { record_id: 'REC-410', name: 'Fatima Noor', father_name: 'Noor Ahmed', birth_year: 1992, city: 'Islamabad', phonetic_key: 'ftm nr' },
  { record_id: 'REC-418', name: 'Faatima Nur', father_name: 'Noor Ahmad', birth_year: 1992, city: 'Islamabad', phonetic_key: 'ftm nr' },
  { record_id: 'REC-501', name: 'Qaim Hussnain', father_name: 'Hasnain Ali', birth_year: 1989, city: 'Faisalabad', phonetic_key: 'km hssnn' },
  { record_id: 'REC-509', name: 'Kaim Hasnain', father_name: 'Hasnain Ali', birth_year: 1989, city: 'Faisalabad', phonetic_key: 'km hsnn' },
  { record_id: 'REC-600', name: 'Ali Khan', father_name: 'Tariq Khan', birth_year: 1995, city: 'Lahore', phonetic_key: 'al xn' },
  { record_id: 'REC-601', name: 'Ahmed Khan', father_name: 'Tariq Khan', birth_year: 1996, city: 'Lahore', phonetic_key: 'amd xn' },
]

export const mockLinks: LinkItem[] = [
  { record_a: 'REC-014', record_b: 'REC-097', relation: 'confirmed_same', score: 0.96, evidence: 'Phonetic keys equal; father name and birth year agree', confirmed_by: 'officer', date: '2026-11-03' },
  { record_a: 'REC-332', record_b: 'REC-341', relation: 'confirmed_same', score: 0.95, evidence: 'City resolves to same place; father name agrees', confirmed_by: 'officer', date: '2026-11-04' },
  { record_a: 'REC-410', record_b: 'REC-418', relation: 'confirmed_same', score: 0.93, evidence: 'Phonetic keys equal; birth year agrees', confirmed_by: 'officer', date: '2026-11-05' },
  { record_a: 'REC-014', record_b: 'REC-131', relation: 'rejected_same', score: 0.84, evidence: 'Name tokens differ phonetically', confirmed_by: 'officer', date: '2026-11-06' },
]

export const initialCallLogs: CallLogEntry[] = [
  { id: 'call-001', timestamp: '12:24:02 PM', toolName: 'resolve_city', type: 'MCP_TOOL_CALL', status: '200 OK', input: { city_name: 'Lahor' }, output: { canonical_name: 'Lahore', country: 'Pakistan', lat: 31.5204, lon: 74.3587 }, latency: '142ms' },
  { id: 'call-002', timestamp: '12:24:03 PM', toolName: 'phonetic_key', type: 'MCP_TOOL_CALL', status: 'SUCCESS', input: { name_variant: 'Muhd Ali Khaan' }, output: { phonetic_code: 'mmmd al xn' }, latency: '12ms' },
  { id: 'call-003', timestamp: '12:24:03 PM', toolName: 'name_similarity', type: 'MCP_TOOL_CALL', status: 'SUCCESS', input: { name_a: 'Muhammad Ali Khan', name_b: 'Muhd Ali Khaan' }, output: { levenshtein_ratio: 0.88, phonetic_match: true, combined_score: 0.96 }, latency: '18ms' },
]

export const mockMcpCapabilities: McpCapabilities = {
  tools: [
    { name: 'phonetic_key', description: 'Normalise a name into a phonetic key.', input_schema: { name: 'string' } },
    { name: 'name_similarity', description: 'Compare two Roman-Urdu names.', input_schema: { name_a: 'string', name_b: 'string' } },
    { name: 'compare_records', description: 'Compare two records field by field.', input_schema: { record_a: 'object', record_b: 'object' } },
    { name: 'validate_fictional_id', description: 'Validate a fictional FRO id.', input_schema: { id_value: 'string' } },
    { name: 'resolve_city', description: 'Geocode a city (Open-Meteo).', input_schema: { city: 'string' } },
    { name: 'compare_cities', description: 'Compare two cities.', input_schema: { city_a: 'string', city_b: 'string' } },
    { name: 'search_candidates', description: 'Find similar records.', input_schema: { name: 'string' } },
    { name: 'save_link', description: 'Save a confirmed link.', input_schema: { record_a: 'string', record_b: 'string', relation: 'string', score: 'number', evidence: 'string' } },
    { name: 'get_links', description: 'Get links for a record.', input_schema: { record_id: 'string' } },
  ],
  resources: [{ name: 'matching_thresholds', description: 'Threshold table text.', uri: 'policy://matching-thresholds' }],
  prompts: [{ name: 'review_candidate_match', description: 'Review template.' }],
}

export const mockMemory: MemoryResponse = {
  stm: [
    { role: 'user', content: 'Are REC-014 and REC-097 the same person?' },
    { role: 'assistant', content: 'Likely same person; awaiting officer confirmation.' },
    { role: 'user', content: 'Check REC-332 vs REC-341.' },
    { role: 'assistant', content: 'Likely same; cities resolve to same place.' },
  ],
  working_set: [
    { record_a: 'REC-014', record_b: 'REC-097', score: 0.96, note: 'Phonetic keys equal' },
    { record_a: 'REC-332', record_b: 'REC-341', score: 0.95, note: 'Cities same place' },
  ],
}

export const mockKnowledge: KnowledgeDoc[] = [
  { id: 'D1', title: 'Naming Conventions Handbook', category: 'Official SOP', score: 0.81, snippets: ['Names are stored as given name, father name and family name.'] },
  { id: 'D2', title: 'Roman-Urdu Transliteration Rules', category: 'Official SOP', score: 0.84, snippets: ['Variant families: aa/a, ee/i, kh/x and others.'] },
  { id: 'D3', title: 'Records Office Matching SOP', category: 'Official SOP', score: 0.87, snippets: ['Likely same when combined >= 0.92 and all tokens phonetically equal.'] },
  { id: 'D4', title: 'Alias Confirmation and Rejection Policy', category: 'Official SOP', score: 0.79, snippets: ['Only an officer may confirm or reject a link.'] },
  { id: 'D5', title: 'Fictional ID Format Specification', category: 'Official SOP', score: 0.73, snippets: ['IDs follow FRO-DD-NNNNNN-C with a check digit.'] },
  { id: 'D6', title: 'Abbreviations and Honorifics Guide', category: 'Official SOP', score: 0.76, snippets: ['Muhd, Md and Mohammed normalise to Muhammad.'] },
  { id: 'D7', title: 'Ambiguity Playbook', category: 'Official SOP', score: 0.71, snippets: ['Common names and near-misses require supporting fields.'] },
]

const verdictByPair: Record<string, { verdict: Verdict; score: number }> = {
  'REC-014|REC-097': { verdict: 'Likely same', score: 0.96 },
  'REC-097|REC-014': { verdict: 'Likely same', score: 0.96 },
  'REC-014|REC-205': { verdict: 'Likely same', score: 0.97 },
  'REC-205|REC-014': { verdict: 'Likely same', score: 0.97 },
  'REC-014|REC-219': { verdict: 'Likely same', score: 0.95 },
  'REC-219|REC-014': { verdict: 'Likely same', score: 0.95 },
  'REC-332|REC-341': { verdict: 'Likely same', score: 0.95 },
  'REC-341|REC-332': { verdict: 'Likely same', score: 0.95 },
  'REC-410|REC-418': { verdict: 'Likely same', score: 0.93 },
  'REC-418|REC-410': { verdict: 'Likely same', score: 0.93 },
  'REC-014|REC-131': { verdict: 'Possible', score: 0.84 },
  'REC-131|REC-014': { verdict: 'Possible', score: 0.84 },
  'REC-501|REC-509': { verdict: 'Possible', score: 0.92 },
  'REC-509|REC-501': { verdict: 'Possible', score: 0.92 },
  'REC-600|REC-601': { verdict: 'Hard conflict', score: 0.84 },
  'REC-601|REC-600': { verdict: 'Hard conflict', score: 0.84 },
}

const REJECTION = "I cannot answer this question. I am a specialized agent designed exclusively to resolve and verify Roman-Urdu identity variants and registry records. Please provide a relevant name, record query, or new record document to ingest."

export function mockChat(message: string): ChatResponse {
  const m = message.toLowerCase()
  const isRecordQuery = /rec-\d+/.test(m) || /same person|compare|record|identity|link|alias|city|ingest|add record/.test(m)
  if (!isRecordQuery) {
    return { answer: REJECTION, verdict: 'Unlikely', evidence_for: [], evidence_against: [REJECTION], policy_cited: 'None', next_step: 'Provide a relevant name or record query.', trace: [], retrieved_chunks: [], suggested_link: null }
  }
  const ids = message.match(/REC-\d+/g) ?? []
  if (ids.length >= 2) {
    const a = ids[0], b = ids[1], key = `${a}|${b}`
    const info = verdictByPair[key] ?? { verdict: 'Possible' as Verdict, score: 0.8 }
    const recA = mockRecords.find(r => r.record_id === a)
    const recB = mockRecords.find(r => r.record_id === b)
    const nameA = recA?.name ?? a, nameB = recB?.name ?? b
    const likely = info.verdict === 'Likely same'
    return {
      answer: `${nameA} (${a}) and ${nameB} (${b}) are ${info.verdict.toLowerCase()} the same person.`,
      verdict: info.verdict,
      evidence_for: likely ? ['Phonetic keys are equal', 'Father name and birth year agree', 'Cities resolve to the same place'] : ['Names share a family name', 'Some phonetic overlap'],
      evidence_against: likely ? ['Spellings differ'] : ['Name tokens differ phonetically', 'Supporting fields do not fully agree'],
      policy_cited: 'Records Office Matching SOP',
      next_step: 'Ask the officer to confirm before saving the link.',
      trace: ['Selected tool: name_similarity', 'Selected tool: compare_records', 'Selected tool: compare_cities'],
      retrieved_chunks: [{ doc: 'Records Office Matching SOP', score: 0.87, text: 'Likely same when combined >= 0.92 and all tokens phonetically equal.' }],
      suggested_link: { record_a: a, record_b: b, score: info.score, evidence: 'Deterministic comparison' },
    }
  }
  return { answer: 'Please provide two record IDs (e.g., REC-014 and REC-097) to compare.', verdict: 'Unlikely', evidence_for: [], evidence_against: ['Insufficient input'], policy_cited: 'None', next_step: 'Provide two record IDs.', trace: [], retrieved_chunks: [], suggested_link: null }
}

export function mockSaveLink(): { saved: boolean; total_links: number } { return { saved: true, total_links: mockLinks.length + 1 } }
