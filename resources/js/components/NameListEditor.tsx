import React, { useState, useEffect } from 'react';
import { usePrizeStore } from '../store/prizeStore';
import { shuffle } from '../lib/random';
import { Shuffle, ArrowUpDown, Trash2, Upload, FileText, Check } from 'lucide-react';

export const NameListEditor: React.FC = () => {
  const {
    participants,
    setParticipants,
    clearParticipants,
    shuffleParticipantsList,
    sortParticipantsAlphabetically
  } = usePrizeStore();

  const [text, setText] = useState('');
  const [copied, setCopied] = useState(false);

  // Sync internal text state with participants
  useEffect(() => {
    setText(participants.map((p) => p.name).join('\n'));
  }, [participants]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setText(val);

    const lines = val
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    const updated = lines.map((name, index) => ({
      id: `p-${index}-${name}`,
      name
    }));

    setParticipants(updated);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const lines = content
          .split(/\r?\n/)
          .map((l) => l.trim().replace(/^"|"$/g, ''))
          .filter((l) => l.length > 0);

        const updated = lines.map((name, index) => ({
          id: `p-${index}-${Date.now().toString(36)}`,
          name
        }));
        setParticipants(updated);
      }
    };
    reader.readAsText(file);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-[#081F30] rounded-2xl border border-slate-700/80 p-4 shadow-xl">
      {/* Action Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-3 border-b border-slate-700/60">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-lg bg-[#FFE135]/20 text-[#FFE135] text-xs font-black border border-[#FFE135]/40">
            {participants.length} Nama
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={shuffleParticipantsList}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center gap-1 border border-slate-700"
            title="Acak Urutan Nama"
          >
            <Shuffle size={13} className="text-yellow-400" />
            <span>Acak</span>
          </button>

          <button
            onClick={sortParticipantsAlphabetically}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center gap-1 border border-slate-700"
            title="Urutkan A sampai Z"
          >
            <ArrowUpDown size={13} className="text-blue-400" />
            <span>A–Z</span>
          </button>

          <label className="cursor-pointer px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center gap-1 border border-slate-700">
            <Upload size={13} className="text-emerald-400" />
            <span>Import</span>
            <input
              type="file"
              accept=".txt,.csv"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>

          <button
            onClick={clearParticipants}
            className="px-2.5 py-1 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-300 text-xs font-bold transition flex items-center gap-1 border border-red-900/50"
            title="Hapus Semua Nama"
          >
            <Trash2 size={13} />
            <span>Hapus</span>
          </button>
        </div>
      </div>

      {/* Textarea Editor */}
      <div className="flex-1 min-h-[280px] relative">
        <textarea
          value={text}
          onChange={handleTextChange}
          placeholder="Ketik atau tempel daftar nama di sini (1 nama per baris)..."
          className="w-full h-full min-h-[280px] p-3 rounded-xl bg-slate-950/90 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 font-sans focus:outline-none focus:border-[#FFE135] focus:ring-1 focus:ring-[#FFE135] resize-none"
        />
      </div>

      {/* Footer Info */}
      <div className="flex items-center justify-between mt-2 pt-2 text-[11px] text-slate-400">
        <span>Roda diperbarui otomatis secara real-time</span>
        <button
          onClick={handleCopy}
          className="hover:text-white transition flex items-center gap-1 font-semibold"
        >
          {copied ? <Check size={12} className="text-emerald-400" /> : <FileText size={12} />}
          <span>{copied ? 'Tersalin!' : 'Salin Semua'}</span>
        </button>
      </div>
    </div>
  );
};
