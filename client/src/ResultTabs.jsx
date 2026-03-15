import { useState } from 'react';

export default function ResultTabs({ tabs, data }) {
  const [active, setActive] = useState(tabs[0].id);
  const current = tabs.find((t) => t.id === active);
  const content = current ? (data[current.key] || '') : '';

  return (
    <div className="border border-slate-800 rounded-xl bg-slate-900/80 overflow-hidden">
      <div className="flex border-b border-slate-800 bg-slate-900/50">
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
        <pre className="text-sm text-slate-300 font-mono whitespace-pre-wrap break-words">
          {content || 'No content generated.'}
        </pre>
      </div>
    </div>
  );
}
