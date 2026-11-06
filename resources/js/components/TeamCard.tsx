import React, { useState } from 'react';
import { Team } from '../types';
import { CheckCircle2, Trophy, Edit2, Check } from 'lucide-react';

interface TeamCardProps {
  team: Team;
  teamIndex: number;
  isActive: boolean;
  onUpdateName?: (newName: string) => void;
}

export const TeamCard: React.FC<TeamCardProps> = ({
  team,
  teamIndex,
  isActive,
  onUpdateName
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(team.name);

  const isFull = team.members.length >= team.quota;
  const progressPercent = Math.min(100, Math.round((team.members.length / team.quota) * 100));

  const handleSaveName = () => {
    if (editedName.trim() && onUpdateName) {
      onUpdateName(editedName.trim());
    }
    setIsEditing(false);
  };

  return (
    <div
      id={`team-card-${team.id}`}
      className={`relative w-full rounded-2xl p-4 transition-all duration-300 border-2 select-none ${
        isActive
          ? 'bg-gradient-to-br from-[#0F3854] to-[#072438] border-[#FFE135] shadow-[0_0_25px_rgba(255,225,53,0.35)] ring-2 ring-[#FFE135]/40 scale-[1.02] z-10'
          : isFull
          ? 'bg-gradient-to-br from-[#0B2E42]/90 to-[#071E2F]/90 border-emerald-500/60 shadow-md'
          : 'bg-[#0A2738]/80 border-slate-700/60 opacity-90 hover:border-slate-500'
      }`}
    >
      {/* Active Glowing Header Badge */}
      {isActive && (
        <div className="absolute -top-3.5 right-4 px-3 py-0.5 rounded-full bg-[#FFE135] text-black text-xs font-black tracking-wider uppercase flex items-center gap-1 shadow-lg animate-bounce">
          <span>🏎️</span>
          <span>Sedang Diisi</span>
        </div>
      )}

      {isFull && (
        <div className="absolute -top-3.5 right-4 px-3 py-0.5 rounded-full bg-emerald-500 text-white text-xs font-black tracking-wider uppercase flex items-center gap-1 shadow-md">
          <CheckCircle2 size={13} />
          <span>Finish! 🏁</span>
        </div>
      )}

      {/* Team Header */}
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2 flex-1 min-w-0 mr-2">
          <span className="text-2xl filter drop-shadow">{team.icon || '🏎️'}</span>
          {isEditing ? (
            <div className="flex items-center gap-1 flex-1">
              <input
                type="text"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                className="bg-slate-900 border border-[#FFE135] rounded px-2 py-0.5 text-sm font-bold text-white w-full focus:outline-none"
                autoFocus
              />
              <button
                onClick={handleSaveName}
                className="p-1 rounded bg-[#FFE135] text-black hover:bg-yellow-400"
                title="Simpan nama"
              >
                <Check size={14} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 min-w-0">
              <h3 
                className="font-black text-base text-white truncate hover:text-[#FFE135] cursor-pointer"
                style={{ fontFamily: "'Lilita One', cursive, sans-serif" }}
                onClick={() => setIsEditing(true)}
                title="Klik untuk mengubah nama tim"
              >
                {team.name}
              </h3>
              <button
                onClick={() => setIsEditing(true)}
                className="text-slate-400 hover:text-[#FFE135] p-0.5 transition-colors"
                title="Ubah nama"
              >
                <Edit2 size={12} />
              </button>
            </div>
          )}
        </div>

        {/* Quota Badge */}
        <div className={`px-2.5 py-1 rounded-lg text-xs font-black flex items-center gap-1 ${
          isFull 
            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' 
            : isActive
            ? 'bg-[#FFE135]/20 text-[#FFE135] border border-[#FFE135]/50'
            : 'bg-slate-800 text-slate-300 border border-slate-700'
        }`}>
          <span>{team.members.length}</span>
          <span className="opacity-60">/</span>
          <span>{team.quota}</span>
        </div>
      </div>

      {/* Race Track Style Progress Bar */}
      <div className="relative mb-3">
        <div className="w-full h-3 bg-slate-900/90 rounded-full overflow-hidden border border-slate-700/60 p-0.5">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isFull
                ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                : 'bg-gradient-to-r from-amber-400 via-yellow-400 to-[#FFE135]'
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        {/* Mobil kecil yang melaju di atas progress track */}
        <div
          className="absolute -top-2 transition-all duration-500 pointer-events-none text-xs transform -translate-x-1/2"
          style={{ left: `${Math.max(5, Math.min(95, progressPercent))}%` }}
        >
          🏎️
        </div>
      </div>

      {/* Slots List (Sesuai Kuota) */}
      <div className="space-y-1.5 pr-1">
        {Array.from({ length: team.quota }).map((_, slotIndex) => {
          const member = team.members[slotIndex];
          const isSlotFilled = Boolean(member);

          return (
            <div
              key={slotIndex}
              className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-all ${
                isSlotFilled
                  ? 'bg-gradient-to-r from-slate-800/90 to-slate-900/90 border border-slate-700 text-slate-100 font-semibold shadow-sm'
                  : 'bg-slate-900/40 border border-dashed border-slate-700/50 text-slate-500 italic'
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  isSlotFilled ? 'bg-[#1CA3DE] text-white' : 'bg-slate-800 text-slate-500'
                }`}>
                  {slotIndex + 1}
                </span>
                <span className="truncate">
                  {isSlotFilled ? member.name : '— kosong —'}
                </span>
              </div>

              {isSlotFilled && (
                <span className="text-[11px] text-emerald-400 font-bold">✓</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
