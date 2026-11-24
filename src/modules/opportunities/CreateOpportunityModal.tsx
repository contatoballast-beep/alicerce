import React, { useState } from 'react';
import { Modal } from '../../components/Modal';
import { UserProfile } from '../../types';
import { RealApiClient } from '../../services/realApiClient';
import { PROJECT_TYPES, PROJECT_STAGES } from '../../utils/compatibility';
import { Send, Loader2, AlertCircle } from 'lucide-react';

interface CreateOpportunityModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onSubmitSuccess: () => void;
}

export const CreateOpportunityModal: React.FC<CreateOpportunityModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSubmitSuccess,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(PROJECT_TYPES[0]);
  const [specialty, setSpecialty] = useState(PROJECT_TYPES[0]);
  const [currentStage, setCurrentStage] = useState(PROJECT_STAGES[1]);
  const [city, setCity] = useState(currentUser.city || '');
  const [state, setState] = useState(currentUser.state || 'SP');
  const [budgetMin, setBudgetMin] = useState(15000);
  const [budgetMax, setBudgetMax] = useState(60000);
  const [deadlineDays, setDeadlineDays] = useState(45);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!title.trim() || !description.trim() || !city.trim()) {
      setError('Preencha título, descrição e cidade do projeto.');
      return;
    }

    setLoading(true);
    const res = await RealApiClient.createOpportunity({
      title: title.trim(),
      description: description.trim(),
      category,
      specialty: specialty.trim() || category,
      currentStage,
      city: city.trim(),
      state: state.trim().toUpperCase(),
      budgetMin,
      budgetMax,
      deadlineDays,
    });
    setLoading(false);

    if (res.ok) {
      setTitle('');
      setDescription('');
      onSubmitSuccess();
      onClose();
    } else {
      setError(res.error || 'O servidor não confirmou a publicação da demanda.');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Publicar Demanda de Projeto" maxWidth="580px">
      <form onSubmit={handleSubmit} className="form-wrap">
        {error && (
          <div role="alert" style={{ background: 'var(--color-danger-light)', border: '1px solid #FECDCA', color: 'var(--color-danger)', padding: '10px 14px', borderRadius: 'var(--radius-sm)', fontSize: '13px', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={15} /> {error}
          </div>
        )}

        <div className="field">
          <label htmlFor="opp-title">Título do projeto *</label>
          <input id="opp-title" type="text" placeholder="Ex: Projeto arquitetônico para residência térrea de 220 m²" value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>

        <div className="responsive-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <div className="field">
            <label htmlFor="opp-cat">Tipo de projeto</label>
            <select id="opp-cat" value={category} onChange={(e) => { setCategory(e.target.value); setSpecialty(e.target.value); }}>
              {PROJECT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="field">
            <label htmlFor="opp-stage">Etapa atual</label>
            <select id="opp-stage" value={currentStage} onChange={(e) => setCurrentStage(e.target.value)}>
              {PROJECT_STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div className="field">
          <label htmlFor="opp-desc">Descrição do briefing e necessidades *</label>
          <textarea id="opp-desc" rows={4} placeholder="Informe metragem, características do terreno ou imóvel, ambientes desejados e expectativas..." value={description} onChange={(e) => setDescription(e.target.value)} required />
        </div>

        <div className="responsive-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
          <div className="field">
            <label htmlFor="opp-min">Orçamento mín. (R$)</label>
            <input id="opp-min" type="number" className="mono" min="0" value={budgetMin} onChange={(e) => setBudgetMin(Number(e.target.value))} required />
          </div>
          <div className="field">
            <label htmlFor="opp-max">Orçamento máx. (R$)</label>
            <input id="opp-max" type="number" className="mono" min="0" value={budgetMax} onChange={(e) => setBudgetMax(Number(e.target.value))} required />
          </div>
          <div className="field">
            <label htmlFor="opp-days">Prazo (dias)</label>
            <input id="opp-days" type="number" className="mono" min="1" value={deadlineDays} onChange={(e) => setDeadlineDays(Number(e.target.value))} required />
          </div>
        </div>

        <div className="responsive-2col" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '10px' }}>
          <div className="field">
            <label htmlFor="opp-city">Cidade *</label>
            <input id="opp-city" type="text" value={city} onChange={(e) => setCity(e.target.value)} required />
          </div>
          <div className="field">
            <label htmlFor="opp-state">UF *</label>
            <input id="opp-state" type="text" maxLength={2} value={state} onChange={(e) => setState(e.target.value.toUpperCase())} required />
          </div>
        </div>

        <button type="submit" disabled={loading} className="btn primary" style={{ width: '100%' }}>
          {loading ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />} Publicar demanda
        </button>
      </form>
    </Modal>
  );
};
