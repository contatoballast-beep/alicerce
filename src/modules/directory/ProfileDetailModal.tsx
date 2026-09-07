import React, { useState, useEffect } from 'react';
import { Modal } from '../../components/Modal';
import { UserProfile, ReviewItem } from '../../types';
import { RealApiClient } from '../../services/realApiClient';
import { 
  Star, 
  MapPin, 
  Phone, 
  MessageSquare, 
  ShieldCheck, 
  Heart, 
  Share2, 
  Send, 
  Briefcase, 
  FileText, 
  ExternalLink,
  CheckCircle2,
  Loader2
} from 'lucide-react';

interface ProfileDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: any | null;
  currentUser: UserProfile;
  onRequestQuote: (profile: any) => void;
  onToggleFavorite: (profile: any) => void;
  isFavorited?: boolean;
  onStartChat?: (profile: any) => void;
}

export const ProfileDetailModal: React.FC<ProfileDetailModalProps> = ({
  isOpen,
  onClose,
  profile,
  currentUser,
  onRequestQuote,
  onToggleFavorite,
  isFavorited = false,
  onStartChat,
}) => {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (profile?.id) {
      RealApiClient.getReviews(profile.id).then(setReviews);
    }
  }, [profile?.id]);

  if (!profile) return null;

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${profile.name} - ALICERCE`,
          text: `Confira o perfil de ${profile.name} na plataforma ALICERCE:`,
          url,
        });
      } catch (err) {
        // Share cancelled or failed
      }
    } else {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleOpenWhatsApp = () => {
    const rawNumber = profile.whatsapp || profile.phone || '5511987654321';
    const cleanNumber = rawNumber.replace(/\D/g, '');
    const fullNumber = cleanNumber.startsWith('55') ? cleanNumber : `55${cleanNumber}`;
    const text = encodeURIComponent(`Olá ${profile.name}, encontrei seu perfil na plataforma ALICERCE e gostaria de solicitar um orçamento para minha obra.`);
    window.open(`https://wa.me/${fullNumber}?text=${text}`, '_blank');
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmittingReview(true);
    await RealApiClient.createReview({
      reviewerId: currentUser.id,
      reviewerName: currentUser.name,
      reviewerAvatar: currentUser.avatar,
      targetUserId: profile.id,
      rating: newRating,
      comment: newComment,
      contractType: 'Serviço ALICERCE'
    });

    const updatedReviews = await RealApiClient.getReviews(profile.id);
    setReviews(updatedReviews);
    setNewComment('');
    setSubmittingReview(false);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={profile.name} maxWidth="680px">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        
        {/* Header Profile Info */}
        <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
          <img 
            src={profile.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'} 
            alt={profile.name} 
            style={{ width: '68px', height: '68px', borderRadius: 'var(--radius-md)', objectFit: 'cover', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }} 
          />
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-heading)', margin: 0, letterSpacing: '-0.02em' }}>{profile.name}</h3>
                {profile.tradeName && profile.tradeName !== profile.name && (
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Nome Fantasia: {profile.tradeName}</div>
                )}
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button 
                  onClick={() => onToggleFavorite(profile)}
                  className="btn ghost" 
                  style={{ padding: '6px 10px', fontSize: '12px', color: isFavorited ? 'var(--accent-color)' : 'var(--text-muted)' }}
                  title="Favoritar"
                >
                  <Heart size={15} fill={isFavorited ? 'var(--accent-color)' : 'none'} />
                </button>
                <button 
                  onClick={handleShare}
                  className="btn ghost" 
                  style={{ padding: '6px 10px', fontSize: '12px' }}
                  title="Compartilhar Perfil"
                >
                  <Share2 size={15} /> {copied ? 'Copiado!' : ''}
                </button>
              </div>
            </div>

            <div style={{ fontSize: '13px', color: 'var(--primary-color)', fontWeight: 600, marginTop: '2px' }}>
              {profile.profession || profile.category || 'Prestador Verificado'}
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', marginTop: '8px', fontSize: '12px', color: 'var(--text-muted)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <MapPin size={13} color="var(--primary-color)" /> {profile.city}, {profile.state}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#D97706', fontWeight: 700 }}>
                <Star size={13} fill="#D97706" /> {profile.rating || 5.0} ({profile.reviewsCount || reviews.length} avaliações)
              </span>
              {profile.creaCauNumber && (
                <span style={{ 
                  background: 'rgba(37, 99, 235, 0.08)', 
                  color: 'var(--primary-color)',
                  padding: '2px 8px', 
                  borderRadius: 'var(--radius-sm)', 
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  fontWeight: 600
                }}>
                  {profile.creaCauNumber}
                </span>
              )}
              {profile.cnpj && (
                <span style={{ 
                  background: 'var(--bg-subtle)', 
                  color: 'var(--text-muted)',
                  padding: '2px 8px', 
                  borderRadius: 'var(--radius-sm)', 
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px'
                }}>
                  CNPJ: {profile.cnpj}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action CTAs */}
        <div style={{ display: 'grid', gridTemplateColumns: onStartChat ? '1fr 1fr 1fr' : '1fr 1fr', gap: '10px' }}>
          {onStartChat && (
            <button 
              onClick={() => {
                onClose();
                onStartChat(profile);
              }}
              className="btn primary" 
              style={{ justifyContent: 'center', fontSize: '12px', padding: '10px' }}
            >
              <MessageSquare size={14} /> Chat Direto
            </button>
          )}
          <button 
            onClick={handleOpenWhatsApp}
            className="btn primary" 
            style={{ background: '#059669', borderColor: '#059669', justifyContent: 'center', fontSize: '12px', padding: '10px' }}
          >
            <Phone size={14} /> WhatsApp
          </button>
          <button 
            onClick={() => onRequestQuote(profile)}
            className="btn accent" 
            style={{ justifyContent: 'center', fontSize: '12px', padding: '10px' }}
          >
            <FileText size={14} /> Solicitar Orçamento
          </button>
        </div>

        {/* Bio / Description */}
        <div>
          <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-heading)', margin: '0 0 6px 0' }}>Sobre & Atuação</h4>
          <p style={{ fontSize: '13px', color: 'var(--text-body)', lineHeight: '1.6', margin: 0 }}>
            {profile.bio || profile.description || 'Profissional atuando com alto rigor técnico, pontualidade e conformidade com normas ABNT.'}
          </p>
        </div>

        {/* Services / Products List */}
        {profile.services && profile.services.length > 0 && (
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-heading)', margin: '0 0 8px 0' }}>Serviços Especializados</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {profile.services.map((srv: string, i: number) => (
                <span key={i} style={{ 
                  fontSize: '11.5px', 
                  padding: '4px 10px', 
                  background: 'var(--bg-subtle)', 
                  border: '1px solid var(--border-color)', 
                  borderRadius: 'var(--radius-sm)',
                  fontWeight: 600,
                  color: 'var(--text-body)'
                }}>
                  ✓ {srv}
                </span>
              ))}
            </div>
          </div>
        )}

        {profile.productTypes && profile.productTypes.length > 0 && (
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-heading)', margin: '0 0 8px 0' }}>Produtos & Materiais em Catálogo</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {profile.productTypes.map((prod: string, i: number) => (
                <span key={i} style={{ 
                  fontSize: '11.5px', 
                  padding: '4px 10px', 
                  background: 'var(--bg-subtle)', 
                  border: '1px solid var(--border-color)', 
                  borderRadius: 'var(--radius-sm)',
                  fontWeight: 600,
                  color: 'var(--text-body)'
                }}>
                  📦 {prod}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Reviews Section */}
        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
          <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-heading)', margin: '0 0 10px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Star size={15} color="#D97706" /> Avaliações da Comunidade ({reviews.length})
          </h4>

          {reviews.length === 0 ? (
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontStyle: 'italic', padding: '8px 0' }}>
              Seja o primeiro a avaliar este perfil após a realização de serviços ou cotações.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '180px', overflowY: 'auto', marginBottom: '14px' }}>
              {reviews.map((rev) => (
                <div key={rev.id} style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border-color)', padding: '10px 12px', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 700, fontSize: '12px', color: 'var(--text-heading)' }}>{rev.reviewer_name}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '2px', color: '#D97706', fontSize: '11px' }}>
                      {'★'.repeat(rev.rating)}
                    </span>
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--text-body)', margin: 0 }}>{rev.comment}</p>
                </div>
              ))}
            </div>
          )}

          {/* Form to submit review */}
          <form onSubmit={handleSubmitReview} style={{ marginTop: '10px', background: 'var(--bg-subtle)', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-heading)', marginBottom: '6px' }}>
              Deixar uma Avaliação:
            </div>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Nota:</span>
              {[1, 2, 3, 4, 5].map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setNewRating(st)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: st <= newRating ? '#D97706' : 'var(--border-color)', padding: 0 }}
                >
                  ★
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input 
                type="text" 
                placeholder="Escreva sua avaliação sobre o atendimento e serviço..." 
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                style={{ flex: 1, fontSize: '12px', padding: '8px 12px' }}
                required
              />
              <button type="submit" disabled={submittingReview} className="btn primary" style={{ padding: '8px 14px', fontSize: '12px' }}>
                {submittingReview ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />} Avaliar
              </button>
            </div>
          </form>
        </div>

      </div>
    </Modal>
  );
};
