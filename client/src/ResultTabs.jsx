import { useState } from 'react';

export default function ResultTabs({ tabs, data }) {
  const [active, setActive] = useState(tabs[0].id);
  const [selectedPath, setSelectedPath] = useState(null);
  const current = tabs.find((t) => t.id === active);
  const content = current && current.key !== 'repo' ? (data[current.key] || '') : '';
  const files = Array.isArray(data.files) ? data.files : [];
  const selectedFile = selectedPath ? files.find((f) => f.path === selectedPath) : null;

  return (
    <div className="border border-slate-800 rounded-xl bg-slate-900/80 overflow-hidden">
      <div className="flex flex-wrap border-b border-slate-800 bg-slate-900/50 gap-px">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActive(tab.id)}
            className={`px-4 py-3 text-sm font-medium transition-colors ${
              active === tab.id
                ? 'text-emerald-400 border-b-2 border-emerald-500 bg-slate-900/80'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="p-4 min-h-[280px] max-h-[60vh] overflow-auto">
        {active === 'repo' && files.length > 0 ? (
          <div className="flex gap-4 h-full min-h-[260px]">
            <ul className="flex-shrink-0 w-56 space-y-1 font-mono text-sm text-slate-400">
              {files.map(({ path }) => (
                <li key={path}>
                  <button
                    type="button"
                    onClick={() => setSelectedPath(path)}
                    className={`block w-full text-left truncate px-2 py-1 rounded ${selectedPath === path ? 'bg-slate-700 text-emerald-400' : 'hover:bg-slate-800 hover:text-slate-200'}`}
                    title={path}
                  >
                    {path}
                  </button>
                </li>
              ))}
            </ul>
            <div className="flex-1 min-w-0 border border-slate-700 rounded-lg bg-slate-950 overflow-auto">
              {selectedFile ? (
                <pre className="p-3 text-xs text-slate-300 font-mono whitespace-pre-wrap break-words">
                  {selectedFile.content || '(empty)'}
                </pre>
              ) : (
                <p className="p-3 text-slate-500 text-sm">Click a file to view content.</p>
              )}
            </div>
          </div>
        ) : (
          <pre className="text-sm text-slate-300 font-mono whitespace-pre-wrap break-words">
            {content || 'No content generated.'}
          </pre>
        )}
      </div>
    </div>
  );
}
