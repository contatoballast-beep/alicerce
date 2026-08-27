import React, { useState } from 'react';
import { Opportunity, UserProfile } from '../../types';
import { Search, MapPin, Send, Grid, Map } from 'lucide-react';

interface OpportunitiesViewProps {
  opportunities: Opportunity[];
  currentUser: UserProfile;
  onSelectOpportunity: (opp: Opportunity) => void;
  onOpenSendProposal: (opp: Opportunity) => void;
}

export const OpportunitiesView: React.FC<OpportunitiesViewProps> = ({
  opportunities,
  currentUser,
  onSelectOpportunity,
  onOpenSendProposal,
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
    <div style={{ maxWidth: '640px', margin: '0 auto', padding: '20px 16px' }}>
      
      {/* Title */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
        <div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10.5px', color: 'var(--line)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            MARKETPLACE DE OPORTUNIDADES
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--ink)' }}>
            Explorar Vagas e Terrenos
          </h2>
        </div>

        <div style={{ display: 'flex', gap: '4px' }}>
          <button 
            className={`btn ${viewMode === 'grid' ? 'primary' : 'ghost'}`}
            onClick={() => setViewMode('grid')}
            style={{ padding: '5px 8px', fontSize: '10px' }}
          >
            <Grid size={12} /> Grade
          </button>
          <button 
            className={`btn ${viewMode === 'map' ? 'primary' : 'ghost'}`}
            onClick={() => setViewMode('map')}
            style={{ padding: '5px 8px', fontSize: '10px' }}
          >
            <Map size={12} /> Mapa
          </button>
        </div>
      </div>

      {/* Segmented Controls */}
      <div className="segrow" style={{ marginBottom: '14px' }}>
        <div className={`seg ${selectedSeg === 'todas' ? 'on' : ''}`} onClick={() => setSelectedSeg('todas')}>Tudo</div>
        <div className={`seg ${selectedSeg === 'estrutura' ? 'on' : ''}`} onClick={() => setSelectedSeg('estrutura')}>Estrutural</div>
        <div className={`seg ${selectedSeg === 'laudo' ? 'on' : ''}`} onClick={() => setSelectedSeg('laudo')}>Laudos</div>
        <div className={`seg ${selectedSeg === 'instala' ? 'on' : ''}`} onClick={() => setSelectedSeg('instala')}>Instalações</div>
      </div>

      {/* Search Input */}
      <div style={{ position: 'relative', marginBottom: '16px' }}>
        <Search size={14} color="var(--steel)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
        <input 
          type="text" 
          className="input-field" 
          placeholder="Buscar por cidade, laudo, galpão..." 
          style={{ paddingLeft: '34px' }}
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Cards List */}
      {viewMode === 'grid' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {filtered.map(opp => (
            <div key={opp.id} className="card" onClick={() => onSelectOpportunity(opp)}>
              <div className="card-head">
                <div className="avatar">{opp.ownerName.substring(0, 2).toUpperCase()}</div>
                <div className="who">
                  <div className="name">{opp.ownerName}</div>
                  <div className="role">{opp.location.city}, {opp.location.state}</div>
                </div>
                <span className="tag warn">{opp.specialty}</span>
              </div>
              <div className="card-body">
                <h4 style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--ink)', marginBottom: '4px' }}>{opp.title}</h4>
                <p style={{ fontSize: '12px', color: 'var(--steel)' }}>{opp.description}</p>
              </div>

              <div className="titleblock">
                <div className="tb-field">
                  <div className="tb-label">Orçamento</div>
                  <div className="tb-value" style={{ color: 'var(--line)' }}>
                    R$ {opp.budgetRange.min.toLocaleString('pt-BR')} – {opp.budgetRange.max.toLocaleString('pt-BR')}
                  </div>
                </div>
                <div className="tb-field">
                  <div className="tb-label">Propostas</div>
                  <div className="tb-value">{opp.proposalsCount} enviadas</div>
                </div>
                <div className="tb-field" style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                  <button onClick={(e) => { e.stopPropagation(); onOpenSendProposal(opp); }} className="btn primary" style={{ padding: '4px 10px', fontSize: '10px' }}>
                    <Send size={10} /> Propor
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Map Simulation View */
        <div className="card" style={{ padding: '30px 20px', textAlign: 'center', background: 'var(--paper)' }}>
          <MapPin size={32} color="var(--accent)" style={{ margin: '0 auto 8px' }} />
          <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--ink)' }}>Mapa de Oportunidades Geolocalizadas</h4>
          <p style={{ fontSize: '12px', color: 'var(--steel)', marginBottom: '16px' }}>{filtered.length} oportunidades ativas encontradas na sua região.</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
            {filtered.map(opp => (
              <div key={opp.id} className="btn ghost" style={{ fontSize: '10px' }} onClick={() => onSelectOpportunity(opp)}>
                📍 {opp.location.city} - R$ {opp.budgetRange.max.toLocaleString('pt-BR')}
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
