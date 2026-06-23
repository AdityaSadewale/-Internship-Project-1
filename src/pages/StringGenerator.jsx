import React, { useState, useCallback, useEffect } from 'react';
import { Copy, Check, RotateCw, History, Trash2, Clipboard, Zap, Shield, Key } from 'lucide-react';


export default function StringGenerator() {
  // 1. State Hooks
  const [length, setLength] = useState(16);
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeLowercase, setIncludeLowercase] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [prefix, setPrefix] = useState('');
  const [suffix, setSuffix] = useState('');
  const [generatedString, setGeneratedString] = useState('');
  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem('str_gen_history');
    return saved ? JSON.parse(saved) : [];
  });
  const [copied, setCopied] = useState(false);
  const [bulkCount, setBulkCount] = useState(1);
  const [bulkStrings, setBulkStrings] = useState([]);
  const [autoGenerateOnChange, setAutoGenerateOnChange] = useState(true);

  // 2. Callback Hook for generation logic
  const generateRandomString = useCallback((len, config) => {
    const { upper, lower, nums, syms, pref, suff } = config;
    let charset = '';
    if (upper) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (lower) charset += 'abcdefghijklmnopqrstuvwxyz';
    if (nums) charset += '0123456789';
    if (syms) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';

    if (charset.length === 0) {
      return 'Please select at least one character set!';
    }

    let result = '';
    for (let i = 0; i < len; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      result += charset[randomIndex];
    }

    return `${pref}${result}${suff}`;
  }, []);

  // Handler to generate single and bulk strings
  const handleGenerate = useCallback(() => {
    const config = {
      upper: includeUppercase,
      lower: includeLowercase,
      nums: includeNumbers,
      syms: includeSymbols,
      pref: prefix,
      suff: suffix
    };

    if (bulkCount > 1) {
      const list = [];
      for (let i = 0; i < bulkCount; i++) {
        list.push(generateRandomString(length, config));
      }
      setBulkStrings(list);
      setGeneratedString(list[0]);
      
      // Save primary to history
      setHistory(prev => {
        const updated = [list[0], ...prev.filter(item => item !== list[0])].slice(0, 8);
        localStorage.setItem('str_gen_history', JSON.stringify(updated));
        return updated;
      });
    } else {
      const str = generateRandomString(length, config);
      setGeneratedString(str);
      setBulkStrings([]);
      
      // Check if it's a valid generated string (not error message)
      if (str && !str.startsWith('Please select')) {
        setHistory(prev => {
          const updated = [str, ...prev.filter(item => item !== str)].slice(0, 8);
          localStorage.setItem('str_gen_history', JSON.stringify(updated));
          return updated;
        });
      }
    }
  }, [length, includeUppercase, includeLowercase, includeNumbers, includeSymbols, prefix, suffix, bulkCount, generateRandomString]);

  // 3. Effect Hook to generate on load and option changes
  useEffect(() => {
    if (autoGenerateOnChange) {
      handleGenerate();
    }
  }, [length, includeUppercase, includeLowercase, includeNumbers, includeSymbols, prefix, suffix, autoGenerateOnChange, handleGenerate]);

  // Generate on load once if auto-generate is off
  useEffect(() => {
    if (!autoGenerateOnChange) {
      handleGenerate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Copy helper
  const copyToClipboard = async (text) => {
    if (!text || text.startsWith('Please select')) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  // History copy helper
  const [historyCopiedIdx, setHistoryCopiedIdx] = useState(null);
  const copyHistoryItem = async (text, idx) => {
    try {
      await navigator.clipboard.writeText(text);
      setHistoryCopiedIdx(idx);
      setTimeout(() => setHistoryCopiedIdx(null), 1500);
    } catch (err) {
      console.error(err);
    }
  };

  // Delete history item
  const deleteHistoryItem = (idx) => {
    setHistory(prev => {
      const updated = prev.filter((_, i) => i !== idx);
      localStorage.setItem('str_gen_history', JSON.stringify(updated));
      return updated;
    });
  };

  // Clear history
  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('str_gen_history');
  };

  // Calculate Password Strength (Entropy)
  const calculateStrength = () => {
    let poolSize = 0;
    if (includeUppercase) poolSize += 26;
    if (includeLowercase) poolSize += 26;
    if (includeNumbers) poolSize += 10;
    if (includeSymbols) poolSize += 26;

    if (poolSize === 0 || length === 0) return { score: 0, label: 'None', color: 'bg-red-500', textClass: 'text-red-400' };

    const entropy = Math.round(length * Math.log2(poolSize));
    
    if (entropy < 40) {
      return { score: 25, label: 'Weak', color: 'bg-red-500', textClass: 'text-red-400', entropy };
    } else if (entropy < 60) {
      return { score: 50, label: 'Medium', color: 'bg-amber-500', textClass: 'text-amber-400', entropy };
    } else if (entropy < 80) {
      return { score: 75, label: 'Strong', color: 'bg-emerald-500', textClass: 'text-emerald-400', entropy };
    } else {
      return { score: 100, label: 'Excellent (Secure)', color: 'bg-indigo-500', textClass: 'text-indigo-400', entropy };
    }
  };

  const strength = calculateStrength();

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in">
      <div className="text-center mb-8">
        <div className="inline-flex p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 mb-4">
          <Key className="w-8 h-8 text-indigo-400" />
        </div>
        <h1 className="text-4xl font-extrabold font-display tracking-tight text-white mb-2 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
          Random String Generator
        </h1>
        <p className="text-gray-400 text-sm max-w-md mx-auto">
          Create highly secure passwords, tokens, or arbitrary strings instantly.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Generator Controls */}
        <div className="lg:col-span-2 space-y-6">
          {/* Output Display Card */}
          <div className="glass-panel p-6 rounded-3xl shadow-xl space-y-4">
            <div className="relative group">
              <textarea
                readOnly
                value={generatedString}
                className="w-full h-24 bg-gray-900/60 border border-gray-800 text-white font-mono text-lg rounded-2xl px-5 py-4 pr-16 focus:outline-none resize-none scrollbar-none transition-all duration-300 focus:border-indigo-500/50"
                placeholder="Click Generate String..."
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-2">
                <button
                  onClick={() => copyToClipboard(generatedString)}
                  disabled={!generatedString || generatedString.startsWith('Please select')}
                  className={`p-3 rounded-xl transition-all duration-300 ${
                    copied
                      ? 'bg-emerald-500 text-white'
                      : 'bg-gray-800 hover:bg-gray-700 text-indigo-400 hover:text-indigo-300 cursor-pointer'
                  }`}
                  title="Copy generated string"
                >
                  {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Strength Indicator */}
            {!generatedString.startsWith('Please select') && generatedString && (
              <div className="space-y-2 bg-gray-900/30 p-4 rounded-2xl border border-gray-800/50">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-gray-400 flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5" /> Security Level:
                  </span>
                  <span className={strength.textClass}>
                    {strength.label} ({strength.entropy} bits entropy)
                  </span>
                </div>
                <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${strength.color}`}
                    style={{ width: `${strength.score}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Settings Options Card */}
          <div className="glass-panel p-6 rounded-3xl shadow-xl space-y-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-indigo-400" /> Customization Settings
            </h2>

            {/* Length Control */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-sm font-semibold text-gray-300">String Length</label>
                <div className="bg-indigo-500/10 text-indigo-400 font-mono font-bold text-sm px-3 py-1 rounded-lg border border-indigo-500/20">
                  {length} Chars
                </div>
              </div>
              <input
                type="range"
                min="4"
                max="128"
                value={length}
                onChange={(e) => setLength(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 focus:outline-none"
              />
              <div className="flex justify-between text-xs text-gray-500 font-mono">
                <span>4</span>
                <span>32</span>
                <span>64</span>
                <span>96</span>
                <span>128</span>
              </div>
            </div>

            {/* Character Set Selectors */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="flex items-center gap-3 p-3 bg-gray-900/30 hover:bg-gray-900/50 border border-gray-800/80 rounded-2xl cursor-pointer transition-colors duration-200">
                <input
                  type="checkbox"
                  checked={includeUppercase}
                  onChange={(e) => setIncludeUppercase(e.target.checked)}
                  className="w-5 h-5 accent-indigo-500 rounded border-gray-700 bg-gray-800"
                />
                <div>
                  <div className="text-sm font-semibold text-gray-200">Uppercase Letters</div>
                  <div className="text-xs text-gray-500 font-mono">A-Z</div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 bg-gray-900/30 hover:bg-gray-900/50 border border-gray-800/80 rounded-2xl cursor-pointer transition-colors duration-200">
                <input
                  type="checkbox"
                  checked={includeLowercase}
                  onChange={(e) => setIncludeLowercase(e.target.checked)}
                  className="w-5 h-5 accent-indigo-500 rounded border-gray-700 bg-gray-800"
                />
                <div>
                  <div className="text-sm font-semibold text-gray-200">Lowercase Letters</div>
                  <div className="text-xs text-gray-500 font-mono">a-z</div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 bg-gray-900/30 hover:bg-gray-900/50 border border-gray-800/80 rounded-2xl cursor-pointer transition-colors duration-200">
                <input
                  type="checkbox"
                  checked={includeNumbers}
                  onChange={(e) => setIncludeNumbers(e.target.checked)}
                  className="w-5 h-5 accent-indigo-500 rounded border-gray-700 bg-gray-800"
                />
                <div>
                  <div className="text-sm font-semibold text-gray-200">Numbers</div>
                  <div className="text-xs text-gray-500 font-mono">0-9</div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 bg-gray-900/30 hover:bg-gray-900/50 border border-gray-800/80 rounded-2xl cursor-pointer transition-colors duration-200">
                <input
                  type="checkbox"
                  checked={includeSymbols}
                  onChange={(e) => setIncludeSymbols(e.target.checked)}
                  className="w-5 h-5 accent-indigo-500 rounded border-gray-700 bg-gray-800"
                />
                <div>
                  <div className="text-sm font-semibold text-gray-200">Special Symbols</div>
                  <div className="text-xs text-gray-500 font-mono">!@#$%^&*...</div>
                </div>
              </label>
            </div>

            {/* Prefix & Suffix Custom Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-400">Prefix (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. USER_"
                  value={prefix}
                  onChange={(e) => setPrefix(e.target.value)}
                  className="w-full bg-gray-900/60 border border-gray-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500/50 font-mono"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-400">Suffix (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. _PROD"
                  value={suffix}
                  onChange={(e) => setSuffix(e.target.value)}
                  className="w-full bg-gray-900/60 border border-gray-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500/50 font-mono"
                />
              </div>
            </div>

            {/* Generation Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-gray-800/50">
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={autoGenerateOnChange}
                    onChange={(e) => setAutoGenerateOnChange(e.target.checked)}
                    className="w-4 h-4 accent-indigo-500 rounded border-gray-700 bg-gray-800"
                  />
                  <span className="text-xs font-semibold text-gray-400">Generate automatically</span>
                </label>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                <div className="flex items-center gap-1.5 bg-gray-900/60 border border-gray-800 px-3 py-2 rounded-xl">
                  <span className="text-xs font-semibold text-gray-400">Qty:</span>
                  <select
                    value={bulkCount}
                    onChange={(e) => setBulkCount(parseInt(e.target.value))}
                    className="bg-transparent text-white font-bold text-xs focus:outline-none cursor-pointer pr-1"
                  >
                    <option value="1" className="bg-gray-900 text-white">1</option>
                    <option value="5" className="bg-gray-900 text-white">5</option>
                    <option value="10" className="bg-gray-900 text-white">10</option>
                  </select>
                </div>

                <button
                  onClick={handleGenerate}
                  className="flex-1 sm:flex-initial bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold px-6 py-2.5 rounded-xl transition-all duration-300 shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/35 active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <RotateCw className="w-4 h-4" /> Generate
                </button>
              </div>
            </div>

            {/* Bulk Display if enabled */}
            {bulkStrings.length > 1 && (
              <div className="bg-gray-900/40 border border-gray-800 p-4 rounded-2xl space-y-3">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Bulk Generated Strings ({bulkStrings.length})
                </h3>
                <div className="max-h-48 overflow-y-auto space-y-2 pr-1 font-mono text-xs text-gray-300">
                  {bulkStrings.map((str, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 hover:bg-indigo-500/5 bg-gray-950/40 rounded-lg border border-gray-800/40 group">
                      <span className="truncate pr-4 select-all">{str}</span>
                      <button
                        onClick={() => copyToClipboard(str)}
                        className="text-gray-500 hover:text-indigo-400 p-1 rounded transition-colors"
                        title="Copy string"
                      >
                        <Clipboard className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* History Panel */}
        <div className="glass-panel p-6 rounded-3xl shadow-xl flex flex-col h-[520px]">
          <div className="flex items-center justify-between mb-4 border-b border-gray-800/50 pb-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <History className="w-5 h-5 text-indigo-400" /> Recent History
            </h2>
            {history.length > 0 && (
              <button
                onClick={clearHistory}
                className="text-xs text-rose-400 hover:text-rose-300 font-semibold transition-colors duration-200 flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3 h-3" /> Clear
              </button>
            )}
          </div>

          {history.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-gray-500">
              <History className="w-10 h-10 mb-2 text-gray-700" />
              <p className="text-sm font-semibold">No strings generated yet.</p>
              <p className="text-xs text-gray-600 mt-1">Generated strings will appear here.</p>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {history.map((str, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 bg-gray-900/30 border border-gray-850 rounded-2xl hover:border-indigo-500/25 transition-all duration-200 hover:bg-gray-900/50 group"
                >
                  <span className="font-mono text-xs text-gray-300 truncate max-w-[150px] md:max-w-[200px] select-all">
                    {str}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => copyHistoryItem(str, idx)}
                      className={`p-1.5 rounded-lg transition-colors duration-150 ${
                        historyCopiedIdx === idx
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'text-gray-500 hover:text-indigo-400 hover:bg-gray-800'
                      }`}
                      title="Copy item"
                    >
                      {historyCopiedIdx === idx ? (
                        <Check className="w-3.5 h-3.5" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <button
                      onClick={() => deleteHistoryItem(idx)}
                      className="p-1.5 rounded-lg text-gray-500 hover:text-rose-400 hover:bg-gray-800 transition-colors duration-150"
                      title="Delete item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <div className="mt-4 pt-3 border-t border-gray-800/50 text-[10px] text-gray-500 text-center font-mono">
            History is persisted locally in your browser cache.
          </div>
        </div>
      </div>
    </div>
  );
}
