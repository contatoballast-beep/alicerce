import React, { useState } from 'react';
import { Opportunity, UserProfile } from '../../types';
import { PROJECT_TYPES } from '../../utils/compatibility';
import { Search, MapPin, Send, Plus, Briefcase, AlertTriangle, RefreshCw } from 'lucide-react';

interface OpportunitiesViewProps {
  opportunities: Opportunity[];
  currentUser: UserProfile;
  loading?: boolean;
  serviceError?: string | null;
  onRetry?: () => void;
  onSelectOpportunity: (opp: Opportunity) => void;
  onOpenSendProposal: (opp: Opportunity) => void;
  onOpenCreateOpportunity: () => void;
}

export const OpportunitiesView: React.FC<OpportunitiesViewProps> = ({
  opportunities,
  loading = false,
  serviceError = null,
  onRetry,
  onSelectOpportunity,
  onOpenSendProposal,
  onOpenCreateOpportunity,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCat, setSelectedCat] = useState('todas');

  const filtered = opportunities.filter((opp) => {
    const matchesCat =
      selectedCat === 'todas' ||
      opp.category.toLowerCase().includes(selectedCat.toLowerCase()) ||
      opp.specialty.toLowerCase().includes(selectedCat.toLowerCase());
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      opp.title.toLowerCase().includes(q) ||
      opp.description.toLowerCase().includes(q) ||
      (opp.location?.city && opp.location.city.toLowerCase().includes(q));
    return matchesCat && matchesSearch;
  });

  return (
    <div className="ballast-container" style={{ maxWidth: '880px', paddingTop: '32px', paddingBottom: '56px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '14px', marginBottom: '20px' }}>
        <div>
          <div className="meta-label" style={{ color: 'var(--azul-lastro)', marginBottom: '6px' }}>
            OPORTUNIDADES DE PROJETO
          </div>
          <h1 style={{ fontSize: 'clamp(28px, 4vw, 38px)', marginBottom: '6px' }}>Demandas publicadas</h1>
          <p style={{ fontSize: '14px', color: 'var(--steel)', margin: 0 }}>
            Briefings publicados por clientes para arquitetos e escritórios avaliarem compatibilidade e enviar propostas.
          </p>
        </div>

        <button type="button" onClick={onOpenCreateOpportunity} className="btn primary">
          <Plus size={15} /> Publicar demanda
        </button>
      </div>

      <div className="card" style={{ padding: '14px 16px', marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ position: 'relative' }}>
          <Search size={15} color="#546168" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="search"
            aria-label="Buscar demandas"
            placeholder="Buscar por tipo de projeto, cidade ou escopo..."
            style={{ paddingLeft: '36px' }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button type="button" className={`chip ${selectedCat === 'todas' ? 'on' : ''}`} onClick={() => setSelectedCat('todas')}>
            Todas
          </button>
          {PROJECT_TYPES.slice(0, 4).map((t) => (
            <button key={t} type="button" className={`chip ${selectedCat === t ? 'on' : ''}`} onClick={() => setSelectedCat(t)}>
              {t}
            </button>
          ))}
        </div>
      </div>

      {serviceError && (
        <div role="alert" className="card" style={{ padding: '32px', textAlign: 'center', borderColor: '#FECDCA', background: 'var(--color-danger-light)' }}>
          <AlertTriangle size={28} color="#B42318" style={{ margin: '0 auto 10px' }} />
          <p style={{ fontSize: '14px', color: 'var(--grafite)', marginBottom: '14px' }}>{serviceError}</p>
          {onRetry && (
            <button type="button" onClick={onRetry} className="btn primary">
              <RefreshCw size={14} /> Tentar novamente
            </button>
          )}
        </div>
      )}

      {loading && !serviceError && (
        <div className="card" style={{ padding: '32px', textAlign: 'center', color: 'var(--steel)' }}>Carregando demandas...</div>
      )}

      {!loading && !serviceError && filtered.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {filtered.map((opp) => (
            <article key={opp.id} className="card" onClick={() => onSelectOpportunity(opp)} style={{ padding: '20px', cursor: 'pointer' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px', marginBottom: '10px' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '14px' }}>{opp.ownerName}</div>
                  <div style={{ fontSize: '12px', color: 'var(--steel)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <MapPin size={12} /> {opp.location.city}, {opp.location.state}
                    {opp.currentStage ? ` · ${opp.currentStage}` : ''}
                  </div>
                </div>
                <span className="badge accent">{opp.specialty}</span>
              </div>

              <h3 style={{ fontSize: '20px', marginBottom: '6px' }}>{opp.title}</h3>
              <p style={{ fontSize: '13.5px', lineHeight: 1.6, marginBottom: '14px' }}>{opp.description}</p>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', paddingTop: '12px', borderTop: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', fontSize: '13px' }}>
                  <div>
                    <div className="meta-label" style={{ fontSize: '10px' }}>Orçamento estimado</div>
                    <strong className="mono">
                      R$ {opp.budgetRange.min.toLocaleString('pt-BR')} – R$ {opp.budgetRange.max.toLocaleString('pt-BR')}
                    </strong>
                  </div>
                  <div>
                    <div className="meta-label" style={{ fontSize: '10px' }}>Propostas</div>
                    <strong>{opp.proposalsCount}</strong>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenSendProposal(opp);
                  }}
                  className="btn primary"
                  style={{ minHeight: '36px', fontSize: '12.5px', padding: '7px 14px' }}
                >
                  <Send size={13} /> Enviar proposta
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {!loading && !serviceError && filtered.length === 0 && (
        <div className="card" style={{ padding: '48px 24px', textAlign: 'center' }}>
          <Briefcase size={30} color="#2F5872" style={{ margin: '0 auto 10px' }} />
          <h2 style={{ fontSize: '22px', marginBottom: '8px' }}>Nenhuma demanda encontrada</h2>
          <p style={{ fontSize: '14px', color: 'var(--steel)', maxWidth: '420px', margin: '0 auto 18px' }}>
            Publique seu briefing para receber propostas de arquitetos e escritórios compatíveis.
          </p>
          <button type="button" onClick={onOpenCreateOpportunity} className="btn primary">
            <Plus size={14} /> Publicar demanda
          </button>
        </div>
      )}
    </div>
  );
};
