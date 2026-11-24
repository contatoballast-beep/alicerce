import React, { useState, useEffect } from 'react';
import { Modal } from '../../components/Modal';
import { ClientBriefing, ProfessionalProfile, UserProfile } from '../../types';
import { RealApiClient } from '../../services/realApiClient';
import { trackEvent } from '../../services/telemetry';
import { PROJECT_TYPES, INVESTMENT_RANGES, PROJECT_TIMELINES, PROJECT_STAGES } from '../../utils/compatibility';
import { Send, Loader2, AlertCircle } from 'lucide-react';

interface ProposalRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  architect: ProfessionalProfile | null;
  currentUser: UserProfile;
  briefing: ClientBriefing | null;
  onSuccess: (threadId: string) => void;
}

export const ProposalRequestModal: React.FC<ProposalRequestModalProps> = ({
  isOpen,
  onClose,
  architect,
  currentUser,
  briefing,
  onSuccess,
}) => {
  const [projectType, setProjectType] = useState(briefing?.projectType || PROJECT_TYPES[0]);
  const [city, setCity] = useState(briefing?.city || currentUser.city || '');
  const [state, setState] = useState(briefing?.state || currentUser.state || 'SP');
  const [budgetRange, setBudgetRange] = useState(briefing?.budgetRange || INVESTMENT_RANGES[1]);
  const [timeline, setTimeline] = useState(briefing?.timeline || PROJECT_TIMELINES[1]);
  const [currentStage, setCurrentStage] = useState(briefing?.currentStage || PROJECT_STAGES[1]);
  const [description, setDescription] = useState(briefing?.needs || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setError(null);
      if (briefing) {
        setProjectType(briefing.projectType || PROJECT_TYPES[0]);
        setCity(briefing.city || currentUser.city || '');
        setState(briefing.state || currentUser.state || 'SP');
        setBudgetRange(briefing.budgetRange || INVESTMENT_RANGES[1]);
        setTimeline(briefing.timeline || PROJECT_TIMELINES[1]);
        setCurrentStage(briefing.currentStage || PROJECT_STAGES[1]);
        setDescription(briefing.needs || '');
      }
    }
  }, [isOpen, briefing, currentUser.city, currentUser.state]);

  if (!architect) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!city.trim() || !description.trim()) {
      setError('Informe a cidade e uma descrição do que você precisa.');
      return;
    }

    setLoading(true);
    setError(null);
    const res = await RealApiClient.createProposalRequest({
      architectId: architect.id,
      projectType,
      city: city.trim(),
      state: state.trim().toUpperCase(),
      budgetRange,
      timeline,
      currentStage,
      description: description.trim(),
      stylePreferences: briefing?.stylePreferences || [],
    });
    setLoading(false);

    if (res.ok && res.data) {
      trackEvent('contact_sent', { architectId: architect.id, projectType });
      onSuccess(res.data.threadId);
      onClose();
    } else {
      setError(res.error || 'Não foi possível enviar a solicitação de proposta.');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Solicitar proposta para ${architect.name}`} maxWidth="580px">
      <form onSubmit={handleSubmit} className="form-wrap">
        {error && (
          <div
            role="alert"
            style={{
              background: 'var(--color-danger-light)',
              border: '1px solid #FECDCA',
              color: 'var(--color-danger)',
              padding: '10px 14px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '13px',
              marginBottom: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <AlertCircle size={15} /> {error}
          </div>
        )}

        <p style={{ fontSize: '13.5px', color: 'var(--steel)', marginBottom: '16px' }}>
          Sua solicitação será registrada e vinculada diretamente a uma conversa privada no chat para você acompanhar o retorno.
        </p>

        <div className="field">
          <label htmlFor="preq-type">Tipo de projeto *</label>
          <select id="preq-type" value={projectType} onChange={(e) => setProjectType(e.target.value)}>
            {PROJECT_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        <div className="responsive-2col" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '10px' }}>
          <div className="field">
            <label htmlFor="preq-city">Cidade da obra *</label>
            <input id="preq-city" type="text" value={city} onChange={(e) => setCity(e.target.value)} required />
          </div>
          <div className="field">
            <label htmlFor="preq-state">UF *</label>
            <input id="preq-state" type="text" maxLength={2} value={state} onChange={(e) => setState(e.target.value.toUpperCase())} required />
          </div>
        </div>

        <div className="responsive-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <div className="field">
            <label htmlFor="preq-budget">Faixa de investimento</label>
            <select id="preq-budget" value={budgetRange} onChange={(e) => setBudgetRange(e.target.value)}>
              {INVESTMENT_RANGES.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="preq-timeline">Prazo desejado</label>
            <select id="preq-timeline" value={timeline} onChange={(e) => setTimeline(e.target.value)}>
              {PROJECT_TIMELINES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="field">
          <label htmlFor="preq-stage">Etapa atual</label>
          <select id="preq-stage" value={currentStage} onChange={(e) => setCurrentStage(e.target.value)}>
            {PROJECT_STAGES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="preq-desc">Resumo do projeto e necessidades *</label>
          <textarea
            id="preq-desc"
            rows={4}
            placeholder="Descreva metragem aproximada, ambientes, objetivos e qualquer detalhe relevante..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>

        <button type="submit" disabled={loading} className="btn primary" style={{ width: '100%' }}>
          {loading ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
          Enviar solicitação de proposta
        </button>
      </form>
    </Modal>
  );
};
