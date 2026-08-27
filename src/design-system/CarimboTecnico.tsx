import React from 'react';
import { ShieldCheck, FileCheck, CheckCircle2, QrCode } from 'lucide-react';
import { TechnicalStamp } from '../types';

interface CarimboTecnicoProps {
  stamp: TechnicalStamp;
  authorRole?: string;
  compact?: boolean;
}

export const CarimboTecnico: React.FC<CarimboTecnicoProps> = ({ stamp, authorRole, compact = false }) => {
  const isTerracotta = authorRole === 'empresa_cnpj' || authorRole === 'investidor';

  if (compact) {
    return (
      <div className={`carimbo-tecnico ${isTerracotta ? 'carimbo-tecnico-accent' : ''} style-compact`}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ShieldCheck size={16} color={isTerracotta ? '#B5654A' : '#539DC4'} />
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-main)' }}>
              {stamp.registrationNumber}
            </span>
          </div>
          <span className={`stamp-badge ${isTerracotta ? 'terracotta' : ''}`}>
            REGISTRO VALIDADE OK
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`carimbo-tecnico ${isTerracotta ? 'carimbo-tecnico-accent' : ''}`}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShieldCheck size={20} color={isTerracotta ? '#B5654A' : '#539DC4'} />
          <span style={{ fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.05em', color: 'var(--text-heading)' }}>
            CHANCELA TÉCNICA VERIFICADA
          </span>
        </div>
        <span className={`stamp-badge ${isTerracotta ? 'terracotta' : ''}`}>
          <CheckCircle2 size={12} /> HASH AUTÊNTICO
        </span>
      </div>

      {/* Grid Content */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px', fontSize: '0.78rem', marginTop: '6px' }}>
        <div>
          <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.7rem' }}>REGISTRO CONSELHO/CNPJ</span>
          <strong style={{ color: isTerracotta ? '#B5654A' : '#539DC4', fontSize: '0.9rem' }}>{stamp.registrationNumber}</strong>
        </div>

        {stamp.artRrtCode && (
          <div>
            <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.7rem' }}>CÓDIGO ART / RRT</span>
            <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>{stamp.artRrtCode}</span>
          </div>
        )}

        <div>
          <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.7rem' }}>CHAVE HASH (SHA-256)</span>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem', wordBreak: 'break-all' }}>
            {stamp.hashVerification.substring(0, 16)}...
          </span>
        </div>

        <div>
          <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.7rem' }}>EMISSÃO CHANCELA</span>
          <span style={{ color: 'var(--text-main)' }}>{stamp.issueDate}</span>
        </div>
      </div>

      {/* Footer stamp notice */}
      <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px dashed var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <FileCheck size={12} /> Validação oficial ativa em banco CREA/CAU/Receita
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-primary)' }}>
          <QrCode size={12} /> Ver de forma pública
        </span>
      </div>
    </div>
  );
};
