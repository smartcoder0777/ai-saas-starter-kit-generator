# AI SaaS Starter Kit Generator

Generate a full SaaS starter kit from a short description. Enter something like **"AI SaaS for restaurant booking"** and get:

- **Quick spec:** Database schema (Prisma), API endpoints, UI pages, project structure
- **Full repo:** A complete GitHub-ready project you can download as a ZIP:
  - `/frontend` — React (Vite) + Tailwind, components and pages
  - `/backend` — Node (Express), API routes
  - Database schema (Prisma)
  - Working **authentication** placeholder (login/register)
  - Example **AI feature** (e.g. OpenAI-backed route)
  - **README** with setup and run instructions

Stack: **React (Vite)** + **Tailwind CSS** + **Node.js**.

---

## Quick start

### 1. Set up the backend

```bash
cd server
cp .env.example .env
# Edit .env and set OPENAI_API_KEY=your_openai_api_key
npm install
npm run dev
```

Server runs at **http://localhost:3001**.

### 2. Set up the frontend

In another terminal:

```bash
cd client
npm install
npm run dev
```

App runs at **http://localhost:5173**. Vite proxies `/api` to the server.

### 3. Run both from the root

From the project root:

```bash
npm install
npm run dev
```

This starts both server and client.

---

## Usage

1. Open **http://localhost:5173**.
2. Type your product idea (e.g. *"AI SaaS for restaurant booking"*).
3. Choose **Quick** (spec only) or check **Full repo** for a complete project (frontend, backend, auth, AI example).
4. Click **Generate starter kit** or **Generate full repo**.
5. Review the tabs (schema, endpoints, pages, structure; for full repo, also **Repo files** to browse generated files).
6. Click **Download as ZIP** — for full repo you get a folder ready to push to GitHub.

---

## Environment

| Variable        | Required | Description                |
|----------------|----------|----------------------------|
| `PORT`         | No       | Server port (default 3001) |
| `OPENAI_API_KEY` | Yes    | OpenAI API key for generation |

---

## Project layout

```
├── client/          # React + Vite + Tailwind
│   ├── src/
│   │   ├── App.jsx
│   │   ├── ResultTabs.jsx
│   │   ├── api.js
│   │   ├── main.jsx
│   │   └── index.css
│   └── ...
├── server/          # Node.js + Express
│   ├── src/
│   │   ├── index.js    # Routes
│   │   ├── generate.js # OpenAI boilerplate generation
│   │   └── zip.js      # ZIP download
│   └── .env.example
├── package.json     # Root scripts (concurrently)
└── README.md
```

---

## API

- **POST /api/generate**  
  Body: `{ "description": "Build SaaS for restaurant booking" }`  
  Returns: `{ databaseSchema, apiEndpoints, uiPages, projectStructure }`

- **POST /api/generate-repo**  
  Body: `{ "description": "AI SaaS for restaurant booking" }`  
  Returns: same fields plus `files: [{ path, content }, ...]` (full frontend/backend, auth, AI example, README).

- **POST /api/download-zip**  
  Body: `{ "description": "...", "generated": { databaseSchema, apiEndpoints, uiPages, projectStructure } }`  
  Returns: ZIP file.

- **GET /api/health**  
  Returns: `{ "ok": true }`.

---

## Deploy (single service)

The app is set up to run as **one service**: the Node server serves the built React app and the API. No separate frontend host or CORS config needed.

**Build (from repo root):**
```bash
npm run install:all
npm run build
```

**Run in production:**
```bash
NODE_ENV=production npm run start
```
Server listens on `PORT` and serves the UI and `/api` from the same origin.

### Render

1. New **Web Service**, connect repo.
2. **Root directory:** leave default (repo root).
3. **Build command:** `npm run install:all && npm run build`
4. **Start command:** `NODE_ENV=production npm run start`
5. **Environment:** add `OPENAI_API_KEY` (required). Optionally `PORT` (Render sets it automatically).
6. Deploy.

### Railway

1. New project from repo.
2. **Build command:** `npm run install:all && npm run build`
3. **Start command:** `NODE_ENV=production npm run start`
4. **Variables:** add `OPENAI_API_KEY`. Railway sets `PORT`.
5. Deploy.

### Vercel

Uses **serverless functions** for the API (no long-running Node server). Frontend and `/api` are on the same domain.

1. Import the repo in [Vercel](https://vercel.com) (GitHub/GitLab/Bitbucket).
2. **Root Directory:** leave default (repo root).
3. **Build & Output:** `vercel.json` is set: build runs `npm run install:all && npm run build`, output is `client/dist`. API routes in `api/` are picked up automatically.
4. **Environment variables:** in the project dashboard, add `OPENAI_API_KEY` (required).
5. Deploy. The app URL will serve the UI; `/api/generate` and `/api/download-zip` run as serverless functions.

**Note:** Serverless has a ~10s timeout on the Hobby plan (60s on Pro). Generation usually finishes within that; if you hit limits, consider Render/Railway for a long-running server.

### Other hosts (Fly.io, Heroku, etc.)

- Install deps and build client from root: `npm run install:all && npm run build`
- Start with `NODE_ENV=production npm run start` (from root).
- Set `OPENAI_API_KEY` and `PORT` (if the host doesn’t set it).
