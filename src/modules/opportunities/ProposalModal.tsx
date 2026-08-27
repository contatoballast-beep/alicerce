import React, { useState } from 'react';
import { Modal } from '../../components/Modal';
import { UserProfile, Opportunity } from '../../types';
import { Send } from 'lucide-react';

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

  if (!opportunity) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!value || !deadlineDays || !scopeDescription) return;

    onSubmitProposal(opportunity.id, {
      value: parseFloat(value),
      deadlineDays: parseInt(deadlineDays, 10),
      scopeDescription,
      attachmentUrl: `Proposta_${currentUser.name.replace(/\s+/g, '')}.pdf`,
    });

    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Enviar Proposta Técnica" maxWidth="500px">
      <form onSubmit={handleSubmit} className="form-wrap" style={{ padding: 0 }}>
        
        <div className="titleblock" style={{ border: '1px solid var(--steel-line)', borderRadius: '3px' }}>
          <div className="tb-field">
            <div className="tb-label">Oportunidade</div>
            <div className="tb-value">{opportunity.title.substring(0, 25)}...</div>
          </div>
          <div className="tb-field">
            <div className="tb-label">Proponente</div>
            <div className="tb-value">{currentUser.name}</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <div className="field">
            <label>Valor da Proposta (R$)</label>
            <input type="number" className="mono" placeholder="58000" value={value} onChange={e => setValue(e.target.value)} required />
          </div>
          <div className="field">
            <label>Prazo (Dias)</label>
            <input type="number" className="mono" placeholder="30" value={deadlineDays} onChange={e => setDeadlineDays(e.target.value)} required />
          </div>
        </div>

        <div className="field">
          <label>Memorial de Escopo e Metodologia</label>
          <textarea placeholder="Detalhe os entregáveis, softwares de projeto (Revit/TQS) e garantias..." value={scopeDescription} onChange={e => setScopeDescription(e.target.value)} required />
        </div>

        <button type="submit" className="btn primary" style={{ width: '100%', justifyContent: 'center' }}>
          <Send size={12} /> Submeter Proposta
        </button>
      </form>
    </Modal>
  );
};
