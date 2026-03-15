import 'dotenv/config';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import cors from 'cors';
import { generateBoilerplate } from './generate.js';
import { generateFullRepo } from './generateRepo.js';
import { buildZip } from './zip.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isProduction = process.env.NODE_ENV === 'production';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: isProduction ? true : ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:3001', 'http://127.0.0.1:3001'],
  credentials: false,
}));
app.use(express.json());

app.post('/api/generate', async (req, res) => {
  const { description } = req.body;
  if (!description || typeof description !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid "description" in body' });
  }
  try {
    const result = await generateBoilerplate(description.trim());
    return res.json(result);
  } catch (err) {
    console.error('Generate error:', err);
    const message = err.message || 'Generation failed';
    const status = err.statusCode || 500;
    return res.status(status).json({ error: message });
  }
});

app.post('/api/generate-repo', async (req, res) => {
  const { description } = req.body;
  if (!description || typeof description !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid "description" in body' });
  }
  try {
    const result = await generateFullRepo(description.trim());
    return res.json(result);
  } catch (err) {
    console.error('Generate-repo error:', err);
    const message = err.message || 'Full repo generation failed';
    const status = err.statusCode || 500;
    return res.status(status).json({ error: message });
  }
});

app.post('/api/download-zip', async (req, res) => {
  const { description, generated } = req.body;
  if (!description || !generated) {
    return res.status(400).json({ error: 'Missing "description" or "generated" in body' });
  }
  try {
    const zipBuffer = await buildZip(description, generated);
    const slug = description.slice(0, 40).replace(/[^a-z0-9]/gi, '-').toLowerCase();
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${slug}-saas-starter.zip"`);
    return res.send(zipBuffer);
  } catch (err) {
    console.error('Zip error:', err);
    return res.status(500).json({ error: err.message || 'Failed to build zip' });
  }
});

app.get('/api/health', (_, res) => res.json({ ok: true }));

// Serve built client in production (single deployment)
if (isProduction) {
  const clientDist = path.join(__dirname, '..', '..', 'client', 'dist');
  app.use(express.static(clientDist));
  app.get('*', (_, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
