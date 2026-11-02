import json
import os
import re
import uuid
from datetime import datetime, date
from difflib import SequenceMatcher
from typing import Any, Dict, List, Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

sys.path.insert(0, os.path.dirname(__file__))
from phonetics import clean_tokens, phonetic_key, token_key  # noqa: E402

try:
    import mcp_server  # noqa: E402
    HAS_MCP_SERVER = True
except Exception:
    HAS_MCP_SERVER = False

BASE_DIR = os.path.dirname(__file__)
RECORDS_FILE = os.path.join(BASE_DIR, 'data', 'records.json')
LINKS_FILE = os.path.join(BASE_DIR, 'data', 'ltm.json')
DOCS_DIR = os.path.join(BASE_DIR, 'data', 'docs')
PROMPT_FILE = os.path.join(BASE_DIR, 'prompts', 'system.txt')

GROQ_API_KEY = os.getenv('GROQ_API_KEY', '')
GROQ_MODEL = os.getenv('GROQ_MODEL', 'llama-3.3-70b-versatile')
GROQ_FALLBACK_MODEL = os.getenv('GROQ_FALLBACK_MODEL', 'llama-3.1-8b-instant')
MCP_URL = os.getenv('MCP_URL', 'http://127.0.0.1:8765/mcp')

MAX_ITERATIONS = 6

app = FastAPI(title='Identity Variant Linker backend')
app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_methods=['*'],
    allow_headers=['*'],
)

RECORDS: Dict[str, dict] = {}
LTM: Dict[str, Any] = {'nodes': [], 'edges': []}
DOCS: List[dict] = []
SYSTEM_PROMPT = ''
SESSIONS: Dict[str, dict] = {}


def load_records():
    global RECORDS
    try:
        with open(RECORDS_FILE, 'r', encoding='utf-8') as f:
            RECORDS = json.load(f)
    except Exception:
        RECORDS = {}


def load_ltm():
    global LTM
    try:
        with open(LINKS_FILE, 'r', encoding='utf-8') as f:
            data = json.load(f)
        if isinstance(data, list):
            edges = data
            nodes = []
            seen = set()
            for e in edges:
                for r in (e.get('record_a'), e.get('record_b')):
                    if r and r not in seen:
                        seen.add(r)
                        nodes.append({'id': r, 'label': r})
            LTM = {'nodes': nodes, 'edges': edges}
        else:
            LTM = data
    except Exception:
        LTM = {'nodes': [], 'edges': []}


def save_ltm():
    os.makedirs(os.path.dirname(LINKS_FILE), exist_ok=True)
    with open(LINKS_FILE, 'w', encoding='utf-8') as f:
        json.dump(LTM['edges'], f, indent=2)


def load_docs():
    global DOCS
    DOCS = []
    if not os.path.isdir(DOCS_DIR):
        return
    for fname in sorted(os.listdir(DOCS_DIR)):
        if not fname.endswith('.md'):
            continue
        path = os.path.join(DOCS_DIR, fname)
        try:
            with open(path, 'r', encoding='utf-8') as f:
                text = f.read()
        except Exception:
            continue
        title = fname.replace('_', ' ').replace('.md', '')
        chunks = [c.strip() for c in re.split(r'\n\s*\n', text) if c.strip()]
        DOCS.append({'id': fname.replace('.md', ''), 'title': title, 'chunks': chunks})


def load_system_prompt():
    global SYSTEM_PROMPT
    try:
        with open(PROMPT_FILE, 'r', encoding='utf-8') as f:
            SYSTEM_PROMPT = f.read()
    except Exception:
        SYSTEM_PROMPT = ''


def chunk_text(text: str, size: int = 400, overlap: int = 50) -> List[str]:
    chunks = []
    start = 0
    while start < len(text):
        chunks.append(text[start:start + size])
        start += size - overlap
    return [c for c in chunks if c.strip()]


def rag_retrieve(query: str, top_k: int = 3) -> List[dict]:
    q = query.lower()
    scored = []
    for doc in DOCS:
        for chunk in doc['chunks']:
            c = chunk.lower()
            score = sum(1 for w in re.findall(r'\w+', q) if w in c) / max(1, len(re.findall(r'\w+', q)))
            if score > 0:
                scored.append({'doc': doc['title'], 'score': round(min(score, 1.0), 2), 'text': chunk})
    scored.sort(key=lambda x: -x['score'])
    return scored[:top_k]


def get_session(session_id: str) -> dict:
    if session_id not in SESSIONS:
        SESSIONS[session_id] = {'stm': [], 'working_set': []}
    return SESSIONS[session_id]


def mcp_name_similarity(a: str, b: str) -> dict:
    if HAS_MCP_SERVER:
        return mcp_server.name_similarity(a, b)
    ta, tb = clean_tokens(a), clean_tokens(b)
    ka, kb = phonetic_key(a), phonetic_key(b)
    phon = SequenceMatcher(None, ka, kb).ratio()
    lex = SequenceMatcher(None, ' '.join(ta), ' '.join(tb)).ratio()
    te = len(ta) == len(tb) and all(token_key(x) == token_key(y) for x, y in zip(ta, tb))
    return {
        'key_a': ka, 'key_b': kb,
        'phonetic_score': round(phon, 2),
        'spelling_score': round(lex, 2),
        'combined_score': round(0.6 * phon + 0.4 * lex, 2),
        'all_tokens_phonetically_equal': te,
    }


def mcp_compare_records(ra: dict, rb: dict) -> dict:
    if HAS_MCP_SERVER:
        return mcp_server.compare_records(ra, rb)
    ns = mcp_name_similarity(ra.get('name', ''), rb.get('name', ''))
    fa, fb = ra.get('father_name', ''), rb.get('father_name', '')
    fs = round(SequenceMatcher(None, phonetic_key(fa), phonetic_key(fb)).ratio(), 2) if fa and fb else 0.0
    ya, yb = ra.get('birth_year'), rb.get('birth_year')
    yd = abs(ya - yb) if ya is not None and yb is not None else None
    ya_flag = yd is not None and yd <= 1
    cc = mcp_server.compare_cities(ra.get('city', ''), rb.get('city', '')) if HAS_MCP_SERVER else {'verdict': 'different places'}
    cs = cc.get('verdict') == 'same place'
    combined = ns['combined_score']
    te = ns['all_tokens_phonetically_equal']
    supporting = fs >= 0.85 or ya_flag or cs
    band = 'Possible'
    if combined >= 0.92 and te and supporting:
        band = 'Likely same'
    elif combined < 0.75 or not te:
        band = 'Unlikely'
    if band == 'Likely same' and yd is not None and yd > 1:
        band = 'Hard conflict'
    return {
        'name_similarity': ns, 'father_name_similarity': fs,
        'birth_year_diff': yd, 'birth_year_agree': ya_flag,
        'city_comparison': cc, 'city_same_place': cs,
        'combined_score': combined, 'all_tokens_phonetically_equal': te, 'band': band,
    }


def out_of_scope(message: str) -> bool:
    m = message.lower()
    triggers = ['rec-', 'same person', 'compare', 'record', 'name', 'identity', 'link', 'alias', 'city', 'id', 'ingest', 'add record']
    return not any(t in m for t in triggers)


REJECTION = ("I cannot answer this question. I am a specialized agent designed exclusively to resolve and verify "
             "Roman-Urdu identity variants and registry records. Please provide a relevant name, record query, or "
             "new record document to ingest.")


def deterministic_chat(session_id: str, message: str) -> dict:
    if out_of_scope(message):
        return {
            'answer': REJECTION,
            'verdict': 'Unlikely',
            'evidence_for': [],
            'evidence_against': [REJECTION],
            'policy_cited': 'None',
            'next_step': 'Provide a relevant name or record query.',
            'trace': [],
            'retrieved_chunks': [],
            'suggested_link': None,
        }
    ids = re.findall(r'REC-\d+', message)
    if len(ids) >= 2:
        a, b = ids[0], ids[1]
        ra, rb = RECORDS.get(a), RECORDS.get(b)
        if not ra or not rb:
            return {'answer': f'Record {a if not ra else b} not found.', 'verdict': 'Unlikely', 'evidence_for': [], 'evidence_against': ['Record not found'], 'policy_cited': 'None', 'next_step': 'Provide valid record IDs.', 'trace': [], 'retrieved_chunks': [], 'suggested_link': None}
        comp = mcp_compare_records(ra, rb)
        get_session(session_id)['stm'].append({'role': 'user', 'content': message})
        get_session(session_id)['stm'].append({'role': 'assistant', 'content': f"{comp['band']} based on deterministic comparison."})
        return {
            'answer': f"{a} ({ra['name']}) and {b} ({rb['name']}) are {comp['band'].lower()}.",
            'verdict': comp['band'],
            'evidence_for': [f"Combined score {comp['combined_score']}", f"Phonetic keys: {comp['name_similarity']['key_a']} vs {comp['name_similarity']['key_b']}"],
            'evidence_against': ['Supporting fields do not fully agree' if comp['band'] != 'Likely same' else 'Spellings differ'],
            'policy_cited': 'Records Office Matching SOP',
            'next_step': 'Ask the officer to confirm before saving the link.',
            'trace': [f'Selected tool: name_similarity ({a}, {b})', f'Selected tool: compare_records ({a}, {b})'],
            'retrieved_chunks': rag_retrieve(message),
            'suggested_link': {'record_a': a, 'record_b': b, 'score': comp['combined_score'], 'evidence': 'Deterministic comparison'},
        }
    return {
        'answer': 'Please provide two record IDs (e.g., REC-014 and REC-097) to compare.',
        'verdict': 'Unlikely',
        'evidence_for': [],
        'evidence_against': ['Insufficient input'],
        'policy_cited': 'None',
        'next_step': 'Provide two record IDs.',
        'trace': [],
        'retrieved_chunks': [],
        'suggested_link': None,
    }


def groq_chat(session_id: str, message: str) -> dict:
    try:
        from openai import OpenAI
    except Exception:
        return deterministic_chat(session_id, message)
    if not GROQ_API_KEY:
        return deterministic_chat(session_id, message)
    try:
        client = OpenAI(base_url='https://api.groq.com/openai/v1', api_key=GROQ_API_KEY)
        session = get_session(session_id)
        chunks = rag_retrieve(message)
        context = '\n'.join(f"- [{c['doc']}] {c['text']}" for c in chunks)
        ltm_edges = [e for e in LTM['edges']]
        ltm_text = '; '.join(f"{e['record_a']} {e['relation']} {e['record_b']}" for e in ltm_edges[:5]) or 'none'
        stm = session['stm'][-10:]
        stm_text = '\n'.join(f"{m['role']}: {m['content']}" for m in stm)
        tools = [
            {'type': 'function', 'function': {
                'name': 'name_similarity',
                'description': 'Compare two Roman-Urdu names and return phonetic, spelling and combined scores.',
                'parameters': {'type': 'object', 'properties': {'name_a': {'type': 'string'}, 'name_b': {'type': 'string'}}, 'required': ['name_a', 'name_b']},
            }},
            {'type': 'function', 'function': {
                'name': 'compare_records',
                'description': 'Compare two records field by field.',
                'parameters': {'type': 'object', 'properties': {'record_a': {'type': 'object'}, 'record_b': {'type': 'object'}}, 'required': ['record_a', 'record_b']},
            }},
            {'type': 'function', 'function': {
                'name': 'validate_fictional_id',
                'description': 'Validate a fictional FRO id.',
                'parameters': {'type': 'object', 'properties': {'id_value': {'type': 'string'}}, 'required': ['id_value']},
            }},
        ]
        messages = [{'role': 'system', 'content': SYSTEM_PROMPT + '\n\nRAG CONTEXT:\n' + context + '\n\nLTM FACTS:\n' + ltm_text + '\n\nSTM:\n' + stm_text}, {'role': 'user', 'content': message}]
        model = GROQ_MODEL
        for _ in range(MAX_ITERATIONS):
            try:
                resp = client.chat.completions.create(model=model, messages=messages, tools=tools, tool_choice='auto', temperature=0.1)
            except Exception:
                model = GROQ_FALLBACK_MODEL
                resp = client.chat.completions.create(model=model, messages=messages, tools=tools, tool_choice='auto', temperature=0.1)
            msg = resp.choices[0].message
            if msg.tool_calls:
                messages.append(msg)
                for call in msg.tool_calls:
                    name = call.function.name
                    args = json.loads(call.function.arguments or '{}')
                    if name == 'name_similarity':
                        result = mcp_name_similarity(args.get('name_a', ''), args.get('name_b', ''))
                    elif name == 'compare_records':
                        result = mcp_compare_records(args.get('record_a', {}), args.get('record_b', {}))
                    elif name == 'validate_fictional_id':
                        result = mcp_server.validate_fictional_id(args.get('id_value', '')) if HAS_MCP_SERVER else {'valid': False}
                    else:
                        result = {'error': 'unknown tool'}
                    messages.append({'role': 'tool', 'tool_call_id': call.id, 'name': name, 'content': json.dumps(result)})
                continue
            final = msg.content or ''
            session['stm'].append({'role': 'user', 'content': message})
            session['stm'].append({'role': 'assistant', 'content': final})
            return {
                'answer': final,
                'verdict': 'Possible',
                'evidence_for': [],
                'evidence_against': [],
                'policy_cited': 'Retrieved documents',
                'next_step': 'Ask the officer to confirm before saving the link.',
                'trace': [m.content for m in messages if m.get('role') == 'assistant' and m.get('tool_calls')],
                'retrieved_chunks': chunks,
                'suggested_link': None,
            }
        return deterministic_chat(session_id, message)
    except Exception:
        return deterministic_chat(session_id, message)


class ChatIn(BaseModel):
    session_id: str
    message: str


class LinkIn(BaseModel):
    record_a: str
    record_b: str
    relation: str
    score: float
    evidence: str


@app.on_event('startup')
def _startup():
    load_records()
    load_ltm()
    load_docs()
    load_system_prompt()


@app.get('/api/health')
def health():
    return {'status': 'ok', 'groq_configured': bool(GROQ_API_KEY), 'mcp_url': MCP_URL, 'records': len(RECORDS), 'docs': len(DOCS)}


@app.get('/api/dashboard')
def dashboard():
    edges = LTM['edges']
    confirmed = [e for e in edges if e.get('relation') == 'confirmed_same']
    rejected = [e for e in edges if e.get('relation') == 'rejected_same']
    return {
        'records': len(RECORDS),
        'pending_reviews': len(LTM['edges']) - len(confirmed) - len(rejected),
        'confirmed': len(confirmed),
        'rejected': len(rejected),
        'verdict_counts': {'Likely same': len(confirmed), 'Possible': 0, 'Unlikely': len(rejected), 'Hard conflict': 0},
        'matches_per_day': [],
    }


@app.post('/api/chat')
def chat(body: ChatIn):
    if out_of_scope(body.message):
        return {
            'answer': REJECTION, 'verdict': 'Unlikely', 'evidence_for': [], 'evidence_against': [REJECTION],
            'policy_cited': 'None', 'next_step': 'Provide a relevant name or record query.', 'trace': [],
            'retrieved_chunks': [], 'suggested_link': None,
        }
    if GROQ_API_KEY:
        return groq_chat(body.session_id, body.message)
    return deterministic_chat(body.session_id, body.message)


@app.get('/api/records')
def records():
    return [{'record_id': k, **v} for k, v in RECORDS.items()]


@app.get('/api/links')
def links():
    return LTM['edges']


@app.post('/api/links')
def save_link(body: LinkIn):
    if body.relation not in ('confirmed_same', 'rejected_same'):
        raise HTTPException(status_code=400, detail="relation must be confirmed_same or rejected_same")
    edge = {'record_a': body.record_a, 'record_b': body.record_b, 'relation': body.relation,
            'score': body.score, 'evidence': body.evidence, 'confirmed_by': 'officer',
            'date': date.today().isoformat()}
    LTM['edges'].append(edge)
    for r in (body.record_a, body.record_b):
        if r not in [n['id'] for n in LTM['nodes']]:
            LTM['nodes'].append({'id': r, 'label': r})
    save_ltm()
    return {'saved': True, 'total_links': len(LTM['edges'])}


@app.get('/api/mcp/capabilities')
def mcp_capabilities():
    return {
        'tools': [
            {'name': 'name_similarity', 'description': 'Compare two Roman-Urdu names.', 'input_schema': {'name_a': 'string', 'name_b': 'string'}},
            {'name': 'compare_records', 'description': 'Compare two records field by field.', 'input_schema': {'record_a': 'object', 'record_b': 'object'}},
            {'name': 'validate_fictional_id', 'description': 'Validate a fictional FRO id.', 'input_schema': {'id_value': 'string'}},
            {'name': 'resolve_city', 'description': 'Geocode a city.', 'input_schema': {'city': 'string'}},
            {'name': 'compare_cities', 'description': 'Compare two cities.', 'input_schema': {'city_a': 'string', 'city_b': 'string'}},
            {'name': 'search_candidates', 'description': 'Find similar records.', 'input_schema': {'name': 'string'}},
            {'name': 'save_link', 'description': 'Save a confirmed link.', 'input_schema': {'record_a': 'string', 'record_b': 'string', 'relation': 'string', 'score': 'number', 'evidence': 'string'}},
            {'name': 'get_links', 'description': 'Get links for a record.', 'input_schema': {'record_id': 'string'}},
        ],
        'resources': [{'name': 'matching_thresholds', 'uri': 'policy://matching-thresholds'}],
        'prompts': [{'name': 'review_candidate_match'}],
    }


@app.get('/api/memory/{session_id}')
def memory(session_id: str):
    s = get_session(session_id)
    return {'stm': s['stm'], 'working_set': s['working_set'], 'ltm': LTM}


@app.get('/api/knowledge')
def knowledge():
    return DOCS


@app.get('/')
def root():
    return {'message': 'Identity Variant Linker backend. See /api/health'}
