import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { Participant } from '../types';
import { exportElementAsPng } from '../lib/export';
import { Trophy, Copy, Download, X, Check, Sparkles } from 'lucide-react';

interface WinnersDialogProps {
  isOpen: boolean;
  onClose: () => void;
  winners: Participant[];
  prizeName?: string;
  confettiEnabled?: boolean;
}

export const WinnersDialog: React.FC<WinnersDialogProps> = ({
  isOpen,
  onClose,
  winners,
  prizeName,
  confettiEnabled = true
}) => {
  const [revealedCount, setRevealedCount] = useState<number>(0);
  const [copied, setCopied] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  // Trigger confetti dan reveal satu per satu
  useEffect(() => {
    if (isOpen && winners.length > 0) {
      setRevealedCount(0);

      if (confettiEnabled) {
        // Confetti ganda kiri dan kanan
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { x: 0.2, y: 0.5 },
          colors: ['#FFE135', '#1CA3DE', '#E63946', '#2EC4B6', '#FFFFFF']
        });
        setTimeout(() => {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { x: 0.8, y: 0.5 },
            colors: ['#FFE135', '#1CA3DE', '#E63946', '#2EC4B6', '#FFFFFF']
          });
        }, 300);
      }

      // Animasi kartu reveal berurutan (misal tiap 150ms)
      const interval = setInterval(() => {
        setRevealedCount((prev) => {
          if (prev >= winners.length) {
            clearInterval(interval);
            return prev;
          }
          return prev + 1;
        });
      }, 160);

      return () => clearInterval(interval);
    }
  }, [isOpen, winners, confettiEnabled]);

  if (!isOpen) return null;

  const handleCopyList = () => {
    const text = winners
      .map((w, idx) => `${idx + 1}. ${w.name}`)
      .join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPng = async () => {
    setIsExporting(true);
    await exportElementAsPng('winners-dialog-card', `Pemenang-${prizeName || 'Hadiah'}`);
    setIsExporting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div
        id="winners-dialog-card"
        className="relative w-full max-w-2xl rounded-3xl bg-gradient-to-b from-[#09293F] via-[#071E2F] to-[#04111C] border-2 border-[#FFE135] shadow-[0_0_50px_rgba(255,225,53,0.35)] p-6 sm:p-8 text-white max-h-[90vh] overflow-y-auto"
      >
        {/* Checkered Border Top */}
        <div className="absolute top-0 left-0 right-0 h-4 bg-checkered rounded-t-3xl opacity-30" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X size={20} />
        </button>

        {/* Trophy & Header */}
        <div className="text-center pt-2 mb-6">
          <div className="inline-block relative">
            <div className="text-6xl sm:text-7xl filter drop-shadow-[0_0_20px_rgba(255,225,53,0.6)] animate-bounce">
              🏆
            </div>
            <span className="absolute -bottom-2 -right-2 text-2xl">🏁</span>
          </div>

          <h2
            className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#FFE135] via-white to-[#FFE135] mt-2"
            style={{ fontFamily: "'Lilita One', cursive, sans-serif" }}
          >
            SELAMAT KEPADA PARA PEMENANG! 🏁🎉
          </h2>

          <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-[#1CA3DE]/20 border border-[#1CA3DE]/40 text-[#1CA3DE] text-sm font-bold mt-2">
            <Sparkles size={14} />
            <span>{prizeName || 'Grand Prix Trophy & Doorprize'}</span>
          </div>

          <p className="text-xs text-slate-400 mt-1">
            Terpilih {winners.length} Pemenang Beruntung!
          </p>
        </div>

        {/* Daftar Kartu Pemenang 1 - 10 (Revealed Animasi) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-6">
          {winners.map((winner, idx) => {
            const isRevealed = idx < revealedCount;
            return (
              <div
                key={winner.id || idx}
                className={`relative flex items-center justify-between p-3 rounded-2xl border transition-all duration-300 ${
                  isRevealed
                    ? 'opacity-100 transform translate-y-0 bg-gradient-to-r from-slate-900 to-[#0C2A3D] border-[#FFE135]/60 shadow-md'
                    : 'opacity-0 transform translate-y-4 bg-slate-900/40 border-slate-800'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#FFE135] to-[#FFA000] text-black font-black flex items-center justify-center text-sm shadow">
                    {idx + 1}
                  </div>
                  <div className="truncate">
                    <span className="text-xs text-slate-400 block font-semibold">
                      Juara / Pemenang #{idx + 1}
                    </span>
                    <span 
                      className="text-sm sm:text-base font-black text-white truncate block"
                      style={{ fontFamily: "'Outfit', sans-serif" }}
                    >
                      {winner.name}
                    </span>
                  </div>
                </div>

                <div className="text-lg filter drop-shadow">
                  {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : '🏎️'}
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Buttons: Tutup, Salin, Simpan PNG */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-4 border-t border-slate-800">
          <button
            onClick={handleCopyList}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm transition flex items-center gap-2 border border-slate-700"
          >
            {copied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
            <span>{copied ? 'Tersalin!' : 'Salin Daftar Pemenang'}</span>
          </button>

          <button
            onClick={handleDownloadPng}
            disabled={isExporting}
            className="px-5 py-2.5 rounded-xl bg-[#1CA3DE] hover:bg-[#1588ba] text-white font-bold text-sm transition flex items-center gap-2 shadow"
          >
            <Download size={16} />
            <span>{isExporting ? 'Menyimpan...' : 'Simpan Gambar PNG'}</span>
          </button>

          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-[#FFE135] hover:bg-yellow-400 text-black font-black text-sm transition shadow-lg"
            style={{ fontFamily: "'Lilita One', cursive, sans-serif" }}
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
