import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Clipboard, 
  Check, 
  Trash2, 
  Sparkles, 
  ArrowRight, 
  FileText, 
  Target,
  Download,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import ReactMarkdown from 'react-markdown';
import { HistoryItem } from './HistoryUI';

// Initialize Gemini API
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

interface ExtractorUIProps {
  initialData?: HistoryItem | null;
}

export default function ExtractorUI({ initialData }: ExtractorUIProps) {
  const [sourceText, setSourceText] = useState(initialData?.sourceText || '');
  const [instruction, setInstruction] = useState(initialData?.instruction || '');
  const [result, setResult] = useState(initialData?.result || '');
  const [isExtracting, setIsExtracting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  // Update state if initialData changes (when user clicks from history)
  React.useEffect(() => {
    if (initialData) {
      setSourceText(initialData.sourceText);
      setInstruction(initialData.instruction);
      setResult(initialData.result);
    }
  }, [initialData]);
  
  const resultRef = useRef<HTMLDivElement>(null);

  const handleExtract = async () => {
    if (!sourceText.trim() || !instruction.trim()) {
      setError('Please provide both source text and extraction instructions.');
      return;
    }

    setIsExtracting(true);
    setError(null);
    setResult('');

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          {
            text: `Source Text:\n"""\n${sourceText}\n"""\n\nExtraction Instruction: ${instruction}\n\nPlease extract only the requested data points. Do not include any extra text, labels, or context.`
          }
        ],
        config: {
          systemInstruction: "You are an elite data extraction engine. Your output MUST consist ONLY of the specific data points requested by the user. Do not include headers, conversational filler, explanations, or metadata. If the user asks for a list, provide a clean vertical list with one item per line and zero additional text. Never add conversational prefixes like 'Here is the list...' or 'I found...'. If the data is not found, return an empty response or 'Not found'.",
          temperature: 0.1, // Even lower temperature for maximum precision
        }
      });

      const extractedData = response.text;
      if (extractedData) {
        setResult(extractedData);
        
        // SAVE TO HISTORY
        const historyItem = {
          id: crypto.randomUUID(),
          timestamp: Date.now(),
          instruction: instruction,
          sourceText: sourceText,
          result: extractedData
        };
        
        const existing = JSON.parse(localStorage.getItem('omni-extract-history') || '[]');
        localStorage.setItem('omni-extract-history', JSON.stringify([historyItem, ...existing].slice(0, 50)));

        // Scroll to result after a short delay for animation
        setTimeout(() => {
          resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      } else {
        setError('The model returned an empty response. Please try refining your instruction.');
      }
    } catch (err) {
      console.error('Extraction Error:', err);
      setError('An error occurred during extraction. Please check your connection or try again later.');
    } finally {
      setIsExtracting(false);
    }
  };

  const handleCopy = () => {
    if (result) {
      navigator.clipboard.writeText(result);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleClear = () => {
    setSourceText('');
    setInstruction('');
    setResult('');
    setError(null);
  };

  const downloadResult = () => {
    if (!result) return;
    const blob = new Blob([result], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `extraction-result-${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 flex flex-col gap-8 max-w-5xl mx-auto w-full" id="extractor-container">
      <div className="text-center space-y-2 mb-4">
        <h2 className="text-3xl md:text-4xl font-display font-bold tracking-tight text-white mb-2">
          Extract anything you want from your text
        </h2>
        <p className="text-slate-400 text-sm md:text-base max-w-2xl mx-auto">
          Paste your document below and define exactly what information you want to isolate.
        </p>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0">
        {/* Left Column: Source Text */}
        <section className="lg:flex-[3] flex flex-col gap-3 min-h-[400px]" id="source-section">
          <div className="flex items-center justify-between">
            <label htmlFor="source-text" className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
              <FileText size={14} className="text-brand-primary" />
              Source Input
            </label>
            <span className="text-[10px] text-slate-500 font-mono">
              {sourceText.split(/\s+/).filter(Boolean).length} WORDS
            </span>
          </div>
          
          <div className="flex-1 glass-panel flex flex-col min-h-0 relative group ring-1 ring-white/5">
            <textarea
              id="source-text"
              className="flex-1 w-full p-6 text-slate-300 leading-relaxed resize-none border-none focus:ring-0 focus:outline-none text-sm font-sans bg-transparent"
              placeholder="Paste your source text here..."
              value={sourceText}
              onChange={(e) => setSourceText(e.target.value)}
            />
            <button
              onClick={() => setSourceText('')}
              className="absolute bottom-4 right-4 p-2 bg-slate-700/50 hover:bg-slate-700 text-slate-300 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all opacity-0 group-hover:opacity-100"
            >
              Clear
            </button>
          </div>
        </section>

        {/* Right Column: Configuration & Results */}
        <section className="lg:flex-[2] flex flex-col gap-6 min-h-0" id="config-section">
          
          {/* Instruction Input */}
          <div className="glass-panel p-6 ring-1 ring-white/5 shadow-2xl">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Target Data</h2>
            <div className="space-y-4">
              <div className="relative">
                <input
                  type="text"
                  id="instruction"
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-lg py-3 px-4 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-primary/40 focus:border-brand-primary transition-all shadow-inner"
                  placeholder="e.g., 'Extract only phone numbers'..."
                  value={instruction}
                  onChange={(e) => setInstruction(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleExtract()}
                />
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex gap-2">
                    <span className="px-2 py-1 bg-indigo-500/10 text-brand-primary text-[9px] font-black rounded border border-indigo-500/20 uppercase tracking-tighter">AI AGENT</span>
                  </div>
                  <button
                    onClick={handleExtract}
                    disabled={isExtracting || !sourceText.trim() || !instruction.trim()}
                    className="bg-brand-primary hover:bg-indigo-500 text-white px-6 py-2 rounded-lg text-sm font-bold shadow-lg shadow-indigo-900/30 disabled:opacity-30 disabled:shadow-none transition-all flex items-center gap-2"
                  >
                    {isExtracting ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />}
                    Extract
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="flex-1 flex flex-col gap-3 min-h-0">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold text-brand-primary uppercase tracking-widest">Extraction Archive</h2>
              {result && (
                <div className="flex gap-1">
                  <button onClick={handleCopy} className="p-2 text-slate-500 hover:text-brand-primary transition-colors"><Clipboard size={14} /></button>
                  <button onClick={downloadResult} className="p-2 text-slate-500 hover:text-brand-primary transition-colors"><Download size={14} /></button>
                </div>
              )}
            </div>

            <div className="flex-1 bg-slate-950 rounded-xl p-6 overflow-auto border border-slate-800/50 shadow-inner custom-scrollbar relative selection:bg-indigo-500/30">
              <AnimatePresence mode="wait">
                {isExtracting ? (
                  <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full flex flex-col items-center justify-center space-y-3">
                    <Loader2 className="animate-spin text-brand-primary" size={32} />
                    <span className="text-[10px] text-slate-600 font-mono uppercase tracking-[0.2em] animate-pulse">Scanning Patterns...</span>
                  </motion.div>
                ) : result ? (
                  <motion.div key="result" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="prose prose-invert prose-sm max-w-none font-mono text-slate-300 result-content">
                    <ReactMarkdown>{result}</ReactMarkdown>
                  </motion.div>
                ) : error ? (
                  <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col items-center justify-center text-rose-400 space-y-2 text-center">
                    <AlertCircle size={24} />
                    <span className="text-xs font-medium">{error}</span>
                  </motion.div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-700 italic text-xs text-center px-8">
                    <Target className="mb-3 opacity-10" size={40} />
                    Results will appear here
                  </div>
                )}
              </AnimatePresence>
            </div>

            {result && (
              <div className="flex gap-2">
                <button
                  onClick={handleCopy}
                  className="flex-1 py-2 bg-slate-800 border border-slate-700 rounded-lg text-[11px] font-bold uppercase tracking-wider text-slate-300 hover:bg-slate-700 transition-colors flex items-center justify-center gap-2"
                >
                  {isCopied ? <Check size={12} /> : <Clipboard size={12} />}
                  {isCopied ? 'Copied' : 'Copy'}
                </button>
                <button
                  onClick={downloadResult}
                  className="flex-1 py-2 bg-slate-800 border border-slate-700 rounded-lg text-[11px] font-bold uppercase tracking-wider text-slate-300 hover:bg-slate-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Download size={12} />
                  Export
                </button>
              </div>
            )}
          </div>
        </section>
      </div>

      <style>{`
        .result-content h1, .result-content h2, .result-content h3 { color: #818CF8 !important; margin-top: 1rem; margin-bottom: 0.5rem; }
        .result-content table { border-collapse: collapse; width: 100%; border-radius: 4px; overflow: hidden; background: rgba(255,255,255,0.02); }
        .result-content th { background: rgba(255,255,255,0.05); text-align: left; padding: 8px; border: 1px solid rgba(255,255,255,0.1); color: #818CF8; }
        .result-content td { padding: 8px; border: 1px solid rgba(255,255,255,0.1); }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #475569; }
      `}</style>
    </div>
  );
}
