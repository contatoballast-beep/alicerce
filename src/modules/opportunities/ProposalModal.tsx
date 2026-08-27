import React, { useState } from 'react';
import { Modal } from '../../components/Modal';
import { UserProfile, Opportunity } from '../../types';
import { Send, DollarSign, Calendar, FileText, ShieldCheck } from 'lucide-react';

interface ProposalModalProps {
  isOpen: boolean;
  onClose: () => void;
  opportunity: Opportunity | null;
  currentUser: UserProfile;
  onSubmitProposal: (oppId: string, proposal: any) => void;
}

export const ProposalModal: React.FC<ProposalModalProps> = ({
  isOpen,
  onClose,
  opportunity,
  currentUser,
  onSubmitProposal,
}) => {
  const [value, setValue] = useState('');
  const [deadlineDays, setDeadlineDays] = useState('');
  const [scopeDescription, setScopeDescription] = useState('');
  const [attachment, setAttachment] = useState('');

  if (!opportunity) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!value || !deadlineDays || !scopeDescription) return;

    onSubmitProposal(opportunity.id, {
      value: parseFloat(value),
      deadlineDays: parseInt(deadlineDays, 10),
      scopeDescription,
      attachmentUrl: attachment || `Proposta_Tecnica_${currentUser.name.replace(/\s+/g, '')}.pdf`,
    });

    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Enviar Proposta TÉCNICA — ${opportunity.title}`} maxWidth="650px">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        
        {/* Opportunity Card Summary */}
        <div style={{ background: 'var(--bg-input)', padding: '12px 16px', borderRadius: 'var(--radius-md)', borderLeft: '3px solid var(--color-accent)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-accent)', fontWeight: 700, textTransform: 'uppercase' }}>
            CONTRATANTE: {opportunity.ownerName}
          </div>
          <div style={{ fontWeight: 600, fontSize: '0.95rem', color: '#FFF' }}>{opportunity.title}</div>
          <div className="mono" style={{ fontSize: '0.8rem', color: '#4ADE80', marginTop: '2px' }}>
            Faixa Orçamentária: R$ {opportunity.budgetRange.min.toLocaleString('pt-BR')} - R$ {opportunity.budgetRange.max.toLocaleString('pt-BR')}
          </div>
        </div>

        {/* Proposer Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(83, 157, 196, 0.1)', padding: '10px', borderRadius: 'var(--radius-md)' }}>
          <ShieldCheck size={20} color="var(--color-primary)" />
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#FFF' }}>Proponente: {currentUser.name}</div>
            <div className="mono" style={{ fontSize: '0.72rem', color: 'var(--color-primary)' }}>
              CHANCELA: {currentUser.creaCauNumber || currentUser.cnpjNumber || 'CPF VERIFICADO'}
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Valor da Proposta (R$) *</label>
            <input 
              type="number" 
              className="input-field mono" 
              placeholder="Ex: 58000" 
              value={value} 
              onChange={e => setValue(e.target.value)} 
              required 
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Prazo de Execução (Dias) *</label>
            <input 
              type="number" 
              className="input-field mono" 
              placeholder="Ex: 30" 
              value={deadlineDays} 
              onChange={e => setDeadlineDays(e.target.value)} 
              required 
            />
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Memorial de Escopo & Metodologia *</label>
          <textarea 
            className="input-field" 
            rows={4}
            placeholder="Detalhe o escopo de serviços inclusos, softwares de modelagem (Revit/TQS/Eberick), entregáveis e garantia técnica..."
            value={scopeDescription}
            onChange={e => setScopeDescription(e.target.value)}
            required
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Anexo da Proposta Completa (PDF/DWG)</label>
          <input 
            type="text" 
            className="input-field mono" 
            placeholder="Proposta_Tecnica_Completa.pdf" 
            value={attachment}
            onChange={e => setAttachment(e.target.value)}
          />
        </div>

        <button type="submit" className="btn-accent" style={{ width: '100%', justifyContent: 'center', marginTop: '10px' }}>
          <Send size={18} /> Submeter Proposta Orçamentária
        </button>

      </form>
    </Modal>
  );
};
