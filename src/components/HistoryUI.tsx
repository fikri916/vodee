import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trash2, 
  Clipboard, 
  Check, 
  Clock, 
  ChevronRight,
  Search,
  Inbox
} from 'lucide-react';

export interface HistoryItem {
  id: string;
  timestamp: number;
  instruction: string;
  sourceText: string;
  result: string;
}

interface HistoryUIProps {
  onSelect: (item: HistoryItem) => void;
}

export default function HistoryUI({ onSelect }: HistoryUIProps) {
  const [history, setHistory] = React.useState<HistoryItem[]>([]);
  const [isCopied, setIsCopied] = React.useState<string | null>(null);
  const [searchTerm, setSearchTerm] = React.useState('');

  React.useEffect(() => {
    const saved = localStorage.getItem('omni-extract-history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse history', e);
      }
    }
  }, []);

  const handleClearHistory = () => {
    if (confirm('Are you sure you want to clear your entire history?')) {
      localStorage.removeItem('omni-extract-history');
      setHistory([]);
    }
  };

  const handleDeleteItem = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const updated = history.filter(item => item.id !== id);
    localStorage.setItem('omni-extract-history', JSON.stringify(updated));
    setHistory(updated);
  };

  const handleCopy = (e: React.MouseEvent, text: string, id: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setIsCopied(id);
    setTimeout(() => setIsCopied(null), 2000);
  };

  const filteredHistory = history
    .filter(item => 
      item.instruction.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.result.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => b.timestamp - a.timestamp);

  return (
    <div className="flex flex-col gap-6 h-full" id="history-container">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-slate-500">
          <Clock size={16} />
          <h2 className="text-xs font-bold uppercase tracking-widest">Recent Extractions</h2>
        </div>
        {history.length > 0 && (
          <button 
            onClick={handleClearHistory}
            className="text-[10px] font-bold text-rose-500 hover:text-rose-600 uppercase tracking-widest flex items-center gap-1.5 transition-colors"
          >
            <Trash2 size={12} />
            Clear All
          </button>
        )}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
        <input 
          type="text" 
          placeholder="Search history..."
          className="w-full bg-slate-800/50 border border-slate-700 rounded-lg py-2 pl-10 pr-4 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary placeholder-slate-600"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="flex-1 overflow-auto custom-scrollbar space-y-3 pr-1" id="history-list">
        <AnimatePresence mode="popLayout">
          {filteredHistory.length > 0 ? (
            filteredHistory.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onClick={() => onSelect(item)}
                className="glass-panel p-4 flex items-center justify-between hover:border-brand-primary/50 cursor-pointer group transition-all ring-1 ring-white/5"
              >
                <div className="flex-1 min-w-0 mr-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-mono text-slate-500">
                      {new Date(item.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-slate-200 truncate capitalize">
                    {item.instruction}
                  </h3>
                  <p className="text-[11px] text-slate-500 truncate font-mono">
                    {item.result.slice(0, 80)}...
                  </p>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => handleCopy(e, item.result, item.id)}
                    className={`p-2 rounded-lg transition-colors ${isCopied === item.id ? 'bg-emerald-500/10 text-emerald-400' : 'text-slate-500 hover:bg-slate-700'}`}
                  >
                    {isCopied === item.id ? <Check size={14} /> : <Clipboard size={14} />}
                  </button>
                  <button
                    onClick={(e) => handleDeleteItem(e, item.id)}
                    className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                  <ChevronRight size={16} className="text-slate-600 group-hover:text-brand-primary transition-colors" />
                </div>
              </motion.div>
            ))
          ) : (
            <div className="h-48 flex flex-col items-center justify-center text-slate-600 text-center px-8 border-2 border-dashed border-slate-800 rounded-xl">
              <Inbox className="mb-3 opacity-20" size={32} />
              <p className="text-xs font-medium uppercase tracking-widest">No entries found</p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
