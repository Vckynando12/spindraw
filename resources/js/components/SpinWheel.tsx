import React, { useEffect, useRef, useCallback } from 'react';
import { Participant } from '../types';
import { sound } from '../lib/sound';

interface SpinWheelProps {
  items: Participant[];
  isSpinning: boolean;
  targetIndex?: number | null;
  onSpinEnd?: () => void;
  duration?: number; // seconds
  size?: number; // pixels
  fastSpin?: boolean;
  isFinished?: boolean;
}

const SEGMENT_COLORS = [
  { bg: '#FFE135', text: '#000000' }, // Kuning SpongeBob
  { bg: '#1CA3DE', text: '#FFFFFF' }, // Biru Laut
  { bg: '#E63946', text: '#FFFFFF' }, // Merah Balap
  { bg: '#FFFFFF', text: '#000000' }, // Putih Flag
  { bg: '#2EC4B6', text: '#FFFFFF' }, // Hijau Mint
  { bg: '#FF9F1C', text: '#000000' }, // Oranye
];

export const SpinWheel: React.FC<SpinWheelProps> = ({
  items,
  isSpinning,
  targetIndex,
  onSpinEnd,
  duration = 4.5,
  size = 460,
  fastSpin = false,
  isFinished = false
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const currentAngleRef = useRef<number>(0);
  const animationFrameRef = useRef<number | null>(null);
  const lastTickSegmentRef = useRef<number>(-1);

  const itemsRef = useRef(items);
  itemsRef.current = items;
  const lastNonEmptyItemsRef = useRef<Participant[]>(items);
  if (items.length > 0) {
    lastNonEmptyItemsRef.current = items;
  }

  const modeRef = useRef<'idle' | 'continuous' | 'stopping' | 'target'>('idle');
  const velocityRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);

  const onSpinEndRef = useRef(onSpinEnd);
  onSpinEndRef.current = onSpinEnd;

  // Gambar roda pada canvas
  const drawWheel = useCallback((angle: number, explicitItems?: Participant[]) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const center = (size / 2);
    const radius = center - 18; // Margin untuk ban luar

    // Selalu fallback ke lastNonEmptyItemsRef jika items sedang kosong (misal saat semua sudah terundi)
    let currentItems = explicitItems ?? (itemsRef.current.length > 0 ? itemsRef.current : lastNonEmptyItemsRef.current);

    ctx.save();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.scale(dpr, dpr);

    // 1. Gambar Ban Mobil Luar (Tire Tread)
    ctx.beginPath();
    ctx.arc(center, center, radius + 14, 0, 2 * Math.PI);
    ctx.fillStyle = '#1A1D20';
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#FFE135';
    ctx.stroke();

    // Pola gerigi ban luar (Tire Grooves)
    const groovesCount = 36;
    for (let g = 0; g < groovesCount; g++) {
      const gAngle = angle + (g * (2 * Math.PI / groovesCount));
      const gx1 = center + Math.cos(gAngle) * (radius + 4);
      const gy1 = center + Math.sin(gAngle) * (radius + 4);
      const gx2 = center + Math.cos(gAngle) * (radius + 13);
      const gy2 = center + Math.sin(gAngle) * (radius + 13);

      ctx.beginPath();
      ctx.moveTo(gx1, gy1);
      ctx.lineTo(gx2, gy2);
      ctx.strokeStyle = '#383D43';
      ctx.lineWidth = 2.5;
      ctx.stroke();
    }

    if (currentItems.length === 0) {
      // Tampilan roda jika benar-benar belum ada data peserta sama sekali
      ctx.beginPath();
      ctx.arc(center, center, radius, 0, 2 * Math.PI);
      ctx.fillStyle = '#0B3C5D';
      ctx.fill();
      ctx.font = 'bold 16px Outfit, sans-serif';
      ctx.fillStyle = '#FFFFFF';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Belum ada peserta', center, center);
      ctx.restore();
      return;
    }

    const arc = (2 * Math.PI) / currentItems.length;

    // 2. Gambar Setiap Segmen
    currentItems.forEach((item, index) => {
      const segAngle = angle + index * arc;
      const colorScheme = SEGMENT_COLORS[index % SEGMENT_COLORS.length];

      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.arc(center, center, radius, segAngle, segAngle + arc);
      ctx.closePath();
      ctx.fillStyle = colorScheme.bg;
      ctx.fill();

      // Border antar segmen
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = '#071E2F';
      ctx.stroke();

      // 3. Teks Nama Peserta di Segmen
      ctx.save();
      ctx.translate(center, center);
      ctx.rotate(segAngle + arc / 2);

      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = colorScheme.text;

      // Atur ukuran font dinamis tergantung banyaknya peserta
      let fontSize = 15;
      if (currentItems.length > 50) fontSize = 9;
      else if (currentItems.length > 35) fontSize = 11;
      else if (currentItems.length > 20) fontSize = 13;

      ctx.font = `bold ${fontSize}px "Outfit", sans-serif`;

      // Persingkat nama jika terlalu panjang
      let label = item.name;
      const maxChars = currentItems.length > 30 ? 12 : 18;
      if (label.length > maxChars) {
        label = label.slice(0, maxChars - 2) + '..';
      }

      ctx.fillText(label, radius - 16, 0);
      ctx.restore();
    });

    // 4. Hubcap Velg Roda Tengah (Racing Center Rim)
    const rimRadius = 46;
    const rimGradient = ctx.createRadialGradient(center, center, 5, center, center, rimRadius);
    rimGradient.addColorStop(0, '#FFF5A5');
    rimGradient.addColorStop(0.6, '#FFE135');
    rimGradient.addColorStop(1, '#B89B00');

    ctx.beginPath();
    ctx.arc(center, center, rimRadius, 0, 2 * Math.PI);
    ctx.fillStyle = rimGradient;
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#071E2F';
    ctx.stroke();

    // Baut Roda (Lug nuts)
    const lugCount = 5;
    for (let l = 0; l < lugCount; l++) {
      const lAngle = (l * (2 * Math.PI / lugCount)) + angle;
      const lx = center + Math.cos(lAngle) * (rimRadius - 14);
      const ly = center + Math.sin(lAngle) * (rimRadius - 14);

      ctx.beginPath();
      ctx.arc(lx, ly, 3.5, 0, 2 * Math.PI);
      ctx.fillStyle = '#071E2F';
      ctx.fill();
    }

    // Logo SpongeBob Grand Prix di tengah
    ctx.font = '22px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🍍', center, center);

    ctx.restore();
  }, [size, isFinished]);

  // Initial draw & resize handling
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;

    if (modeRef.current === 'idle') {
      drawWheel(currentAngleRef.current, items);
    }
  }, [size, items, drawWheel]);

  // Handler Animasi Spin
  useEffect(() => {
    // ── KONDISI 1: isSpinning false ──
    if (!isSpinning) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      modeRef.current = 'idle';
      drawWheel(currentAngleRef.current);
      return;
    }

    // ── KONDISI 2: Sudah berputar, jangan restart ──
    if (modeRef.current === 'continuous' || modeRef.current === 'target') {
      return;
    }

    const availableItems = itemsRef.current.length > 0 ? itemsRef.current : lastNonEmptyItemsRef.current;
    if (availableItems.length === 0) {
      return;
    }

    // ── CABANG A: Mode Target Berhenti (Dipakai PrizeDrawPage) ──
    if (targetIndex !== undefined && targetIndex !== null) {
      modeRef.current = 'target';
      sound.playEngineRev();

      const spinItems = [...availableItems];
      const actualDuration = fastSpin ? 2.0 : Math.max(3.5, duration);
      const startTime = performance.now();
      const startAngle = currentAngleRef.current;
      const arc = (2 * Math.PI) / spinItems.length;

      const targetSegmentCenter = targetIndex * arc + arc / 2;
      const normalizedTarget = (2 * Math.PI) - (targetSegmentCenter % (2 * Math.PI));

      const fullSpins = fastSpin ? 4 : 7;
      const currentNormalized = startAngle % (2 * Math.PI);
      let delta = normalizedTarget - currentNormalized;
      while (delta < 0) {
        delta += 2 * Math.PI;
      }
      const totalRotation = fullSpins * (2 * Math.PI) + delta;
      const finalAngle = startAngle + totalRotation;

      const easeOutQuint = (t: number) => 1 - Math.pow(1 - t, 5);

      const animateTarget = (now: number) => {
        const elapsed = (now - startTime) / 1000;
        const progress = Math.min(elapsed / actualDuration, 1);
        const easedProgress = easeOutQuint(progress);

        const currentAngle = startAngle + totalRotation * easedProgress;
        currentAngleRef.current = currentAngle;
        drawWheel(currentAngle, spinItems);

        const relativeAngle = ((2 * Math.PI) - (currentAngle % (2 * Math.PI))) % (2 * Math.PI);
        const currentSegment = Math.floor(relativeAngle / arc) % spinItems.length;

        if (currentSegment !== lastTickSegmentRef.current) {
          lastTickSegmentRef.current = currentSegment;
          sound.playTick(1 - progress * 0.4);
        }

        if (progress < 1) {
          animationFrameRef.current = requestAnimationFrame(animateTarget);
        } else {
          modeRef.current = 'idle';
          currentAngleRef.current = finalAngle;
          drawWheel(finalAngle, spinItems);
          sound.playFanfare();
          if (onSpinEndRef.current) {
            onSpinEndRef.current();
          }
        }
      };

      animationFrameRef.current = requestAnimationFrame(animateTarget);
      return () => {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
          animationFrameRef.current = null;
        }
      };
    }

    // ── CABANG B: Mode Continuous Roulette (Dipakai TeamDrawPage) ──
    modeRef.current = 'continuous';
    velocityRef.current = fastSpin ? 16 : 11; // rad/s (~1.75 rev/s)
    lastTimeRef.current = performance.now();
    sound.playEngineRev();

    const animateContinuous = (now: number) => {
      const dt = Math.min((now - lastTimeRef.current) / 1000, 0.1);
      lastTimeRef.current = now;

      currentAngleRef.current += velocityRef.current * dt;
      drawWheel(currentAngleRef.current);

      // Subtle tick sound saat roda berputar
      const currentItems = itemsRef.current.length > 0 ? itemsRef.current : lastNonEmptyItemsRef.current;
      if (currentItems.length > 0) {
        const arc = (2 * Math.PI) / currentItems.length;
        const relAngle = ((2 * Math.PI) - (currentAngleRef.current % (2 * Math.PI))) % (2 * Math.PI);
        const seg = Math.floor(relAngle / arc) % currentItems.length;
        if (seg !== lastTickSegmentRef.current) {
          lastTickSegmentRef.current = seg;
          sound.playTick(0.4);
        }
      }

      animationFrameRef.current = requestAnimationFrame(animateContinuous);
    };

    animationFrameRef.current = requestAnimationFrame(animateContinuous);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [isSpinning, targetIndex, duration, fastSpin, drawWheel]);

  return (
    <div className="relative inline-flex items-center justify-center p-3">
      {/* Outer Glow Halo */}
      <div className={`absolute -inset-2 rounded-full transition-all duration-700 pointer-events-none ${
        isSpinning 
          ? 'bg-gradient-to-r from-yellow-400 via-red-500 to-blue-500 blur-xl opacity-60 animate-pulse' 
          : 'bg-blue-600/20 blur-md opacity-30'
      }`} />

      {/* Canvas Roda */}
      <canvas
        ref={canvasRef}
        className="relative z-10 drop-shadow-2xl select-none"
      />

      {/* Pointer Berbentuk Bendera Finish / Anak Panah Racing (di sisi KANAN menunjuk ke kiri) */}
      <div 
        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 z-20 flex items-center pointer-events-none filter drop-shadow-lg"
        title="Pointer Bendera Finish"
      >
        <div className="relative flex items-center">
          {/* Segitiga panah emas */}
          <div className="w-0 h-0 border-y-[16px] border-y-transparent border-r-[32px] border-r-[#FFE135] filter drop-shadow" />
          {/* Bendera Finish Badge */}
          <div className="w-9 h-9 rounded-md bg-checkered-sm border-2 border-[#FFE135] shadow-md flex items-center justify-center -ml-1">
            <span className="text-xs">🏁</span>
          </div>
        </div>
      </div>
    </div>
  );
};
