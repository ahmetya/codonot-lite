# codonot**lite**

An AI stream playground built with React + Express. Stream live token-by-token responses from Google's Gemma model, with markdown-aware rendering of code blocks and labeled headers.

---

## Stack

| Layer | Tech |
|---|---|
| Frontend | React 19, TypeScript, Vite |
| Backend | Express, TypeScript, Node.js |
| Database | SQLite via Prisma (better-sqlite3) |
| AI | Google GenAI SDK — Gemma 4 26B MoE |

---

## Project Structure

```
codonot-lite/
├── client/          # Vite + React frontend
│   ├── src/
│   │   ├── pages/Home/   # Main UI + stream rendering
│   │   ├── services/     # Client-side utility classes
│   │   └── routes/       # React Router config
│   └── .env              # Client env vars (VITE_ prefix required)
│
└── server/          # Express backend
    ├── src/
    │   ├── controllers/  # Request handlers
    │   ├── services/     # Business logic (AI, Pokemon, Generic)
    │   └── routes/       # API route definitions
    └── prisma/
        └── schema.prisma # SQLite schema
```

---

## Getting Started

### 1. Install dependencies

```bash
npm install
npm install --prefix client
npm install --prefix server
```

### 2. Configure environment variables

**`server/.env`** — create this file:
```env
PORT=3001
GEMINI_API_KEY=your_google_gemini_api_key_here
```

**`client/.env`** — already exists, update if needed:
```env
VITE_API_URL=http://localhost:3001/api
```

> The Gemini API key is required for the AI stream features. Get one at [aistudio.google.com](https://aistudio.google.com).

### 3. Set up the database

```bash
cd server
npx prisma generate
npx prisma migrate dev
```

### 4. Run in development

From the root:
```bash
npm run dev
```

This starts both the Express server (`:3001`) and the Vite dev server (`:5173`) concurrently.

Or run separately:
```bash
npm run start:server   # Express only
npm run start:client   # Vite only
```

---

## API Routes

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/hello` | Health check |
| `GET` | `/api/poke` | Fetch a Pokémon from PokéAPI |
| `GET` | `/api/pokemon/:id` | Fetch Pokémon by ID |
| `POST` | `/api/pokemon` | Create a Pokémon record |
| `POST` | `/api/helperbot` | Single AI response |
| `POST` | `/api/helperbot/stream` | SSE stream (raw Gemini) |
| `POST` | `/api/helperbot/stream-sdk` | Token stream via GenAI SDK |
| `GET/POST` | `/api/generic` | Generic CRUD (SQLite) |

---

## Client Env Variables

All client-side env vars must be prefixed with `VITE_` to be exposed by Vite.

| Variable | Default | Description |
|---|---|---|
| `VITE_API_URL` | `http://localhost:3001/api` | Base API URL for stream requests |

> After editing `.env`, restart the Vite dev server for changes to take effect.

---

## Build for Production

```bash
# Build the server
cd server && npm run build

# Build the client
cd client && npm run build
```
