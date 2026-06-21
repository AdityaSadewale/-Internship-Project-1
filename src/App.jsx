import React from 'react';
import { HashRouter, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { Languages, Key, Code, Info, Layers } from 'lucide-react';
import Translator from './pages/Translator';
import StringGenerator from './pages/StringGenerator';

function App() {
  return (
    <HashRouter>
      <div className="min-h-screen flex flex-col md:flex-row text-gray-100 font-sans relative">
        {/* Glowing Accents background */}
        <div className="glow-bg" />

        {/* Sidebar Navigation */}
        <aside className="md:w-64 glass-panel border-b md:border-b-0 md:border-r border-gray-800/80 flex flex-col justify-between p-6 z-10">
          <div className="space-y-8">
            {/* Logo area */}
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-indigo-500 rounded-2xl shadow-lg shadow-indigo-500/20">
                <Layers className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-black font-display tracking-tight text-white leading-none">
                  OmniTools
                </h1>
                <span className="text-[10px] text-gray-500 font-mono tracking-widest uppercase">
                  Workspace v1.0
                </span>
              </div>
            </div>

            {/* Nav links */}
            <nav className="flex md:flex-col gap-2 w-full">
              <NavLink
                to="/"
                end
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-300 w-full cursor-pointer ${
                    isActive
                      ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/25 border-l-4 border-indigo-400'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-gray-900/40 border-l-4 border-transparent'
                  }`
                }
              >
                <Languages className="w-5 h-5" />
                <span>Translator</span>
              </NavLink>

              <NavLink
                to="/generator"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-300 w-full cursor-pointer ${
                    isActive
                      ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/25 border-l-4 border-indigo-400'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-gray-900/40 border-l-4 border-transparent'
                  }`
                }
              >
                <Key className="w-5 h-5" />
                <span>String Gen</span>
              </NavLink>
            </nav>
          </div>

          {/* Sidebar Footer info */}
          <div className="hidden md:block pt-6 border-t border-gray-800/60 space-y-4">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Info className="w-4 h-4" />
              <span>Internship Assignment</span>
            </div>
            
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 text-xs text-gray-400 hover:text-indigo-400 transition-colors"
            >
              <Code className="w-4 h-4" />
              <span>Source Repository</span>
            </a>
          </div>
        </aside>

        {/* Mobile Navbar bottom layout fallback (for small screens only) */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 glass-panel border-t border-gray-850 p-2 flex justify-around z-20 shadow-2xl">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 py-1 px-4 rounded-xl text-[10px] font-bold transition-all ${
                isActive ? 'text-indigo-400' : 'text-gray-500'
              }`
            }
          >
            <Languages className="w-5 h-5" />
            <span>Translator</span>
          </NavLink>
          
          <NavLink
            to="/generator"
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 py-1 px-4 rounded-xl text-[10px] font-bold transition-all ${
                isActive ? 'text-indigo-400' : 'text-gray-500'
              }`
            }
          >
            <Key className="w-5 h-5" />
            <span>Generator</span>
          </NavLink>
        </div>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto pb-24 md:pb-8">
          <Routes>
            <Route path="/" element={<Translator />} />
            <Route path="/generator" element={<StringGenerator />} />
            {/* Fallback to translator */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </HashRouter>
  );
}

export default App;
