# Roman-Urdu-Identity-Variant-Linker

A Capstone project agent to normalize, link, and resolve identity variants in Roman Urdu text using MCP and RAG.

## Frontend

Stack: React + Vite + TypeScript + Tailwind CSS + React Router.

### Run

```bash
npm install
npm run dev
```

The app runs in mock mode by default (`VITE_USE_MOCK` defaults to on), so it works without a backend.

To connect to a real backend, set `VITE_USE_MOCK=false` and `VITE_API_URL` (default `http://localhost:8000`) in a `.env` file.

### Pages

- `/console` Agent chat, verdict card, tool trace
- `/records` Searchable records table
- `/review` Suggested matches with confirm/reject
- `/memory` Short-term memory and long-term memory graph
- `/mcp` MCP inspector
- `/knowledge` Knowledge base

All data and rules are fictional demonstration data.
EOF