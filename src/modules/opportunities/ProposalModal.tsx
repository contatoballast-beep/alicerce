import React, { useState } from 'react';
import { Modal } from '../../components/Modal';
import { UserProfile, Opportunity } from '../../types';
import { Send, Loader2, AlertCircle } from 'lucide-react';

interface ProposalModalProps {
  isOpen: boolean;
  onClose: () => void;
  opportunity: Opportunity | null;
  currentUser: UserProfile;
  onSubmitProposal: (oppId: string, proposal: any) => Promise<{ ok: boolean; error?: string }>;
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!opportunity) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!value || !deadlineDays || !scopeDescription.trim()) {
      setError('Preencha valor, prazo e escopo da proposta.');
      return;
    }

    setLoading(true);
    const res = await onSubmitProposal(opportunity.id, {
      value: parseFloat(value),
      deadlineDays: parseInt(deadlineDays, 10),
      scopeDescription: scopeDescription.trim(),
    });
    setLoading(false);

    if (res.ok) {
      setValue('');
      setDeadlineDays('');
      setScopeDescription('');
      onClose();
    } else {
      setError(res.error || 'Não foi possível enviar a proposta.');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Enviar Proposta" maxWidth="520px">
      <form onSubmit={handleSubmit} className="form-wrap">
        {error && (
          <div role="alert" style={{ background: 'var(--color-danger-light)', border: '1px solid #FECDCA', color: 'var(--color-danger)', padding: '10px 14px', borderRadius: 'var(--radius-sm)', fontSize: '13px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={15} /> {error}
          </div>
        )}

        <div style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '12px 14px', marginBottom: '14px' }}>
          <div className="meta-label">DEMANDA</div>
          <div style={{ fontWeight: 700, fontSize: '14px', marginTop: '2px' }}>{opportunity.title}</div>
          <div style={{ fontSize: '12px', color: 'var(--steel)', marginTop: '2px' }}>Proponente: {currentUser.name}</div>
        </div>

        <div className="responsive-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <div className="field">
            <label htmlFor="prop-value">Honorários / Valor (R$) *</label>
            <input id="prop-value" type="number" className="mono" min="1" value={value} onChange={(e) => setValue(e.target.value)} required />
          </div>
          <div className="field">
            <label htmlFor="prop-days">Prazo estimado (dias) *</label>
            <input id="prop-days" type="number" className="mono" min="1" value={deadlineDays} onChange={(e) => setDeadlineDays(e.target.value)} required />
          </div>
        </div>

        <div className="field">
          <label htmlFor="prop-scope">Escopo, etapas e entregáveis *</label>
          <textarea id="prop-scope" rows={4} placeholder="Detalhe levantamento, estudo preliminar, anteprojeto, executivo e forma de acompanhamento..." value={scopeDescription} onChange={(e) => setScopeDescription(e.target.value)} required />
        </div>

        <button type="submit" disabled={loading} className="btn primary" style={{ width: '100%' }}>
          {loading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />} Enviar proposta
        </button>
      </form>
    </Modal>
  );
};
