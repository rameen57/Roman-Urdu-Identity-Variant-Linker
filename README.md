# Roman-Urdu-Identity-Variant-Linker

Full-stack Identity Variant Linker Console for a fictional Records Office. Resolves Roman-Urdu name spelling variants using MCP tools, RAG, an LLM (Groq), short-term and long-term memory, and a dark-theme React frontend.

## Repo layout
- `backend/` — Python FastAPI + FastMCP server, phonetics, RAG docs, eval, tests
- `frontend/` — React + Vite + TypeScript + Tailwind (dark theme)

## Quick start (mock mode — works with no backend/Groq key)

### Frontend
```bash
cd frontend
npm install
npm run dev
# open http://localhost:5173
```
Mock mode is on by default (`VITE_USE_MOCK` defaults to true). All pages work offline with realistic fake data.

### Backend (connect real agent)
```bash
cd backend
cp .env.example .env   # set GROQ_API_KEY if you want LLM reasoning
pip install -r requirements.txt
python ingest.py
python mcp_server.py          # MCP server on http://127.0.0.1:8765/mcp (separate terminal)
uvicorn app:app --port 8000   # API on http://localhost:8000
```
Then run the frontend with `VITE_USE_MOCK=false` to connect to the backend.

## Acceptance
- `REC-014` vs `REC-097` → Likely same with evidence + tool trace
- `REC-014` vs `REC-131` → Possible / not Likely same
- Out-of-scope queries (greetings, math, coding) → mandatory rejection message
- Confirm/Reject writes to LTM; repeat queries report the earlier decision
- Footer on every page: all data and rules are fictional demonstration data

## Files
- `C:\Users\HP\Downloads\Roman-Urdu-Identity-Variant-Linker-full.zip` — runnable project (extract, open in VS Code, run commands above)
EOF