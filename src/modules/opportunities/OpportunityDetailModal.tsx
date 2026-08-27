import React from 'react';
import { Modal } from '../../components/Modal';
import { Opportunity, Proposal, UserProfile } from '../../types';
import { DollarSign, Calendar, MapPin, Send, CheckCircle2, FileText, UserCheck, ShieldCheck } from 'lucide-react';

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
  onAcceptProposal,
}) => {
  if (!opportunity) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={opportunity.title} maxWidth="750px">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        
        {/* Header Info */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', background: 'var(--bg-input)', padding: '14px 18px', borderRadius: 'var(--radius-md)' }}>
          <div>
            <span className="stamp-badge terracotta">{opportunity.specialty}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '6px' }}>
              <MapPin size={16} /> {opportunity.location.city} - {opportunity.location.state}
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Faixa Orçamentária</span>
            <div className="mono" style={{ fontSize: '1.2rem', fontWeight: 800, color: '#4ADE80' }}>
              R$ {opportunity.budgetRange.min.toLocaleString('pt-BR')} - R$ {opportunity.budgetRange.max.toLocaleString('pt-BR')}
            </div>
          </div>
        </div>

        {/* Description */}
        <div>
          <h4 style={{ fontSize: '0.9rem', textTransform: 'uppercase', color: 'var(--color-primary)', marginBottom: '4px' }}>
            Descrição Detalhada do Projeto
          </h4>
          <p style={{ color: 'var(--text-main)', fontSize: '0.92rem', lineHeight: 1.6 }}>
            {opportunity.description}
          </p>
        </div>

        {/* Received Proposals Section */}
        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#FFF' }}>
              Propostas Técnicas Submetidas ({opportunity.proposals ? opportunity.proposals.length : 0})
            </h4>
            <button onClick={onOpenSendProposal} className="btn-accent" style={{ padding: '6px 14px', fontSize: '0.85rem' }}>
              <Send size={14} /> Submeter Minha Proposta
            </button>
          </div>

          {opportunity.proposals && opportunity.proposals.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {opportunity.proposals.map(prop => (
                <div key={prop.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', padding: '14px', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <img src={prop.proposerAvatar} alt={prop.proposerName} style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }} />
                      <div>
                        <strong style={{ fontSize: '0.9rem', color: '#FFF' }}>{prop.proposerName}</strong>
                        <span className="mono" style={{ fontSize: '0.72rem', color: 'var(--color-primary)', display: 'block' }}>
                          {prop.creaCau || 'CHANCELA VERIFICADA'}
                        </span>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <span className="mono" style={{ fontSize: '1.1rem', fontWeight: 700, color: '#4ADE80' }}>
                        R$ {prop.value.toLocaleString('pt-BR')}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>
                        Prazo: {prop.deadlineDays} dias
                      </span>
                    </div>
                  </div>

                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                    {prop.scopeDescription}
                  </p>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.78rem' }}>
                    <span style={{ color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <FileText size={14} /> {prop.attachmentUrl || 'Memorial_Tecnico.pdf'}
                    </span>

                    {onAcceptProposal && prop.status === 'em_negociacao' && (
                      <button onClick={() => onAcceptProposal(prop.id)} className="btn-primary" style={{ padding: '4px 10px', fontSize: '0.75rem' }}>
                        <CheckCircle2 size={12} /> Aceitar e Fechar Contrato
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '30px', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Nenhuma proposta enviada ainda. Seja o primeiro profissional verificado a enviar uma proposta!
            </div>
          )}
        </div>

      </div>
    </Modal>
  );
};
