import React, { useState } from 'react';
import { usePrizeStore } from '../store/prizeStore';
import { SpinWheel } from '../components/SpinWheel';
import { StartLights } from '../components/StartLights';
import { NameListEditor } from '../components/NameListEditor';
import { WinnersPanel } from '../components/WinnersPanel';
import { WinnersDialog } from '../components/WinnersDialog';
import { pickMultipleRandom, secureRandomInt } from '../lib/random';
import { Participant } from '../types';
import { 
  Gift, 
  Settings, 
  ListFilter, 
  Trophy, 
  Sparkles, 
  AlertTriangle,
  RotateCcw,
  CheckCircle2
} from 'lucide-react';

export const PrizeDrawPage: React.FC = () => {
  const {
    participants,
    settings,
    updateSettings,
    activeTab,
    setActiveTab,
    isSpinning,
    setIsSpinning,
    recordWinnersDraw,
    latestWinnersDialog,
    setLatestWinnersDialog
  } = usePrizeStore();

  const [targetIndex, setTargetIndex] = useState<number | null>(null);
  const [chosenWinners, setChosenWinners] = useState<Participant[]>([]);
  const [isOptionsModalOpen, setIsOptionsModalOpen] = useState(false);

  // Mulai Spin Hadiah
  const handleStartSpin = () => {
    if (isSpinning || participants.length < 2) return;

    // 1. Tentukan N pemenang acak (default 10) menggunakan crypto Fisher-Yates
    const winnersCount = Math.min(settings.winnersCountPerSpin, participants.length);
    const selectedWinners = pickMultipleRandom(participants, winnersCount);

    // 2. Tentukan satu pemenang utama dari daftar pemenang untuk animasi Roda berhenti padanya
    const visualPrimaryWinner = selectedWinners[0];
    const visualTargetIndex = participants.findIndex((p) => p.id === visualPrimaryWinner.id);

    setTargetIndex(visualTargetIndex >= 0 ? visualTargetIndex : 0);
    setChosenWinners(selectedWinners);
    setIsSpinning(true);
  };

  // Saat Wheel selesai berputar
  const handleSpinEnd = () => {
    if (chosenWinners.length === 0) {
      setIsSpinning(false);
      return;
    }

    // Catat pemenang ke store (dan hapus dari daftar jika toggle diaktifkan)
    recordWinnersDraw(chosenWinners, settings.prizeName);

    setIsSpinning(false);
    setTargetIndex(null);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Quick Prize Options */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-3xl bg-gradient-to-r from-[#09283D] via-[#0B3550] to-[#071E2F] border-2 border-[#1CA3DE]/40 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#1CA3DE] to-[#0A6C98] flex items-center justify-center text-2xl shadow-lg">
            🎁
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black tracking-widest text-[#FFE135] uppercase">
                Wheel of Names Style
              </span>
              <span className="text-xs">🏁</span>
            </div>
            <h2
              className="text-xl sm:text-2xl font-black text-white"
              style={{ fontFamily: "'Lilita One', cursive, sans-serif" }}
            >
              Undi Hadiah & Doorprize Balapan
            </h2>
          </div>
        </div>

        {/* Quick Settings Pill */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-700 text-xs font-bold text-slate-300">
            <span>Pemenang / Spin:</span>
            <input
              type="number"
              min={1}
              max={50}
              value={settings.winnersCountPerSpin}
              onChange={(e) => updateSettings({ winnersCountPerSpin: Math.max(1, parseInt(e.target.value, 10) || 1) })}
              className="w-12 px-1 py-0.5 rounded bg-black text-[#FFE135] font-black text-center focus:outline-none"
            />
          </div>

          <button
            onClick={() => updateSettings({ removeWinnersAfterDraw: !settings.removeWinnersAfterDraw })}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border ${
              settings.removeWinnersAfterDraw
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                : 'bg-blue-500/20 text-blue-300 border-blue-500/50'
            }`}
            title="Ubah apakah pemenang dihapus atau tetap di roda"
          >
            <span>Setelah spin:</span>
            <strong className="underline">
              {settings.removeWinnersAfterDraw ? 'Dihapus dari roda' : 'Tetap ada di roda'}
            </strong>
          </button>

          <button
            onClick={() => setIsOptionsModalOpen(true)}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition"
            title="Opsi Hadiah Lengkap"
          >
            <Settings size={16} className="text-[#FFE135]" />
          </button>
        </div>
      </div>

      {/* Main Area: Wheelofnames Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Kolom Kiri: Roda Ban Besar & Tombol Putar (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col items-center p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-[#09263B] to-[#061B2B] border-2 border-slate-700/80 shadow-2xl relative">
          
          {/* Judul Hadiah Saat Ini */}
          <div className="text-center mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Hadiah yang Diundi:
            </span>
            <h3 
              className="text-xl sm:text-2xl font-black text-[#FFE135] drop-shadow"
              style={{ fontFamily: "'Lilita One', cursive, sans-serif" }}
            >
              {settings.prizeName || 'Hadiah Doorprize Utama 🏆'}
            </h3>
          </div>

          {/* Wheel besar (Bisa diklik untuk spin) */}
          <div 
            onClick={!isSpinning ? handleStartSpin : undefined}
            className={`relative my-2 cursor-pointer transition-transform duration-200 ${
              !isSpinning ? 'hover:scale-[1.01] active:scale-[0.99]' : ''
            }`}
            title="Klik roda atau tekan tombol SPIN di bawah untuk memutar"
          >
            <SpinWheel
              items={participants}
              isSpinning={isSpinning}
              targetIndex={targetIndex}
              onSpinEnd={handleSpinEnd}
              duration={settings.spinDuration}
              size={420}
            />
          </div>

          {/* Warning jika peserta kurang dari kuota pemenang */}
          {participants.length < settings.winnersCountPerSpin && participants.length > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-950/60 border border-amber-500/40 text-amber-300 text-xs font-semibold mb-3">
              <AlertTriangle size={14} />
              <span>
                Jumlah peserta ({participants.length}) lebih sedikit dari kuota pemenang ({settings.winnersCountPerSpin}). Semua yang tersisa akan terpilih.
              </span>
            </div>
          )}

          {/* Tombol Lampu Balap SPIN */}
          <div className="w-full flex flex-col items-center gap-3">
            <StartLights
              onStart={handleStartSpin}
              disabled={isSpinning || participants.length < 2}
            />
            
            <p className="text-xs text-slate-400">
              Tip: Anda juga dapat langsung mengklik roda untuk memutar! 🏁
            </p>
          </div>

        </div>

        {/* Kolom Kanan: Panel Tab (Daftar Nama & Pemenang) (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col h-full space-y-3">
          
          {/* Tab Selector */}
          <div className="grid grid-cols-2 gap-2 p-1.5 bg-[#092233] rounded-2xl border border-slate-700/80 shadow">
            <button
              onClick={() => setActiveTab('names')}
              className={`py-2 px-3 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 ${
                activeTab === 'names'
                  ? 'bg-[#1CA3DE] text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ListFilter size={15} />
              <span>Daftar Nama ({participants.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('winners')}
              className={`py-2 px-3 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 ${
                activeTab === 'winners'
                  ? 'bg-[#FFE135] text-black shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Trophy size={15} />
              <span>Pemenang 🏆</span>
            </button>
          </div>

          {/* Panel Konten Aktif */}
          <div className="flex-1 min-h-[460px]">
            {activeTab === 'names' ? (
              <NameListEditor />
            ) : (
              <WinnersPanel />
            )}
          </div>

        </div>

      </div>

      {/* Dialog Hasil 10 Pemenang Reveal */}
      {latestWinnersDialog && (
        <WinnersDialog
          isOpen={latestWinnersDialog.isOpen}
          onClose={() => setLatestWinnersDialog(null)}
          winners={latestWinnersDialog.winners}
          prizeName={latestWinnersDialog.prizeName}
          confettiEnabled={settings.confettiEnabled}
        />
      )}

      {/* Modal Opsi Hadiah (Options Wheel of Names) */}
      {isOptionsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md rounded-3xl bg-[#092233] border-2 border-[#1CA3DE] p-6 text-white shadow-2xl">
            <h3 
              className="text-xl font-black text-white mb-4"
              style={{ fontFamily: "'Lilita One', cursive, sans-serif" }}
            >
              ⚙️ Pengaturan Undian Hadiah
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Nama Hadiah / Doorprize:
                </label>
                <input
                  type="text"
                  value={settings.prizeName}
                  onChange={(e) => updateSettings({ prizeName: e.target.value })}
                  placeholder="Contoh: Sepeda Lipat, Voucher Belanja..."
                  className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-sm text-white focus:outline-none focus:border-[#1CA3DE]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Jumlah Pemenang per Spin:
                </label>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={settings.winnersCountPerSpin}
                  onChange={(e) => updateSettings({ winnersCountPerSpin: Math.max(1, parseInt(e.target.value, 10) || 1) })}
                  className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-sm text-white focus:outline-none focus:border-[#1CA3DE]"
                />
                <span className="text-[11px] text-slate-400">
                  Default 10 pemenang sekaligus dalam sekali putaran.
                </span>
              </div>

              {/* Behavior Toggle */}
              <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                <span className="block text-xs font-bold text-slate-300">
                  Setelah Menang:
                </span>
                <label className="flex items-center gap-2 cursor-pointer text-xs">
                  <input
                    type="radio"
                    name="removeWinners"
                    checked={settings.removeWinnersAfterDraw === true}
                    onChange={() => updateSettings({ removeWinnersAfterDraw: true })}
                    className="accent-[#1CA3DE]"
                  />
                  <span>Keluarkan nama pemenang dari roda (bisa di-restore)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-xs">
                  <input
                    type="radio"
                    name="removeWinners"
                    checked={settings.removeWinnersAfterDraw === false}
                    onChange={() => updateSettings({ removeWinnersAfterDraw: false })}
                    className="accent-[#1CA3DE]"
                  />
                  <span>Biarkan nama pemenang tetap ada di roda</span>
                </label>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-slate-300 mb-1">
                  <span>Durasi Putar:</span>
                  <span className="text-[#1CA3DE]">{settings.spinDuration} detik</span>
                </div>
                <input
                  type="range"
                  min={2}
                  max={10}
                  value={settings.spinDuration}
                  onChange={(e) => updateSettings({ spinDuration: parseInt(e.target.value, 10) })}
                  className="w-full accent-[#1CA3DE]"
                />
              </div>
            </div>

            <div className="flex justify-end mt-6 pt-4 border-t border-slate-800">
              <button
                onClick={() => setIsOptionsModalOpen(false)}
                className="px-6 py-2.5 rounded-xl bg-[#1CA3DE] hover:bg-[#1588ba] text-white font-black text-sm"
                style={{ fontFamily: "'Lilita One', cursive, sans-serif" }}
              >
                Selesai
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
