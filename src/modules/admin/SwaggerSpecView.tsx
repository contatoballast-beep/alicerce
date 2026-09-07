import React, { useState } from 'react';
import { SWAGGER_SPEC } from '../../services/swaggerSpec';
import { FileCode2, Copy, Check } from 'lucide-react';

export const SwaggerSpecView: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const specJson = JSON.stringify(SWAGGER_SPEC, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(specJson);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ maxWidth: '780px', margin: '0 auto', padding: '24px 16px' }}>
      
      <div style={{ 
        background: 'var(--bg-card)', 
        border: '1px solid var(--border-color)', 
        borderRadius: 'var(--radius-lg)', 
        padding: '20px 24px', 
        marginBottom: '20px',
        boxShadow: 'var(--shadow-sm)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--accent-color)', display: 'flex', alignItems: 'center', gap: '6px', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
            <FileCode2 size={13} /> ESPECIFICAÇÃO TÉCNICA DA API REST
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-heading)', margin: 0, letterSpacing: '-0.02em' }}>
            OpenAPI 3.0 (Swagger Spec)
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
            Contrato de integração REST para ERPs, sistemas de compras e canteiros de obra.
          </p>
        </div>
        <button onClick={handleCopy} className="btn primary" style={{ fontSize: '12px', padding: '10px 16px' }}>
          {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? 'Copiado!' : 'Copiar JSON'}
        </button>
      </div>

      <div className="card" style={{ padding: '16px' }}>
        <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span>schema / openapi_spec.json</span>
        </div>
        <pre style={{ 
          background: 'var(--bg-subtle)', 
          border: '1px solid var(--border-color)', 
          padding: '16px', 
          borderRadius: 'var(--radius-md)', 
          fontSize: '12px', 
          color: 'var(--text-heading)', 
          overflowX: 'auto', 
          maxHeight: '480px',
          fontFamily: 'var(--font-mono)',
          lineHeight: '1.45'
        }}>
          {specJson}
        </pre>
      </div>

    </div>
  );
};
