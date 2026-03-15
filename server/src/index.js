import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { generateBoilerplate } from './generate.js';
import { buildZip } from './zip.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
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

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
