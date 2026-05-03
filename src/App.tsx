/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import ExtractorUI from './components/ExtractorUI';
import HistoryUI, { HistoryItem } from './components/HistoryUI';

export default function App() {
  const [view, setView] = useState<'extractor' | 'history'>('extractor');
  const [selectedHistory, setSelectedHistory] = useState<HistoryItem | null>(null);

  const handleSelectHistory = (item: HistoryItem) => {
    setSelectedHistory(item);
    setView('extractor');
  };

  return (
    <div className="min-h-screen flex flex-col bg-brand-bg">
      <header className="h-16 bg-slate-900/80 border-b border-slate-800 px-6 md:px-8 flex items-center justify-between shadow-lg z-50 sticky top-0 backdrop-blur-md" id="app-header">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-brand-primary rounded-lg flex items-center justify-center text-white shadow-lg shadow-brand-primary/20" id="logo-icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect width="18" height="18" x="3" y="3" rx="2" />
              <path d="M7 7h10" />
              <path d="M7 12h10" />
              <path d="M7 17h10" />
              <path d="m15 15 3 3" />
            </svg>
          </div>
          <div className="flex flex-col -space-y-0.5">
            <h1 className="font-display text-lg font-bold tracking-tight text-white" id="app-title">
              Text Extractor <span className="text-brand-primary font-normal text-[10px] ml-1 uppercase tracking-widest hidden sm:inline">Pro</span>
            </h1>
            <span className="text-[10px] text-slate-500 font-medium tracking-tight">
              made by <a href="https://www.instagram.com/fikriadarmouch" target="_blank" rel="noopener noreferrer" className="text-brand-primary font-bold hover:text-indigo-300 transition-colors">fikri</a>
            </span>
          </div>
        </div>
        
        <nav className="hidden md:flex gap-6 text-sm font-medium text-slate-400 items-center">
          <button 
            onClick={() => { setView('extractor'); setSelectedHistory(null); }}
            className={`transition-all pb-px border-b-2 ${view === 'extractor' ? 'text-brand-primary border-brand-primary' : 'border-transparent hover:text-slate-200'}`}
          >
            Extractor
          </button>
          <button 
            onClick={() => setView('history')}
            className={`transition-all pb-px border-b-2 ${view === 'history' ? 'text-brand-primary border-brand-primary' : 'border-transparent hover:text-slate-200'}`}
          >
            History
          </button>
        </nav>

        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col p-4 md:p-6 lg:p-8 max-w-[1600px] mx-auto w-full" id="main-content">
        {view === 'extractor' ? (
          <ExtractorUI initialData={selectedHistory} key={selectedHistory?.id || 'new'} />
        ) : (
          <HistoryUI onSelect={handleSelectHistory} />
        )}
      </main>

      <footer className="h-10 bg-slate-900 border-t border-slate-800 px-6 flex items-center justify-between text-[11px] text-slate-500 uppercase tracking-widest font-medium" id="app-footer">
        <div className="flex gap-4">
          <span>Engine: <span className="text-brand-accent font-bold">Online</span></span>
          <span className="hidden sm:inline text-slate-700">|</span>
          <span className="hidden sm:inline">Dark Synthesis Active</span>
        </div>
        <div>© 2026 Text Extractor • Powered by Gemini</div>
      </footer>
    </div>
  );
}
