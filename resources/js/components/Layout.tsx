import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useSettingsStore } from '../store/settingsStore';
import { SettingsModal } from './SettingsModal';
import { Volume2, VolumeX, Settings, Trophy, Users, Sparkles, Gift } from 'lucide-react';

export const Layout: React.FC = () => {
  const { teamSettings, toggleSound, openSettings } = useSettingsStore();

  return (
    <div className="relative min-h-screen bg-[#071E2F] text-slate-100 flex flex-col overflow-x-hidden">
      {/* Ocean Animated Bubbles */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="bubble w-6 h-6 left-[10%]" style={{ animationDelay: '0s', animationDuration: '14s' }} />
        <div className="bubble w-10 h-10 left-[25%]" style={{ animationDelay: '4s', animationDuration: '18s' }} />
        <div className="bubble w-4 h-4 left-[45%]" style={{ animationDelay: '2s', animationDuration: '12s' }} />
        <div className="bubble w-8 h-8 left-[70%]" style={{ animationDelay: '6s', animationDuration: '16s' }} />
        <div className="bubble w-5 h-5 left-[88%]" style={{ animationDelay: '1s', animationDuration: '15s' }} />
      </div>

      {/* Top Checkered Flag Ribbon */}
      <div className="w-full h-4 bg-checkered opacity-90 shadow-md relative z-30" />

      {/* Main Header */}
      <header className="relative z-20 bg-gradient-to-b from-[#092B42] to-[#071E2F] border-b-2 border-[#FFE135]/40 shadow-xl px-4 sm:px-8 py-3.5">
        <div className="max-w-[1720px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">

          
          {/* Logo Brand / SpongeBob Racing Identity */}
          <div className="flex items-center gap-3 select-none">
            {/* Sponge Racing Badge Icon */}
            <div className="relative flex items-center justify-center w-12 h-12 rounded-2xl bg-[#FFE135] border-2 border-black shadow-[0_0_15px_rgba(255,225,53,0.5)] transform hover:rotate-3 transition-transform">
              <span className="text-2xl filter drop-shadow">🧽</span>
              <span className="absolute -bottom-1 -right-1 text-sm">🏎️</span>
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black tracking-widest text-[#1CA3DE] uppercase">
                  Bikini Bottom Series
                </span>
                <span className="text-xs">🏁</span>
              </div>
              <h1
                className="text-2xl sm:text-3xl font-black tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-[#FFE135] via-yellow-200 to-[#FFE135] drop-shadow-sm"
                style={{ fontFamily: "'Lilita One', cursive, sans-serif" }}
              >
                GRAND PRIX
              </h1>
            </div>
          </div>

          {/* Navigation Menu (Undi Tim & Undi Hadiah) */}
          <nav className="flex items-center gap-2 p-1.5 bg-[#051724] rounded-2xl border border-slate-700/80 shadow-inner">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `px-5 py-2 rounded-xl text-sm font-black transition-all duration-200 flex items-center gap-2 ${
                  isActive
                    ? 'bg-[#FFE135] text-black shadow-lg shadow-yellow-400/20 scale-105'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`
              }
              style={{ fontFamily: "'Lilita One', cursive, sans-serif" }}
            >
              <Users size={16} />
              <span>1. UNDI TIM 🏎️</span>
            </NavLink>

            <NavLink
              to="/hadiah"
              className={({ isActive }) =>
                `px-5 py-2 rounded-xl text-sm font-black transition-all duration-200 flex items-center gap-2 ${
                  isActive
                    ? 'bg-[#1CA3DE] text-white shadow-lg shadow-blue-400/20 scale-105'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`
              }
              style={{ fontFamily: "'Lilita One', cursive, sans-serif" }}
            >
              <Gift size={16} />
              <span>2. UNDI HADIAH 🎁</span>
            </NavLink>
          </nav>

          {/* Global Controls: Sound & Settings */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleSound}
              className={`p-2.5 rounded-xl border transition flex items-center gap-1.5 text-xs font-bold ${
                teamSettings.soundEnabled
                  ? 'bg-slate-800 text-[#FFE135] border-[#FFE135]/40 hover:bg-slate-700'
                  : 'bg-slate-900 text-slate-500 border-slate-800 hover:text-slate-300'
              }`}
              title={teamSettings.soundEnabled ? 'Matikan Suara (Mute)' : 'Nyalakan Suara (Unmute)'}
            >
              {teamSettings.soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
              <span className="hidden sm:inline">
                {teamSettings.soundEnabled ? 'Suara Aktif' : 'Mute'}
              </span>
            </button>

            <button
              onClick={openSettings}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition shadow flex items-center gap-1.5 text-xs font-bold"
              title="Buka Pengaturan"
            >
              <Settings size={18} className="text-[#FFE135]" />
              <span className="hidden sm:inline">Pengaturan</span>
            </button>
          </div>

        </div>
      </header>

      {/* Main Content View */}
      <main className="relative z-10 flex-1 max-w-[1720px] w-full mx-auto p-3 sm:p-5 lg:p-6">
        <Outlet />
      </main>

      {/* Global Settings Modal */}
      <SettingsModal />

      {/* Footer */}
      <footer className="relative z-10 bg-[#051724] border-t border-slate-800 py-4 px-6 text-center text-xs text-slate-400">
        <div className="max-w-[1720px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">

          <div className="flex items-center gap-2">
            <span>🏁</span>
            <span className="font-bold text-slate-300">Bikini Bottom Grand Prix</span>
            <span className="opacity-40">•</span>
            <span>Web Pengundian Tim & Hadiah Balapan</span>
          </div>
          <div className="flex items-center gap-3">
            <span>🍍 Tanpa Backend • Penyimpanan LocalStorage</span>
            <span className="text-yellow-400 font-bold">100% Fair Random (Crypto API)</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
