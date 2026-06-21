import React, { useState, useEffect } from 'react';
import { Languages, Volume2, Copy, Check, Settings, Trash2, ArrowRightLeft, AlertCircle, HelpCircle } from 'lucide-react';

const SUPPORTED_LANGUAGES = [
  { code: 'es', name: 'Spanish (Español)' },
  { code: 'fr', name: 'French (Français)' },
  { code: 'de', name: 'German (Deutsch)' },
  { code: 'it', name: 'Italian (Italiano)' },
  { code: 'ja', name: 'Japanese (日本語)' },
  { code: 'zh', name: 'Chinese (中文)' },
  { code: 'hi', name: 'Hindi (हिन्दी)' },
  { code: 'ar', name: 'Arabic (العربية)' },
  { code: 'pt', name: 'Portuguese (Português)' },
  { code: 'ru', name: 'Russian (Русский)' },
  { code: 'ko', name: 'Korean (한국어)' },
  { code: 'vi', name: 'Vietnamese (Tiếng Việt)' },
  { code: 'tr', name: 'Turkish (Türkçe)' },
  { code: 'nl', name: 'Dutch (Nederlands)' },
  { code: 'pl', name: 'Polish (Polski)' },
];

const PROVIDERS = {
  mymemory: {
    id: 'mymemory',
    name: 'MyMemory API (Free Fallback, No Key)',
    host: '',
    endpoint: 'https://api.mymemory.translated.net/get',
  },
  google_translate1: {
    id: 'google_translate1',
    name: 'Google Translate (RapidAPI)',
    host: 'google-translate1.p.rapidapi.com',
    endpoint: 'https://google-translate1.p.rapidapi.com/language/translate/v2',
  },
  text_translator2: {
    id: 'text_translator2',
    name: 'Text Translator (RapidAPI)',
    host: 'text-translator2.p.rapidapi.com',
    endpoint: 'https://text-translator2.p.rapidapi.com/translate',
  }
};

export default function Translator() {
  // 1. State Configuration
  const [inputText, setInputText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [targetLanguage, setTargetLanguage] = useState(() => {
    return localStorage.getItem('str_fav_lang') || 'es';
  });
  const [favoriteLanguage, setFavoriteLanguage] = useState(() => {
    return localStorage.getItem('str_fav_lang') || 'es';
  });
  const [provider, setProvider] = useState(() => {
    return localStorage.getItem('tr_provider') || 'mymemory';
  });
  const [apiKey, setApiKey] = useState(() => {
    return localStorage.getItem('tr_api_key') || '';
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [copiedInput, setCopiedInput] = useState(false);
  const [copiedOutput, setCopiedOutput] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Sync Favorite Language
  const toggleFavorite = (langCode) => {
    if (favoriteLanguage === langCode) {
      // Unfavorite (fallback to default 'es')
      setFavoriteLanguage('');
      localStorage.removeItem('str_fav_lang');
    } else {
      setFavoriteLanguage(langCode);
      localStorage.setItem('str_fav_lang', langCode);
    }
  };

  // Persist settings changes
  useEffect(() => {
    localStorage.setItem('tr_provider', provider);
  }, [provider]);

  useEffect(() => {
    localStorage.setItem('tr_api_key', apiKey);
  }, [apiKey]);

  // Translate handler
  const handleTranslate = async () => {
    if (!inputText.trim()) {
      setTranslatedText('');
      setErrorMessage('');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    setTranslatedText('');

    const currentProvider = PROVIDERS[provider];

    try {
      if (provider === 'mymemory') {
        // MyMemory Free Public GET translation
        const langpair = `en|${targetLanguage}`;
        const url = `${currentProvider.endpoint}?q=${encodeURIComponent(inputText)}&langpair=${langpair}`;
        
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`MyMemory API error: HTTP ${response.status}`);
        }
        
        const data = await response.json();
        if (data.responseStatus === 200) {
          setTranslatedText(data.responseData.translatedText);
        } else {
          throw new Error(data.responseDetails || 'Translation failed');
        }
      } else if (provider === 'google_translate1') {
        // Google Translate RapidAPI
        if (!apiKey.trim()) {
          throw new Error('RapidAPI Key is required. Please open settings and configure it.');
        }

        // According to our research, google-translate1.p.rapidapi.com requires form-url-encoded POST
        const bodyParams = new URLSearchParams();
        bodyParams.append('q', inputText);
        bodyParams.append('target', targetLanguage);
        bodyParams.append('source', 'en');

        const response = await fetch(currentProvider.endpoint, {
          method: 'POST',
          headers: {
            'content-type': 'application/x-www-form-urlencoded',
            'x-rapidapi-host': currentProvider.host,
            'x-rapidapi-key': apiKey,
          },
          body: bodyParams,
        });

        if (!response.ok) {
          const errText = await response.text();
          throw new Error(`RapidAPI Error (HTTP ${response.status}): ${errText || response.statusText}`);
        }

        const data = await response.json();
        // Google Translate structure: data.data.translations[0].translatedText
        if (data?.data?.translations?.[0]?.translatedText) {
          setTranslatedText(data.data.translations[0].translatedText);
        } else {
          throw new Error('Unexpected translation response structure from Google Translate API');
        }
      } else if (provider === 'text_translator2') {
        // Text Translator RapidAPI
        if (!apiKey.trim()) {
          throw new Error('RapidAPI Key is required. Please open settings and configure it.');
        }

        // text-translator2.p.rapidapi.com requires JSON POST
        const response = await fetch(currentProvider.endpoint, {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            'x-rapidapi-host': currentProvider.host,
            'x-rapidapi-key': apiKey,
          },
          body: JSON.stringify({
            source_language: 'en',
            target_language: targetLanguage,
            text: inputText
          })
        });

        if (!response.ok) {
          const errText = await response.text();
          throw new Error(`RapidAPI Error (HTTP ${response.status}): ${errText || response.statusText}`);
        }

        const data = await response.json();
        // text-translator2 structure: data.data.translated_text
        if (data?.data?.translated_text) {
          setTranslatedText(data.data.translated_text);
        } else {
          throw new Error('Unexpected translation response structure from Text Translator API');
        }
      }
    } catch (err) {
      console.error(err);
      setErrorMessage(err.message || 'An error occurred during translation.');
    } finally {
      setIsLoading(false);
    }
  };

  // Copy helpers
  const copyText = async (text, setCopiedState) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedState(true);
      setTimeout(() => setCopiedState(false), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  // Text to Speech
  const speakText = (text, lang) => {
    if (!text) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.error('Speech synthesis failed', err);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 animate-fade-in">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 mb-4">
          <Languages className="w-8 h-8 text-indigo-400" />
        </div>
        <h1 className="text-4xl font-extrabold font-display tracking-tight text-white mb-2 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
          English Text Translator
        </h1>
        <p className="text-gray-400 text-sm max-w-md mx-auto">
          Translate English into your favorite languages instantly using RapidAPI or MyMemory.
        </p>
      </div>

      {/* Main Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Translation Columns */}
        <div className="lg:col-span-9 grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Input Panel (English) */}
          <div className="glass-panel rounded-3xl shadow-xl p-5 flex flex-col h-[400px]">
            <div className="flex items-center justify-between border-b border-gray-800/50 pb-3 mb-4">
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider font-mono">
                English (Input)
              </span>
              {inputText && (
                <button
                  onClick={() => setInputText('')}
                  className="text-xs text-gray-500 hover:text-gray-300 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Clear
                </button>
              )}
            </div>

            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type your English text here..."
              maxLength={2000}
              className="flex-1 w-full bg-transparent text-white placeholder-gray-600 border-none resize-none focus:outline-none text-base leading-relaxed"
            />

            <div className="flex items-center justify-between pt-3 border-t border-gray-800/50">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => speakText(inputText, 'en-US')}
                  disabled={!inputText}
                  className="p-2 rounded-xl text-gray-500 hover:text-indigo-400 hover:bg-gray-800 disabled:opacity-40 disabled:hover:bg-transparent transition-all cursor-pointer"
                  title="Listen"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => copyText(inputText, setCopiedInput)}
                  disabled={!inputText}
                  className="p-2 rounded-xl text-gray-500 hover:text-indigo-400 hover:bg-gray-800 disabled:opacity-40 disabled:hover:bg-transparent transition-all cursor-pointer"
                  title="Copy"
                >
                  {copiedInput ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-mono text-gray-600">
                  {inputText.length}/2000
                </span>
                <button
                  onClick={handleTranslate}
                  disabled={isLoading || !inputText.trim()}
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold text-xs px-5 py-2 rounded-xl transition-all duration-300 shadow-md shadow-indigo-500/10 disabled:opacity-50 disabled:pointer-events-none active:scale-95 flex items-center gap-1.5 cursor-pointer"
                >
                  {isLoading ? (
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>Translate <ArrowRightLeft className="w-3 h-3" /></>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Output Panel (Target Language) */}
          <div className="glass-panel rounded-3xl shadow-xl p-5 flex flex-col h-[400px]">
            <div className="flex items-center justify-between border-b border-gray-800/50 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <select
                  value={targetLanguage}
                  onChange={(e) => setTargetLanguage(e.target.value)}
                  className="bg-transparent text-sm font-bold text-gray-200 focus:outline-none cursor-pointer pr-2 border-none"
                >
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <option key={lang.code} value={lang.code} className="bg-gray-900 text-white">
                      {lang.name}
                    </option>
                  ))}
                </select>
                
                {/* Favorite Star Button */}
                <button
                  onClick={() => toggleFavorite(targetLanguage)}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    favoriteLanguage === targetLanguage
                      ? 'text-amber-400 bg-amber-500/10 border border-amber-500/20'
                      : 'text-gray-500 hover:text-amber-400 hover:bg-gray-800'
                  }`}
                  title={favoriteLanguage === targetLanguage ? "Remove favorite" : "Set as favorite"}
                >
                  ★
                </button>
              </div>

              {favoriteLanguage === targetLanguage && (
                <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20 uppercase tracking-wide">
                  Fav Language
                </span>
              )}
            </div>

            {/* Error Message */}
            {errorMessage ? (
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-rose-400 space-y-2 bg-rose-500/5 border border-rose-500/15 rounded-2xl overflow-y-auto">
                <AlertCircle className="w-8 h-8 text-rose-500 flex-shrink-0" />
                <h3 className="text-sm font-bold">Translation Error</h3>
                <p className="text-xs text-rose-300/80 max-w-sm">{errorMessage}</p>
                {provider !== 'mymemory' && !apiKey && (
                  <button
                    onClick={() => setShowSettings(true)}
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-bold underline pt-1 cursor-pointer"
                  >
                    Open Settings to Configure API Key
                  </button>
                )}
              </div>
            ) : isLoading ? (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
                <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-sm font-semibold animate-pulse text-indigo-400">Translating text...</p>
              </div>
            ) : !translatedText ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-gray-600">
                <Languages className="w-10 h-10 mb-2 text-gray-800" />
                <p className="text-sm font-semibold">Ready for translation</p>
                <p className="text-xs text-gray-700 max-w-xs mt-1">
                  Type in English on the left and click Translate.
                </p>
              </div>
            ) : (
              <textarea
                readOnly
                value={translatedText}
                className="flex-1 w-full bg-transparent text-white border-none resize-none focus:outline-none text-base leading-relaxed select-all"
              />
            )}

            <div className="flex items-center justify-between pt-3 border-t border-gray-800/50">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => speakText(translatedText, targetLanguage)}
                  disabled={!translatedText}
                  className="p-2 rounded-xl text-gray-500 hover:text-indigo-400 hover:bg-gray-800 disabled:opacity-40 disabled:hover:bg-transparent transition-all cursor-pointer"
                  title="Listen"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => copyText(translatedText, setCopiedOutput)}
                  disabled={!translatedText}
                  className="p-2 rounded-xl text-gray-500 hover:text-indigo-400 hover:bg-gray-800 disabled:opacity-40 disabled:hover:bg-transparent transition-all cursor-pointer"
                  title="Copy"
                >
                  {copiedOutput ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              
              <div className="flex items-center gap-1.5 text-[10px] font-semibold text-gray-500">
                Provider: <span className="text-indigo-400 uppercase">{provider === 'mymemory' ? 'Free API' : 'RapidAPI'}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Settings Side Control */}
        <div className="lg:col-span-3 space-y-4">
          <div className="glass-panel p-5 rounded-3xl shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-800/50 pb-2">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Settings className="w-4 h-4 text-indigo-400" /> API Settings
              </h2>
            </div>

            <div className="space-y-4">
              {/* Provider dropdown */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-400 flex items-center gap-1">
                  Translation Engine
                </label>
                <select
                  value={provider}
                  onChange={(e) => setProvider(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-800 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500/50 cursor-pointer"
                >
                  {Object.values(PROVIDERS).map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* API Key details (hidden for MyMemory) */}
              {provider !== 'mymemory' ? (
                <div className="space-y-3 pt-1 animate-fade-in">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-400">
                      RapidAPI Key
                    </label>
                    <input
                      type="password"
                      placeholder="Paste your API key here..."
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      className="w-full bg-gray-900 border border-gray-800 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500/50 font-mono"
                    />
                  </div>

                  <div className="bg-indigo-500/5 border border-indigo-500/10 p-3 rounded-2xl space-y-2">
                    <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">
                      RapidAPI Settings
                    </span>
                    <div className="text-[10px] text-gray-400 space-y-1 font-mono">
                      <div>Host: <span className="text-gray-300">{PROVIDERS[provider].host}</span></div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-indigo-500/5 border border-indigo-500/10 p-3 rounded-2xl text-[11px] text-gray-400 space-y-2 leading-relaxed">
                  <p className="font-semibold text-indigo-400">✨ Ready out-of-the-box!</p>
                  <p>No account or API key required. Uses MyMemory Translation Memory API for seamless web testing.</p>
                  <p className="text-[10px] text-gray-500">To test full RapidAPI capabilities, switch the engine above and enter your key.</p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Help Card */}
          <div className="glass-panel p-5 rounded-3xl shadow-xl text-xs space-y-2 bg-gradient-to-br from-indigo-950/20 to-purple-950/20 border-indigo-950/30">
            <h3 className="font-bold text-white flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-indigo-400" /> Favorite Language Pin
            </h3>
            <p className="text-gray-400 leading-relaxed">
              Click the star button next to any language dropdown to save it as your default. It will automatically load on subsequent visits!
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
