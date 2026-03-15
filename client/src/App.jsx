import { useState, useRef, useEffect } from 'react';
import { generateBoilerplate, generateFullRepo, downloadZip } from './api';
import ResultTabs from './ResultTabs';

const QUICK_TABS = [
  { id: 'schema', label: 'Database schema', key: 'databaseSchema' },
  { id: 'endpoints', label: 'API endpoints', key: 'apiEndpoints' },
  { id: 'pages', label: 'UI pages', key: 'uiPages' },
  { id: 'structure', label: 'Project structure', key: 'projectStructure' },
];

const FULL_REPO_TABS = [
  ...QUICK_TABS,
  { id: 'repo', label: 'Repo files', key: 'repo' },
];

const LOADING_STAGES = [
  'Analyzing your idea…',
  'Designing schema & API…',
  'Writing repo (parallel)…',
];

export default function App() {
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState(0);
  const [error, setError] = useState(null);
  const [generated, setGenerated] = useState(null);
  const [isFullRepo, setIsFullRepo] = useState(false);
  const abortRef = useRef(null);
  const stageIntervalRef = useRef(null);

  useEffect(() => {
    if (!loading || !isFullRepo) return;
    setLoadingStage(0);
    stageIntervalRef.current = setInterval(() => {
      setLoadingStage((s) => Math.min(s + 1, LOADING_STAGES.length - 1));
    }, 10000);
    return () => {
      if (stageIntervalRef.current) clearInterval(stageIntervalRef.current);
    };
  }, [loading, isFullRepo]);

  const handleGenerate = async () => {
    if (!description.trim()) return;
    setError(null);
    setGenerated(null);
    setLoading(true);
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();
    const signal = abortRef.current.signal;
    try {
      const result = isFullRepo
        ? await generateFullRepo(description.trim(), { signal })
        : await generateBoilerplate(description.trim());
      setGenerated(result);
    } catch (e) {
      if (e.name === 'AbortError') {
        setError('Cancelled');
      } else {
        setError(e.message || 'Generation failed');
      }
    } finally {
      setLoading(false);
      if (stageIntervalRef.current) clearInterval(stageIntervalRef.current);
      abortRef.current = null;
    }
  };

  const handleCancel = () => {
    if (abortRef.current) abortRef.current.abort();
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
            Describe your SaaS idea — get a quick spec or a full GitHub-ready repo (frontend, backend, auth, AI example)
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
            <label className="flex items-center gap-2 text-slate-400 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={isFullRepo}
                onChange={(e) => setIsFullRepo(e.target.checked)}
                disabled={loading}
                className="rounded border-slate-600 bg-slate-800 text-emerald-500 focus:ring-emerald-500"
              />
              Full repo (frontend + backend + auth + AI example)
            </label>
            <button
              onClick={handleGenerate}
              disabled={loading || !description.trim()}
              className="px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:pointer-events-none text-white font-medium transition-colors"
            >
              {loading ? (isFullRepo ? LOADING_STAGES[loadingStage] : 'Generating…') : isFullRepo ? 'Generate full repo' : 'Generate starter kit'}
            </button>
            {loading && isFullRepo && (
              <>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-5 py-2.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 font-medium transition-colors"
                >
                  Cancel
                </button>
                <span className="text-slate-500 text-sm">Usually 25–40 seconds</span>
              </>
            )}
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
            <ResultTabs tabs={generated.files?.length ? FULL_REPO_TABS : QUICK_TABS} data={generated} />
          </div>
        )}
      </main>
    </div>
  );
}
