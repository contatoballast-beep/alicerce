import React from 'react';
import { Modal } from '../../components/Modal';
import { Opportunity, UserProfile } from '../../types';
import { Send, FileText, MapPin, DollarSign, Users } from 'lucide-react';

interface OpportunityDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  opportunity: Opportunity | null;
  currentUser: UserProfile;
  onOpenSendProposal: () => void;
  onAcceptProposal?: (proposalId: string) => void;
}

export const OpportunityDetailModal: React.FC<OpportunityDetailModalProps> = ({
  isOpen,
  onClose,
  opportunity,
  currentUser,
  onOpenSendProposal,
}) => {
  if (!opportunity) return null;

  const initials = opportunity.ownerName.substring(0, 2).toUpperCase();

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={opportunity.title} maxWidth="600px">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        
        {/* Detail Org Info */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ 
              width: '42px', 
              height: '42px', 
              borderRadius: 'var(--radius-md)', 
              background: 'var(--primary-bg)', 
              color: 'var(--primary-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '14px'
            }}>
              {initials}
            </div>
            <div>
              <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-heading)' }}>{opportunity.ownerName}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                <MapPin size={12} color="var(--primary-color)" /> {opportunity.location.city}, {opportunity.location.state}
              </div>
            </div>
          </div>
          <span style={{ 
            fontSize: '11px', 
            fontWeight: 700, 
            padding: '4px 10px', 
            borderRadius: 'var(--radius-full)', 
            background: 'rgba(234, 88, 12, 0.1)', 
            color: 'var(--accent-color)' 
          }}>
            {opportunity.specialty}
          </span>
        </div>

        {/* Text */}
        <p style={{ fontSize: '13.5px', lineHeight: 1.6, color: 'var(--text-body)', margin: 0 }}>
          {opportunity.description}
        </p>

        {/* Detail Table */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', 
          gap: '12px',
          background: 'var(--bg-subtle)',
          padding: '14px 16px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-color)'
        }}>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Local da Obra</div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-heading)', marginTop: '2px' }}>{opportunity.location.city}, {opportunity.location.state}</div>
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Remuneração Estimada</div>
            <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--primary-color)', marginTop: '2px', fontFamily: 'var(--font-mono)' }}>
              R$ {opportunity.budgetRange.min.toLocaleString('pt-BR')} – {opportunity.budgetRange.max.toLocaleString('pt-BR')}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Propostas</div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--accent-color)', marginTop: '2px' }}>{opportunity.proposalsCount} recebidas</div>
          </div>
        </div>

        {/* Proposta list */}
        {opportunity.proposals && opportunity.proposals.length > 0 && (
          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '14px' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px' }}>
              Propostas Técnicas Enviadas
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {opportunity.proposals.map(p => (
                <div key={p.id} className="card" style={{ padding: '12px 14px', fontSize: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
                    <span style={{ color: 'var(--text-heading)' }}>{p.proposerName}</span>
                    <span style={{ color: 'var(--accent-color)', fontFamily: 'var(--font-mono)' }}>R$ {p.value.toLocaleString('pt-BR')} ({p.deadlineDays}d)</span>
                  </div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '4px' }}>{p.scopeDescription}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
          <button onClick={onClose} className="btn ghost" style={{ flex: 1, justifyContent: 'center', fontSize: '12.5px' }}>
            Fechar
          </button>
          <button onClick={onOpenSendProposal} className="btn primary" style={{ flex: 1, justifyContent: 'center', fontSize: '12.5px' }}>
            <Send size={13} /> Enviar Proposta
          </button>
        </div>

      </div>
    </Modal>
  );
};
