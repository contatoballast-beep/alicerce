import React, { useState } from 'react';
import { SWAGGER_SPEC } from '../../services/swaggerSpec';
import { FileCode2, Copy } from 'lucide-react';

export const SwaggerSpecView: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const specJson = JSON.stringify(SWAGGER_SPEC, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(specJson);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto', padding: '20px 16px' }}>
      
      <div className="card" style={{ padding: '16px', marginBottom: '18px', borderLeft: '4px solid var(--accent)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div className="tb-label" style={{ color: 'var(--accent)' }}>ESPECIFICAÇÃO TÉCNICA DA API</div>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--ink)' }}>
              OpenAPI 3.0 (Swagger Spec)
            </h2>
          </div>
          <button onClick={handleCopy} className="btn primary" style={{ fontSize: '10px' }}>
            <Copy size={12} /> {copied ? 'Copiado!' : 'Copiar JSON'}
          </button>
        </div>
      </div>

      <div className="card" style={{ padding: '12px' }}>
        <div className="tb-label" style={{ marginBottom: '8px' }}>openapi_spec.json</div>
        <pre className="mono" style={{ background: 'var(--paper)', border: '1px solid var(--steel-line)', padding: '12px', borderRadius: '3px', fontSize: '11px', color: 'var(--ink)', overflowX: 'auto', maxHeight: '420px' }}>
          {specJson}
        </pre>
      </div>

    </div>
  );
};
