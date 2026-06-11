# codonot-lite

`codonot-lite` is a full-stack AI streaming playground built with React and
Express. It sends prompts to models available through the Google GenAI API and
renders responses in the browser as they arrive, including syntax-highlighted
code blocks.

The project also contains small authentication, Prisma, Pokemon API, callback,
Promise, and object-oriented programming examples. These controls make the app
useful as both an AI interface prototype and a JavaScript/TypeScript learning
sandbox.

## Features

- Live token-by-token AI responses
- Selectable AI model in the streaming interface
- Code-fence detection and syntax highlighting with Highlight.js
- JWT-based registration, login, logout, and protected user lookup
- SQLite persistence through Prisma
- Pokemon API fetching with a local database cache
- Generic database read/create examples
- Responsive single-page React interface

## Technology

| Area           | Technology                                               |
| -------------- | -------------------------------------------------------- |
| Client         | React 19, TypeScript, Vite, React Router                 |
| Server         | Node.js, Express, TypeScript                             |
| Database       | SQLite, Prisma, better-sqlite3 adapter                   |
| Authentication | bcrypt, JSON Web Tokens                                  |
| AI             | Google GenAI SDK and Google Generative Language REST API |
| Rendering      | Highlight.js                                             |

## Project Structure

```text
codonot-lite/
|-- client/
|   |-- public/                 Static assets
|   `-- src/
|       |-- components/         Shared UI components
|       |-- context/            Authentication state
|       |-- pages/              Home, dashboard, and not-found pages
|       |-- routes/             React Router configuration
|       `-- services/           API and learning-example utilities
|-- server/
|   |-- prisma/
|   |   |-- migrations/         Database migration history
|   |   `-- schema.prisma       Prisma data model
|   `-- src/
|       |-- controllers/        HTTP request handlers
|       |-- middleware/         Authentication middleware
|       |-- routes/             Express route definitions
|       `-- services/           AI, auth, database, and Pokemon logic
|-- deploy.sh                   Example production deployment script
`-- package.json                Root development scripts
```

## Prerequisites

- Node.js with built-in `fetch` support (Node.js 20 or newer recommended)
- npm
- A Google AI API key for the helper bot endpoints

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
DATABASE_URL = file:./prisma/dev.db
GEMINI_API_KEY = replace_with_your_google_ai_key
JWT_SECRET = replace_with_a_long_random_secret
NODE_ENV = development
PORT = 3001
```

`GEMINI_API_KEY` is only required for AI requests. `JWT_SECRET` is required for
registration and login.

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

| Method | Endpoint                | Description                                  |
| ------ | ----------------------- | -------------------------------------------- |
| `POST` | `/helperbot`            | Return one complete AI response              |
| `POST` | `/helperbot/stream`     | Proxy the upstream SSE response              |
| `POST` | `/helperbot/stream-sdk` | Stream plain text chunks using the GenAI SDK |

Each helper bot endpoint accepts:

```json
{
  "prompt": "Show a TypeScript fetch example"
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
service. The client includes visible test controls and learning examples, the
random Pokemon route is a placeholder, and automated tests have not yet been
added. The production client build also includes the full syntax-highlighting
bundle, so code splitting is a useful future optimization.
