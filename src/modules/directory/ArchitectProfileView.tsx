import React, { useEffect, useState } from 'react';
import { ClientBriefing, ProfessionalProfile, UserProfile } from '../../types';
import { RealApiClient } from '../../services/realApiClient';
import { formatAvailability, getCompatibilityReasons } from '../../utils/compatibility';
import {
  ArrowLeft,
  MapPin,
  ShieldCheck,
  Heart,
  Share2,
  Scale,
  MessageSquare,
  FileText,
  Star,
  Send,
  Flag,
  Check,
  AlertTriangle,
  Loader2,
  Briefcase,
} from 'lucide-react';

interface ArchitectProfileViewProps {
  architectId: string;
  initialProfile?: ProfessionalProfile | null;
  currentUser: UserProfile;
  briefing: ClientBriefing | null;
  isFavorited: boolean;
  isCompared: boolean;
  onBack: () => void;
  onToggleFavorite: (prof: ProfessionalProfile) => void;
  onToggleCompare: (prof: ProfessionalProfile) => void;
  onStartChat: (prof: ProfessionalProfile) => void;
  onRequestProposal: (prof: ProfessionalProfile) => void;
  onRequireAuth: () => void;
  onNotify: (msg: string) => void;
}

export const ArchitectProfileView: React.FC<ArchitectProfileViewProps> = ({
  architectId,
  initialProfile,
  currentUser,
  briefing,
  isFavorited,
  isCompared,
  onBack,
  onToggleFavorite,
  onToggleCompare,
  onStartChat,
  onRequestProposal,
  onRequireAuth,
  onNotify,
}) => {
  const [profile, setProfile] = useState<ProfessionalProfile | null>(initialProfile || null);
  const [loading, setLoading] = useState(!initialProfile);
  const [error, setError] = useState<string | null>(null);
  const [copiedUrl, setCopiedUrl] = useState(false);

  // Review state
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Report state
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState('Informações incorretas ou enganosas');
  const [reportDetails, setReportDetails] = useState('');

  const isGuest = !currentUser || currentUser.id === 'usr_guest';

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      const res = await RealApiClient.getProfessionalById(architectId);
      if (!active) return;
      if (res.ok && res.data) {
        setProfile(res.data);
      } else {
        setError(res.error || 'Perfil não encontrado.');
      }
      setLoading(false);
    };
    void load();
    return () => {
      active = false;
    };
  }, [architectId]);

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/arquiteto/${encodeURIComponent(architectId)}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${profile?.name || 'Arquiteto'} — Ballast Architecture`,
          text: `Confira o perfil e portfólio de ${profile?.name} na Ballast Architecture.`,
          url: shareUrl,
        });
        return;
      } catch {}
    }
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedUrl(true);
      onNotify('Link do perfil copiado para a área de transferência.');
      setTimeout(() => setCopiedUrl(false), 2500);
    } catch {}
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isGuest) {
      onRequireAuth();
      return;
    }
    if (!profile || !comment.trim()) return;
    setSubmittingReview(true);
    const res = await RealApiClient.createReview({
      targetUserId: profile.id,
      rating,
      comment: comment.trim(),
      contractType: 'Projeto Arquitetônico',
    });
    setSubmittingReview(false);
    if (res.ok) {
      setComment('');
      onNotify('Avaliação publicada com sucesso.');
      const refreshed = await RealApiClient.getProfessionalById(profile.id);
      if (refreshed.ok && refreshed.data) setProfile(refreshed.data);
    } else {
      onNotify(res.error || 'Não foi possível publicar a avaliação.');
    }
  };

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isGuest) {
      onRequireAuth();
      return;
    }
    if (!profile) return;
    const res = await RealApiClient.submitReport({
      targetType: 'profile',
      targetId: profile.id,
      reason: reportReason,
      details: reportDetails.trim(),
    });
    if (res.ok) {
      setReportOpen(false);
      setReportDetails('');
      onNotify('Denúncia registrada para análise da equipe Ballast.');
    } else {
      onNotify(res.error || 'Erro ao enviar denúncia.');
    }
  };

  if (loading) {
    return (
      <div className="ballast-container" style={{ paddingTop: '48px', paddingBottom: '64px', textAlign: 'center' }}>
        <Loader2 size={28} className="animate-spin" color="#2F5872" style={{ margin: '0 auto 12px' }} />
        <p style={{ fontSize: '14px', color: 'var(--steel)' }}>Carregando perfil profissional...</p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="ballast-container" style={{ paddingTop: '48px', paddingBottom: '64px' }}>
        <button type="button" onClick={onBack} className="btn ghost" style={{ marginBottom: '20px' }}>
          <ArrowLeft size={15} /> Voltar ao catálogo
        </button>
        <div className="card" style={{ padding: '40px 24px', textAlign: 'center' }}>
          <AlertTriangle size={30} color="#B42318" style={{ margin: '0 auto 10px' }} />
          <h2 style={{ fontSize: '22px', marginBottom: '8px' }}>Perfil indisponível</h2>
          <p style={{ fontSize: '14px', color: 'var(--steel)' }}>{error || 'Não foi possível carregar este perfil.'}</p>
        </div>
      </div>
    );
  }

  const avail = formatAvailability(profile.availability);
  const matchReasons = getCompatibilityReasons(profile, briefing);
  const portfolioItems = profile.portfolio || profile.portfolioPreview || [];
  const reviews = profile.reviews || [];
  const initials = profile.name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join('');

  return (
    <div className="ballast-container" style={{ paddingTop: '28px', paddingBottom: '64px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
        <button type="button" onClick={onBack} className="btn ghost" style={{ minHeight: '36px', padding: '7px 14px' }}>
          <ArrowLeft size={15} /> Voltar aos arquitetos
        </button>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button type="button" onClick={handleShare} className="btn ghost" style={{ minHeight: '36px', padding: '7px 13px' }}>
            <Share2 size={14} /> {copiedUrl ? 'Link copiado' : 'Compartilhar link'}
          </button>
          <button type="button" onClick={() => onToggleCompare(profile)} className="btn ghost" style={{ minHeight: '36px', padding: '7px 13px' }}>
            <Scale size={14} /> {isCompared ? 'Na comparação' : 'Comparar'}
          </button>
          <button type="button" onClick={() => onToggleFavorite(profile)} className="btn ghost" style={{ minHeight: '36px', padding: '7px 13px' }}>
            <Heart size={14} fill={isFavorited ? '#2F5872' : 'none'} color={isFavorited ? '#2F5872' : undefined} />
            {isFavorited ? 'Salvo' : 'Salvar'}
          </button>
        </div>
      </div>

      {/* Main Profile Header Card */}
      <section className="card" style={{ padding: 'clamp(20px, 3vw, 32px)', marginBottom: '24px' }}>
        <div
          className="responsive-split"
          style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.4fr) minmax(260px, 0.75fr)', gap: '28px', alignItems: 'start' }}
        >
          <div>
            <div style={{ display: 'flex', gap: '18px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '18px' }}>
              {profile.avatar ? (
                <img
                  src={profile.avatar}
                  alt={profile.name}
                  style={{ width: '80px', height: '80px', borderRadius: 'var(--radius-md)', objectFit: 'cover', border: '1px solid var(--border-color)' }}
                />
              ) : (
                <div
                  style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--azul-lastro)',
                    color: '#FFFFFF',
                    fontFamily: 'var(--font-display)',
                    fontSize: '28px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {initials}
                </div>
              )}

              <div>
                <div className="meta-label" style={{ color: 'var(--azul-lastro)', marginBottom: '4px' }}>
                  {profile.profession}
                </div>
                <h1 style={{ fontSize: 'clamp(26px, 3.6vw, 38px)', marginBottom: '6px' }}>{profile.name}</h1>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center', fontSize: '13.5px', color: 'var(--steel)' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                    <MapPin size={14} color="#2F5872" /> {profile.city}, {profile.state}
                  </span>
                  {profile.experienceYears > 0 && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                      <Briefcase size={14} color="#2F5872" /> {profile.experienceYears} anos de experiência
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Credential Verification Status — Strictly Distinguished */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '18px' }}>
              {profile.isVerified ? (
                <span className="badge verified">
                  <ShieldCheck size={13} /> {profile.creaCauNumber ? `${profile.creaCauNumber} — Verificado pela Ballast` : 'Profissional verificado pela Ballast'}
                </span>
              ) : profile.creaCauNumber ? (
                <span className="badge declared">
                  Registro declarado pelo profissional: {profile.creaCauNumber} (aguardando validação)
                </span>
              ) : (
                <span className="badge">Registro profissional não informado</span>
              )}

              <span className="badge" style={{ color: avail.tone === 'success' ? 'var(--color-success)' : 'var(--steel)' }}>
                {avail.label}
              </span>
            </div>

            <p style={{ fontSize: '15px', color: 'var(--text-body)', lineHeight: 1.7, marginBottom: '18px' }}>
              {profile.bio || 'Perfil profissional cadastrado na Ballast Architecture.'}
            </p>

            {/* Structured Specs */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
              <div>
                <div className="meta-label" style={{ marginBottom: '4px' }}>Especialidade</div>
                <div style={{ fontSize: '14px', fontWeight: 600 }}>{profile.specialty}</div>
              </div>
              <div>
                <div className="meta-label" style={{ marginBottom: '4px' }}>Área de atendimento</div>
                <div style={{ fontSize: '14px', fontWeight: 500 }}>{profile.serviceArea || `${profile.city}, ${profile.state}`}</div>
              </div>
              {profile.investmentRanges?.length > 0 && (
                <div>
                  <div className="meta-label" style={{ marginBottom: '4px' }}>Faixas de projeto</div>
                  <div style={{ fontSize: '13.5px' }}>{profile.investmentRanges.join(' · ')}</div>
                </div>
              )}
            </div>

            {(profile.projectTypes?.length > 0 || profile.styles?.length > 0 || profile.services?.length > 0) && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '16px' }}>
                {[...(profile.projectTypes || []), ...(profile.styles || []), ...(profile.services || [])].map((tag, i) => (
                  <span key={`${tag}-${i}`} className="badge">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Right Contact & Compatibility Box */}
          <aside
            style={{
              background: 'var(--bg-subtle)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
            }}
          >
            <div className="meta-label" style={{ color: 'var(--azul-lastro)' }}>INICIAR CONTATO</div>
            <p style={{ fontSize: '13.5px', color: 'var(--text-body)', margin: 0 }}>
              Envie seu briefing estruturado ou inicie uma conversa privada diretamente pela plataforma Ballast.
            </p>

            {matchReasons.length > 0 && (
              <div style={{ background: 'var(--branco)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '12px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--azul-lastro)', marginBottom: '6px' }}>
                  Compatibilidade com seu briefing
                </div>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '12.5px' }}>
                  {matchReasons.map((r) => (
                    <li key={r} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Check size={13} color="#2F5872" /> {r}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <button type="button" onClick={() => onRequestProposal(profile)} className="btn primary" style={{ width: '100%' }}>
              <FileText size={15} /> Solicitar proposta
            </button>
            <button type="button" onClick={() => onStartChat(profile)} className="btn ghost" style={{ width: '100%' }}>
              <MessageSquare size={15} /> Conversar no chat
            </button>

            <button
              type="button"
              onClick={() => setReportOpen((o) => !o)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--steel)',
                fontSize: '12px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                justifyContent: 'center',
                marginTop: '4px',
              }}
            >
              <Flag size={12} /> Reportar problema neste perfil
            </button>

            {reportOpen && (
              <form onSubmit={handleSubmitReport} style={{ borderTop: '1px solid var(--border-color)', paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label htmlFor="report-profile-reason">Motivo</label>
                <select id="report-profile-reason" value={reportReason} onChange={(e) => setReportReason(e.target.value)}>
                  <option value="Informações incorretas ou enganosas">Informações incorretas ou enganosas</option>
                  <option value="Uso indevido de registro profissional">Uso indevido de registro profissional</option>
                  <option value="Spam ou abordagem abusiva">Spam ou abordagem abusiva</option>
                </select>
                <textarea
                  rows={2}
                  placeholder="Detalhes adicionais (opcional)"
                  value={reportDetails}
                  onChange={(e) => setReportDetails(e.target.value)}
                />
                <button type="submit" className="btn danger" style={{ fontSize: '12.5px', minHeight: '34px' }}>
                  Enviar denúncia
                </button>
              </form>
            )}
          </aside>
        </div>
      </section>

      {/* Structured Portfolio Section */}
      <section style={{ marginBottom: '28px' }}>
        <div style={{ marginBottom: '16px' }}>
          <div className="meta-label" style={{ color: 'var(--azul-lastro)', marginBottom: '4px' }}>PORTFÓLIO</div>
          <h2 style={{ fontSize: '28px' }}>Projetos publicados ({portfolioItems.length})</h2>
        </div>

        {portfolioItems.length === 0 ? (
          <div className="card" style={{ padding: '32px 20px', textAlign: 'center', color: 'var(--steel)', fontSize: '14px' }}>
            Este profissional ainda não publicou projetos no portfólio.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
            {portfolioItems.map((item) => (
              <article key={item.id} className="card" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                {item.mediaUrls?.[0] && (
                  <div style={{ aspectRatio: '16 / 10', overflow: 'hidden', background: 'var(--grafite)' }}>
                    <img
                      src={item.mediaUrls[0]}
                      alt={item.title}
                      loading="lazy"
                      decoding="async"
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    />
                  </div>
                )}
                <div style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    {item.projectType && <span className="badge accent">{item.projectType}</span>}
                    <span style={{ fontSize: '12px', color: 'var(--steel)' }}>
                      {[item.city && `${item.city}/${item.state}`, item.year].filter(Boolean).join(' · ')}
                    </span>
                  </div>
                  <h3 style={{ fontSize: '20px' }}>{item.title}</h3>
                  {item.description && <p style={{ fontSize: '13.5px', lineHeight: 1.6, margin: 0 }}>{item.description}</p>}
                  {item.context && (
                    <p style={{ fontSize: '12.5px', color: 'var(--steel)', margin: 0 }}>
                      <strong>Contexto:</strong> {item.context}
                    </p>
                  )}
                  {item.photoCredit && (
                    <div style={{ marginTop: 'auto', paddingTop: '8px', fontSize: '11.5px', color: 'var(--steel)' }}>
                      Crédito fotográfico: {item.photoCredit}
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Reviews Section */}
      <section className="card" style={{ padding: '24px' }}>
        <h2 style={{ fontSize: '24px', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Star size={18} color="#2F5872" /> Avaliações de clientes ({reviews.length})
        </h2>

        {reviews.length === 0 ? (
          <p style={{ fontSize: '13.5px', color: 'var(--steel)', marginBottom: '18px' }}>
            Ainda não há avaliações registradas para este profissional.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
            {reviews.map((rev) => (
              <div key={rev.id} style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '13px' }}>
                  <strong>{rev.reviewer_name}</strong>
                  <span aria-label={`${rev.rating} de 5 estrelas`} style={{ color: 'var(--azul-lastro)', fontWeight: 700 }}>
                    {'★'.repeat(rev.rating)}{'☆'.repeat(5 - rev.rating)}
                  </span>
                </div>
                <p style={{ fontSize: '13.5px', margin: 0 }}>{rev.comment}</p>
              </div>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmitReview} style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
          <div style={{ fontSize: '13.5px', fontWeight: 600, marginBottom: '8px' }}>Registrar sua avaliação</div>
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '12.5px', color: 'var(--steel)' }}>Nota:</span>
            {[1, 2, 3, 4, 5].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setRating(st)}
                aria-label={`Nota ${st}`}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '20px',
                  color: st <= rating ? '#2F5872' : '#C8C1B2',
                  padding: '0 2px',
                }}
              >
                ★
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <input
              type="text"
              aria-label="Comentário da avaliação"
              placeholder={isGuest ? 'Faça login para avaliar este profissional...' : 'Compartilhe como foi sua experiência no projeto...'}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              style={{ flex: 1, minWidth: '220px' }}
              required
            />
            <button type="submit" disabled={submittingReview} className="btn primary">
              {submittingReview ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />} Publicar avaliação
            </button>
          </div>
        </form>
      </section>
    </div>
  );
};
