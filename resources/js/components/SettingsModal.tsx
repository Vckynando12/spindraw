import React, { useState } from 'react';
import { useSettingsStore } from '../store/settingsStore';
import { useTeamStore } from '../store/teamStore';
import { Settings, Volume2, VolumeX, Sparkles, Zap, RotateCcw, X } from 'lucide-react';

export const SettingsModal: React.FC = () => {
  const { isSettingsOpen, closeSettings, teamSettings, updateTeamSettings, toggleSound } = useSettingsStore();
  const { categories, activeCategoryId, recalculateTeams } = useTeamStore();

  const activeCategory = categories.find((c) => c.id === activeCategoryId);

  const [capacity, setCapacity] = useState(teamSettings.maxCapacityPerTeam);
  const [duration, setDuration] = useState(teamSettings.spinDuration);
  const [eventName, setEventName] = useState(teamSettings.eventName);

  if (!isSettingsOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateTeamSettings({
      maxCapacityPerTeam: capacity,
      spinDuration: duration,
      eventName
    });

    if (activeCategory && capacity !== teamSettings.maxCapacityPerTeam) {
      if (confirm('Mengubah kapasitas tim akan mengkalkulasi ulang pembagian kuota tim. Lanjutkan?')) {
        recalculateTeams(activeCategory.id, capacity);
      }
    }

    closeSettings();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg rounded-3xl bg-[#092233] border-2 border-[#FFE135] shadow-2xl p-6 text-white max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={closeSettings}
          className="absolute top-5 right-5 p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X size={20} />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-[#FFE135] text-black flex items-center justify-center text-2xl shadow-lg">
            ⚙️
          </div>
          <div>
            <h3 
              className="text-xl font-black text-white"
              style={{ fontFamily: "'Lilita One', cursive, sans-serif" }}
            >
              Pengaturan Balapan & Sistem
            </h3>
            <p className="text-xs text-slate-300">
              Konfigurasi kapasitas tim, animasi putaran, dan audio
            </p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-5">
          {/* Nama Event */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Nama Event Balapan:
            </label>
            <input
              type="text"
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3.5 py-2 text-sm text-white focus:outline-none focus:border-[#FFE135]"
              placeholder="Contoh: Bikini Bottom Grand Prix 🏁"
            />
          </div>

          {/* Kapasitas Maksimal Tim */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Kapasitas Maksimal Per Tim:
              </label>
              <span className="text-sm font-black text-[#FFE135]">{capacity} Peserta/Tim</span>
            </div>
            <input
              type="range"
              min={2}
              max={25}
              value={capacity}
              onChange={(e) => setCapacity(parseInt(e.target.value, 10))}
              className="w-full accent-[#FFE135] cursor-pointer"
            />
            <span className="text-[11px] text-slate-400">
              Default adalah 10 peserta per tim sesuai petunjuk panitia.
            </span>
          </div>

          {/* Durasi Spin Wheel */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Durasi Animasi Putaran Roda:
              </label>
              <span className="text-sm font-black text-[#1CA3DE]">{duration} Detik</span>
            </div>
            <input
              type="range"
              min={2}
              max={10}
              step={0.5}
              value={duration}
              onChange={(e) => setDuration(parseFloat(e.target.value))}
              className="w-full accent-[#1CA3DE] cursor-pointer"
            />
          </div>

          {/* Toggles */}
          <div className="space-y-3 pt-2 border-t border-slate-800">
            {/* Suara On/Off */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="flex items-center gap-2.5">
                {teamSettings.soundEnabled ? (
                  <Volume2 className="text-[#FFE135]" size={18} />
                ) : (
                  <VolumeX className="text-slate-500" size={18} />
                )}
                <div>
                  <div className="text-xs font-bold text-white">Efek Suara Balap & Fanfare</div>
                  <div className="text-[11px] text-slate-400">Deru mesin, tick wheel, dan terompet pemenang</div>
                </div>
              </div>
              <button
                type="button"
                onClick={toggleSound}
                className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                  teamSettings.soundEnabled ? 'bg-[#FFE135]' : 'bg-slate-700'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-black transition-transform ${
                    teamSettings.soundEnabled ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Confetti On/Off */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="flex items-center gap-2.5">
                <Sparkles className="text-purple-400" size={18} />
                <div>
                  <div className="text-xs font-bold text-white">Animasi Confetti Pesta</div>
                  <div className="text-[11px] text-slate-400">Taburan confetti saat tim/pemenang finish</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => updateTeamSettings({ confettiEnabled: !teamSettings.confettiEnabled })}
                className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                  teamSettings.confettiEnabled ? 'bg-[#FFE135]' : 'bg-slate-700'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-black transition-transform ${
                    teamSettings.confettiEnabled ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Fast Spin */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="flex items-center gap-2.5">
                <Zap className="text-yellow-400" size={18} />
                <div>
                  <div className="text-xs font-bold text-white">Mode Spin Cepat</div>
                  <div className="text-[11px] text-slate-400">Melewati animasi panjang (durasi 1.2 detik)</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => updateTeamSettings({ fastSpin: !teamSettings.fastSpin })}
                className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                  teamSettings.fastSpin ? 'bg-[#FFE135]' : 'bg-slate-700'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-black transition-transform ${
                    teamSettings.fastSpin ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Footer Save */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={closeSettings}
              className="px-4 py-2 rounded-xl text-sm font-bold text-slate-400 hover:text-white"
            >
              Tutup
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-xl bg-[#FFE135] text-black font-black text-sm hover:brightness-110 shadow-lg"
              style={{ fontFamily: "'Lilita One', cursive, sans-serif" }}
            >
              Simpan Pengaturan
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
