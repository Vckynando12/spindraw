import React, { useState } from 'react';
import { usePrizeStore } from '../store/prizeStore';
import { exportPrizeWinnersToCSV } from '../lib/export';
import { Trophy, Copy, Download, Trash2, RotateCcw, Check, Clock } from 'lucide-react';

export const WinnersPanel: React.FC = () => {
  const { winnersHistory, removedWinners, restoreWinner, clearHistory } = usePrizeStore();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyDraw = (drawId: string, winnersText: string) => {
    navigator.clipboard.writeText(winnersText);
    setCopiedId(drawId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExportCSV = () => {
    exportPrizeWinnersToCSV(winnersHistory);
  };

  return (
    <div className="flex flex-col h-full bg-[#081F30] rounded-2xl border border-slate-700/80 p-4 shadow-xl">
      {/* Header Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-3 border-b border-slate-700/60">
        <div className="flex items-center gap-2">
          <Trophy size={16} className="text-[#FFE135]" />
          <span className="text-xs font-black text-white uppercase tracking-wider">
            Riwayat Undian ({winnersHistory.length})
          </span>
        </div>

        {winnersHistory.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="px-2.5 py-1 rounded-lg bg-emerald-600/80 hover:bg-emerald-600 text-white text-xs font-bold transition flex items-center gap-1 shadow"
            >
              <Download size={12} />
              <span>Export CSV</span>
            </button>

            <button
              onClick={() => confirm('Hapus semua riwayat pemenang?') && clearHistory()}
              className="px-2.5 py-1 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-300 text-xs font-bold transition flex items-center gap-1 border border-red-900/50"
            >
              <Trash2 size={12} />
              <span>Bersihkan</span>
            </button>
          </div>
        )}
      </div>

      {/* Main List */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 min-h-[300px]">
        {winnersHistory.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-12 text-center text-slate-400">
            <span className="text-4xl mb-2">🏁</span>
            <p className="text-sm font-semibold">Belum ada riwayat pemenang</p>
            <p className="text-xs text-slate-500 mt-1">
              Putar roda untuk mengundi pemenang hadiah doorprize
            </p>
          </div>
        ) : (
          winnersHistory.map((draw) => {
            const formattedTime = new Date(draw.drawnAt).toLocaleTimeString('id-ID', {
              hour: '2-digit',
              minute: '2-digit'
            });
            const textToCopy = `${draw.prizeName || 'Pemenang Hadiah'}:\n` +
              draw.winners.map((w, i) => `${i + 1}. ${w.name}`).join('\n');

            return (
              <div
                key={draw.id}
                className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-700/80 shadow-md"
              >
                <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-800">
                  <div>
                    <h4 
                      className="font-bold text-sm text-[#FFE135]"
                      style={{ fontFamily: "'Lilita One', cursive, sans-serif" }}
                    >
                      {draw.prizeName || 'Hadiah Doorprize'}
                    </h4>
                    <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                      <Clock size={11} />
                      <span>{formattedTime} • {draw.winners.length} Pemenang</span>
                    </span>
                  </div>

                  <button
                    onClick={() => handleCopyDraw(draw.id, textToCopy)}
                    className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1 border border-slate-700"
                  >
                    {copiedId === draw.id ? (
                      <>
                        <Check size={12} className="text-emerald-400" />
                        <span className="text-emerald-400">Tersalin</span>
                      </>
                    ) : (
                      <>
                        <Copy size={12} />
                        <span>Salin</span>
                      </>
                    )}
                  </button>
                </div>

                {/* List Pemenang */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {draw.winners.map((w, idx) => (
                    <div
                      key={w.id || idx}
                      className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-950/70 border border-slate-800 text-xs text-slate-200"
                    >
                      <span className="w-4 h-4 rounded-full bg-[#1CA3DE] text-white text-[10px] font-bold flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <span className="truncate font-semibold">{w.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        )}

        {/* Section: Nama yang sudah menang (Bisa di-Restore) */}
        {removedWinners.length > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-700/60">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-300">
                Pemenang yang Dikeluarkan dari Roda ({removedWinners.length}):
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {removedWinners.map((winner) => (
                <div
                  key={winner.id}
                  className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-300"
                >
                  <span className="truncate max-w-[120px]">{winner.name}</span>
                  <button
                    onClick={() => restoreWinner(winner.id)}
                    className="p-0.5 text-[#FFE135] hover:text-white transition"
                    title="Kembalikan nama ke roda"
                  >
                    <RotateCcw size={12} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
