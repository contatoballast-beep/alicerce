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
  Share2,
  Filter
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
    const text = encodeURIComponent(`Olá ${item.name}, encontrei seu perfil no ALICERCE e gostaria de solicitar um orçamento.`);
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
    <div style={{ maxWidth: '840px', margin: '0 auto', padding: '20px 16px' }}>
      
      {/* Header Banner */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10.5px', color: 'var(--line)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          CATÁLOGO DO ECOSSISTEMA DA CONSTRUÇÃO CIVIL
        </div>
        <h2 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--ink)' }}>
          Encontre Profissionais, Empresas & Fornecedores
        </h2>
        <p style={{ fontSize: '12px', color: 'var(--steel)', marginTop: '2px' }}>
          Conecte-se diretamente com engenheiros, arquitetos, empreiteiras e lojas de materiais verificadas.
        </p>
      </div>

      {/* Type Selector Segments */}
      <div className="segrow" style={{ marginBottom: '12px' }}>
        <div className={`seg ${activeTab === 'all' ? 'on' : ''}`} onClick={() => setActiveTab('all')}>
          Todos ({professionals.length + companies.length + suppliers.length})
        </div>
        <div className={`seg ${activeTab === 'professionals' ? 'on' : ''}`} onClick={() => setActiveTab('professionals')}>
          <HardHat size={12} style={{ display: 'inline', marginRight: '4px' }} /> Profissionais ({professionals.length})
        </div>
        <div className={`seg ${activeTab === 'companies' ? 'on' : ''}`} onClick={() => setActiveTab('companies')}>
          <Building2 size={12} style={{ display: 'inline', marginRight: '4px' }} /> Construtoras ({companies.length})
        </div>
        <div className={`seg ${activeTab === 'suppliers' ? 'on' : ''}`} onClick={() => setActiveTab('suppliers')}>
          <Truck size={12} style={{ display: 'inline', marginRight: '4px' }} /> Fornecedores ({suppliers.length})
        </div>
      </div>

      {/* Search & Location Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '8px', marginBottom: '16px' }}>
        <div style={{ position: 'relative' }}>
          <Search size={14} color="var(--steel)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input 
            type="text" 
            className="input-field" 
            placeholder="Buscar por especialidade, profissão ou produto (ex: calculista, cimento)..."
            style={{ paddingLeft: '34px' }}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
        <div style={{ position: 'relative' }}>
          <MapPin size={14} color="var(--steel)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <select 
            className="input-field" 
            style={{ paddingLeft: '34px', background: 'var(--white)' }}
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', fontSize: '11px', color: 'var(--steel)' }}>
        <span>{totalResults} prestadores e fornecedores encontrados</span>
        <div style={{ display: 'flex', gap: '6px' }}>
          <span className="chip on" onClick={() => setSearchQuery('Estrutural')}>Estrutural</span>
          <span className="chip on" onClick={() => setSearchQuery('Concreto')}>Concreto</span>
          <span className="chip on" onClick={() => setSearchQuery('Arquitetura')}>Arquitetura</span>
        </div>
      </div>

      {/* Cards List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        
        {/* Render Professionals */}
        {(activeTab === 'all' || activeTab === 'professionals') && filteredProfs.map(prof => (
          <div key={prof.id} className="card" onClick={() => onOpenProfile(prof)} style={{ cursor: 'pointer' }}>
            <div style={{ padding: '14px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <img 
                src={prof.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'} 
                alt={prof.name} 
                style={{ width: '52px', height: '52px', borderRadius: '4px', objectFit: 'cover', border: '1px solid var(--steel-line)' }} 
              />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--ink)' }}>{prof.name}</h4>
                    {prof.isVerified && (
                      <span className="stamp-badge accent" style={{ fontSize: '8.5px', padding: '1px 5px' }}>
                        <CheckCircle2 size={10} /> Verificado
                      </span>
                    )}
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); onToggleFavorite(prof); }}
                    className="btn ghost" 
                    style={{ padding: '4px 6px', fontSize: '10px', color: favoriteIds.has(prof.id) ? 'var(--line)' : 'var(--steel)' }}
                  >
                    <Heart size={13} fill={favoriteIds.has(prof.id) ? 'var(--line)' : 'none'} />
                  </button>
                </div>

                <div style={{ fontSize: '11.5px', color: 'var(--ink-soft)', fontWeight: 600 }}>
                  {prof.profession} • {prof.specialty}
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center', marginTop: '4px', fontSize: '11px', color: 'var(--steel)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                    <MapPin size={11} /> {prof.city}, {prof.state}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '2px', color: '#D97706', fontWeight: 600 }}>
                    <Star size={11} fill="#D97706" /> {prof.rating} ({prof.reviewsCount} avaliações)
                  </span>
                  {prof.creaCauNumber && (
                    <span className="mono" style={{ background: 'var(--paper)', padding: '1px 5px', borderRadius: '2px', fontSize: '9.5px' }}>
                      {prof.creaCauNumber}
                    </span>
                  )}
                </div>

                {prof.services && prof.services.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '8px' }}>
                    {prof.services.map((srv, idx) => (
                      <span key={idx} className="chip" style={{ fontSize: '9.5px', padding: '3px 8px' }}>
                        {srv}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Actions Bar */}
            <div className="titleblock">
              <div className="tb-field" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span className="pulse-dot"></span>
                <span className="mono" style={{ fontSize: '10px', color: 'var(--graphite)' }}>Disponível para Projetos</span>
              </div>
              <div className="tb-field" style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                <button 
                  onClick={(e) => handleOpenWhatsApp(e, prof)}
                  className="btn primary" 
                  style={{ background: '#059669', borderColor: '#059669', padding: '4px 10px', fontSize: '10px' }}
                >
                  <Phone size={11} /> WhatsApp
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); onRequestQuote(prof); }}
                  className="btn accent" 
                  style={{ padding: '4px 10px', fontSize: '10px' }}
                >
                  <FileText size={11} /> Orçamento
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* Render Companies */}
        {(activeTab === 'all' || activeTab === 'companies') && filteredComps.map(comp => (
          <div key={comp.id} className="card" onClick={() => onOpenProfile(comp)} style={{ cursor: 'pointer' }}>
            <div style={{ padding: '14px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <img 
                src={comp.avatar || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=150&auto=format&fit=crop&q=80'} 
                alt={comp.name} 
                style={{ width: '52px', height: '52px', borderRadius: '4px', objectFit: 'cover', border: '1px solid var(--steel-line)' }} 
              />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--ink)' }}>{comp.name}</h4>
                    {comp.isVerified && (
                      <span className="stamp-badge accent" style={{ fontSize: '8.5px', padding: '1px 5px' }}>
                        <CheckCircle2 size={10} /> Construtora
                      </span>
                    )}
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); onToggleFavorite(comp); }}
                    className="btn ghost" 
                    style={{ padding: '4px 6px', fontSize: '10px', color: favoriteIds.has(comp.id) ? 'var(--line)' : 'var(--steel)' }}
                  >
                    <Heart size={13} fill={favoriteIds.has(comp.id) ? 'var(--line)' : 'none'} />
                  </button>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center', marginTop: '4px', fontSize: '11px', color: 'var(--steel)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                    <MapPin size={11} /> {comp.city}, {comp.state}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '2px', color: '#D97706', fontWeight: 600 }}>
                    <Star size={11} fill="#D97706" /> {comp.rating} ({comp.reviewsCount} obras)
                  </span>
                  <span className="mono" style={{ background: 'var(--paper)', padding: '1px 5px', borderRadius: '2px', fontSize: '9.5px' }}>
                    CNPJ: {comp.cnpj}
                  </span>
                </div>

                {comp.services && comp.services.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '8px' }}>
                    {comp.services.map((srv, idx) => (
                      <span key={idx} className="chip" style={{ fontSize: '9.5px', padding: '3px 8px' }}>
                        {srv}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="titleblock">
              <div className="tb-field">
                <span className="mono" style={{ fontSize: '10px', color: 'var(--steel)' }}>Turn-Key & Empreitada Global</span>
              </div>
              <div className="tb-field" style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                <button 
                  onClick={(e) => handleOpenWhatsApp(e, comp)}
                  className="btn primary" 
                  style={{ background: '#059669', borderColor: '#059669', padding: '4px 10px', fontSize: '10px' }}
                >
                  <Phone size={11} /> WhatsApp
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); onRequestQuote(comp); }}
                  className="btn accent" 
                  style={{ padding: '4px 10px', fontSize: '10px' }}
                >
                  <FileText size={11} /> Solicitar Proposta
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* Render Suppliers */}
        {(activeTab === 'all' || activeTab === 'suppliers') && filteredSupps.map(supp => (
          <div key={supp.id} className="card" onClick={() => onOpenProfile(supp)} style={{ cursor: 'pointer' }}>
            <div style={{ padding: '14px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <img 
                src={supp.avatar || 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=150&auto=format&fit=crop&q=80'} 
                alt={supp.name} 
                style={{ width: '52px', height: '52px', borderRadius: '4px', objectFit: 'cover', border: '1px solid var(--steel-line)' }} 
              />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--ink)' }}>{supp.name}</h4>
                    <span className="tag" style={{ fontSize: '8.5px', padding: '1px 5px', background: 'var(--paper)', border: '1px solid var(--steel-line)' }}>
                      {supp.category}
                    </span>
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); onToggleFavorite(supp); }}
                    className="btn ghost" 
                    style={{ padding: '4px 6px', fontSize: '10px', color: favoriteIds.has(supp.id) ? 'var(--line)' : 'var(--steel)' }}
                  >
                    <Heart size={13} fill={favoriteIds.has(supp.id) ? 'var(--line)' : 'none'} />
                  </button>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center', marginTop: '4px', fontSize: '11px', color: 'var(--steel)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                    <MapPin size={11} /> {supp.city}, {supp.state}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '2px', color: '#D97706', fontWeight: 600 }}>
                    <Star size={11} fill="#D97706" /> {supp.rating} ({supp.reviewsCount} entregas)
                  </span>
                  {supp.deliveryAvailable && (
                    <span style={{ color: '#059669', fontWeight: 600, fontSize: '10.5px' }}>
                      🚚 Entrega no Canteiro Disponível
                    </span>
                  )}
                </div>

                {supp.productTypes && supp.productTypes.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '8px' }}>
                    {supp.productTypes.map((prod, idx) => (
                      <span key={idx} className="chip on" style={{ fontSize: '9.5px', padding: '3px 8px' }}>
                        📦 {prod}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="titleblock">
              <div className="tb-field">
                <span className="mono" style={{ fontSize: '10px', color: 'var(--steel)' }}>Fornecimento Direto de Fábrica / Distribuidor</span>
              </div>
              <div className="tb-field" style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                <button 
                  onClick={(e) => handleOpenWhatsApp(e, supp)}
                  className="btn primary" 
                  style={{ background: '#059669', borderColor: '#059669', padding: '4px 10px', fontSize: '10px' }}
                >
                  <Phone size={11} /> WhatsApp
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); onRequestQuote(supp); }}
                  className="btn primary" 
                  style={{ padding: '4px 10px', fontSize: '10px' }}
                >
                  <Truck size={11} /> Cotar Materiais
                </button>
              </div>
            </div>
          </div>
        ))}

        {totalResults === 0 && !loading && (
          <div className="card" style={{ padding: '40px 20px', textAlign: 'center', background: 'var(--paper)' }}>
            <Search size={32} color="var(--steel)" style={{ margin: '0 auto 8px' }} />
            <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--ink)' }}>Nenhum resultado encontrado</h4>
            <p style={{ fontSize: '12px', color: 'var(--steel)', marginTop: '4px' }}>
              Tente buscar por termos mais genéricos como "cimento", "estrutural", "projeto" ou selecione "Todas as Cidades".
            </p>
          </div>
        )}

      </div>

    </div>
  );
};
