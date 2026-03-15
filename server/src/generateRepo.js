import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

const REPO_SYSTEM_PROMPT = `You are an expert full-stack architect. Given a short product description, you generate a complete GitHub-ready SaaS starter repo as a single JSON object.

Respond with exactly one JSON object (no markdown, no extra text) with these keys:

1. "databaseSchema" (string) - Prisma schema: datasource db PostgreSQL, generator client, and models. Use \\n for newlines. Match the product domain.

2. "apiEndpoints" (string) - REST API list, one per line, e.g. "GET /api/users\\nPOST /api/auth/login". Include auth and main resources.

3. "uiPages" (string) - UI pages list, one per line, e.g. "Landing\\nLogin\\nDashboard".

4. "projectStructure" (string) - Tree of folders/files for the repo. Use \\n for newlines.

5. "files" (array of objects) - Each object has "path" (string) and "content" (string). Use \\n for newlines inside content. Generate working, concise code for exactly these paths (all required):

- README.md - Project name, description, setup (install deps, env vars, run frontend + backend), how to run DB migrations, and a short "Project structure" section.
- backend/package.json - name, type "module", scripts start/dev, dependencies: express, cors, dotenv, prisma, jsonwebtoken, bcryptjs (or similar). DevDependencies: none or nodemon.
- backend/src/index.js - Express app, cors(), json, mount /api/auth and /api/ai-example, listen on PORT. Use ESM import.
- backend/src/routes/auth.js - Export router with POST /login and POST /register (placeholder: validate body, return 200 + mock token or message). Use ESM.
- backend/src/routes/ai-example.js - Export router with POST / (or /suggest): call OpenAI API (or placeholder that returns mock AI response). Use ESM, require OPENAI_API_KEY in env.
- backend/prisma/schema.prisma - Same as databaseSchema above (full Prisma schema).
- frontend/package.json - name, type "module", scripts dev/build/preview, dependencies react react-dom, devDependencies vite @vitejs/plugin-react tailwindcss postcss autoprefixer.
- frontend/vite.config.js - React plugin, server port 5173, proxy /api to http://localhost:3001.
- frontend/index.html - Doctype, root div, script type=module src=/src/main.jsx.
- frontend/src/main.jsx - ReactDOM.createRoot, render App.
- frontend/src/App.jsx - Simple layout: Header, main area with one page (e.g. Home). Tailwind classes. Fetch from /api/ai-example on button click to show "example AI feature".
- frontend/src/components/Header.jsx - Nav bar with app name and optional Login/Dashboard links (no routing, just UI).
- frontend/src/components/Layout.jsx - Wraps children with Header and main.
- frontend/src/pages/Home.jsx - Welcome text, short description, button "Try AI example" that calls API and shows result.
- frontend/src/lib/api.js - Export async function api(path, options) using fetch to /api + path. Used by App or Home.

Keep every file concise but runnable. Auth can be placeholder (no real DB). AI example can use real OpenAI if OPENAI_API_KEY set, or return a mock. Domain-specific names (e.g. "restaurant", "booking") in README and UI copy.`;

function buildRepoUserPrompt(description) {
  return `Product description: "${description}"\n\nGenerate the full JSON object with databaseSchema, apiEndpoints, uiPages, projectStructure, and files array with all 15 file paths and their content.`;
}

/**
 * @param {string} description
 * @returns {Promise<{ databaseSchema: string, apiEndpoints: string, uiPages: string, projectStructure: string, files?: Array<{ path: string, content: string }> }>}
 */
export async function generateFullRepo(description) {
  if (!process.env.OPENAI_API_KEY) {
    const err = new Error('OPENAI_API_KEY is not set. Add it to server/.env');
    err.statusCode = 503;
    throw err;
  }

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: REPO_SYSTEM_PROMPT },
      { role: 'user', content: buildRepoUserPrompt(description) },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.3,
    max_tokens: 16000,
  });

  const raw = completion.choices[0]?.message?.content;
  if (!raw) throw new Error('Empty response from AI');

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error('Invalid JSON in AI response');
  }

  const files = Array.isArray(parsed.files) ? parsed.files : [];
  const safeFiles = files
    .filter((f) => f && typeof f.path === 'string' && typeof f.content === 'string')
    .map((f) => ({ path: f.path.replace(/\\/g, '/'), content: f.content }));

  return {
    databaseSchema: String(parsed.databaseSchema ?? ''),
    apiEndpoints: String(parsed.apiEndpoints ?? ''),
    uiPages: String(parsed.uiPages ?? ''),
    projectStructure: String(parsed.projectStructure ?? ''),
    files: safeFiles,
  };
}
