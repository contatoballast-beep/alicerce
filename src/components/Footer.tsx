import React from 'react';
import { Lock, FileCode2 } from 'lucide-react';
import { BallastLogo } from './BallastLogo';

interface FooterProps {
  onOpenLGPD: () => void;
  onOpenSwagger: () => void;
  onNavigate?: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenLGPD, onOpenSwagger, onNavigate }) => {
  return (
    <footer
      style={{
        borderTop: '1px solid var(--border-color)',
        padding: '44px 0',
        background: 'var(--grafite)',
        color: '#E3E7EA',
        marginTop: '72px',
      }}
    >
      <div className="ballast-container">
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: '28px',
            paddingBottom: '28px',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          <div style={{ maxWidth: '340px' }}>
            <BallastLogo variant="horizontal" surface="dark" size={24} />
            <p style={{ fontSize: '13.5px', color: 'rgba(255,255,255,0.74)', marginTop: '14px', lineHeight: 1.6 }}>
              Design que transforma decisões em sentido — conectando pessoas a arquitetos compatíveis com clareza,
              sensibilidade e lastro.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '36px', flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8BBBD6', marginBottom: '12px' }}>
                Plataforma
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {onNavigate && (
                  <>
                    <button type="button" onClick={() => onNavigate('directory')} style={footerLinkStyle}>
                      Encontrar arquitetos
                    </button>
                    <button type="button" onClick={() => onNavigate('feed')} style={footerLinkStyle}>
                      Explorar projetos
                    </button>
                    <button type="button" onClick={() => onNavigate('briefing')} style={footerLinkStyle}>
                      Montar briefing
                    </button>
                    <button type="button" onClick={() => onNavigate('opportunities')} style={footerLinkStyle}>
                      Demandas de projeto
                    </button>
                  </>
                )}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8BBBD6', marginBottom: '12px' }}>
                Transparência
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button type="button" onClick={onOpenLGPD} style={footerLinkStyle}>
                  <Lock size={13} /> Privacidade e LGPD
                </button>
                <button type="button" onClick={onOpenSwagger} style={footerLinkStyle}>
                  <FileCode2 size={13} /> Documentação da API
                </button>
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
            paddingTop: '20px',
            fontSize: '12.5px',
            color: 'rgba(255,255,255,0.62)',
          }}
        >
          <span>© {new Date().getFullYear()} Ballast Architecture · ballastarch.com</span>
          <span>Uma marca, duas extensões de valor: Modos de Morar & Marketplace.</span>
        </div>
      </div>
    </footer>
  );
};

const footerLinkStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  color: 'rgba(255,255,255,0.82)',
  fontSize: '13px',
  cursor: 'pointer',
  padding: '2px 0',
  textAlign: 'left',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
};
