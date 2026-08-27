import React, { useState } from 'react';
import { SWAGGER_SPEC } from '../../services/swaggerSpec';
import { FileCode2, Copy, CheckCircle2, Server, ShieldCheck } from 'lucide-react';

export const SwaggerSpecView: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const specJson = JSON.stringify(SWAGGER_SPEC, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(specJson);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '24px 16px' }}>
      
      <div className="glass-card" style={{ padding: '24px', marginBottom: '24px', borderLeft: '4px solid var(--color-primary)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <span className="stamp-badge">DOCUMENTAÇÃO OFICIAL DA API</span>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#FFF', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <FileCode2 size={28} color="var(--color-primary)" /> Especificação OpenAPI 3.0 (Swagger)
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Schema RESTful completo para desenvolvimento de apps nativos iOS/Android e integrações B2B.
            </p>
          </div>

          <button onClick={handleCopy} className="btn-primary" style={{ padding: '10px 18px' }}>
            <Copy size={16} /> {copied ? 'Copiado JSON!' : 'Copiar OpenAPI JSON'}
          </button>
        </div>
      </div>

      {/* Endpoint Cards Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        
        <div className="glass-card" style={{ padding: '16px' }}>
          <div className="stamp-badge" style={{ background: 'rgba(34, 197, 94, 0.15)', color: '#4ADE80', marginBottom: '8px' }}>
            POST /v1/auth/register
          </div>
          <h4 style={{ fontSize: '0.95rem', color: '#FFF' }}>Autenticação & Multi-Perfil</h4>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Validação de registros CREA/CAU/CNPJ e emissão de JWT + 2FA TOTP.
          </p>
        </div>

        <div className="glass-card" style={{ padding: '16px' }}>
          <div className="stamp-badge" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#60A5FA', marginBottom: '8px' }}>
            POST /v1/feed/posts
          </div>
          <h4 style={{ fontSize: '0.95rem', color: '#FFF' }}>Feed & Carimbo Técnico</h4>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Criação de obras enriquecidas com hash SHA-256 de chancela profissional.
          </p>
        </div>

        <div className="glass-card" style={{ padding: '16px' }}>
          <div className="stamp-badge terracotta" style={{ marginBottom: '8px' }}>
            POST /v1/ads/campaigns
          </div>
          <h4 style={{ fontSize: '0.95rem', color: '#FFF' }}>ALICERCE Ads & Pix NFS-e</h4>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Geração instantânea de QR Code Pix e emissão assíncrona de Nota Fiscal.
          </p>
        </div>

      </div>

      {/* JSON Viewer */}
      <div className="glass-card" style={{ padding: '20px' }}>
        <h3 style={{ fontSize: '1rem', color: 'var(--text-muted)', marginBottom: '12px', fontFamily: 'var(--font-mono)' }}>
          openapi_spec.json
        </h3>
        <pre className="mono" style={{ background: 'var(--bg-darker)', border: '1px solid var(--border-color)', padding: '16px', borderRadius: 'var(--radius-md)', fontSize: '0.8rem', color: '#4ADE80', overflowX: 'auto', maxHeight: '500px' }}>
          {specJson}
        </pre>
      </div>

    </div>
  );
};
