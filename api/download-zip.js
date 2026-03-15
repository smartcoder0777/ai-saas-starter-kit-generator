import { buildZip } from '../server/src/zip.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
  const { description, generated } = body;
  if (!description || !generated) {
    return res.status(400).json({ error: 'Missing "description" or "generated" in body' });
  }
  try {
    const zipBuffer = await buildZip(description, generated);
    const slug = description.slice(0, 40).replace(/[^a-z0-9]/gi, '-').toLowerCase();
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${slug}-saas-starter.zip"`);
    return res.status(200).send(zipBuffer);
  } catch (err) {
    console.error('Zip error:', err);
    return res.status(500).json({ error: err.message || 'Failed to build zip' });
  }
}
