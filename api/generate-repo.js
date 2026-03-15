import { generateFullRepo } from '../server/src/generateRepo.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
  const { description } = body;
  if (!description || typeof description !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid "description" in body' });
  }
  try {
    const result = await generateFullRepo(description.trim());
    return res.status(200).json(result);
  } catch (err) {
    console.error('Generate-repo error:', err);
    const status = err.statusCode || 500;
    return res.status(status).json({ error: err.message || 'Full repo generation failed' });
  }
}
