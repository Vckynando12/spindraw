import React, { useState, useRef, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { useTeamStore } from '../store/teamStore';
import { useSettingsStore } from '../store/settingsStore';
import { SpinWheel } from '../components/SpinWheel';
import { StartLights } from '../components/StartLights';
import { TeamBoard } from '../components/TeamBoard';
import { ParticipantInput } from '../components/ParticipantInput';
import { secureRandomInt } from '../lib/random';
import { exportTeamsToCSV, exportElementAsPng } from '../lib/export';
import { isAllTeamsFinished, getActiveTeam } from '../lib/teams';
import { sound } from '../lib/sound';
import { Participant } from '../types';
import { 
  Users, 
  RotateCcw, 
  Download, 
  Printer, 
  Plus, 
  Trash2, 
  FileSpreadsheet,
  CheckCircle2,
  Shuffle,
} from 'lucide-react';

/** Durasi spin roda dalam detik (lebih lama = lebih dramatis) */
const SPIN_DURATION_SECONDS = 7;
/** Delay antar insert peserta (ms) — makin kecil makin cepat */
const REVEAL_INTERVAL_MS = 160;

export const TeamDrawPage: React.FC = () => {
  const {
    categories,
    activeCategoryId,
    setActiveCategory,
    addCategory,
    removeCategory,
    assignParticipantToRandomTeam,
    undoLastAssignment,
    resetCategoryDraw,
    updateTeamName,
    setCategoryParticipants,
    recalculateTeams
  } = useTeamStore();

  const { teamSettings } = useSettingsStore();

  const activeCategory = categories.find((c) => c.id === activeCategoryId) || categories[0];

  // State spin
  const [isSpinning, setIsSpinning]     = useState(false);
  const [targetIndex, setTargetIndex]   = useState<number | null>(null);
  const [isRevealing, setIsRevealing]   = useState(false);
  const [revealCount, setRevealCount]   = useState(0);   // berapa sudah diinsert
  const [totalReveal, setTotalReveal]   = useState(0);   // total yang akan diinsert
  const [celebrationData, setCelebrationData] = useState<{ totalPeserta: number } | null>(null);
  const [latestDraw, setLatestDraw] = useState<{ participantName: string; teamName: string; teamId: string } | null>(null);

  // Modals & controls
  const [isInputModalOpen, setIsInputModalOpen] = useState(false);

  // Refs untuk reveal queue & interval
  const revealQueueRef    = useRef<Participant[]>([]);
  const revealIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const activeCatIdRef    = useRef<string>(activeCategory?.id ?? '');
  const totalDrawnRef     = useRef<number>(0);

  // Selalu update ref supaya closure di interval selalu fresh
  useEffect(() => {
    activeCatIdRef.current = activeCategory?.id ?? '';
  }, [activeCategory?.id]);

  // Cleanup interval saat unmount
  useEffect(() => {
    return () => {
      if (revealIntervalRef.current) clearInterval(revealIntervalRef.current);
    };
  }, []);

  const activeTeam      = activeCategory ? getActiveTeam(activeCategory.teams) : undefined;
  const isFinished      = activeCategory ? isAllTeamsFinished(activeCategory.teams) : false;
  const currentCapacity = activeCategory?.maxCapacityPerTeam || 10;
  const isBusy          = isSpinning || isRevealing;

  // ── SELESAI PENGUNDIAN ──────────────────────────────────────────────────
  const finalizeDraw = (total: number) => {
    if (revealIntervalRef.current) {
      clearInterval(revealIntervalRef.current);
      revealIntervalRef.current = null;
    }

    setIsSpinning(false);
    setIsRevealing(false);
    setTargetIndex(null);
    setLatestDraw(null);
    setRevealCount(0);
    setTotalReveal(0);

    setCelebrationData({ totalPeserta: total });
    sound.playFanfare();

    if (teamSettings.confettiEnabled) {
      confetti({ particleCount: 160, spread: 100, origin: { y: 0.5 } });
    }

    setTimeout(() => {
      setCelebrationData(null);
    }, 4000);
  };

  // ── SPIN ROULETTE & LIVE SELECTION ─────────────────────────────────────────
  const handleStartSpin = () => {
    if (!activeCategory || isBusy || activeCategory.remaining.length === 0) return;

    if (revealIntervalRef.current) {
      clearInterval(revealIntervalRef.current);
      revealIntervalRef.current = null;
    }

    // Fisher-Yates shuffle semua peserta SEBELUM pengundian
    const shuffled = [...activeCategory.remaining];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = secureRandomInt(0, i);
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    const total = shuffled.length;
    revealQueueRef.current = shuffled;
    totalDrawnRef.current = total;

    setTargetIndex(null); // Mode Continuous Roulette (berputar tanpa henti sampai semua nama ditarik)
    setRevealCount(0);
    setTotalReveal(total);
    setIsSpinning(true);
    setIsRevealing(true);
    setCelebrationData(null);
    setLatestDraw(null);

    // Hitung interval agar pengambilan nama berjalan dinamis & seru (~140ms - 360ms)
    const intervalMs = Math.max(140, Math.min(360, Math.floor(6500 / total)));

    let inserted = 0;
    const catId = activeCatIdRef.current;

    const timer = setInterval(() => {
      // 1. Cek jika antrean sudah habis
      if (revealQueueRef.current.length === 0) {
        clearInterval(timer);
        revealIntervalRef.current = null;
        finalizeDraw(total);
        return;
      }

      // 2. Ambil 1 peserta dari antrean acak & masukkan ke tim acak
      const participant = revealQueueRef.current.shift()!;
      const assigned = assignParticipantToRandomTeam(catId, participant);
      if (assigned) {
        sound.playSlotPop(inserted);
        setLatestDraw({
          participantName: participant.name,
          teamName: assigned.teamName,
          teamId: assigned.teamId
        });
      }

      inserted++;
      setRevealCount(inserted);

      // 3. Jika baru saja memasukkan peserta terakhir, langsung tuntaskan
      if (revealQueueRef.current.length === 0) {
        clearInterval(timer);
        revealIntervalRef.current = null;
        finalizeDraw(total);
      }
    }, intervalMs);

    revealIntervalRef.current = timer;
  };

  // ── SPIN SELESAI CALLBACK DARI WHEEL ──────────────────────────────────────
  const handleSpinEnd = () => {
    finalizeDraw(totalDrawnRef.current || totalReveal || activeCategory?.totalTarget || 0);
  };

  // Handler Tambah Kategori Baru
  const handleAddCategoryPrompt = () => {
    const label = prompt('Masukkan nama kategori baru (contoh: Laki-laki usia 4 tahun):');
    if (label && label.trim()) {
      addCategory(label.trim(), 30, 10);
    }
  };

  // Handler ubah kapasitas per tim secara langsung
  const handleQuickCapacityChange = (delta: number) => {
    if (!activeCategory) return;
    const nextCap = Math.max(2, currentCapacity + delta);
    if (nextCap === currentCapacity) return;
    recalculateTeams(activeCategory.id, nextCap, activeCategory.customTeamCount);
  };

  return (
    <div className="space-y-5 w-full">
      
      {/* 1. Kategori Navigation Bar & Fleksibilitas Kuota */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-2.5 bg-[#092233] rounded-2xl border border-slate-700/80 shadow-md">
        <div className="flex flex-wrap items-center gap-2">
          {categories.map((cat) => {
            const isCatActive = cat.id === activeCategoryId;
            const isCatFull = isAllTeamsFinished(cat.teams);

            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`group px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 border ${
                  isCatActive
                    ? 'bg-[#FFE135] text-black border-[#FFE135] shadow-md shadow-yellow-500/20 scale-105'
                    : 'bg-slate-900/80 text-slate-300 border-slate-700 hover:border-slate-500'
                }`}
              >
                <span>{isCatFull ? '🏁' : '🏎️'}</span>
                <span>{cat.label}</span>
                <span className={`px-1.5 py-0.2 rounded-md text-[10px] ${
                  isCatActive ? 'bg-black/20 text-black font-black' : 'bg-slate-800 text-slate-400'
                }`}>
                  {cat.teams.reduce((acc, t) => acc + t.members.length, 0)}/{cat.totalTarget}
                </span>
              </button>
            );
          })}

          <button
            onClick={handleAddCategoryPrompt}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-[#FFE135] text-xs font-bold transition flex items-center gap-1 border border-dashed border-[#FFE135]/40"
            title="Tambah Kategori Baru"
          >
            <Plus size={14} />
            <span>Tambah Kategori</span>
          </button>
        </div>

        {/* Category Controls & Dynamic Capacity Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Stepper Kapasitas Maks/Tim Dinamis */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200">
            <span className="font-bold text-slate-300">Kapasitas:</span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => handleQuickCapacityChange(-1)}
                className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-white font-black flex items-center justify-center border border-slate-600"
                title="Kurangi kapasitas tim"
              >
                -
              </button>
              <span className="px-1.5 font-black text-[#FFE135] min-w-[20px] text-center">
                {currentCapacity}
              </span>
              <button
                onClick={() => handleQuickCapacityChange(1)}
                className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-white font-black flex items-center justify-center border border-slate-600"
                title="Tambah kapasitas tim"
              >
                +
              </button>
            </div>
            <span className="text-[11px] text-slate-400">/tim</span>
          </div>

          <button
            onClick={() => setIsInputModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-[#1CA3DE] hover:bg-[#1588ba] text-white text-xs font-bold transition flex items-center gap-1.5 shadow"
            title="Atur jumlah peserta, kapasitas per tim, atau import nama"
          >
            <Users size={14} />
            <span>Atur Peserta & Kuota</span>
          </button>

          {categories.length > 1 && (
            <button
              onClick={() => confirm(`Hapus kategori "${activeCategory.label}"?`) && removeCategory(activeCategory.id)}
              className="p-2 rounded-xl text-red-400 hover:bg-red-950/40 border border-red-900/40 transition"
              title="Hapus Kategori Ini"
            >
              <Trash2 size={15} />
            </button>
          )}
        </div>
      </div>

      {/* 2. Main Arena: Flex Widescreen Layout (Roda di Kiri, Papan Tim Lebar Penuh di Kanan) */}
      <div className="flex flex-col xl:flex-row items-start gap-6 w-full">
        
        {/* Kolom Kiri: Spin Wheel & Kontrol Balapan (Width terkontrol rapi) */}
        <div className="w-full xl:w-[380px] 2xl:w-[410px] shrink-0 flex flex-col items-center p-5 rounded-3xl bg-gradient-to-b from-[#09263B] to-[#061B2B] border-2 border-slate-700/80 shadow-2xl relative">
          
          {/* Info Bar: Status modus pengundian */}
          <div className="w-full mb-3">
            {isRevealing ? (
              /* ── Sedang reveal satu per satu ── */
              <div className="flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-purple-900/60 to-indigo-900/60 border-2 border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.4)] animate-pulse">
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl animate-spin" style={{ animationDuration: '1s' }}>🎲</span>
                  <div>
                    <span className="text-[10px] font-bold text-purple-300 uppercase tracking-wider block">
                      Memasukkan Peserta...
                    </span>
                    <h4 className="text-sm font-black text-white">
                      {revealCount} / {totalReveal} peserta
                    </h4>
                  </div>
                </div>
                {/* Progress bar reveal */}
                <div className="w-20 h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-400 to-pink-400 rounded-full transition-all duration-150"
                    style={{ width: `${totalReveal > 0 ? (revealCount / totalReveal) * 100 : 0}%` }}
                  />
                </div>
              </div>
            ) : !isFinished ? (
              /* ── Siap diundi ── */
              <div className="flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-[#0F3956] to-[#0A263B] border-2 border-[#FFE135] shadow-[0_0_15px_rgba(255,225,53,0.3)]">
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">🎡</span>
                  <div>
                    <span className="text-[10px] font-bold text-[#FFE135] uppercase tracking-wider block">
                      Mode: Acak Semua Sekaligus
                    </span>
                    <h4 className="text-sm font-black text-white">
                      {activeCategory?.remaining.length || 0} peserta siap diundi
                    </h4>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-slate-300">
                    ke <strong className="text-[#FFE135]">{activeCategory?.teams.length || 0}</strong> Tim
                  </span>
                </div>
              </div>
            ) : (
              /* ── Semua selesai ── */
              <div className="p-3 rounded-2xl bg-emerald-950/60 border-2 border-emerald-500 text-center shadow-lg">
                <span className="text-emerald-400 font-black text-sm flex items-center justify-center gap-1.5">
                  <CheckCircle2 size={16} />
                  <span>SEMUA TIM SUDAH PENUH! 🏁</span>
                </span>
              </div>
            )}
          </div>

          {/* Roda Ban Balap (SpinWheel) */}
          <div className="relative my-1">
            <SpinWheel
              items={activeCategory ? activeCategory.remaining : []}
              isSpinning={isSpinning}
              targetIndex={targetIndex}
              onSpinEnd={handleSpinEnd}
              duration={SPIN_DURATION_SECONDS}
              fastSpin={teamSettings.fastSpin}
              isFinished={isFinished}
              size={340}
            />

            {/* Popup Selebrasi — semua tim terbentuk */}
            {celebrationData && (
              <div className="absolute inset-0 z-30 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm rounded-full animate-pop">
                <div className="p-4 rounded-3xl bg-gradient-to-b from-[#FFE135] to-[#FFA000] text-black text-center shadow-2xl border-2 border-white max-w-[260px]">
                  <span className="text-2xl block mb-1">🎉🏆</span>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-900">
                    Pengundian Selesai!
                  </div>
                  <h4
                    className="text-base font-black"
                    style={{ fontFamily: "'Lilita One', cursive, sans-serif" }}
                  >
                    Semua Tim Terbentuk 🏁
                  </h4>
                  <div className="mt-2 py-1 px-3 rounded-xl bg-black text-white font-black text-sm">
                    {celebrationData.totalPeserta} peserta telah diacak ✓
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Live Pick Announcement Banner saat proses roulette berlangsung */}
          {latestDraw && isBusy && (
            <div className="w-full my-1 py-1.5 px-3 rounded-2xl bg-gradient-to-r from-yellow-500/20 via-[#FFE135]/30 to-amber-500/20 border border-[#FFE135] text-center shadow-lg animate-pulse flex items-center justify-center gap-2">
              <span className="text-sm">🎯</span>
              <span className="text-white font-black text-xs sm:text-sm truncate max-w-[130px]">
                {latestDraw.participantName}
              </span>
              <span className="text-yellow-400 font-black text-xs">➔</span>
              <span className="text-[#FFE135] font-black text-xs sm:text-sm truncate max-w-[130px]">
                {latestDraw.teamName}
              </span>
            </div>
          )}

          {/* Sisa Peserta Counter */}
          <div className="text-xs text-slate-400 font-semibold mb-3 mt-1">
            {isRevealing
              ? <span className="text-purple-300 font-bold">🎲 Mengisi slot tim... ({activeCategory?.remaining.length || 0} sisa di roda)</span>
              : <>Tersisa <strong className="text-[#FFE135]">{activeCategory?.remaining.length || 0}</strong> Peserta di Roda</>
            }
          </div>

          {/* Start Gantry Lights & SPIN Button */}
          <div className="w-full flex flex-col items-center gap-3">
            <StartLights
              onStart={handleStartSpin}
              disabled={isBusy || isFinished || (activeCategory?.remaining.length === 0)}
              fastSpin={teamSettings.fastSpin}
            />

            {/* Quick Action Toolbar */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2 border-t border-slate-700/60 w-full">
              {/* Tombol Undo */}
              <button
                onClick={() => undoLastAssignment(activeCategory.id)}
                disabled={isBusy || activeCategory.history.length === 0}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center gap-1.5 border border-slate-700 disabled:opacity-40"
                title="Batalkan penempatan terakhir"
              >
                <RotateCcw size={13} className="text-amber-400" />
                <span>Undo ({activeCategory.history.length})</span>
              </button>

              {/* Reset Category */}
              <button
                onClick={() => {
                  if (confirm('Reset semua hasil tim untuk kategori ini? Semua peserta akan kembali ke roda.')) {
                    resetCategoryDraw(activeCategory.id);
                  }
                }}
                disabled={isBusy || activeCategory.history.length === 0}
                className="px-3 py-1.5 rounded-xl bg-red-950/40 hover:bg-red-900/60 text-red-300 text-xs font-bold transition flex items-center gap-1 border border-red-900/50 disabled:opacity-40"
              >
                <RotateCcw size={12} />
                <span>Reset</span>
              </button>
            </div>
          </div>

        </div>

        {/* Kolom Kanan: Tournament Team Board (Mengambil seluruh sisa ruang luas) */}
        <div className="flex-1 min-w-0 w-full flex flex-col gap-4">
          
          {/* Top Actions: Export CSV, PNG & Print */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-[#092233] border border-slate-700/80 shadow">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-white uppercase tracking-wider">
                Papan Turnamen ({activeCategory.teams.length} Tim)
              </span>
              <span className="px-2 py-0.5 rounded-md bg-[#1CA3DE]/20 text-[#1CA3DE] text-xs font-bold border border-[#1CA3DE]/40">
                Maks {currentCapacity}/Tim
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => exportTeamsToCSV(categories, activeCategory)}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow"
                title="Download CSV Hasil Tim"
              >
                <FileSpreadsheet size={14} />
                <span>Export CSV</span>
              </button>

              <button
                onClick={() => exportElementAsPng('team-board-capture', `Bikini-Bottom-Tim-${activeCategory.label}`)}
                className="px-3 py-1.5 rounded-xl bg-[#1CA3DE] hover:bg-[#1588ba] text-white text-xs font-bold transition flex items-center gap-1.5 shadow"
                title="Simpan Gambar PNG untuk WhatsApp"
              >
                <Download size={14} />
                <span>Simpan PNG 📸</span>
              </button>

              <button
                onClick={() => window.print()}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center gap-1.5 border border-slate-700"
                title="Cetak Papan Tim"
              >
                <Printer size={14} />
                <span className="hidden sm:inline">Cetak</span>
              </button>
            </div>
          </div>

          {/* Tournament Team Board Bracket Component (Full Width & Clean Two-Sided Bracket) */}
          <TeamBoard
            category={activeCategory}
            activeTeam={isBusy ? undefined : activeTeam}
            onUpdateTeamName={(teamId, newName) => updateTeamName(activeCategory.id, teamId, newName)}
            eventName={teamSettings.eventName}
          />

        </div>

      </div>

      {/* Input Peserta & Kuota Modal */}
      <ParticipantInput
        isOpen={isInputModalOpen}
        onClose={() => setIsInputModalOpen(false)}
        onSubmit={(participants, cap, tc) => {
          setCategoryParticipants(activeCategory.id, participants, cap, tc);
        }}
        currentCount={activeCategory.totalTarget}
        currentCapacity={currentCapacity}
        currentTeamCount={activeCategory.customTeamCount}
        categoryLabel={activeCategory.label}
      />

    </div>
  );
};
