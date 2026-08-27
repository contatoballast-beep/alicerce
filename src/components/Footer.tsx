import React from 'react';
import { Building2, ShieldCheck, Lock, FileCode2, Heart } from 'lucide-react';

interface FooterProps {
  onOpenLGPD: () => void;
  onOpenSwagger: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenLGPD, onOpenSwagger }) => {
  return (
    <footer style={{ background: 'var(--bg-darker)', borderTop: '1px solid var(--border-color)', padding: '40px 16px 24px', marginTop: '60px' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '30px', marginBottom: '30px' }}>
        
        {/* Brand Column */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <div style={{ background: 'linear-gradient(135deg, #539DC4, #B5654A)', padding: '8px', borderRadius: '8px' }}>
              <Building2 size={20} color="#FFF" />
            </div>
            <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', fontWeight: 800, color: '#FFF' }}>
              ALICERCE
            </span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.6 }}>
            A maior ecossistema B2B2C de conexões técnicas, oportunidades e investimentos para a Indústria da Construção Civil no Brasil.
          </p>
          <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="pulse-dot"></span>
            <span className="mono" style={{ fontSize: '0.75rem', color: '#4ADE80' }}>SISTEMA 99.5% UPTIME OPERACIONAL</span>
          </div>
        </div>

        {/* Links Column 1 */}
        <div>
          <h4 style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-primary)', marginBottom: '12px' }}>
            Ecossistema
          </h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            <li>Chancela de Registros (CREA / CAU / CNPJ)</li>
            <li>Diário de Obra Digital & Timeline</li>
            <li>Marketplace de Oportunidades</li>
            <li>ALICERCE Ads (Patrocinados)</li>
          </ul>
        </div>

        {/* Links Column 2 */}
        <div>
          <h4 style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-accent)', marginBottom: '12px' }}>
            Conformidade & Devs
          </h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            <li style={{ cursor: 'pointer', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }} onClick={onOpenLGPD}>
              <Lock size={14} color="var(--color-primary)" /> Centro de Privacidade LGPD
            </li>
            <li style={{ cursor: 'pointer', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }} onClick={onOpenSwagger}>
              <FileCode2 size={14} color="var(--color-accent)" /> Documentação API OpenAPI 3.0
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShieldCheck size={14} color="#4ADE80" /> TLS 1.3 / Argon2id Criptografia
            </li>
          </ul>
        </div>
      </div>

      <div style={{ maxWidth: '1280px', margin: '0 auto', paddingTop: '20px', borderTop: '1px solid var(--border-color)', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '12px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
        <div>
          © 2026 ALICERCE Tecnologia S.A. Todos os direitos reservados.
        </div>
        <div className="mono" style={{ fontSize: '0.75rem' }}>
          Construído com Next.js, TypeScript e Design System Personalizado
        </div>
      </div>
    </footer>
  );
};
