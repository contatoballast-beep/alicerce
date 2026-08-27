import React from 'react';
import { ModerationItem, UserProfile } from '../../types';
import { ShieldAlert, CheckCircle2, Trash2 } from 'lucide-react';

interface AdminDashboardViewProps {
  moderationItems: ModerationItem[];
  currentUser: UserProfile;
  onResolveItem: (itemId: string, status: 'aprovado' | 'removido') => void;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({
  moderationItems,
  currentUser,
  onResolveItem,
}) => {
  return (
    <div style={{ maxWidth: '640px', margin: '0 auto', padding: '20px 16px' }}>
      
      {/* Header */}
      <div className="card" style={{ padding: '16px', marginBottom: '18px', borderLeft: '4px solid var(--ink)' }}>
        <div className="tb-label" style={{ color: 'var(--steel)' }}>PAINEL DE MODERAÇÃO E CONTROLE</div>
        <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--ink)' }}>
          Gestão Operacional ALICERCE
        </h2>
      </div>

      {/* KPI Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '18px' }}>
        <div className="card" style={{ padding: '12px' }}>
          <div className="tb-label">Usuários Cadastrados</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 700, color: 'var(--ink)' }}>14.820</div>
          <div style={{ fontSize: '10px', color: 'var(--accent)' }}>84% CREA/CAU Verificados</div>
        </div>

        <div className="card" style={{ padding: '12px' }}>
          <div className="tb-label">Volume Propostas (R$)</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 700, color: 'var(--line)' }}>R$ 8.4M</div>
          <div style={{ fontSize: '10px', color: 'var(--steel)' }}>Mês Atual</div>
        </div>
      </div>

      {/* Moderation Items */}
      <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--ink)', marginBottom: '10px' }}>Fila de Moderação de Denúncias</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {moderationItems.map(item => (
          <div key={item.id} className="card" style={{ padding: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span className="tag warn">DENÚNCIA</span>
              <span className="mono" style={{ fontSize: '9.5px', color: 'var(--steel)' }}>{item.createdAt}</span>
            </div>
            <h4 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--ink)' }}>{item.title}</h4>
            <p style={{ fontSize: '11.5px', color: 'var(--steel)', margin: '4px 0 10px' }}>{item.reason}</p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
              <button onClick={() => onResolveItem(item.id, 'removido')} className="btn ghost" style={{ padding: '3px 8px', fontSize: '9.5px', color: 'var(--line)' }}>
                <Trash2 size={11} /> Remover
              </button>
              <button onClick={() => onResolveItem(item.id, 'aprovado')} className="btn primary" style={{ padding: '3px 8px', fontSize: '9.5px' }}>
                <CheckCircle2 size={11} /> Aprovar
              </button>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
