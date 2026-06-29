# codonot-lite

`codonot-lite` is a full-stack AI playground built with React and Express. Its
main experiences are the Fadelands fantasy character forge and a streaming AI
interface that renders model responses in the browser as they arrive, including
syntax-highlighted code blocks.

The project also contains authentication, Prisma persistence, Pokemon API,
callback, Promise, RxJS, and object-oriented programming examples. These
controls make the app useful as both an AI product prototype and a
JavaScript/TypeScript learning sandbox.

## Features

- Fadelands AI fantasy character generator at `/fadelands`
- Structured RPG character drafts with race, class, alignment, backstory,
  traits, equipment, and ability scores
- Character generation through Google AI or Cerebras
- Portrait generation support through Pollinations, Google AI, or a Cerebras
  SVG portrait endpoint
- Live token-by-token AI responses
- Selectable AI model in the streaming interface
- Code-fence detection and syntax highlighting with Highlight.js
- JWT-based registration, login, logout, and protected user lookup
- SQLite persistence through Prisma
- Pokemon API fetching with a local database cache
- Generic database read/create examples
- Responsive single-page React interface with routes for Home, Fadelands,
  Dashboard, About, Verify Email, RxJS Playground, and Not Found

## Technology

| Area           | Technology                                                         |
| -------------- | ------------------------------------------------------------------ |
| Client         | React 19, TypeScript, Vite, React Router                           |
| Server         | Node.js, Express, TypeScript                                       |
| Database       | SQLite, Prisma, better-sqlite3 adapter                             |
| Authentication | bcrypt, JSON Web Tokens                                            |
| AI             | Google GenAI SDK, Google Generative Language REST API, Cerebras SDK |
| Rendering      | Highlight.js, Mermaid                                              |

## Project Structure

```text
codonot-lite/
|-- client/
|   |-- public/                 Static assets
|   `-- src/
|       |-- components/         Shared UI components
|       |-- context/            Authentication state
|       |-- pages/              Home, Fadelands, dashboard, and utility pages
|       |-- routes/             React Router configuration
|       `-- services/           API, Fadelands, and learning utilities
|-- server/
|   |-- prisma/
|   |   |-- migrations/         Database migration history
|   |   `-- schema.prisma       Prisma data model
|   `-- src/
|       |-- controllers/        HTTP request handlers
|       |-- middleware/         Authentication middleware
|       |-- routes/             Express route definitions
|       `-- services/           AI, auth, database, Fadelands, and Pokemon logic
|-- deploy.sh                   Example production deployment script
`-- package.json                Root development scripts
```

## Prerequisites

- Node.js with built-in `fetch` support (Node.js 20 or newer recommended)
- npm
- A Google AI API key for Google-backed helper bot and Fadelands endpoints
- A Cerebras API key for Cerebras-backed Fadelands character generation

## Local Setup

### 1. Install dependencies

Run these commands from the repository root:

```bash
npm install
npm install --prefix client
npm install --prefix server
```

### 2. Configure the server

Create `server/.env`:

```env
APP_URL = https://lite.codonot.com
DATABASE_URL = file:./prisma/dev.db
EMAIL_FROM = Codonot Lite <noreply@lite.codonot.com>
GEMINI_API_KEY = replace_with_your_google_ai_key
CEREBRAS_API_KEY = replace_with_your_cerebras_api_key
JWT_SECRET = replace_with_a_long_random_secret
NODE_ENV = development
NVIDIA_API_KEY = replace_with_your_nvidia_api_key
NVIDIA_NIM_MODEL = meta/llama-3.1-8b-instruct
PORT = 3001
RESEND_API_KEY = replace_with_your_resend_api_key
```

`GEMINI_API_KEY` is required for Google AI requests and Google portrait
generation. `CEREBRAS_API_KEY` is required when Fadelands uses the Cerebras
provider or the Cerebras portrait endpoint. `NVIDIA_API_KEY` is required for the
NVIDIA NIM endpoint. `NVIDIA_NIM_MODEL` is optional and defaults to
`meta/llama-3.1-8b-instruct`. `JWT_SECRET` is required for registration and
login. `RESEND_API_KEY`, `EMAIL_FROM`, and `APP_URL` are required for email
verification. Verify the sender domain in Resend before using it in
`EMAIL_FROM`.

### 3. Configure the client

Create `client/.env`:

```env
VITE_API_URL = http://localhost:3001/api
```

Most browser requests use Vite's `/api` development proxy. `VITE_API_URL` is
currently used by the raw SSE streaming example.

Only variables prefixed with `VITE_` are exposed to client-side code. Restart
Vite after changing a client environment variable.

### 4. Prepare the database

```bash
cd server
npx prisma generate
npx prisma migrate dev
cd ..
```

The local SQLite database is ignored by Git.

### 5. Start development

Start the client and server together:

```bash
npm run dev
```

The default local addresses are:

- Client: `http://localhost:5173`
- Server: `http://localhost:3001`

The services can also be started independently:

```bash
npm run start:client
npm run start:server
```

On Windows systems where PowerShell blocks `npm.ps1`, use `npm.cmd` in place of
`npm`.

## App Routes

| Route           | Description                                      |
| --------------- | ------------------------------------------------ |
| `/`             | Home page with AI streaming controls             |
| `/fadelands`    | AI fantasy character forge                       |
| `/dashboard`    | Authenticated dashboard shell                    |
| `/about`        | About and experience page                        |
| `/verify-email` | Email verification flow                          |
| `/rxjs`         | RxJS playground and examples                     |
| `*`             | Not Found page                                   |

## Fadelands

Fadelands is an AI fantasy character generator available at `/fadelands`.
Users enter a character brief or use a random prompt seed, choose an AI provider,
and receive a structured character sheet with identity, background, appearance,
personality, motivations, flaws, equipment, ability scores, alignment, and a
portrait area.

Character drafts are generated by the server through:

```text
POST /api/helperbot/generateFantasyCharacter
```

The request body accepts a prompt and provider:

```json
{
  "prompt": "Create a lawful good dwarf cleric who protects a forgotten archive.",
  "provider": "cerebras"
}
```

`provider` may be `google` or `cerebras`. If omitted, the server defaults to
Google. The current Fadelands UI defaults to Cerebras.

Portrait behavior is split between client and server options:

- The Fadelands page currently uses Pollinations image URLs by default.
- `/api/helperbot/portrait/google` generates a bitmap portrait through Google AI.
- `/api/helperbot/portrait` generates an SVG portrait through the Cerebras
  portrait service.

The backend validates model output into a consistent RPG character draft shape
before returning it to the client.

## Available Scripts

### Repository root

| Command                | Description                            |
| ---------------------- | -------------------------------------- |
| `npm run dev`          | Run the client and server concurrently |
| `npm run start:client` | Run the Vite development server        |
| `npm run start:server` | Run the server development entry point |

### Client

| Command           | Description                   |
| ----------------- | ----------------------------- |
| `npm run dev`     | Start Vite                    |
| `npm run build`   | Create a production bundle    |
| `npm run lint`    | Run ESLint                    |
| `npm run preview` | Preview the production bundle |

### Server

| Command         | Description                                 |
| --------------- | ------------------------------------------- |
| `npm run dev`   | Run Express with Nodemon and ts-node        |
| `npm run build` | Compile TypeScript and resolve path aliases |
| `npm run start` | Run the compiled server from `dist/`        |

## API Reference

All endpoints are mounted below `/api`.

### General

| Method | Endpoint | Description                         |
| ------ | -------- | ----------------------------------- |
| `GET`  | `/hello` | Basic server health response        |
| `GET`  | `/poke`  | Fetch Pokemon number 1 from PokeAPI |

### Authentication

| Method | Endpoint         | Description                           |
| ------ | ---------------- | ------------------------------------- |
| `POST` | `/auth/register` | Create a user and return a JWT        |
| `POST` | `/auth/login`    | Verify credentials and return a JWT   |
| `GET`  | `/auth/me`       | Return the decoded authenticated user |

Send protected requests with:

```http
Authorization: Bearer <token>
```

Example registration body:

```json
{
  "email": "developer@example.com",
  "password": "change-me",
  "name": "Developer"
}
```

### Helper Bot

| Method | Endpoint                              | Description                                  |
| ------ | ------------------------------------- | -------------------------------------------- |
| `POST` | `/helperbot`                          | Return one complete character draft response |
| `POST` | `/helperbot/generateFantasyCharacter` | Generate a Fadelands RPG character draft     |
| `POST` | `/helperbot/portrait`                 | Generate a Cerebras SVG character portrait   |
| `POST` | `/helperbot/portrait/google`          | Generate a Google AI bitmap portrait         |
| `POST` | `/helperbot/stream`                   | Proxy the upstream SSE response              |
| `POST` | `/helperbot/stream-sdk`               | Stream plain text chunks using the GenAI SDK |
| `POST` | `/helperbot/nim`                      | Return one NVIDIA NIM response               |

Each helper bot endpoint accepts:

```json
{
  "prompt": "Show a TypeScript fetch example"
}
```

Fadelands character-generation endpoints also accept:

```json
{
  "prompt": "Create a neutral good elf ranger who maps a changing forest.",
  "provider": "google"
}
```

The SDK endpoint accepts an optional model query parameter:

```text
POST /api/helperbot/stream-sdk?model=<model-id>
```

Model availability and identifiers are controlled by the Google AI account and
API version in use.

### Pokemon

| Method | Endpoint          | Description                                      |
| ------ | ----------------- | ------------------------------------------------ |
| `GET`  | `/pokemon`        | List locally stored Pokemon                      |
| `POST` | `/pokemon`        | Store a Pokemon with `pokeId` and `name`         |
| `GET`  | `/pokemon/random` | Placeholder random-Pokemon response              |
| `GET`  | `/pokemon/:id`    | Return a cached Pokemon or fetch it from PokeAPI |

### Generic Records

| Method | Endpoint   | Description                             |
| ------ | ---------- | --------------------------------------- |
| `GET`  | `/generic` | List generic records                    |
| `POST` | `/generic` | Create a record with `title` and `body` |

## Streaming Flow

1. The client posts a prompt to the Express server.
2. The server opens a streaming request through the Google GenAI SDK or REST
   endpoint.
3. Response chunks are forwarded immediately to the browser.
4. The client groups complete lines into text and fenced-code segments.
5. Code is highlighted and rendered while the response is still arriving.

The raw `/helperbot/stream` route forwards SSE events. The
`/helperbot/stream-sdk` route writes plain text chunks while retaining
event-stream response headers, so consumers should choose a parser that matches
the selected endpoint.

## Production Build

```bash
npm run build --prefix server
npm run build --prefix client
```

The outputs are written to:

- `server/dist`
- `client/dist`

`deploy.sh` is an environment-specific example that pulls `master`, applies
Prisma migrations, builds both applications, and restarts the API with PM2.
Review its paths and destructive `git reset --hard` behavior before using it on
another server.

## Current Status

This repository is an active prototype rather than a finished production
service. Fadelands is the most product-shaped feature, while the client still
includes visible test controls and learning examples. The random Pokemon route
is a placeholder, generated Fadelands characters are not persisted yet, and
automated tests have not yet been added. The production client build also
includes the full syntax-highlighting bundle, so code splitting is a useful
future optimization.
