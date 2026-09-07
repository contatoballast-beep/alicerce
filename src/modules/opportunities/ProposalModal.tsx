import React, { useState } from 'react';
import { Modal } from '../../components/Modal';
import { UserProfile, Opportunity } from '../../types';
import { Send, FileText } from 'lucide-react';

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
    <Modal isOpen={isOpen} onClose={onClose} title="Submeter Proposta Técnica" maxWidth="520px">
      <form onSubmit={handleSubmit} className="form-wrap" style={{ padding: 0 }}>
        
        <div style={{ 
          background: 'var(--bg-subtle)', 
          border: '1px solid var(--border-color)', 
          borderRadius: 'var(--radius-md)', 
          padding: '12px 16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '14px'
        }}>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Demanda / Obra</div>
            <div style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--text-heading)', marginTop: '2px' }}>{opportunity.title.substring(0, 30)}...</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Proponente</div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--primary-color)' }}>{currentUser.name}</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <div className="field">
            <label>Valor da Proposta (R$) *</label>
            <input type="number" className="mono" placeholder="58000" value={value} onChange={e => setValue(e.target.value)} required />
          </div>
          <div className="field">
            <label>Prazo de Entrega (Dias) *</label>
            <input type="number" className="mono" placeholder="30" value={deadlineDays} onChange={e => setDeadlineDays(e.target.value)} required />
          </div>
        </div>

        <div className="field">
          <label>Memorial de Escopo e Metodologia Executiva *</label>
          <textarea 
            rows={4}
            placeholder="Detalhe os entregáveis técnicos, softwares utilizados (Revit, TQS, AltoQi) e garantias de conformidade ABNT..." 
            value={scopeDescription} 
            onChange={e => setScopeDescription(e.target.value)} 
            required 
          />
        </div>

        <button type="submit" className="btn primary" style={{ width: '100%', justifyContent: 'center', marginTop: '6px', padding: '10px 16px', fontSize: '13px' }}>
          <Send size={14} /> Submeter Proposta Técnica
        </button>
      </form>
    </Modal>
  );
};
