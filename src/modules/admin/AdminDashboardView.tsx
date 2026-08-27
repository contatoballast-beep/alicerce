import React from 'react';
import { ModerationItem, UserProfile } from '../../types';
import { ShieldAlert, Users, DollarSign, HardHat, CheckCircle2, Trash2, ShieldCheck, Lock } from 'lucide-react';

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
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '24px 16px' }}>
      
      {/* Header */}
      <div className="glass-card" style={{ padding: '24px', marginBottom: '24px', borderLeft: '4px solid #FACC15' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <span className="status-badge status-pending">MODO ADMINISTRATIVO / MODERAÇÃO</span>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#FFF', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <ShieldAlert size={28} color="#FACC15" /> Painel de Controle Operacional ALICERCE
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Gestão de usuários, moderação assíncrona de publicações, faturamento de anúncios e auditoria LGPD.
            </p>
          </div>
        </div>
      </div>

      {/* KPI Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        
        <div className="glass-card" style={{ padding: '18px' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Users size={16} color="var(--color-primary)" /> USUÁRIOS REGISTRADOS
          </span>
          <div className="mono" style={{ fontSize: '1.8rem', fontWeight: 800, color: '#FFF', marginTop: '4px' }}>
            14,820
          </div>
          <span className="mono" style={{ fontSize: '0.72rem', color: '#4ADE80' }}>84% com CREA/CAU/CNPJ Verificado</span>
        </div>

        <div className="glass-card" style={{ padding: '18px' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <DollarSign size={16} color="#4ADE80" /> VOLUME DE PROPOSTAS (R$)
          </span>
          <div className="mono" style={{ fontSize: '1.8rem', fontWeight: 800, color: '#4ADE80', marginTop: '4px' }}>
            R$ 8.4M
          </div>
          <span className="mono" style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Mês Atual (Em Negociação)</span>
        </div>

        <div className="glass-card" style={{ padding: '18px' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <HardHat size={16} color="var(--color-accent)" /> OBRAS EM ACOMPANHAMENTO
          </span>
          <div className="mono" style={{ fontSize: '1.8rem', fontWeight: 800, color: '#FFF', marginTop: '4px' }}>
            312
          </div>
          <span className="mono" style={{ fontSize: '0.72rem', color: 'var(--color-accent)' }}>Diários de Obra Ativos</span>
        </div>

        <div className="glass-card" style={{ padding: '18px' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Lock size={16} color="#FACC15" /> REQUISIÇÕES LGPD
          </span>
          <div className="mono" style={{ fontSize: '1.8rem', fontWeight: 800, color: '#FACC15', marginTop: '4px' }}>
            0 Pendentes
          </div>
          <span className="mono" style={{ fontSize: '0.72rem', color: '#4ADE80' }}>100% em Conformidade</span>
        </div>

      </div>

      {/* Moderation Queue */}
      <div className="glass-card" style={{ padding: '20px' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#FFF', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShieldCheck size={20} color="#FACC15" /> Fila de Moderação de Conteúdo e Perfis
        </h3>

        {moderationItems.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {moderationItems.map(item => (
              <div key={item.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
                  <span className="status-badge status-pending">DENÚNCIA • STATUS: {item.status.toUpperCase()}</span>
                  <span className="mono" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.createdAt}</span>
                </div>

                <h4 style={{ fontSize: '1rem', color: '#FFF', marginBottom: '4px' }}>{item.title}</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '12px' }}>
                  Motivo da Denúncia: <strong style={{ color: '#EF4444' }}>{item.reason}</strong> (Denunciado por {item.reportsCount} usuários)
                </p>

                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                  <button onClick={() => onResolveItem(item.id, 'removido')} className="btn-outline" style={{ color: '#EF4444', borderColor: 'rgba(239,68,68,0.4)', padding: '6px 12px', fontSize: '0.8rem' }}>
                    <Trash2 size={14} /> Remover Conteúdo
                  </button>
                  <button onClick={() => onResolveItem(item.id, 'aprovado')} className="btn-primary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                    <CheckCircle2 size={14} /> Aprovar e Manter
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Nenhum item pendente na fila de moderação!
          </div>
        )}
      </div>

    </div>
  );
};
