import React from 'react';

interface BallastLogoProps {
  variant?: 'horizontal' | 'stacked' | 'minimal';
  surface?: 'light' | 'dark' | 'azul-lastro';
  size?: number;
}

export const SwanMark: React.FC<{ tone?: 'light' | 'dark'; size?: number }> = ({
  tone = 'light',
  size = 28,
}) => (
  <img
    src={tone === 'light' ? '/ballast-swan-white.png' : '/ballast-swan-dark.png'}
    alt="Cisne oficial Ballast Architecture"
    width={size}
    height={Math.round(size * 0.79)}
    style={{
      width: `${size}px`,
      height: `${Math.round(size * 0.79)}px`,
      objectFit: 'contain',
      display: 'block',
      flexShrink: 0,
    }}
  />
);

export const BallastLogo: React.FC<BallastLogoProps> = ({
  variant = 'horizontal',
  surface = 'light',
  size = 28,
}) => {
  const tileBg = surface === 'dark' || surface === 'azul-lastro' ? '#FFFFFF' : '#2F5872';
  const swanTone: 'light' | 'dark' = surface === 'dark' || surface === 'azul-lastro' ? 'dark' : 'light';
  const textColor = surface === 'dark' || surface === 'azul-lastro' ? '#FFFFFF' : '#242A2D';
  const subColor = surface === 'dark' || surface === 'azul-lastro' ? 'rgba(255,255,255,0.74)' : '#546168';

  const badge = (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: tileBg,
        borderRadius: '6px',
        padding: `${Math.max(6, Math.round(size * 0.26))}px ${Math.max(9, Math.round(size * 0.38))}px`,
        flexShrink: 0,
      }}
    >
      <SwanMark tone={swanTone} size={size} />
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
              fontSize: `${Math.round(size * 0.78)}px`,
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
            fontSize: `${Math.max(17, Math.round(size * 0.7))}px`,
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
