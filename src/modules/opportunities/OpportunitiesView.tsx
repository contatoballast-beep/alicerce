import React, { useState } from 'react';
import { Opportunity, UserProfile } from '../../types';
import { Search, MapPin, DollarSign, Send, Filter, Map, Grid, ShieldCheck, Briefcase } from 'lucide-react';

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
  const [selectedSpecialty, setSelectedSpecialty] = useState('todas');
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');

  const specialtiesList = [
    'todas',
    'Estruturas de Concreto / Metal',
    'Instalações Hidráulicas & Incêndio',
    'Projeto Estrutural',
    'Perícias e Restauração',
    'Arquitetura & Interiores',
  ];

  const filtered = opportunities.filter(opp => {
    const matchesSpec = selectedSpecialty === 'todas' || opp.specialty === selectedSpecialty;
    const matchesSearch = 
      opp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opp.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opp.location.city.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSpec && matchesSearch;
  });

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px 16px' }}>
      
      {/* Title & View Toggle */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#FFF', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Briefcase size={28} color="var(--color-primary)" /> Central de Oportunidades & Contratações
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
            Projetos, laudos, cálculos e contratações técnicas ativas em todo o Brasil.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-card)', padding: '4px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
          <button 
            onClick={() => setViewMode('grid')}
            style={{ padding: '6px 12px', border: 'none', borderRadius: 'var(--radius-sm)', background: viewMode === 'grid' ? 'var(--color-primary)' : 'transparent', color: viewMode === 'grid' ? '#FFF' : 'var(--text-muted)', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Grid size={16} /> Lista em Grade
          </button>
          <button 
            onClick={() => setViewMode('map')}
            style={{ padding: '6px 12px', border: 'none', borderRadius: 'var(--radius-sm)', background: viewMode === 'map' ? 'var(--color-primary)' : 'transparent', color: viewMode === 'map' ? '#FFF' : 'var(--text-muted)', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Map size={16} /> Mapa Interativo
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-card" style={{ padding: '16px', marginBottom: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
          
          <div style={{ position: 'relative' }}>
            <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="text" 
              className="input-field" 
              placeholder="Buscar por galpão, cálculo, laudo, cidade..." 
              style={{ paddingLeft: '38px' }}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          <div>
            <select 
              className="input-field"
              value={selectedSpecialty}
              onChange={e => setSelectedSpecialty(e.target.value)}
            >
              {specialtiesList.map(spec => (
                <option key={spec} value={spec} style={{ background: 'var(--bg-card)', color: '#FFF' }}>
                  {spec === 'todas' ? 'Todas as Especialidades' : spec}
                </option>
              ))}
            </select>
          </div>

        </div>
      </div>

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
          {filtered.map(opp => (
            <div key={opp.id} className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span className="stamp-badge">{opp.specialty}</span>
                  <span className="mono" style={{ fontSize: '0.75rem', color: '#4ADE80' }}>
                    R$ {opp.budgetRange.min.toLocaleString('pt-BR')} - {opp.budgetRange.max.toLocaleString('pt-BR')}
                  </span>
                </div>

                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#FFF', marginBottom: '8px', lineHeight: 1.3 }}>
                  {opp.title}
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.5, marginBottom: '16px' }}>
                  {opp.description.length > 130 ? `${opp.description.substring(0, 130)}...` : opp.description}
                </p>
              </div>

              <div>
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '12px', marginBottom: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <MapPin size={14} color="var(--color-primary)" /> {opp.location.city} - {opp.location.state}
                  </span>
                  <span>{opp.proposalsCount} propostas</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <button onClick={() => onSelectOpportunity(opp)} className="btn-outline" style={{ justifyContent: 'center', fontSize: '0.85rem' }}>
                    Ver Detalhes
                  </button>
                  <button onClick={() => onOpenSendProposal(opp)} className="btn-accent" style={{ justifyContent: 'center', fontSize: '0.85rem' }}>
                    <Send size={14} /> Propor
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Map View Simulation */}
      {viewMode === 'map' && (
        <div className="glass-card" style={{ padding: '24px', textAlign: 'center', minHeight: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(circle at center, rgba(83, 157, 196, 0.15), rgba(15, 23, 42, 0.95))' }}>
          <MapPin size={48} color="var(--color-primary)" style={{ marginBottom: '12px' }} />
          <h3 style={{ fontSize: '1.2rem', color: '#FFF' }}>Mapa de Oportunidades Geolocalizadas</h3>
          <p style={{ color: 'var(--text-muted)', maxWidth: '500px', margin: '8px 0 20px', fontSize: '0.9rem' }}>
            Visualização em mapa de obras com raio de contratação em {currentUser.city}/{currentUser.state}.
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center' }}>
            {filtered.map(opp => (
              <div key={opp.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--color-primary)', padding: '10px 16px', borderRadius: 'var(--radius-md)', textAlign: 'left', cursor: 'pointer' }} onClick={() => onSelectOpportunity(opp)}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#FFF' }}>📍 {opp.location.city} - {opp.title.substring(0, 30)}...</div>
                <div className="mono" style={{ fontSize: '0.75rem', color: '#4ADE80' }}>Max: R$ {opp.budgetRange.max.toLocaleString('pt-BR')}</div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
