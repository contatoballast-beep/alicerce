import React from 'react';

interface HouseSVGProps {
  progress: number; // 0 to 100
}

export const HouseSVG: React.FC<HouseSVGProps> = ({ progress }) => {
  // The SVG viewBox height is 220. Fill goes from bottom (220) upward.
  const svgHeight = 220;
  const fillHeight = (progress / 100) * svgHeight;
  const fillY = svgHeight - fillHeight;

  return (
    <svg
      viewBox="0 0 260 220"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: '100%', maxWidth: 320, display: 'block', margin: '0 auto' }}
      aria-label={`Casa ${Math.round(progress)}% construída`}
    >
      <defs>
        {/* Animated clip path — grows from bottom to top */}
        <clipPath id="house-fill-clip">
          <rect
            x="0"
            y={fillY}
            width="260"
            height={fillHeight}
            style={{ transition: 'y 0.7s cubic-bezier(0.4, 0, 0.2, 1), height 0.7s cubic-bezier(0.4, 0, 0.2, 1)' }}
          />
        </clipPath>

        {/* House shape clip — everything outside the house silhouette is hidden */}
        <clipPath id="house-shape-clip">
          {/* Telhado */}
          <polygon points="130,10 10,90 250,90" />
          {/* Corpo da casa */}
          <rect x="30" y="88" width="200" height="122" />
        </clipPath>
      </defs>

      {/* ── BACKGROUND FILL (painted, clipped to progress) ── */}
      <g clipPath="url(#house-shape-clip)">
        <g clipPath="url(#house-fill-clip)">
          {/* Base fill color — terracota */}
          <rect x="0" y="0" width="260" height="220" fill="#EA580C" opacity="0.15" />
          {/* Telhado fill */}
          <polygon points="130,10 10,90 250,90" fill="#EA580C" opacity="0.7" />
          {/* Paredes fill */}
          <rect x="30" y="88" width="200" height="122" fill="#FEE2D5" />
          {/* Tijolos pattern */}
          {[0, 1, 2, 3, 4, 5].map(row => (
            <g key={row}>
              {[0, 1, 2, 3].map(col => (
                <rect
                  key={col}
                  x={32 + col * 50 + (row % 2 === 0 ? 0 : 25)}
                  y={100 + row * 17}
                  width="44"
                  height="13"
                  rx="1"
                  fill="none"
                  stroke="#EA580C"
                  strokeWidth="0.8"
                  opacity="0.5"
                />
              ))}
            </g>
          ))}
        </g>
      </g>

      {/* ── STROKE OUTLINE (always visible, blueprint style) ── */}
      {/* Telhado (telhado outline) */}
      <polygon
        points="130,10 10,90 250,90"
        fill="none"
        stroke="#1E3A8A"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      {/* Cumeeira */}
      <line x1="10" y1="90" x2="250" y2="90" stroke="#1E3A8A" strokeWidth="2" />
      {/* Chaminé */}
      <rect x="170" y="28" width="18" height="38" fill="none" stroke="#1E3A8A" strokeWidth="2" rx="1" />

      {/* Paredes */}
      <rect x="30" y="90" width="200" height="120" fill="none" stroke="#1E3A8A" strokeWidth="2.5" rx="2" />

      {/* Porta */}
      <rect x="107" y="148" width="46" height="62" fill="none" stroke="#1E3A8A" strokeWidth="2" rx="3" />
      {/* Maçaneta */}
      <circle cx="147" cy="180" r="3" fill="#1E3A8A" />
      {/* Arco da porta */}
      <path d="M 107 148 Q 130 128 153 148" fill="none" stroke="#1E3A8A" strokeWidth="1.5" />

      {/* Janela esquerda */}
      <rect x="46" y="110" width="44" height="38" fill="none" stroke="#1E3A8A" strokeWidth="2" rx="2" />
      <line x1="68" y1="110" x2="68" y2="148" stroke="#1E3A8A" strokeWidth="1" />
      <line x1="46" y1="129" x2="90" y2="129" stroke="#1E3A8A" strokeWidth="1" />

      {/* Janela direita */}
      <rect x="170" y="110" width="44" height="38" fill="none" stroke="#1E3A8A" strokeWidth="2" rx="2" />
      <line x1="192" y1="110" x2="192" y2="148" stroke="#1E3A8A" strokeWidth="1" />
      <line x1="170" y1="129" x2="214" y2="129" stroke="#1E3A8A" strokeWidth="1" />

      {/* Calçada / base */}
      <rect x="10" y="210" width="240" height="6" rx="2" fill="#1E3A8A" opacity="0.3" />
      <line x1="10" y1="210" x2="250" y2="210" stroke="#1E3A8A" strokeWidth="1.5" />

      {/* Degraus da porta */}
      <rect x="100" y="208" width="60" height="4" rx="1" fill="none" stroke="#1E3A8A" strokeWidth="1.5" />

      {/* Progress label inside house */}
      {progress > 5 && (
        <text
          x="130"
          y="98"
          textAnchor="middle"
          fontSize="11"
          fontFamily="'Plus Jakarta Sans', sans-serif"
          fontWeight="700"
          fill="#EA580C"
          opacity="0.9"
        >
          {Math.round(progress)}%
        </text>
      )}
    </svg>
  );
};
