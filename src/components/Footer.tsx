import React from 'react';
import { Lock, FileCode2, ShieldCheck } from 'lucide-react';

interface FooterProps {
  onOpenLGPD: () => void;
  onOpenSwagger: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenLGPD, onOpenSwagger }) => {
  return (
    <footer style={{ 
      borderTop: '1px solid var(--border-color)', 
      padding: '36px 24px', 
      background: 'var(--bg-card)', 
      marginTop: '80px',
      color: 'var(--text-muted)'
    }}>
      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        flexWrap: 'wrap', 
        gap: '20px' 
      }}>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '24px',
            height: '24px',
            background: 'var(--primary-color)',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            fontWeight: 800,
            fontSize: '13px',
            boxShadow: '0 2px 4px rgba(37, 99, 235, 0.25)'
          }}>
            A
          </div>
          <span style={{ fontWeight: 800, fontSize: '14px', letterSpacing: '-0.02em', color: 'var(--text-heading)' }}>
            ALICERCE
          </span>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)', borderLeft: '1px solid var(--border-color)', paddingLeft: '10px', marginLeft: '2px' }}>
            Ecossistema Técnico da Construção Civil
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '24px', fontSize: '13px' }}>
          <button 
            type="button"
            style={{ 
              background: 'none', 
              border: 'none', 
              cursor: 'pointer', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px', 
              color: 'var(--text-muted)',
              fontSize: '12.5px',
              padding: '4px 8px',
              borderRadius: 'var(--radius-sm)',
              transition: 'color 0.15s ease'
            }} 
            onClick={onOpenLGPD}
          >
            <Lock size={13} color="var(--primary-color)" /> Privacidade & LGPD
          </button>
          
          <button 
            type="button"
            style={{ 
              background: 'none', 
              border: 'none', 
              cursor: 'pointer', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px', 
              color: 'var(--text-muted)',
              fontSize: '12.5px',
              padding: '4px 8px',
              borderRadius: 'var(--radius-sm)',
              transition: 'color 0.15s ease'
            }} 
            onClick={onOpenSwagger}
          >
            <FileCode2 size={13} color="var(--accent-color)" /> Documentação API REST
          </button>
        </div>

        <div style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <ShieldCheck size={14} color="#10B981" />
          <span>© 2026 ALICERCE — Feito para quem constrói o Brasil.</span>
        </div>
      </div>
    </footer>
  );
};
