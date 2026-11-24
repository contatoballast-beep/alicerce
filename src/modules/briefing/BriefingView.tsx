import React, { useState } from 'react';
import { ClientBriefing } from '../../types';
import {
  PROJECT_TYPES,
  ARCHITECTURAL_STYLES,
  INVESTMENT_RANGES,
  PROJECT_STAGES,
  PROJECT_TIMELINES,
} from '../../utils/compatibility';
import { trackEvent } from '../../services/telemetry';
import { ArrowRight, Check, Sparkles, RotateCcw } from 'lucide-react';

interface BriefingViewProps {
  initialBriefing: ClientBriefing | null;
  onSaveBriefing: (briefing: ClientBriefing) => void;
  onClearBriefing: () => void;
}

const VISUAL_REFERENCES = [
  {
    style: 'Brasileiro e Natural',
    label: 'Pedra, madeira e luz natural',
    credit: 'Unsplash · Interior natural',
    image: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=560&auto=format&fit=crop&q=75',
  },
  {
    style: 'Minimalista',
    label: 'Linhas puras e amplitude',
    credit: 'Unsplash · Minimalismo',
    image: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=560&auto=format&fit=crop&q=75',
  },
  {
    style: 'Contemporâneo',
    label: 'Integração sala e jardim',
    credit: 'Unsplash · Casa contemporânea',
    image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=560&auto=format&fit=crop&q=75',
  },
  {
    style: 'Biofílico',
    label: 'Verde integrado ao morar',
    credit: 'Unsplash · Arquitetura biofílica',
    image: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=560&auto=format&fit=crop&q=75',
  },
  {
    style: 'Industrial',
    label: 'Concreto aparente e estrutura',
    credit: 'Unsplash · Estilo industrial',
    image: 'https://images.unsplash.com/photo-1600585152220-90363fe7e115?w=560&auto=format&fit=crop&q=75',
  },
  {
    style: 'Clássico Atemporal',
    label: 'Proporção clássica e conforto',
    credit: 'Unsplash · Interiores atemporais',
    image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=560&auto=format&fit=crop&q=75',
  },
];

const ROOM_ENVIRONMENTS = [
  'Sala integrada',
  'Cozinha funcional',
  'Suíte principal',
  'Home office',
  'Área externa e jardim',
  'Fachada',
];

export const BriefingView: React.FC<BriefingViewProps> = ({
  initialBriefing,
  onSaveBriefing,
  onClearBriefing,
}) => {
  const [projectType, setProjectType] = useState(initialBriefing?.projectType || PROJECT_TYPES[0]);
  const [city, setCity] = useState(initialBriefing?.city || '');
  const [state, setState] = useState(initialBriefing?.state || 'SP');
  const [budgetRange, setBudgetRange] = useState(initialBriefing?.budgetRange || INVESTMENT_RANGES[1]);
  const [timeline, setTimeline] = useState(initialBriefing?.timeline || PROJECT_TIMELINES[1]);
  const [currentStage, setCurrentStage] = useState(initialBriefing?.currentStage || PROJECT_STAGES[1]);
  const [needs, setNeeds] = useState(initialBriefing?.needs || '');
  const [stylePreferences, setStylePreferences] = useState<string[]>(initialBriefing?.stylePreferences || []);
  const [roomPreferences, setRoomPreferences] = useState<string[]>(initialBriefing?.roomPreferences || []);

  const toggleItem = (list: string[], value: string, setter: (v: string[]) => void) => {
    if (list.includes(value)) setter(list.filter((i) => i !== value));
    else setter([...list, value]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data: ClientBriefing = {
      projectType,
      city: city.trim(),
      state: state.trim().toUpperCase(),
      budgetRange,
      timeline,
      currentStage,
      needs: needs.trim(),
      stylePreferences,
      roomPreferences,
    };
    trackEvent('briefing_saved', { projectType, city: data.city, stylesCount: stylePreferences.length });
    onSaveBriefing(data);
  };

  return (
    <div className="ballast-container" style={{ maxWidth: '920px', paddingTop: '32px', paddingBottom: '64px' }}>
      <div style={{ marginBottom: '26px' }}>
        <div className="meta-label" style={{ color: 'var(--azul-lastro)', marginBottom: '8px' }}>
          BRIEFING E PREFERÊNCIAS VISUAIS
        </div>
        <h1 style={{ fontSize: 'clamp(28px, 4vw, 42px)', marginBottom: '10px' }}>
          Conte sobre o seu projeto
        </h1>
        <p style={{ fontSize: '15px', color: 'var(--steel)', maxWidth: '640px' }}>
          Em menos de dois minutos você organiza suas necessidades. Usamos estas informações para explicar a
          compatibilidade dos arquitetos no catálogo e agilizar seus pedidos de proposta.
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Step 1: Project Scope */}
        <section className="card" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '22px', marginBottom: '16px' }}>1. Sobre a obra ou reforma</h2>

          <div style={{ marginBottom: '18px' }}>
            <div style={{ fontSize: '12.5px', fontWeight: 600, marginBottom: '8px' }}>Tipo de projeto *</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {PROJECT_TYPES.map((t) => (
                <button
                  key={t}
                  type="button"
                  className={`chip ${projectType === t ? 'on' : ''}`}
                  onClick={() => setProjectType(t)}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="responsive-2col" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
            <div className="field">
              <label htmlFor="briefing-city">Cidade do projeto *</label>
              <input
                id="briefing-city"
                type="text"
                placeholder="Ex: São Paulo, Belo Horizonte, Florianópolis..."
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
              />
            </div>
            <div className="field">
              <label htmlFor="briefing-state">UF *</label>
              <input
                id="briefing-state"
                type="text"
                maxLength={2}
                value={state}
                onChange={(e) => setState(e.target.value.toUpperCase())}
                required
              />
            </div>
          </div>

          <div className="responsive-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="field">
              <label htmlFor="briefing-budget">Orçamento aproximado</label>
              <select id="briefing-budget" value={budgetRange} onChange={(e) => setBudgetRange(e.target.value)}>
                {INVESTMENT_RANGES.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="briefing-timeline">Prazo desejado</label>
              <select id="briefing-timeline" value={timeline} onChange={(e) => setTimeline(e.target.value)}>
                {PROJECT_TIMELINES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="field">
            <label htmlFor="briefing-stage">Etapa atual</label>
            <select id="briefing-stage" value={currentStage} onChange={(e) => setCurrentStage(e.target.value)}>
              {PROJECT_STAGES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="field" style={{ marginBottom: 0 }}>
            <label htmlFor="briefing-needs">Necessidades e objetivos (opcional)</label>
            <textarea
              id="briefing-needs"
              rows={3}
              placeholder="Ex: Preciso integrar sala e cozinha, aproveitar melhor a luz natural da manhã e criar um escritório silencioso..."
              value={needs}
              onChange={(e) => setNeeds(e.target.value)}
            />
          </div>
        </section>

        {/* Step 2: Optional Visual Preferences */}
        <section className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: '8px', marginBottom: '6px' }}>
            <h2 style={{ fontSize: '22px' }}>2. Referências visuais (opcional)</h2>
            <span style={{ fontSize: '12.5px', color: 'var(--steel)' }}>
              {stylePreferences.length} selecionada(s)
            </span>
          </div>
          <p style={{ fontSize: '13.5px', color: 'var(--steel)', marginBottom: '18px' }}>
            Escolha atmosferas e ambientes que refletem como você gostaria de viver o espaço.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '14px', marginBottom: '20px' }}>
            {VISUAL_REFERENCES.map((ref) => {
              const selected = stylePreferences.includes(ref.style);
              return (
                <button
                  key={ref.style}
                  type="button"
                  onClick={() => toggleItem(stylePreferences, ref.style, setStylePreferences)}
                  aria-pressed={selected}
                  style={{
                    padding: 0,
                    textAlign: 'left',
                    background: 'var(--branco)',
                    border: selected ? '2.5px solid var(--azul-lastro)' : '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    position: 'relative',
                  }}
                >
                  <div style={{ aspectRatio: '4 / 3', overflow: 'hidden', background: 'var(--grafite)' }}>
                    <img
                      src={ref.image}
                      alt={ref.label}
                      loading="lazy"
                      decoding="async"
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    />
                  </div>
                  {selected && (
                    <span
                      style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        width: '26px',
                        height: '26px',
                        borderRadius: '50%',
                        background: 'var(--azul-lastro)',
                        color: '#FFFFFF',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Check size={14} />
                    </span>
                  )}
                  <div style={{ padding: '10px 12px' }}>
                    <div style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--grafite)' }}>{ref.style}</div>
                    <div style={{ fontSize: '12px', color: 'var(--steel)' }}>{ref.label}</div>
                    <div style={{ fontSize: '10.5px', color: 'var(--steel)', marginTop: '4px' }}>{ref.credit}</div>
                  </div>
                </button>
              );
            })}
          </div>

          <div>
            <div style={{ fontSize: '12.5px', fontWeight: 600, marginBottom: '8px' }}>Ambientes prioritários (opcional)</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {ROOM_ENVIRONMENTS.map((room) => (
                <button
                  key={room}
                  type="button"
                  className={`chip ${roomPreferences.includes(room) ? 'on' : ''}`}
                  onClick={() => toggleItem(roomPreferences, room, setRoomPreferences)}
                >
                  {room}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          {initialBriefing ? (
            <button type="button" onClick={onClearBriefing} className="btn ghost">
              <RotateCcw size={14} /> Limpar briefing
            </button>
          ) : (
            <div />
          )}

          <button type="submit" className="btn primary" style={{ padding: '12px 26px', fontSize: '14.5px' }}>
            <Sparkles size={16} /> Ver arquitetos compatíveis <ArrowRight size={15} />
          </button>
        </div>
      </form>
    </div>
  );
};
