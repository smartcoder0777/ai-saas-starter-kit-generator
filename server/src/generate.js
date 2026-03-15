import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

const SYSTEM_PROMPT = `You are an expert SaaS architect. Given a short product description, you generate a complete starter kit specification in JSON only, no markdown or extra text.

Respond with exactly one JSON object with these keys (all strings; use \\n for newlines inside strings):

1. "databaseSchema" - Prisma schema (datasource + generator + models). Use PostgreSQL. Include sensible fields, relations, and indexes for the domain.

2. "apiEndpoints" - List of REST API endpoints. Format as a string with one endpoint per line, e.g. "GET /api/users\\nPOST /api/users\\nGET /api/users/:id". Include auth if relevant (e.g. login, register).

3. "uiPages" - List of UI pages/screens. Format as a string with one page per line, e.g. "Landing page\\nLogin\\nDashboard\\nSettings". Include key flows (auth, main app, admin if needed).

4. "projectStructure" - Folder/file structure as a string. Use tree style, e.g. "src/\\n  components/\\n  pages/\\n  api/\\n  lib/". Cover: frontend (React/Vite), backend (Node/Express), shared config.

Be concrete and specific to the product domain. Use common patterns (REST, CRUD, auth) and realistic names.`;

function buildUserPrompt(description) {
  return `Product description: "${description}"\n\nGenerate the JSON object with databaseSchema, apiEndpoints, uiPages, and projectStructure.`;
}

export async function generateBoilerplate(description) {
  if (!process.env.OPENAI_API_KEY) {
    const err = new Error('OPENAI_API_KEY is not set. Add it to server/.env');
    err.statusCode = 503;
    throw err;
  }

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: buildUserPrompt(description) },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.4,
  });

  const raw = completion.choices[0]?.message?.content;
  if (!raw) {
    throw new Error('Empty response from AI');
  }

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error('Invalid JSON in AI response');
  }

  return {
    databaseSchema: String(parsed.databaseSchema ?? ''),
    apiEndpoints: String(parsed.apiEndpoints ?? ''),
    uiPages: String(parsed.uiPages ?? ''),
    projectStructure: String(parsed.projectStructure ?? ''),
  };
}
