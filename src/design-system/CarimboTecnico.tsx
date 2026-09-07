import React, { useState } from 'react';
import { ShieldCheck, CheckCircle2, Copy, Check } from 'lucide-react';
import { TechnicalStamp } from '../types';

interface CarimboTecnicoProps {
  stamp: TechnicalStamp;
  authorRole?: string;
  compact?: boolean;
}

export const CarimboTecnico: React.FC<CarimboTecnicoProps> = ({ stamp, compact = false }) => {
  const [copied, setCopied] = useState(false);

  const handleCopyHash = () => {
    navigator.clipboard.writeText(stamp.hashVerification);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (compact) {
    return (
      <div style={{
        background: '#F8FAFC',
        border: '1px solid #E2E8F0',
        borderRadius: '8px',
        padding: '8px 12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '11.5px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <ShieldCheck size={14} color="#059669" />
          <span style={{ fontWeight: 700, color: '#0F172A' }}>{stamp.registrationNumber}</span>
        </div>
        <span style={{ fontSize: '10.5px', color: '#059669', background: '#ECFDF5', padding: '2px 8px', borderRadius: '9999px', fontWeight: 600 }}>
          Chancela Válida
        </span>
      </div>
    );
  }

  return (
    <div style={{
      background: '#F8FAFC',
      border: '1px solid #E2E8F0',
      borderRadius: '10px',
      overflow: 'hidden',
      boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)'
    }}>
      
      {/* Top Header */}
      <div style={{
        padding: '8px 14px',
        background: '#FFFFFF',
        borderBottom: '1px solid #E2E8F0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '18px',
            height: '18px',
            borderRadius: '4px',
            background: '#EFF6FF',
            color: '#2563EB',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <ShieldCheck size={12} />
          </div>
          <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#0F172A', letterSpacing: '-0.01em' }}>
            Chancela Técnica Verificada ALICERCE
          </span>
        </div>

        <span style={{
          fontSize: '10.5px',
          fontWeight: 600,
          color: '#047857',
          background: '#ECFDF5',
          border: '1px solid #A7F3D0',
          padding: '2px 8px',
          borderRadius: '9999px',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px'
        }}>
          <CheckCircle2 size={11} /> Autenticada
        </span>
      </div>

      {/* Grid of Technical Fields */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
        background: '#F8FAFC',
        padding: '2px 0'
      }}>
        <div style={{ padding: '8px 14px', borderRight: '1px solid #E2E8F0' }}>
          <div style={{ fontSize: '10px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', marginBottom: '2px' }}>
            Registro / CREA-CAU
          </div>
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#0F172A' }}>
            {stamp.registrationNumber}
          </div>
        </div>

        {stamp.artRrtCode && (
          <div style={{ padding: '8px 14px', borderRight: '1px solid #E2E8F0' }}>
            <div style={{ fontSize: '10px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', marginBottom: '2px' }}>
              Código ART / RRT
            </div>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#2563EB' }}>
              {stamp.artRrtCode}
            </div>
          </div>
        )}

        <div style={{ padding: '8px 14px', borderRight: '1px solid #E2E8F0' }}>
          <div style={{ fontSize: '10px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', marginBottom: '2px' }}>
            Hash Autenticidade
          </div>
          <div 
            onClick={handleCopyHash}
            style={{ 
              fontSize: '11px', 
              fontFamily: 'var(--font-mono)', 
              color: '#475569', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '4px',
              cursor: 'pointer' 
            }}
            title="Clique para copiar o Hash de autenticidade"
          >
            <span>{stamp.hashVerification.substring(0, 10)}...</span>
            {copied ? <Check size={11} color="#059669" /> : <Copy size={11} color="#94A3B8" />}
          </div>
        </div>

        <div style={{ padding: '8px 14px' }}>
          <div style={{ fontSize: '10px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', marginBottom: '2px' }}>
            Emissão
          </div>
          <div style={{ fontSize: '11.5px', color: '#334155' }}>
            {stamp.issueDate || 'Recentemente'}
          </div>
        </div>
      </div>

    </div>
  );
};
