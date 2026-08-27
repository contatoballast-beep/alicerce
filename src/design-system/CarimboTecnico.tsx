import React from 'react';
import { ShieldCheck, FileCheck, CheckCircle2 } from 'lucide-react';
import { TechnicalStamp } from '../types';

interface CarimboTecnicoProps {
  stamp: TechnicalStamp;
  authorRole?: string;
  compact?: boolean;
}

export const CarimboTecnico: React.FC<CarimboTecnicoProps> = ({ stamp, authorRole, compact = false }) => {
  const isAccent = authorRole === 'empresa_cnpj' || authorRole === 'investidor';

  if (compact) {
    return (
      <div className="titleblock" style={{ borderRadius: '3px', overflow: 'hidden', border: '1px solid var(--steel-line)' }}>
        <div className="tb-field">
          <div className="tb-label">Chancela</div>
          <div className="tb-value">{stamp.stampId}</div>
        </div>
        <div className="tb-field">
          <div className="tb-label">Registro</div>
          <div className="tb-value">{stamp.registrationNumber}</div>
        </div>
        <div className="tb-field">
          <div className="tb-label">Status</div>
          <div className="tb-value" style={{ color: 'var(--accent)' }}>VALIDADO</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: 'var(--white)', border: '1px solid var(--steel-line)', borderRadius: '4px', overflow: 'hidden' }}>
      
      {/* Top Header */}
      <div style={{ padding: '8px 12px', background: 'var(--paper)', borderBottom: '1px solid var(--steel-line)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '10px', height: '10px', border: '1.5px solid var(--accent)', transform: 'rotate(45deg)', flexShrink: 0 }} />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ink)', fontWeight: 600 }}>
            CHANCELA TÉCNICA VERIFICADA — ALICERCE
          </span>
        </div>
        <span className="stamp-badge">
          <CheckCircle2 size={10} /> REGISTRO OK
        </span>
      </div>

      {/* Blueprint Titleblock Grid */}
      <div className="titleblock">
        <div className="tb-field">
          <div className="tb-label">Nº Registro / CNPJ</div>
          <div className="tb-value" style={{ color: 'var(--line)' }}>{stamp.registrationNumber}</div>
        </div>

        {stamp.artRrtCode && (
          <div className="tb-field">
            <div className="tb-label">Código ART / RRT</div>
            <div className="tb-value">{stamp.artRrtCode}</div>
          </div>
        )}

        <div className="tb-field">
          <div className="tb-label">Hash Autenticidade</div>
          <div className="tb-value" style={{ fontSize: '9.5px', color: 'var(--steel)' }}>
            {stamp.hashVerification.substring(0, 12)}...
          </div>
        </div>

        <div className="tb-field">
          <div className="tb-label">Emissão</div>
          <div className="tb-value">{stamp.issueDate}</div>
        </div>
      </div>

    </div>
  );
};
