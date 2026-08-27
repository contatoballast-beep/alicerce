import React from 'react';
import { Modal } from '../../components/Modal';
import { Opportunity, UserProfile } from '../../types';
import { Send, FileText } from 'lucide-react';

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
    <Modal isOpen={isOpen} onClose={onClose} title={opportunity.title} maxWidth="560px">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        
        {/* Detail Org Info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
          <div className="avatar">{initials}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink)' }}>{opportunity.ownerName}</div>
            <div className="mono" style={{ fontSize: '10px', color: 'var(--steel)' }}>{opportunity.location.city}, {opportunity.location.state}</div>
          </div>
          <span className="tag warn">{opportunity.specialty}</span>
        </div>

        {/* Text */}
        <p style={{ fontSize: '12.5px', lineHeight: 1.6, color: 'var(--graphite)' }}>
          {opportunity.description}
        </p>

        {/* Detail Table */}
        <div className="titleblock" style={{ border: '1px solid var(--steel-line)', borderRadius: '3px' }}>
          <div className="tb-field">
            <div className="tb-label">Local</div>
            <div className="tb-value">{opportunity.location.city}, {opportunity.location.state}</div>
          </div>
          <div className="tb-field">
            <div className="tb-label">Remuneração</div>
            <div className="tb-value" style={{ color: 'var(--line)' }}>
              R$ {opportunity.budgetRange.min.toLocaleString('pt-BR')} – {opportunity.budgetRange.max.toLocaleString('pt-BR')}
            </div>
          </div>
          <div className="tb-field">
            <div className="tb-label">Propostas</div>
            <div className="tb-value">{opportunity.proposalsCount} recebidas</div>
          </div>
        </div>

        {/* Proposta list */}
        {opportunity.proposals && opportunity.proposals.length > 0 && (
          <div style={{ borderTop: '1px solid var(--steel-line)', paddingTop: '10px' }}>
            <div className="tb-label" style={{ marginBottom: '6px' }}>Propostas Técnicas Enviadas</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {opportunity.proposals.map(p => (
                <div key={p.id} className="card" style={{ padding: '8px 10px', fontSize: '11.5px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>
                    <span>{p.proposerName}</span>
                    <span className="mono" style={{ color: 'var(--accent)' }}>R$ {p.value.toLocaleString('pt-BR')} ({p.deadlineDays}d)</span>
                  </div>
                  <div style={{ color: 'var(--steel)', fontSize: '11px', marginTop: '2px' }}>{p.scopeDescription}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
          <button onClick={onClose} className="btn ghost" style={{ flex: 1, justifyContent: 'center' }}>
            Fechar
          </button>
          <button onClick={onOpenSendProposal} className="btn primary" style={{ flex: 1, justifyContent: 'center' }}>
            <Send size={12} /> Enviar Proposta
          </button>
        </div>

      </div>
    </Modal>
  );
};
