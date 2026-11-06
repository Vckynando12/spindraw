import React, { useState } from 'react';
import { parseParticipantNames, generateDefaultParticipants, calculateTeamQuotas } from '../lib/teams';
import { Participant } from '../types';
import { Users, Upload, FileText, CheckCircle, X, AlertCircle, Sliders } from 'lucide-react';

interface ParticipantInputProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (participants: Participant[], maxCapacity: number, customTeamCount?: number) => void;
  currentCount: number;
  currentCapacity?: number;
  currentTeamCount?: number;
  categoryLabel: string;
}

export const ParticipantInput: React.FC<ParticipantInputProps> = ({
  isOpen,
  onClose,
  onSubmit,
  currentCount,
  currentCapacity = 10,
  currentTeamCount,
  categoryLabel
}) => {
  const [mode, setMode] = useState<'text' | 'count'>('text');
  const [textInput, setTextInput] = useState('');
  const [countInput, setCountInput] = useState<number>(currentCount || 30);
  
  // Pengaturan fleksibel kapasitas dan jumlah tim
  const [capacityInput, setCapacityInput] = useState<number>(currentCapacity || 10);
  const [teamCountMode, setTeamCountMode] = useState<'auto' | 'custom'>(currentTeamCount ? 'custom' : 'auto');
  const [customTeamCountInput, setCustomTeamCountInput] = useState<number>(currentTeamCount || 4);

  if (!isOpen) return null;

  // Hitung preview kuota secara real-time
  const parsedNames = parseParticipantNames(textInput);
  const totalPreviewCount = mode === 'text' ? parsedNames.length : countInput;
  const effectiveCustomTeam = teamCountMode === 'custom' ? customTeamCountInput : undefined;
  const quotas = calculateTeamQuotas(totalPreviewCount, capacityInput, effectiveCustomTeam);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const effectiveCapacity = Math.max(1, capacityInput);
    const effectiveTeamCount = teamCountMode === 'custom' ? Math.max(1, customTeamCountInput) : undefined;

    if (mode === 'text') {
      if (parsedNames.length === 0) return;
      onSubmit(parsedNames, effectiveCapacity, effectiveTeamCount);
    } else {
      if (countInput <= 0) return;
      const generated = generateDefaultParticipants(countInput, 'Peserta');
      onSubmit(generated, effectiveCapacity, effectiveTeamCount);
    }
    onClose();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setTextInput(content);
        setMode('text');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-xl rounded-3xl bg-[#0B2538] border-2 border-[#1CA3DE] shadow-2xl p-6 text-white max-h-[92vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X size={20} />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-[#FFE135] text-black flex items-center justify-center text-2xl shadow-lg">
            👥
          </div>
          <div>
            <h3 
              className="text-xl font-black text-white"
              style={{ fontFamily: "'Lilita One', cursive, sans-serif" }}
            >
              Atur Peserta & Kuota — {categoryLabel}
            </h3>
            <p className="text-xs text-slate-300">
              Jumlah peserta dan kapasitas tim bebas Anda sesuaikan
            </p>
          </div>
        </div>

        {/* Mode Selector Tabs */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-900 rounded-xl mb-4 border border-slate-700">
          <button
            type="button"
            onClick={() => setMode('text')}
            className={`py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 ${
              mode === 'text'
                ? 'bg-[#1CA3DE] text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileText size={14} />
            <span>Tempel Nama Peserta</span>
          </button>

          <button
            type="button"
            onClick={() => setMode('count')}
            className={`py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 ${
              mode === 'count'
                ? 'bg-[#1CA3DE] text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users size={14} />
            <span>Isi Jumlah Peserta Saja</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'text' ? (
            <div>
              <div className="flex items-center justify-between mb-1.5 text-xs">
                <label className="text-slate-300 font-bold">
                  Daftar Nama (1 nama per baris):
                </label>
                <label className="cursor-pointer text-[#FFE135] hover:underline flex items-center gap-1 font-semibold">
                  <Upload size={12} />
                  <span>Import File CSV / TXT</span>
                  <input
                    type="file"
                    accept=".csv,.txt"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              <textarea
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                rows={6}
                placeholder="Contoh:&#10;Muhammad Alif&#10;Siti Nurhaliza&#10;Kenzo Tanaka&#10;Aisyah Zahra..."
                className="w-full rounded-2xl bg-slate-950 border border-slate-700 p-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#FFE135] focus:ring-1 focus:ring-[#FFE135] font-mono resize-none"
              />

              <div className="text-xs text-slate-400 mt-1 flex justify-between">
                <span>Terdeteksi: <strong className="text-[#FFE135]">{parsedNames.length}</strong> nama</span>
                {parsedNames.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setTextInput('')}
                    className="text-red-400 hover:underline"
                  >
                    Bersihkan
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="py-2">
              <label className="block text-xs font-bold text-slate-200 mb-1.5 uppercase tracking-wider">
                Total Jumlah Peserta:
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min={1}
                  max={500}
                  value={countInput}
                  onChange={(e) => setCountInput(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  className="w-28 rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-base font-black text-center text-[#FFE135] focus:outline-none focus:border-[#FFE135]"
                />
                <div className="flex flex-wrap gap-1.5">
                  {[16, 24, 30, 40, 43, 50, 60].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setCountInput(num)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition ${
                        countInput === num
                          ? 'bg-[#FFE135] text-black border-[#FFE135]'
                          : 'bg-slate-800 text-slate-300 border-slate-700 hover:border-slate-500'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Konfigurasi Kapasitas & Jumlah Tim */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-700 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-[#FFE135] uppercase tracking-wider">
              <Sliders size={14} />
              <span>Pengaturan Pembagian Tim:</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Kapasitas Maksimal */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Kapasitas Maksimal / Tim:
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCapacityInput(Math.max(2, capacityInput - 1))}
                    className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 font-black text-lg flex items-center justify-center border border-slate-600"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min={2}
                    max={50}
                    value={capacityInput}
                    onChange={(e) => setCapacityInput(Math.max(2, parseInt(e.target.value, 10) || 2))}
                    className="w-16 rounded-lg bg-slate-950 border border-slate-700 py-1 text-center font-black text-[#FFE135]"
                  />
                  <button
                    type="button"
                    onClick={() => setCapacityInput(capacityInput + 1)}
                    className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 font-black text-lg flex items-center justify-center border border-slate-600"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Opsi Jumlah Tim */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Penentuan Jumlah Tim:
                </label>
                <div className="flex items-center gap-2">
                  <select
                    value={teamCountMode}
                    onChange={(e) => setTeamCountMode(e.target.value as 'auto' | 'custom')}
                    className="rounded-lg bg-slate-950 border border-slate-700 px-2 py-1.5 text-xs text-white focus:outline-none"
                  >
                    <option value="auto">Otomatis (Sesuai Kapasitas)</option>
                    <option value="custom">Kustom (Tentukan Tim)</option>
                  </select>

                  {teamCountMode === 'custom' && (
                    <input
                      type="number"
                      min={1}
                      max={30}
                      value={customTeamCountInput}
                      onChange={(e) => setCustomTeamCountInput(Math.max(1, parseInt(e.target.value, 10) || 1))}
                      className="w-14 rounded-lg bg-slate-950 border border-slate-700 py-1 text-center font-bold text-[#1CA3DE] text-xs"
                      title="Jumlah Tim yang diinginkan"
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Simulasi Live Kuota Seimbang */}
            <div className="pt-2 border-t border-slate-800">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300 mb-1.5">
                <AlertCircle size={13} className="text-[#FFE135]" />
                <span>Simulasi Hasil Pembagian Kuota Seimbang:</span>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-xs text-slate-400 font-semibold mr-1">
                  {quotas.length} Tim Terbentuk:
                </span>
                {quotas.map((q, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded-md bg-[#1CA3DE]/20 text-[#1CA3DE] text-xs font-bold border border-[#1CA3DE]/40"
                  >
                    Tim {idx + 1}: {q}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-sm font-bold text-slate-400 hover:text-white transition"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={totalPreviewCount <= 0}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#FFE135] to-[#FFA000] text-black font-black text-sm shadow-lg hover:brightness-110 disabled:opacity-50 transition"
              style={{ fontFamily: "'Lilita One', cursive, sans-serif" }}
            >
              Terapkan Peserta & Tim 🏁
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
