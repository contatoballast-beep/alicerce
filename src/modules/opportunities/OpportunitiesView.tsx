import React, { useState } from 'react';
import { Opportunity, UserProfile } from '../../types';
import { Search, MapPin, Send, Grid, Map, Plus, Phone } from 'lucide-react';

interface OpportunitiesViewProps {
  opportunities: Opportunity[];
  currentUser: UserProfile;
  onSelectOpportunity: (opp: Opportunity) => void;
  onOpenSendProposal: (opp: Opportunity) => void;
  onOpenCreateOpportunity: () => void;
}

export const OpportunitiesView: React.FC<OpportunitiesViewProps> = ({
  opportunities,
  currentUser,
  onSelectOpportunity,
  onOpenSendProposal,
  onOpenCreateOpportunity,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSeg, setSelectedSeg] = useState('todas');
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');

  const filtered = opportunities.filter(opp => {
    const matchesSeg = selectedSeg === 'todas' || opp.specialty.toLowerCase().includes(selectedSeg);
    const matchesSearch = 
      opp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opp.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opp.location.city.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSeg && matchesSearch;
  });

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '20px 16px' }}>
      
      {/* Title & Actions */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
        <div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10.5px', color: 'var(--line)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            MARKETPLACE DE OPORTUNIDADES & DEMANDAS
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--ink)' }}>
            Oportunidades de Obras & Projetos
          </h2>
        </div>

        <div style={{ display: 'flex', gap: '6px' }}>
          <button 
            onClick={onOpenCreateOpportunity}
            className="btn primary" 
            style={{ fontSize: '10.5px', padding: '7px 12px' }}
          >
            <Plus size={13} /> Publicar Demanda
          </button>
        </div>
      </div>

      {/* Segmented Controls */}
      <div className="segrow" style={{ marginBottom: '14px' }}>
        <div className={`seg ${selectedSeg === 'todas' ? 'on' : ''}`} onClick={() => setSelectedSeg('todas')}>Tudo</div>
        <div className={`seg ${selectedSeg === 'estrutura' ? 'on' : ''}`} onClick={() => setSelectedSeg('estrutura')}>Estrutural</div>
        <div className={`seg ${selectedSeg === 'arquitetura' ? 'on' : ''}`} onClick={() => setSelectedSeg('arquitetura')}>Arquitetura</div>
        <div className={`seg ${selectedSeg === 'instalacoes' ? 'on' : ''}`} onClick={() => setSelectedSeg('instalacoes')}>Instalações</div>
      </div>

      {/* Search Input */}
      <div style={{ position: 'relative', marginBottom: '16px' }}>
        <Search size={14} color="var(--steel)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
        <input 
          type="text" 
          className="input-field" 
          placeholder="Buscar por cidade, laudo, projeto estrutural, galpão..." 
          style={{ paddingLeft: '34px' }}
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Cards List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {filtered.map(opp => (
          <div key={opp.id} className="card" onClick={() => onSelectOpportunity(opp)} style={{ cursor: 'pointer' }}>
            <div className="card-head">
              <div className="avatar">{opp.ownerName.substring(0, 2).toUpperCase()}</div>
              <div className="who">
                <div className="name">{opp.ownerName}</div>
                <div className="role">{opp.location.city}, {opp.location.state}</div>
              </div>
              <span className="tag warn">{opp.specialty}</span>
            </div>
            <div className="card-body">
              <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--ink)', marginBottom: '4px' }}>{opp.title}</h4>
              <p style={{ fontSize: '12px', color: 'var(--steel)', lineHeight: '1.5' }}>{opp.description}</p>
            </div>

            <div className="titleblock">
              <div className="tb-field">
                <div className="tb-label">Orçamento Estimado</div>
                <div className="tb-value" style={{ color: 'var(--line)' }}>
                  R$ {opp.budgetRange.min.toLocaleString('pt-BR')} – {opp.budgetRange.max.toLocaleString('pt-BR')}
                </div>
              </div>
              <div className="tb-field">
                <div className="tb-label">Propostas</div>
                <div className="tb-value">{opp.proposalsCount} recebidas</div>
              </div>
              <div className="tb-field" style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                <button 
                  onClick={(e) => { e.stopPropagation(); onOpenSendProposal(opp); }} 
                  className="btn primary" 
                  style={{ padding: '5px 12px', fontSize: '10px' }}
                >
                  <Send size={11} /> Enviar Proposta
                </button>
              </div>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="card" style={{ padding: '40px 20px', textAlign: 'center', background: 'var(--paper)' }}>
            <Search size={32} color="var(--steel)" style={{ margin: '0 auto 8px' }} />
            <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--ink)' }}>Nenhuma oportunidade encontrada</h4>
            <p style={{ fontSize: '12px', color: 'var(--steel)', marginTop: '4px', marginBottom: '14px' }}>
              Seja o primeiro a publicar uma necessidade ou projeto para receber propostas de engenheiros e arquitetos.
            </p>
            <button onClick={onOpenCreateOpportunity} className="btn primary" style={{ margin: '0 auto' }}>
              Publicar Minha Demanda
            </button>
          </div>
        )}
      </div>

    </div>
  );
};
