import React from 'react';

interface BallastLogoProps {
  variant?: 'horizontal' | 'stacked' | 'minimal';
  surface?: 'light' | 'dark' | 'azul-lastro';
  size?: number;
}

export const SwanMark: React.FC<{ color?: string; accentColor?: string; size?: number }> = ({
  color = '#FFFFFF',
  accentColor = '#DDE5EA',
  size = 28,
}) => (
  <svg
    width={size}
    height={Math.round(size * 0.78)}
    viewBox="0 0 100 78"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    style={{ display: 'block', flexShrink: 0 }}
  >
    <polygon points="73,6 85,10 81,22 69,18" fill={color} />
    <polygon points="85,10 96,21 82,22" fill={accentColor} />
    <polygon points="73,6 62,15 69,18" fill={accentColor} />
    <polygon points="62,15 69,18 66,35 58,28" fill={color} />
    <polygon points="66,35 76,50 67,56 58,28" fill={accentColor} />
    <polygon points="76,50 86,65 73,74 67,56" fill={color} />
    <polygon points="67,56 73,74 52,74 58,56" fill={accentColor} />
    <polygon points="58,56 52,74 30,74 44,53" fill={color} />
    <polygon points="44,53 30,74 16,60 28,49" fill={accentColor} />
    <polygon points="58,56 44,53 49,38 66,46" fill={color} />
    <polygon points="49,38 44,53 28,49 21,36" fill={accentColor} />
    <polygon points="49,38 21,36 12,24 38,29" fill={color} />
    <polygon points="28,49 16,60 6,46 19,43" fill={color} />
  </svg>
);

export const BallastLogo: React.FC<BallastLogoProps> = ({
  variant = 'horizontal',
  surface = 'light',
  size = 26,
}) => {
  const tileBg = surface === 'dark' ? '#FFFFFF' : surface === 'azul-lastro' ? '#FFFFFF' : '#2F5872';
  const swanPrimary = surface === 'dark' || surface === 'azul-lastro' ? '#242A2D' : '#FFFFFF';
  const swanAccent = surface === 'dark' || surface === 'azul-lastro' ? '#4B5A63' : '#D5E1E8';
  const textColor = surface === 'dark' || surface === 'azul-lastro' ? '#FFFFFF' : '#242A2D';
  const subColor = surface === 'dark' || surface === 'azul-lastro' ? 'rgba(255,255,255,0.72)' : '#526068';

  const badge = (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: tileBg,
        borderRadius: '6px',
        padding: `${Math.max(6, Math.round(size * 0.28))}px ${Math.max(9, Math.round(size * 0.42))}px`,
        flexShrink: 0,
      }}
    >
      <SwanMark color={swanPrimary} accentColor={swanAccent} size={size} />
    </span>
  );

  if (variant === 'minimal') {
    return badge;
  }

  if (variant === 'stacked') {
    return (
      <span style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: '8px', userSelect: 'none' }}>
        {badge}
        <span style={{ textAlign: 'center', lineHeight: 1.1 }}>
          <span
            style={{
              display: 'block',
              fontFamily: 'var(--font-display)',
              fontSize: `${Math.round(size * 0.8)}px`,
              fontWeight: 600,
              color: textColor,
              letterSpacing: '-0.01em',
            }}
          >
            Ballast
          </span>
          <span
            style={{
              display: 'block',
              fontFamily: 'var(--font-body)',
              fontSize: '10px',
              fontWeight: 600,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: subColor,
              marginTop: '2px',
            }}
          >
            Architecture
          </span>
        </span>
      </span>
    );
  }

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '11px', userSelect: 'none' }}>
      {badge}
      <span style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.05 }}>
        <span
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: `${Math.max(17, Math.round(size * 0.72))}px`,
            fontWeight: 600,
            color: textColor,
            letterSpacing: '-0.015em',
          }}
        >
          Ballast
        </span>
        <span
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '9.5px',
            fontWeight: 600,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: subColor,
            marginTop: '2px',
          }}
        >
          Architecture
        </span>
      </span>
    </span>
  );
};
