# AI SaaS Starter Kit Generator

Generate a full SaaS starter kit from a short description. Enter something like **"Build SaaS for restaurant booking"** and get:

- **Database schema** (Prisma, PostgreSQL)
- **API endpoints** (REST)
- **UI pages** (screens and flows)
- **Project structure** (folders and files)

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
2. Type your product idea (e.g. *"Build SaaS for restaurant booking"*).
3. Click **Generate starter kit**.
4. Review **Database schema**, **API endpoints**, **UI pages**, and **Project structure** in the tabs.
5. Click **Download as ZIP** to get a zip with the generated docs and schema.

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

- **POST /api/download-zip**  
  Body: `{ "description": "...", "generated": { databaseSchema, apiEndpoints, uiPages, projectStructure } }`  
  Returns: ZIP file.

- **GET /api/health**  
  Returns: `{ "ok": true }`.
