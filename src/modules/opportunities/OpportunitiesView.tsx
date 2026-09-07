import React, { useState } from 'react';
import { Opportunity, UserProfile } from '../../types';
import { Search, MapPin, Send, Plus, Briefcase, DollarSign, Clock, Users } from 'lucide-react';

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

  const filtered = opportunities.filter(opp => {
    const matchesSeg = selectedSeg === 'todas' || opp.specialty.toLowerCase().includes(selectedSeg);
    const q = searchQuery.toLowerCase();
    const matchesSearch = 
      !q ||
      opp.title.toLowerCase().includes(q) ||
      opp.description.toLowerCase().includes(q) ||
      (opp.location?.city && opp.location.city.toLowerCase().includes(q));
    return matchesSeg && matchesSearch;
  });

  const categories = [
    { id: 'todas', label: 'Todas as Demandas' },
    { id: 'estrutura', label: 'Estrutural & Fundações' },
    { id: 'arquitetura', label: 'Projetos Arquitetônicos' },
    { id: 'instalacoes', label: 'Instalações Elétrica/Hidráulica' },
  ];

  return (
    <div style={{ maxWidth: '840px', margin: '0 auto', padding: '24px 16px' }}>
      
      {/* Title & Actions */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>
            Oportunidades & Demandas de Obras
          </h2>
          <p style={{ fontSize: '13px', color: '#64748B', marginTop: '3px' }}>
            Conecte-se com clientes e construtoras buscando engenheiros e projetistas qualificados.
          </p>
        </div>

        <button 
          onClick={onOpenCreateOpportunity}
          className="btn primary" 
          style={{ fontSize: '12px', padding: '9px 16px', gap: '6px' }}
        >
          <Plus size={14} /> Publicar Demanda
        </button>
      </div>

      {/* Category Pills */}
      <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', marginBottom: '16px' }}>
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedSeg(cat.id)}
            className={`chip ${selectedSeg === cat.id ? 'on' : ''}`}
            style={{ fontSize: '12px' }}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Search Input */}
      <div style={{ position: 'relative', marginBottom: '20px' }}>
        <Search size={15} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
        <input 
          type="text" 
          className="input-field" 
          placeholder="Buscar por laudo, cálculo estrutural, galpão, reforma ou cidade..." 
          style={{ paddingLeft: '34px', fontSize: '13px' }}
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Opportunities List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {filtered.map(opp => (
          <div 
            key={opp.id} 
            className="card" 
            onClick={() => onSelectOpportunity(opp)} 
            style={{
              padding: '18px',
              borderRadius: '14px',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <img 
                  src={opp.ownerAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'} 
                  alt={opp.ownerName}
                  style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover' }}
                />
                <div>
                  <div style={{ fontWeight: 700, fontSize: '13.5px', color: '#0F172A' }}>{opp.ownerName}</div>
                  <div style={{ fontSize: '11px', color: '#64748B', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <MapPin size={11} /> {opp.location?.city || 'São Paulo'}, {opp.location?.state || 'SP'}
                  </div>
                </div>
              </div>

              <span className="badge" style={{ background: '#EFF6FF', color: '#1D4ED8', borderColor: '#BFDBFE', fontSize: '11px' }}>
                {opp.specialty}
              </span>
            </div>

            {/* Title & Desc */}
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A', lineHeight: 1.35, marginBottom: '6px' }}>
                {opp.title}
              </h3>
              <p style={{ fontSize: '13px', color: '#475569', lineHeight: 1.55 }}>
                {opp.description}
              </p>
            </div>

            {/* Strip: Budget, Proposals & Send CTA */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingTop: '12px',
              borderTop: '1px solid #F1F5F9',
              marginTop: '4px',
              flexWrap: 'wrap',
              gap: '10px'
            }}>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '10px', color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase' }}>
                    Orçamento Estimado
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#059669' }}>
                    R$ {opp.budgetRange.min.toLocaleString('pt-BR')} – {opp.budgetRange.max.toLocaleString('pt-BR')}
                  </div>
                </div>

                <div style={{ borderLeft: '1px solid #E2E8F0', paddingLeft: '16px' }}>
                  <div style={{ fontSize: '10px', color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase' }}>
                    Propostas
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A' }}>
                    {opp.proposalsCount} recebidas
                  </div>
                </div>
              </div>

              <button 
                onClick={(e) => { e.stopPropagation(); onOpenSendProposal(opp); }} 
                className="btn accent" 
                style={{ padding: '7px 16px', fontSize: '12px', gap: '6px' }}
              >
                <Send size={12} /> Enviar Proposta
              </button>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="card" style={{
            padding: '48px 24px',
            textAlign: 'center',
            background: '#FFFFFF',
            borderRadius: '14px',
            border: '1px dashed #CBD5E1'
          }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: '#EFF6FF',
              color: '#2563EB',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 14px'
            }}>
              <Briefcase size={26} />
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', marginBottom: '6px' }}>
              Nenhuma demanda encontrada
            </h3>
            <p style={{ fontSize: '12.5px', color: '#64748B', maxWidth: '400px', margin: '0 auto 18px', lineHeight: 1.5 }}>
              Publique uma nova demanda para receber orçamentos e propostas técnicas de calculistas, engenheiros e construtoras credenciadas.
            </p>
            <button 
              onClick={onOpenCreateOpportunity} 
              className="btn primary" 
              style={{ margin: '0 auto', fontSize: '12px', padding: '10px 20px', gap: '8px' }}
            >
              <Plus size={14} /> Publicar Minha Demanda
            </button>
          </div>
        )}
      </div>

    </div>
  );
};
