import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

// Three batches run in parallel after spec is ready
const FILE_BATCHES = [
  [
    'README.md',
    'backend/package.json',
    'backend/src/index.js',
    'backend/src/routes/auth.js',
    'backend/src/routes/ai-example.js',
  ],
  [
    'backend/prisma/schema.prisma',
    'frontend/package.json',
    'frontend/vite.config.js',
    'frontend/index.html',
    'frontend/src/main.jsx',
  ],
  [
    'frontend/src/App.jsx',
    'frontend/src/components/Header.jsx',
    'frontend/src/components/Layout.jsx',
    'frontend/src/pages/Home.jsx',
    'frontend/src/lib/api.js',
  ],
];

const SPEC_SYSTEM = `You are an expert SaaS architect. Given a product description, return a single JSON object (no markdown) with:
1. "databaseSchema" (string) - Full Prisma schema: datasource db PostgreSQL, generator client, and models. Use \\n for newlines. Match the domain.
2. "apiEndpoints" (string) - REST endpoints, one per line, e.g. "GET /api/users\\nPOST /api/auth/login". Include auth.
3. "uiPages" (string) - UI page names, one per line.
4. "projectStructure" (string) - Folder tree for the repo, \\n for newlines.
Be concise.`;

function parseJsonResponse(raw) {
  if (!raw) throw new Error('Empty response from AI');
  try {
    return JSON.parse(raw);
  } catch {
    throw new Error('Invalid JSON in AI response');
  }
}

/**
 * Single quick call: schema + endpoints + pages + structure.
 * @param {string} description
 */
export async function generateRepoSpec(description) {
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: SPEC_SYSTEM },
      { role: 'user', content: `Product: "${description}"\n\nReturn the JSON object.` },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.3,
    max_tokens: 2000,
  });
  const parsed = parseJsonResponse(completion.choices[0]?.message?.content);
  return {
    databaseSchema: String(parsed.databaseSchema ?? ''),
    apiEndpoints: String(parsed.apiEndpoints ?? ''),
    uiPages: String(parsed.uiPages ?? ''),
    projectStructure: String(parsed.projectStructure ?? ''),
  };
}

/**
 * Generate one batch of files. Runs in parallel with other batches.
 * @param {string} description
 * @param {{ databaseSchema: string }} spec
 * @param {string[]} paths
 */
export async function generateFileBatch(description, spec, paths) {
  const pathList = paths.map((p) => `- ${p}`).join('\n');
  const system = `You generate only the requested files for a GitHub-ready SaaS repo. Return a single JSON object: { "files": [ { "path": "...", "content": "..." } ] }. Use \\n for newlines in content. Be concise and runnable.`;
  const user = `Product: "${description}"
Database schema (use for backend/prisma):
\`\`\`
${spec.databaseSchema}
\`\`\`

Generate exactly these files (same paths, in order):
${pathList}

Return JSON with "files" array only.`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.3,
    max_tokens: 6000,
  });
  const parsed = parseJsonResponse(completion.choices[0]?.message?.content);
  const files = Array.isArray(parsed.files) ? parsed.files : [];
  return files
    .filter((f) => f && typeof f.path === 'string' && typeof f.content === 'string')
    .map((f) => ({ path: f.path.replace(/\\/g, '/'), content: f.content }));
}

/**
 * Parallel full-repo: one spec call, then three file-batch calls in parallel.
 * @param {string} description
 * @returns {Promise<{ databaseSchema: string, apiEndpoints: string, uiPages: string, projectStructure: string, files: Array<{ path: string, content: string }> }>}
 */
export async function generateFullRepo(description) {
  if (!process.env.OPENAI_API_KEY) {
    const err = new Error('OPENAI_API_KEY is not set. Add it to server/.env');
    err.statusCode = 503;
    throw err;
  }

  const spec = await generateRepoSpec(description);

  const batchResults = await Promise.all(
    FILE_BATCHES.map((paths) => generateFileBatch(description, spec, paths))
  );

  const files = batchResults.flat();

  // Ensure backend/prisma/schema.prisma uses the spec schema (batch may have duplicated it)
  const schemaFile = files.find((f) => f.path === 'backend/prisma/schema.prisma');
  if (schemaFile) schemaFile.content = spec.databaseSchema;

  return {
    ...spec,
    files,
  };
}
