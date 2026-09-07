import React, { useState, useEffect } from 'react';
import { 
  ProfessionalProfile, 
  CompanyProfile, 
  SupplierProfile, 
  UserProfile 
} from '../../types';
import { RealApiClient } from '../../services/realApiClient';
import { 
  Search, 
  MapPin, 
  Star, 
  Phone, 
  FileText, 
  Heart, 
  CheckCircle2, 
  Building2, 
  Truck, 
  HardHat, 
  ShieldCheck,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

interface DirectoryViewProps {
  currentUser: UserProfile;
  onRequestQuote: (target: any) => void;
  onOpenProfile: (target: any) => void;
  onToggleFavorite: (target: any) => void;
  favoriteIds: Set<string>;
}

export const DirectoryView: React.FC<DirectoryViewProps> = ({
  currentUser,
  onRequestQuote,
  onOpenProfile,
  onToggleFavorite,
  favoriteIds,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'professionals' | 'companies' | 'suppliers'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('todas');
  
  const [professionals, setProfessionals] = useState<ProfessionalProfile[]>([]);
  const [companies, setCompanies] = useState<CompanyProfile[]>([]);
  const [suppliers, setSuppliers] = useState<SupplierProfile[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    const [profs, comps, supps] = await Promise.all([
      RealApiClient.getProfessionals(),
      RealApiClient.getCompanies(),
      RealApiClient.getSuppliers(),
    ]);
    setProfessionals(profs);
    setCompanies(comps);
    setSuppliers(supps);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenWhatsApp = (e: React.MouseEvent, item: any) => {
    e.stopPropagation();
    const rawNumber = item.whatsapp || item.phone || '5511987654321';
    const cleanNumber = rawNumber.replace(/\D/g, '');
    const fullNumber = cleanNumber.startsWith('55') ? cleanNumber : `55${cleanNumber}`;
    const text = encodeURIComponent(`Olá ${item.name}, encontrei seu perfil no ecossistema ALICERCE e gostaria de solicitar um orçamento para minha obra.`);
    window.open(`https://wa.me/${fullNumber}?text=${text}`, '_blank');
  };

  // Filter items
  const filterItem = (item: any) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = 
      !q ||
      item.name.toLowerCase().includes(q) ||
      (item.profession && item.profession.toLowerCase().includes(q)) ||
      (item.specialty && item.specialty.toLowerCase().includes(q)) ||
      (item.category && item.category.toLowerCase().includes(q)) ||
      (item.services && item.services.some((s: string) => s.toLowerCase().includes(q))) ||
      (item.productTypes && item.productTypes.some((p: string) => p.toLowerCase().includes(q))) ||
      (item.city && item.city.toLowerCase().includes(q));

    const matchesCity = selectedCity === 'todas' || item.city.toLowerCase().includes(selectedCity.toLowerCase());

    return matchesSearch && matchesCity;
  };

  const filteredProfs = professionals.filter(filterItem);
  const filteredComps = companies.filter(filterItem);
  const filteredSupps = suppliers.filter(filterItem);

  const totalResults = 
    (activeTab === 'all' ? (filteredProfs.length + filteredComps.length + filteredSupps.length) :
     activeTab === 'professionals' ? filteredProfs.length :
     activeTab === 'companies' ? filteredComps.length : filteredSupps.length);

  return (
    <div style={{ maxWidth: '920px', margin: '0 auto', padding: '24px 16px' }}>
      
      {/* Header Banner */}
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>
          Catálogo de Profissionais, Construtoras & Fornecedores
        </h2>
        <p style={{ fontSize: '13px', color: '#64748B', marginTop: '4px' }}>
          Conecte-se com engenheiros calculistas, arquitetos, empreiteiras e distribuidoras de materiais com registro técnico ativo.
        </p>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: '6px',
        overflowX: 'auto',
        borderBottom: '1px solid #E2E8F0',
        paddingBottom: '8px',
        marginBottom: '16px'
      }}>
        <button 
          onClick={() => setActiveTab('all')} 
          className={`btn ${activeTab === 'all' ? 'primary' : 'ghost'}`}
          style={{ fontSize: '12px', padding: '7px 14px' }}
        >
          Todos ({professionals.length + companies.length + suppliers.length})
        </button>
        <button 
          onClick={() => setActiveTab('professionals')} 
          className={`btn ${activeTab === 'professionals' ? 'primary' : 'ghost'}`}
          style={{ fontSize: '12px', padding: '7px 14px', gap: '5px' }}
        >
          <HardHat size={14} /> Profissionais ({professionals.length})
        </button>
        <button 
          onClick={() => setActiveTab('companies')} 
          className={`btn ${activeTab === 'companies' ? 'primary' : 'ghost'}`}
          style={{ fontSize: '12px', padding: '7px 14px', gap: '5px' }}
        >
          <Building2 size={14} /> Construtoras ({companies.length})
        </button>
        <button 
          onClick={() => setActiveTab('suppliers')} 
          className={`btn ${activeTab === 'suppliers' ? 'primary' : 'ghost'}`}
          style={{ fontSize: '12px', padding: '7px 14px', gap: '5px' }}
        >
          <Truck size={14} /> Fornecedores ({suppliers.length})
        </button>
      </div>

      {/* Search & Location Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: '2.5fr 1fr', gap: '10px', marginBottom: '16px' }}>
        <div style={{ position: 'relative' }}>
          <Search size={15} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input 
            type="text" 
            className="input-field" 
            placeholder="Buscar por nome, especialidade ou produto (ex: laudo, fundações, concreto)..."
            style={{ paddingLeft: '34px', fontSize: '13px' }}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
        <div style={{ position: 'relative' }}>
          <MapPin size={15} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <select 
            className="input-field" 
            style={{ paddingLeft: '34px', background: '#FFFFFF', fontSize: '13px', cursor: 'pointer' }}
            value={selectedCity}
            onChange={e => setSelectedCity(e.target.value)}
          >
            <option value="todas">Todas as Cidades</option>
            <option value="São Paulo">São Paulo - SP</option>
            <option value="Curitiba">Curitiba - PR</option>
            <option value="Campinas">Campinas - SP</option>
            <option value="Guarulhos">Guarulhos - SP</option>
          </select>
        </div>
      </div>

      {/* Results Count & Quick Tags */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', fontSize: '12px', color: '#64748B' }}>
        <span>{totalResults} perfis técnicos encontrados</span>
        <div style={{ display: 'flex', gap: '6px' }}>
          <span className="chip" onClick={() => setSearchQuery('Estrutural')}>Estrutural</span>
          <span className="chip" onClick={() => setSearchQuery('Concreto')}>Concreto</span>
          <span className="chip" onClick={() => setSearchQuery('Arquitetura')}>Arquitetura</span>
        </div>
      </div>

      {/* Cards List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        
        {/* Render Professionals */}
        {(activeTab === 'all' || activeTab === 'professionals') && filteredProfs.map(prof => (
          <div 
            key={prof.id} 
            className="card" 
            onClick={() => onOpenProfile(prof)} 
            style={{
              padding: '16px',
              borderRadius: '14px',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}
          >
            <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
              <img 
                src={prof.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'} 
                alt={prof.name} 
                style={{ width: '56px', height: '56px', borderRadius: '12px', objectFit: 'cover', border: '1px solid #E2E8F0' }} 
              />

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A' }}>{prof.name}</h4>
                    {prof.isVerified && (
                      <span className="badge verified" style={{ fontSize: '10px' }}>
                        <ShieldCheck size={11} /> Verificado
                      </span>
                    )}
                  </div>
                  
                  <button 
                    onClick={(e) => { e.stopPropagation(); onToggleFavorite(prof); }}
                    className="btn ghost" 
                    style={{ padding: '6px', borderRadius: '50%', color: favoriteIds.has(prof.id) ? '#EA580C' : '#94A3B8' }}
                  >
                    <Heart size={14} fill={favoriteIds.has(prof.id) ? '#EA580C' : 'none'} />
                  </button>
                </div>

                <div style={{ fontSize: '12.5px', color: '#2563EB', fontWeight: 600, marginTop: '2px' }}>
                  {prof.profession} • {prof.specialty}
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', marginTop: '6px', fontSize: '12px', color: '#64748B' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <MapPin size={13} color="#94A3B8" /> {prof.city}, {prof.state}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#D97706', fontWeight: 600 }}>
                    <Star size={13} fill="#D97706" /> {prof.rating} ({prof.reviewsCount} avaliações)
                  </span>
                  {prof.creaCauNumber && (
                    <span style={{ background: '#F1F5F9', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600, color: '#334155' }}>
                      {prof.creaCauNumber}
                    </span>
                  )}
                </div>

                {prof.services && prof.services.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '10px' }}>
                    {prof.services.map((srv, idx) => (
                      <span key={idx} className="badge" style={{ fontSize: '11px' }}>
                        ✓ {srv}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Actions Bar */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingTop: '12px',
              borderTop: '1px solid #F1F5F9',
              marginTop: '4px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', color: '#059669', fontWeight: 600 }}>
                <span className="pulse-dot"></span>
                <span>Disponível para novos projetos</span>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  onClick={(e) => handleOpenWhatsApp(e, prof)}
                  className="btn primary" 
                  style={{ background: '#059669', borderColor: '#059669', fontSize: '11.5px', padding: '6px 12px' }}
                >
                  <Phone size={12} /> WhatsApp
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); onRequestQuote(prof); }}
                  className="btn accent" 
                  style={{ fontSize: '11.5px', padding: '6px 14px' }}
                >
                  <FileText size={12} /> Orçamento
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* Render Companies */}
        {(activeTab === 'all' || activeTab === 'companies') && filteredComps.map(comp => (
          <div 
            key={comp.id} 
            className="card" 
            onClick={() => onOpenProfile(comp)} 
            style={{
              padding: '16px',
              borderRadius: '14px',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}
          >
            <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
              <img 
                src={comp.avatar || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=150'} 
                alt={comp.name} 
                style={{ width: '56px', height: '56px', borderRadius: '12px', objectFit: 'cover', border: '1px solid #E2E8F0' }} 
              />

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A' }}>{comp.name}</h4>
                    <span className="badge" style={{ fontSize: '10px' }}>
                      <Building2 size={11} /> Construtora
                    </span>
                  </div>
                  
                  <button 
                    onClick={(e) => { e.stopPropagation(); onToggleFavorite(comp); }}
                    className="btn ghost" 
                    style={{ padding: '6px', borderRadius: '50%', color: favoriteIds.has(comp.id) ? '#EA580C' : '#94A3B8' }}
                  >
                    <Heart size={14} fill={favoriteIds.has(comp.id) ? '#EA580C' : 'none'} />
                  </button>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', marginTop: '6px', fontSize: '12px', color: '#64748B' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <MapPin size={13} color="#94A3B8" /> {comp.city}, {comp.state}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#D97706', fontWeight: 600 }}>
                    <Star size={13} fill="#D97706" /> {comp.rating} ({comp.reviewsCount} obras)
                  </span>
                  <span style={{ background: '#F1F5F9', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600, color: '#334155' }}>
                    CNPJ: {comp.cnpj}
                  </span>
                </div>

                {comp.services && comp.services.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '10px' }}>
                    {comp.services.map((srv, idx) => (
                      <span key={idx} className="badge" style={{ fontSize: '11px' }}>
                        ✓ {srv}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingTop: '12px',
              borderTop: '1px solid #F1F5F9',
              marginTop: '4px'
            }}>
              <span style={{ fontSize: '11.5px', color: '#64748B' }}>
                Turn-Key & Empreitada Global
              </span>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  onClick={(e) => handleOpenWhatsApp(e, comp)}
                  className="btn primary" 
                  style={{ background: '#059669', borderColor: '#059669', fontSize: '11.5px', padding: '6px 12px' }}
                >
                  <Phone size={12} /> WhatsApp
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); onRequestQuote(comp); }}
                  className="btn accent" 
                  style={{ fontSize: '11.5px', padding: '6px 14px' }}
                >
                  <FileText size={12} /> Solicitar Proposta
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* Render Suppliers */}
        {(activeTab === 'all' || activeTab === 'suppliers') && filteredSupps.map(supp => (
          <div 
            key={supp.id} 
            className="card" 
            onClick={() => onOpenProfile(supp)} 
            style={{
              padding: '16px',
              borderRadius: '14px',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}
          >
            <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
              <img 
                src={supp.avatar || 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=150'} 
                alt={supp.name} 
                style={{ width: '56px', height: '56px', borderRadius: '12px', objectFit: 'cover', border: '1px solid #E2E8F0' }} 
              />

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A' }}>{supp.name}</h4>
                    <span className="badge" style={{ fontSize: '10px' }}>
                      <Truck size={11} /> {supp.category}
                    </span>
                  </div>
                  
                  <button 
                    onClick={(e) => { e.stopPropagation(); onToggleFavorite(supp); }}
                    className="btn ghost" 
                    style={{ padding: '6px', borderRadius: '50%', color: favoriteIds.has(supp.id) ? '#EA580C' : '#94A3B8' }}
                  >
                    <Heart size={14} fill={favoriteIds.has(supp.id) ? '#EA580C' : 'none'} />
                  </button>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', marginTop: '6px', fontSize: '12px', color: '#64748B' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <MapPin size={13} color="#94A3B8" /> {supp.city}, {supp.state}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#D97706', fontWeight: 600 }}>
                    <Star size={13} fill="#D97706" /> {supp.rating} ({supp.reviewsCount} entregas)
                  </span>
                  {supp.deliveryAvailable && (
                    <span style={{ color: '#059669', fontWeight: 600, fontSize: '11px' }}>
                      🚚 Entrega no Canteiro
                    </span>
                  )}
                </div>

                {supp.productTypes && supp.productTypes.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '10px' }}>
                    {supp.productTypes.map((prod, idx) => (
                      <span key={idx} className="badge verified" style={{ fontSize: '11px' }}>
                        📦 {prod}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingTop: '12px',
              borderTop: '1px solid #F1F5F9',
              marginTop: '4px'
            }}>
              <span style={{ fontSize: '11.5px', color: '#64748B' }}>
                Fornecimento Direto de Fábrica / Distribuidor
              </span>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  onClick={(e) => handleOpenWhatsApp(e, supp)}
                  className="btn primary" 
                  style={{ background: '#059669', borderColor: '#059669', fontSize: '11.5px', padding: '6px 12px' }}
                >
                  <Phone size={12} /> WhatsApp
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); onRequestQuote(supp); }}
                  className="btn accent" 
                  style={{ fontSize: '11.5px', padding: '6px 14px' }}
                >
                  <Truck size={12} /> Cotar Materiais
                </button>
              </div>
            </div>
          </div>
        ))}

        {totalResults === 0 && !loading && (
          <div className="card" style={{ padding: '48px 24px', textAlign: 'center', background: '#FFFFFF', borderRadius: '14px' }}>
            <Search size={32} color="#94A3B8" style={{ margin: '0 auto 10px' }} />
            <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A' }}>Nenhum resultado encontrado</h4>
            <p style={{ fontSize: '12.5px', color: '#64748B', marginTop: '4px' }}>
              Tente buscar por termos mais genéricos como "cimento", "estrutural", "projeto" ou selecione "Todas as Cidades".
            </p>
          </div>
        )}

      </div>

    </div>
  );
};
