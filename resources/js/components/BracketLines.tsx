import React from 'react';

interface BracketLinesProps {
  leftCount: number;
  rightCount: number;
}

export const BracketLines: React.FC<BracketLinesProps> = ({ leftCount, rightCount }) => {
  return (
    <div className="hidden md:flex flex-col items-center justify-center w-6 lg:w-8 shrink-0 h-full relative pointer-events-none select-none">
      <svg className="w-full h-full min-h-[320px]" viewBox="0 0 100 400" preserveAspectRatio="none">
        <defs>
          <linearGradient id="bracketGlow" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#1CA3DE" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#FFE135" stopOpacity="1" />
            <stop offset="100%" stopColor="#1CA3DE" stopOpacity="0.8" />
          </linearGradient>
          <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Garis Kiri menuju Pusat (50, 200) */}
        {Array.from({ length: leftCount }).map((_, i) => {
          const yPos = ((i + 0.5) / leftCount) * 400;
          return (
            <path
              key={`left-${i}`}
              d={`M 0 ${yPos} H 30 Q 40 ${yPos} 40 ${yPos < 200 ? yPos + 15 : yPos - 15} V 200 H 50`}
              fill="none"
              stroke="url(#bracketGlow)"
              strokeWidth="3"
              strokeDasharray="4 2"
              filter="url(#neonGlow)"
              className="animate-pulse"
            />
          );
        })}

        {/* Garis Kanan menuju Pusat (50, 200) */}
        {Array.from({ length: rightCount }).map((_, i) => {
          const yPos = ((i + 0.5) / rightCount) * 400;
          return (
            <path
              key={`right-${i}`}
              d={`M 100 ${yPos} H 70 Q 60 ${yPos} 60 ${yPos < 200 ? yPos + 15 : yPos - 15} V 200 H 50`}
              fill="none"
              stroke="url(#bracketGlow)"
              strokeWidth="3"
              strokeDasharray="4 2"
              filter="url(#neonGlow)"
              className="animate-pulse"
            />
          );
        })}
      </svg>
    </div>
  );
};
