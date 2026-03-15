import { useState } from 'react';
import { generateBoilerplate, downloadZip } from './api';
import ResultTabs from './ResultTabs';

const TABS = [
  { id: 'schema', label: 'Database schema', key: 'databaseSchema' },
  { id: 'endpoints', label: 'API endpoints', key: 'apiEndpoints' },
  { id: 'pages', label: 'UI pages', key: 'uiPages' },
  { id: 'structure', label: 'Project structure', key: 'projectStructure' },
];

export default function App() {
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [generated, setGenerated] = useState(null);

  const handleGenerate = async () => {
    if (!description.trim()) return;
    setError(null);
    setGenerated(null);
    setLoading(true);
    try {
      const result = await generateBoilerplate(description.trim());
      setGenerated(result);
    } catch (e) {
      setError(e.message || 'Generation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadZip = async () => {
    if (!description.trim() || !generated) return;
    try {
      await downloadZip(description.trim(), generated);
    } catch (e) {
      setError(e.message || 'Download failed');
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur">
        <div className="max-w-4xl mx-auto px-4 py-5">
          <h1 className="text-xl font-semibold text-white tracking-tight">
            AI SaaS Starter Kit Generator
          </h1>
          <p className="text-slate-400 text-sm mt-0.5">
            Describe your SaaS idea — get database schema, API endpoints, UI pages & project structure
          </p>
        </div>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8">
        <div className="space-y-4">
          <label className="block text-sm font-medium text-slate-300">
            What do you want to build?
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. Build SaaS for restaurant booking"
            className="w-full h-28 px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 resize-none font-sans"
            disabled={loading}
          />
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleGenerate}
              disabled={loading || !description.trim()}
              className="px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:pointer-events-none text-white font-medium transition-colors"
            >
              {loading ? 'Generating…' : 'Generate starter kit'}
            </button>
            {generated && (
              <button
                onClick={handleDownloadZip}
                className="px-5 py-2.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 font-medium transition-colors"
              >
                Download as ZIP
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="mt-6 p-4 rounded-xl bg-red-950/50 border border-red-800 text-red-200 text-sm">
            {error}
          </div>
        )}

        {generated && (
          <div className="mt-8">
            <ResultTabs tabs={TABS} data={generated} />
          </div>
        )}
      </main>
    </div>
  );
}
