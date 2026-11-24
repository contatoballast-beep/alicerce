import React, { useState } from 'react';
import { ShieldCheck, CheckCircle2, Copy, Check, Clock } from 'lucide-react';
import { TechnicalStamp } from '../types';

interface CarimboTecnicoProps {
  stamp: TechnicalStamp;
  authorRole?: string;
  compact?: boolean;
}

export const CarimboTecnico: React.FC<CarimboTecnicoProps> = ({ stamp, compact = false }) => {
  const [copied, setCopied] = useState(false);
  const isVerified = stamp.status === 'valid';

  const handleCopyHash = () => {
    if (!stamp.hashVerification) return;
    navigator.clipboard.writeText(stamp.hashVerification);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (compact) {
    return (
      <div
        style={{
          background: 'var(--bg-subtle)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-sm)',
          padding: '8px 12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <ShieldCheck size={14} color={isVerified ? '#1E6B4B' : '#2F5872'} />
          <span style={{ fontWeight: 600 }}>{stamp.registrationNumber}</span>
        </div>
        <span className={`badge ${isVerified ? 'verified' : 'declared'}`}>
          {isVerified ? 'Verificado' : 'Registro declarado'}
        </span>
      </div>
    );
  }

  return (
    <div
      style={{
        background: 'var(--bg-subtle)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-sm)',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          padding: '8px 14px',
          background: 'var(--branco)',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '8px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShieldCheck size={14} color={isVerified ? '#1E6B4B' : '#2F5872'} />
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--grafite)' }}>
            {isVerified ? 'Registro Profissional Verificado' : 'Registro Profissional Declarado'}
          </span>
        </div>

        <span className={`badge ${isVerified ? 'verified' : 'declared'}`}>
          {isVerified ? <CheckCircle2 size={11} /> : <Clock size={11} />}
          {isVerified ? 'Validado pela Ballast' : 'Aguardando validação'}
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))' }}>
        <div style={{ padding: '8px 14px', borderRight: '1px solid var(--border-color)' }}>
          <div className="meta-label" style={{ fontSize: '10px' }}>CAU / CREA</div>
          <div style={{ fontSize: '12.5px', fontWeight: 600 }}>{stamp.registrationNumber}</div>
        </div>

        {stamp.artRrtCode && (
          <div style={{ padding: '8px 14px', borderRight: '1px solid var(--border-color)' }}>
            <div className="meta-label" style={{ fontSize: '10px' }}>RRT / ART</div>
            <div style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--azul-lastro)' }}>{stamp.artRrtCode}</div>
          </div>
        )}

        {stamp.hashVerification && (
          <div style={{ padding: '8px 14px' }}>
            <div className="meta-label" style={{ fontSize: '10px' }}>Referência</div>
            <button
              type="button"
              onClick={handleCopyHash}
              className="mono"
              style={{
                background: 'none',
                border: 'none',
                padding: 0,
                fontSize: '11.5px',
                color: 'var(--steel)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                cursor: 'pointer',
              }}
              title="Copiar hash de referência"
            >
              <span>{stamp.hashVerification.substring(0, 12)}...</span>
              {copied ? <Check size={11} color="#1E6B4B" /> : <Copy size={11} />}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
