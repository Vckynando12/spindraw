import React, { useState } from 'react';
import { sound } from '../lib/sound';

interface StartLightsProps {
  onStart: () => void;
  disabled: boolean;
  fastSpin?: boolean;
}

export const StartLights: React.FC<StartLightsProps> = ({
  onStart,
  disabled,
  fastSpin = false
}) => {
  const [sequenceStep, setSequenceStep] = useState<'idle' | 'red' | 'yellow' | 'green'>('idle');

  const handleStartSequence = () => {
    if (disabled || sequenceStep !== 'idle') return;

    if (fastSpin) {
      sound.playLightBeep(true);
      onStart();
      return;
    }

    // Racing Start sequence: Merah -> Kuning -> Hijau (GO!)
    setSequenceStep('red');
    sound.playLightBeep(false);

    setTimeout(() => {
      setSequenceStep('yellow');
      sound.playLightBeep(false);

      setTimeout(() => {
        setSequenceStep('green');
        sound.playLightBeep(true);

        setTimeout(() => {
          setSequenceStep('idle');
          onStart();
        }, 300);
      }, 400);
    }, 400);
  };

  const isRed = sequenceStep === 'red';
  const isYellow = sequenceStep === 'yellow';
  const isGreen = sequenceStep === 'green';

  return (
    <div className="flex flex-col items-center gap-2">
      {/* Lampu Start Balap (Gantry Lights) */}
      <div className="flex items-center gap-2.5 px-4 py-2 bg-gradient-to-b from-[#1C1F26] to-[#0A0C10] rounded-2xl border-2 border-[#2E3440] shadow-xl">
        {/* Lampu Merah */}
        <div
          className={`w-6 h-6 rounded-full border-2 transition-all duration-200 ${
            isRed
              ? 'bg-red-500 border-white shadow-[0_0_15px_#EF4444] scale-110'
              : 'bg-red-950/60 border-red-900/40 opacity-40'
          }`}
          title="Merah (Siap)"
        />

        {/* Lampu Kuning */}
        <div
          className={`w-6 h-6 rounded-full border-2 transition-all duration-200 ${
            isYellow
              ? 'bg-yellow-400 border-white shadow-[0_0_15px_#FACC15] scale-110'
              : 'bg-yellow-950/60 border-yellow-900/40 opacity-40'
          }`}
          title="Kuning (Awas)"
        />

        {/* Lampu Hijau */}
        <div
          className={`w-6 h-6 rounded-full border-2 transition-all duration-200 ${
            isGreen
              ? 'bg-emerald-400 border-white shadow-[0_0_15px_#34D399] scale-110'
              : 'bg-emerald-950/60 border-emerald-900/40 opacity-40'
          }`}
          title="Hijau (Mulai!)"
        />
      </div>

      {/* Tombol Utama SPIN */}
      <button
        onClick={handleStartSequence}
        disabled={disabled || sequenceStep !== 'idle'}
        className={`group relative px-8 py-3.5 rounded-2xl font-black text-xl tracking-wider transition-all duration-200 transform active:scale-95 shadow-xl select-none flex items-center gap-3 ${
          disabled || sequenceStep !== 'idle'
            ? 'bg-slate-700/60 text-slate-400 cursor-not-allowed border-2 border-slate-600'
            : 'bg-gradient-to-r from-[#FFE135] via-[#FFD700] to-[#FFA000] text-black hover:brightness-110 hover:shadow-[0_0_25px_rgba(255,225,53,0.6)] border-2 border-white'
        }`}
        style={{ fontFamily: "'Lilita One', cursive, sans-serif" }}
      >
        <span className="text-2xl group-hover:animate-bounce">🏁</span>
        <span>
          {sequenceStep === 'red' && 'READY...'}
          {sequenceStep === 'yellow' && 'SET...'}
          {sequenceStep === 'green' && 'GO! 🏎️'}
          {sequenceStep === 'idle' && (disabled ? 'SEDANG MEMUTAR...' : 'PUTAR RODA (SPIN)!')}
        </span>
        <span className="text-2xl group-hover:rotate-12 transition-transform">🏎️</span>
      </button>
    </div>
  );
};
