import React, { useState, useEffect, useCallback } from 'react';
import {
  ProfessionalProfile,
  UserProfile,
  ClientBriefing,
} from '../../types';
import { RealApiClient } from '../../services/realApiClient';
import { trackEvent } from '../../services/telemetry';
import {
  PROJECT_TYPES,
  ARCHITECTURAL_STYLES,
  INVESTMENT_RANGES,
  formatAvailability,
  getCompatibilityReasons,
} from '../../utils/compatibility';
import {
  Search,
  MapPin,
  Heart,
  ShieldCheck,
  Scale,
  AlertTriangle,
  RefreshCw,
  SlidersHorizontal,
  ArrowRight,
  Check,
  Sparkles,
  UserPlus,
} from 'lucide-react';

interface DirectoryViewProps {
  currentUser: UserProfile;
  briefing: ClientBriefing | null;
  onOpenArchitectPage: (prof: ProfessionalProfile) => void;
  onRequestProposal: (prof: ProfessionalProfile) => void;
  onToggleFavorite: (prof: ProfessionalProfile) => void;
  favoriteIds: Set<string>;
  compareList: ProfessionalProfile[];
  onToggleCompare: (prof: ProfessionalProfile) => void;
  onOpenCompare: () => void;
  onOpenBriefing: () => void;
  onArchitectSignup: () => void;
}

export const DirectoryView: React.FC<DirectoryViewProps> = ({
  briefing,
  onOpenArchitectPage,
  onRequestProposal,
  onToggleFavorite,
  favoriteIds,
  compareList,
  onToggleCompare,
  onOpenCompare,
  onOpenBriefing,
  onArchitectSignup,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [cityFilter, setCityFilter] = useState(briefing?.city || '');
  const [projectTypeFilter, setProjectTypeFilter] = useState(briefing?.projectType || '');
  const [styleFilter, setStyleFilter] = useState(briefing?.stylePreferences?.[0] || '');
  const [investmentFilter, setInvestmentFilter] = useState(briefing?.budgetRange || '');
  const [availabilityFilter, setAvailabilityFilter] = useState('');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const [professionals, setProfessionals] = useState<ProfessionalProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [serviceError, setServiceError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setServiceError(null);

    const res = await RealApiClient.getProfessionals({
      q: searchQuery.trim() || undefined,
      city: cityFilter.trim() || undefined,
      projectType: projectTypeFilter || undefined,
      style: styleFilter || undefined,
      investmentRange: investmentFilter || undefined,
      availability: availabilityFilter || undefined,
      verifiedOnly: verifiedOnly || undefined,
      limit: 30,
    });

    if (!res.ok) {
      setServiceError(res.error || 'Não foi possível consultar o catálogo de arquitetos no momento.');
      setProfessionals([]);
    } else {
      const items = res.data?.items || [];
      setProfessionals(items);
      if (items.length > 0 && (searchQuery || cityFilter || projectTypeFilter || styleFilter)) {
        trackEvent('architect_found', { count: items.length, city: cityFilter || undefined });
      }
    }
    setLoading(false);
  }, [searchQuery, cityFilter, projectTypeFilter, styleFilter, investmentFilter, availabilityFilter, verifiedOnly]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadData();
    }, 200);
    return () => clearTimeout(timer);
  }, [loadData]);

  const hasActiveFilters = Boolean(
    searchQuery || cityFilter || projectTypeFilter || styleFilter || investmentFilter || availabilityFilter || verifiedOnly
  );

  const clearFilters = () => {
    setSearchQuery('');
    setCityFilter('');
    setProjectTypeFilter('');
    setStyleFilter('');
    setInvestmentFilter('');
    setAvailabilityFilter('');
    setVerifiedOnly(false);
  };

  const compareIds = new Set(compareList.map((p) => p.id));

  return (
    <div className="ballast-container" style={{ paddingTop: '32px', paddingBottom: '48px' }}>
      {/* Editorial Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        <div style={{ maxWidth: '640px' }}>
          <div className="meta-label" style={{ color: 'var(--azul-lastro)', marginBottom: '8px' }}>
            CATÁLOGO DE ARQUITETURA · BALLAST
          </div>
          <h1 style={{ fontSize: 'clamp(28px, 4vw, 42px)', marginBottom: '8px' }}>
            Encontre arquitetos compatíveis
          </h1>
          <p style={{ fontSize: '14.5px', color: 'var(--steel)' }}>
            Filtre por cidade, tipo de projeto, estilo arquitetônico, faixa de investimento e disponibilidade.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button type="button" onClick={onOpenBriefing} className="btn ghost">
            <Sparkles size={15} />
            {briefing ? 'Editar meu briefing' : 'Personalizar por briefing'}
          </button>
          {compareList.length > 0 && (
            <button type="button" onClick={onOpenCompare} className="btn primary">
              <Scale size={15} /> Comparar ({compareList.length}/3)
            </button>
          )}
        </div>
      </div>

      {/* Active Briefing Context Strip */}
      {briefing && (
        <div
          style={{
            background: 'var(--azul-lastro-soft)',
            border: '1px solid #C4D6E2',
            borderRadius: 'var(--radius-md)',
            padding: '14px 18px',
            marginBottom: '20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div style={{ fontSize: '13.5px', color: 'var(--grafite)' }}>
            <strong>Briefing ativo:</strong>{' '}
            {[briefing.projectType, briefing.city && `${briefing.city}/${briefing.state}`, briefing.budgetRange]
              .filter(Boolean)
              .join(' · ') || 'Preferências salvas'}{' '}
            {briefing.stylePreferences.length > 0 && (
              <span style={{ color: 'var(--azul-lastro)', fontWeight: 600 }}>
                · Estilos: {briefing.stylePreferences.join(', ')}
              </span>
            )}
          </div>
          <button type="button" onClick={onOpenBriefing} className="btn ghost" style={{ padding: '6px 12px', minHeight: '32px', fontSize: '12.5px' }}>
            Ajustar briefing
          </button>
        </div>
      )}

      {/* Search & Filter Panel */}
      <section aria-label="Filtros do catálogo" className="card" style={{ padding: '18px', marginBottom: '24px' }}>
        <div
          className="responsive-2col"
          style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr auto', gap: '12px', alignItems: 'end' }}
        >
          <div>
            <label htmlFor="catalog-search">Buscar profissional, especialidade ou serviço</label>
            <div style={{ position: 'relative' }}>
              <Search
                size={16}
                color="#546168"
                style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
              />
              <input
                id="catalog-search"
                type="search"
                placeholder="Ex: arquitetura residencial, reforma, minimalista, São Paulo..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ paddingLeft: '36px' }}
              />
            </div>
          </div>

          <div>
            <label htmlFor="catalog-city">Cidade ou região</label>
            <div style={{ position: 'relative' }}>
              <MapPin
                size={16}
                color="#546168"
                style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
              />
              <input
                id="catalog-city"
                type="text"
                placeholder="Ex: São Paulo, Curitiba..."
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
                style={{ paddingLeft: '36px' }}
              />
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowAdvancedFilters((v) => !v)}
            className="btn ghost"
            aria-expanded={showAdvancedFilters}
          >
            <SlidersHorizontal size={15} />
            Filtros
          </button>
        </div>

        {/* Advanced Architectural Filters */}
        {showAdvancedFilters && (
          <div
            style={{
              marginTop: '16px',
              paddingTop: '16px',
              borderTop: '1px solid var(--border-color)',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '12px',
            }}
          >
            <div>
              <label htmlFor="filter-project-type">Tipo de projeto</label>
              <select
                id="filter-project-type"
                value={projectTypeFilter}
                onChange={(e) => setProjectTypeFilter(e.target.value)}
              >
                <option value="">Todos os tipos</option>
                {PROJECT_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="filter-style">Estilo arquitetônico</label>
              <select id="filter-style" value={styleFilter} onChange={(e) => setStyleFilter(e.target.value)}>
                <option value="">Todos os estilos</option>
                {ARCHITECTURAL_STYLES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="filter-investment">Faixa de investimento</label>
              <select
                id="filter-investment"
                value={investmentFilter}
                onChange={(e) => setInvestmentFilter(e.target.value)}
              >
                <option value="">Qualquer faixa</option>
                {INVESTMENT_RANGES.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="filter-availability">Disponibilidade</label>
              <select
                id="filter-availability"
                value={availabilityFilter}
                onChange={(e) => setAvailabilityFilter(e.target.value)}
              >
                <option value="">Qualquer disponibilidade</option>
                <option value="disponivel">Disponível</option>
                <option value="agenda_limitada">Agenda limitada</option>
                <option value="lista_espera">Lista de espera</option>
              </select>
            </div>
          </div>
        )}

        {/* Quick Chips + Verified Toggle */}
        <div
          style={{
            marginTop: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '10px',
          }}
        >
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
            {PROJECT_TYPES.slice(0, 4).map((t) => (
              <button
                key={t}
                type="button"
                className={`chip ${projectTypeFilter === t ? 'on' : ''}`}
                onClick={() => setProjectTypeFilter(projectTypeFilter === t ? '' : t)}
              >
                {t}
              </button>
            ))}
            <button
              type="button"
              className={`chip ${verifiedOnly ? 'on' : ''}`}
              onClick={() => setVerifiedOnly((v) => !v)}
            >
              <ShieldCheck size={13} /> Apenas registro verificado
            </button>
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--azul-lastro)',
                fontWeight: 600,
                fontSize: '12.5px',
                cursor: 'pointer',
                textDecoration: 'underline',
              }}
            >
              Limpar filtros
            </button>
          )}
        </div>
      </section>

      {/* Results Status Header */}
      {!loading && !serviceError && (
        <div style={{ marginBottom: '16px', fontSize: '13px', color: 'var(--steel)', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
          <span>
            {professionals.length === 1
              ? '1 profissional encontrado'
              : `${professionals.length} profissionais encontrados`}
          </span>
          <span>Selecione até 3 perfis para comparar lado a lado</span>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {[1, 2, 3].map((n) => (
            <div key={n} className="card" style={{ padding: '24px', minHeight: '260px', opacity: 0.65 }}>
              <div style={{ height: '18px', width: '55%', background: 'var(--paper)', borderRadius: '4px', marginBottom: '12px' }} />
              <div style={{ height: '14px', width: '40%', background: 'var(--paper)', borderRadius: '4px', marginBottom: '18px' }} />
              <div style={{ height: '90px', width: '100%', background: 'var(--paper)', borderRadius: '6px' }} />
            </div>
          ))}
        </div>
      )}

      {/* Explicit Service Unavailable State (NEVER show fake mock data!) */}
      {!loading && serviceError && (
        <div
          role="alert"
          className="card"
          style={{
            padding: '40px 24px',
            textAlign: 'center',
            borderColor: '#FECDCA',
            background: 'var(--color-danger-light)',
          }}
        >
          <AlertTriangle size={32} color="#B42318" style={{ margin: '0 auto 12px' }} />
          <h2 style={{ fontSize: '22px', marginBottom: '8px', color: 'var(--grafite)' }}>
            Serviço temporariamente indisponível
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--text-body)', maxWidth: '480px', margin: '0 auto 20px' }}>
            {serviceError}
          </p>
          <button type="button" onClick={loadData} className="btn primary">
            <RefreshCw size={15} /> Tentar novamente
          </button>
        </div>
      )}

      {/* Genuine Empty State */}
      {!loading && !serviceError && professionals.length === 0 && (
        <div className="card" style={{ padding: '52px 24px', textAlign: 'center' }}>
          <Search size={32} color="#546168" style={{ margin: '0 auto 12px' }} />
          <h2 style={{ fontSize: '24px', marginBottom: '8px' }}>
            {hasActiveFilters ? 'Nenhum arquiteto encontrado com estes filtros' : 'Catálogo pronto para receber profissionais'}
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--steel)', maxWidth: '480px', margin: '0 auto 22px' }}>
            {hasActiveFilters
              ? 'Experimente ampliar a cidade, remover alguns filtros ou ajustar seu briefing.'
              : 'Os primeiros arquitetos e escritórios estão publicando seus perfis reais na Ballast. Você é profissional de arquitetura?'}
          </p>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
            {hasActiveFilters && (
              <button type="button" onClick={clearFilters} className="btn primary">
                Limpar filtros
              </button>
            )}
            <button type="button" onClick={onArchitectSignup} className="btn ghost">
              <UserPlus size={15} /> Cadastrar perfil profissional
            </button>
          </div>
        </div>
      )}

      {/* Editorial Architect Result Cards (Inspired by PDF Page 11) */}
      {!loading && !serviceError && professionals.length > 0 && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '20px',
          }}
        >
          {professionals.map((prof) => {
            const avail = formatAvailability(prof.availability);
            const matchReasons = getCompatibilityReasons(prof, briefing);
            const isFav = favoriteIds.has(prof.id);
            const isCompared = compareIds.has(prof.id);
            const coverPhoto = prof.portfolioPreview?.[0]?.mediaUrls?.[0];
            const initials = prof.name
              .split(' ')
              .filter(Boolean)
              .slice(0, 2)
              .map((s) => s[0]?.toUpperCase())
              .join('');

            return (
              <article
                key={prof.id}
                className="card"
                style={{
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                {/* Cover or Profile Header Strip */}
                {coverPhoto && (
                  <div
                    onClick={() => onOpenArchitectPage(prof)}
                    style={{ height: '164px', overflow: 'hidden', cursor: 'pointer', background: 'var(--grafite)' }}
                  >
                    <img
                      src={coverPhoto}
                      alt={`Projeto de ${prof.name}`}
                      loading="lazy"
                      decoding="async"
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    />
                  </div>
                )}

                <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center', minWidth: 0 }}>
                      {prof.avatar ? (
                        <img
                          src={prof.avatar}
                          alt={prof.name}
                          loading="lazy"
                          style={{
                            width: '52px',
                            height: '52px',
                            borderRadius: 'var(--radius-sm)',
                            objectFit: 'cover',
                            border: '1px solid var(--border-color)',
                            flexShrink: 0,
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: '52px',
                            height: '52px',
                            borderRadius: 'var(--radius-sm)',
                            background: 'var(--azul-lastro)',
                            color: '#FFFFFF',
                            fontFamily: 'var(--font-display)',
                            fontSize: '18px',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          {initials}
                        </div>
                      )}

                      <div style={{ minWidth: 0 }}>
                        <h3
                          onClick={() => onOpenArchitectPage(prof)}
                          style={{
                            fontSize: '20px',
                            cursor: 'pointer',
                            marginBottom: '2px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {prof.name}
                        </h3>
                        <div style={{ fontSize: '13px', color: 'var(--azul-lastro)', fontWeight: 600 }}>
                          {prof.specialty || prof.profession}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => onToggleFavorite(prof)}
                      aria-label={isFav ? `Remover ${prof.name} dos salvos` : `Salvar ${prof.name}`}
                      style={{
                        background: 'var(--bg-subtle)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '50%',
                        width: '34px',
                        height: '34px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        color: isFav ? 'var(--azul-lastro)' : 'var(--steel)',
                        flexShrink: 0,
                      }}
                    >
                      <Heart size={15} fill={isFav ? '#2F5872' : 'none'} />
                    </button>
                  </div>

                  {/* Location & Clear Credential Distinction */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center', fontSize: '12.5px', color: 'var(--steel)' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <MapPin size={13} /> {prof.city}, {prof.state}
                    </span>

                    {prof.isVerified ? (
                      <span className="badge verified">
                        <ShieldCheck size={12} /> {prof.creaCauNumber ? `${prof.creaCauNumber} · Verificado` : 'Verificado'}
                      </span>
                    ) : prof.creaCauNumber ? (
                      <span className="badge declared">Registro declarado: {prof.creaCauNumber}</span>
                    ) : null}
                  </div>

                  {/* Bio excerpt */}
                  {prof.bio && (
                    <p
                      style={{
                        fontSize: '13.5px',
                        color: 'var(--text-body)',
                        lineHeight: 1.55,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        margin: 0,
                      }}
                    >
                      {prof.bio}
                    </p>
                  )}

                  {/* Styles / Project Types */}
                  {(prof.styles?.length > 0 || prof.projectTypes?.length > 0) && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {[...(prof.projectTypes || []).slice(0, 2), ...(prof.styles || []).slice(0, 2)].map((tag, idx) => (
                        <span key={`${tag}-${idx}`} className="badge" style={{ fontSize: '11px' }}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Transparent Compatibility Explanation */}
                  {matchReasons.length > 0 && (
                    <div
                      style={{
                        background: 'var(--bg-subtle)',
                        borderLeft: '3px solid var(--azul-lastro)',
                        padding: '10px 12px',
                        borderRadius: '0 var(--radius-xs) var(--radius-xs) 0',
                      }}
                    >
                      <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--azul-lastro)', marginBottom: '4px' }}>
                        Por que combina com seu briefing
                      </div>
                      <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '3px', fontSize: '12px', color: 'var(--grafite)' }}>
                        {matchReasons.map((r) => (
                          <li key={r} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Check size={12} color="#2F5872" /> {r}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Availability + Actions */}
                  <div
                    style={{
                      marginTop: 'auto',
                      paddingTop: '14px',
                      borderTop: '1px solid var(--border-color)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                      <span
                        style={{
                          fontWeight: 600,
                          color:
                            avail.tone === 'success'
                              ? 'var(--color-success)'
                              : avail.tone === 'warn'
                              ? 'var(--color-warn)'
                              : 'var(--steel)',
                        }}
                      >
                        {avail.label}
                      </span>
                      {prof.experienceYears > 0 && (
                        <span style={{ color: 'var(--steel)' }}>{prof.experienceYears} anos de atuação</span>
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        type="button"
                        onClick={() => onOpenArchitectPage(prof)}
                        className="btn primary"
                        style={{ flex: 1, fontSize: '13px', padding: '8px 14px' }}
                      >
                        Ver perfil <ArrowRight size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => onToggleCompare(prof)}
                        className="btn ghost"
                        style={{
                          padding: '8px 12px',
                          fontSize: '12.5px',
                          borderColor: isCompared ? 'var(--azul-lastro)' : undefined,
                          background: isCompared ? 'var(--azul-lastro-soft)' : undefined,
                          color: isCompared ? 'var(--azul-lastro)' : undefined,
                        }}
                        title={isCompared ? 'Remover da comparação' : 'Comparar profissional'}
                      >
                        <Scale size={14} />
                        {isCompared ? 'Na lista' : 'Comparar'}
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};
