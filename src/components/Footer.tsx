import React from 'react';
import { Lock, FileCode2 } from 'lucide-react';

interface FooterProps {
  onOpenLGPD: () => void;
  onOpenSwagger: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenLGPD, onOpenSwagger }) => {
  return (
    <footer style={{ borderTop: '1px solid var(--steel-line)', padding: '32px 28px', background: 'var(--white)', marginTop: '60px' }}>
      <div style={{ maxWidth: '1120px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
        
        <div className="wordmark">
          <span className="mark"></span>
          <span>ALICERCE</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', fontSize: '12px', color: 'var(--steel)' }}>
          <span style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--ink)' }} onClick={onOpenLGPD}>
            <Lock size={13} color="var(--accent)" /> Privacidade LGPD
          </span>
          <span style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--ink)' }} onClick={onOpenSwagger}>
            <FileCode2 size={13} color="var(--line)" /> Documentação API
          </span>
        </div>

        <div className="mono" style={{ fontSize: '10.5px', color: 'var(--steel)' }}>
          © 2026 ALICERCE — Feita para quem constrói.
        </div>
      </div>
    </footer>
  );
};
