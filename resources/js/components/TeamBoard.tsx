import React, { useEffect, useRef } from 'react';
import { Category, Team } from '../types';
import { TeamCard } from './TeamCard';
import { BracketLines } from './BracketLines';
import { isAllTeamsFinished } from '../lib/teams';
import { Trophy, Flag, Sparkles } from 'lucide-react';

interface TeamBoardProps {
  category: Category;
  activeTeam?: Team;
  onUpdateTeamName: (teamId: string, newName: string) => void;
  eventName: string;
}

export const TeamBoard: React.FC<TeamBoardProps> = ({
  category,
  activeTeam,
  onUpdateTeamName,
  eventName
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isFinished = isAllTeamsFinished(category.teams);

  // Auto-scroll ke tim aktif pada tampilan mobile jika diperlukan
  useEffect(() => {
    if (activeTeam && window.innerWidth < 768) {
      const cardEl = document.getElementById(`team-card-${activeTeam.id}`);
      if (cardEl) {
        cardEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }, [activeTeam]);

  // Pembagian dua sisi: kiri & kanan seimbang
  const totalTeams = category.teams.length;
  const leftCount = Math.ceil(totalTeams / 2);
  const leftTeams = category.teams.slice(0, leftCount);
  const rightTeams = category.teams.slice(leftCount);

  const totalFilled = category.teams.reduce((acc, t) => acc + t.members.length, 0);
  const totalQuota = category.teams.reduce((acc, t) => acc + t.quota, 0);

  return (
    <div
      id="team-board-capture"
      ref={containerRef}
      className="relative w-full rounded-3xl p-3 sm:p-5 lg:p-6 bg-gradient-to-b from-[#09283D] via-[#071E2F] to-[#04121D] border-2 border-[#1CA3DE]/40 shadow-2xl overflow-x-auto"
    >
      {/* Background Checkered Accent at Corners */}
      <div className="absolute top-0 left-0 w-28 h-5 bg-checkered opacity-20 pointer-events-none rounded-br-2xl" />
      <div className="absolute top-0 right-0 w-28 h-5 bg-checkered opacity-20 pointer-events-none rounded-bl-2xl" />

      {/* Header Info Papan Tim */}
      <div className="text-center mb-5 relative z-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-0.5 rounded-full bg-[#1CA3DE]/20 border border-[#1CA3DE]/40 text-[#1CA3DE] text-xs font-bold uppercase tracking-wider mb-1.5">
          <span>🏁</span>
          <span>{eventName}</span>
          <span>🏁</span>
        </div>
        <h2 
          className="text-xl sm:text-2xl lg:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#FFE135] via-white to-[#FFE135] drop-shadow-md"
          style={{ fontFamily: "'Lilita One', cursive, sans-serif" }}
        >
          {category.label}
        </h2>
        <p className="text-slate-400 text-xs sm:text-sm mt-0.5">
          Terisi: <strong className="text-[#FFE135]">{totalFilled}</strong> dari <strong className="text-white">{totalQuota}</strong> Kuota ({category.remaining.length} sisa di roda)
        </p>

        {isFinished && (
          <div className="mt-2.5 inline-flex items-center gap-2 px-4 py-1.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black text-sm shadow-[0_0_20px_rgba(16,185,129,0.5)] animate-bounce">
            <Sparkles size={16} />
            <span>FINISH! SEMUA TIM LENGKAP 🏁🎉</span>
          </div>
        )}
      </div>

      {/* Bracket Turnamen Grid: Kiri - Trophy Tengah - Kanan */}
      <div className="relative flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 lg:gap-4 z-10 w-full min-w-0">
        
        {/* Kolom Tim Kiri */}
        <div className="w-full md:flex-1 space-y-3 min-w-[200px]">
          {leftTeams.map((team, idx) => (
            <TeamCard
              key={team.id}
              team={team}
              teamIndex={idx}
              isActive={activeTeam?.id === team.id}
              onUpdateName={(newName) => onUpdateTeamName(team.id, newName)}
            />
          ))}
        </div>

        {/* Konektor Siku Kiri (Tablet & Desktop) */}
        <BracketLines leftCount={leftTeams.length} rightCount={0} />

        {/* Pusat: Trophy Grand Prix Hub (Kompak & Simetris) */}
        <div className="flex flex-col items-center justify-center px-3 py-4 rounded-3xl bg-gradient-to-b from-[#0F3650] to-[#0A2234] border-2 border-[#FFE135]/50 shadow-2xl text-center relative group w-full md:w-32 lg:w-36 shrink-0 my-2 md:my-0">
          <div className="absolute -top-3 px-2 py-0.5 rounded-full bg-checkered-sm border border-[#FFE135] text-[9px] font-black text-black tracking-widest uppercase shadow">
            GRAND PRIX
          </div>

          <div className="relative my-1 transform group-hover:scale-105 transition-transform duration-300">
            <div className="text-4xl sm:text-5xl filter drop-shadow-[0_0_15px_rgba(255,225,53,0.5)] animate-pulse">
              🏆
            </div>
            {isFinished && (
              <div className="absolute -bottom-1 -right-1 text-base">
                🏁
              </div>
            )}
          </div>

          <h3 
            className="text-xs sm:text-sm font-black text-[#FFE135] tracking-wide mt-1"
            style={{ fontFamily: "'Lilita One', cursive, sans-serif" }}
          >
            BIKINI BOTTOM
          </h3>
          <span className="text-[10px] font-bold text-slate-300 tracking-wider">
            {isFinished ? 'SELESAI 🏁' : `${category.teams.length} TIM`}
          </span>

          <div className="mt-2 w-full border-t border-slate-700/80 pt-1.5 flex items-center justify-center gap-1 text-[10px] text-slate-400">
            <span>🏎️</span>
            <span>Maks {category.maxCapacityPerTeam || category.teams[0]?.quota || 10}/Tim</span>
          </div>
        </div>

        {/* Konektor Siku Kanan (Tablet & Desktop) */}
        <BracketLines leftCount={0} rightCount={rightTeams.length} />

        {/* Kolom Tim Kanan */}
        <div className="w-full md:flex-1 space-y-3 min-w-[200px]">
          {rightTeams.map((team, idx) => (
            <TeamCard
              key={team.id}
              team={team}
              teamIndex={leftCount + idx}
              isActive={activeTeam?.id === team.id}
              onUpdateName={(newName) => onUpdateTeamName(team.id, newName)}
            />
          ))}
        </div>

      </div>
    </div>
  );
};
