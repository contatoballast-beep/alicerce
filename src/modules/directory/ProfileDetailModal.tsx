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
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        
        {/* Header Profile Info */}
        <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
          <img 
            src={profile.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'} 
            alt={profile.name} 
            style={{ width: '64px', height: '64px', borderRadius: '4px', objectFit: 'cover', border: '1px solid var(--steel-line)' }} 
          />
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--ink)', lineHeight: '1.2' }}>{profile.name}</h3>
                {profile.tradeName && profile.tradeName !== profile.name && (
                  <div style={{ fontSize: '11px', color: 'var(--steel)' }}>Nome Fantasia: {profile.tradeName}</div>
                )}
              </div>
              <div style={{ display: 'flex', gap: '4px' }}>
                <button 
                  onClick={() => onToggleFavorite(profile)}
                  className={`btn ghost`} 
                  style={{ padding: '4px 8px', fontSize: '10px', color: isFavorited ? 'var(--line)' : 'var(--steel)' }}
                  title="Favoritar"
                >
                  <Heart size={13} fill={isFavorited ? 'var(--line)' : 'none'} />
                </button>
                <button 
                  onClick={handleShare}
                  className="btn ghost" 
                  style={{ padding: '4px 8px', fontSize: '10px' }}
                  title="Compartilhar Perfil"
                >
                  <Share2 size={13} /> {copied ? 'Copiado!' : ''}
                </button>
              </div>
            </div>

            <div style={{ fontSize: '12px', color: 'var(--ink-soft)', fontWeight: 600, marginTop: '2px' }}>
              {profile.profession || profile.category || 'Prestador Verificado'}
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center', marginTop: '6px', fontSize: '11px', color: 'var(--steel)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                <MapPin size={12} /> {profile.city}, {profile.state}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '3px', color: '#D97706', fontWeight: 600 }}>
                <Star size={12} fill="#D97706" /> {profile.rating || 5.0} ({profile.reviewsCount || reviews.length} avaliações)
              </span>
              {profile.creaCauNumber && (
                <span className="mono" style={{ background: 'var(--white)', padding: '2px 6px', border: '1px solid var(--steel-line)', borderRadius: '2px', fontSize: '10px' }}>
                  {profile.creaCauNumber}
                </span>
              )}
              {profile.cnpj && (
                <span className="mono" style={{ background: 'var(--white)', padding: '2px 6px', border: '1px solid var(--steel-line)', borderRadius: '2px', fontSize: '10px' }}>
                  CNPJ: {profile.cnpj}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action CTAs */}
        <div style={{ display: 'grid', gridTemplateColumns: onStartChat ? '1fr 1fr 1fr' : '1fr 1fr', gap: '8px' }}>
          {onStartChat && (
            <button 
              onClick={() => {
                onClose();
                onStartChat(profile);
              }}
              className="btn primary" 
              style={{ justifyContent: 'center', fontSize: '11px' }}
            >
              <MessageSquare size={13} /> Chat Direto
            </button>
          )}
          <button 
            onClick={handleOpenWhatsApp}
            className="btn primary" 
            style={{ background: '#059669', borderColor: '#059669', justifyContent: 'center', fontSize: '11px' }}
          >
            <Phone size={13} /> WhatsApp
          </button>
          <button 
            onClick={() => onRequestQuote(profile)}
            className="btn accent" 
            style={{ justifyContent: 'center', fontSize: '11px' }}
          >
            <FileText size={13} /> Solicitar Orçamento
          </button>
        </div>

        {/* Bio / Description */}
        <div>
          <h4 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--ink)', marginBottom: '4px' }}>Sobre & Atuação</h4>
          <p style={{ fontSize: '12px', color: 'var(--graphite)', lineHeight: '1.6' }}>
            {profile.bio || profile.description || 'Profissional atuando com alto rigor técnico, pontualidade e conformidade com normas ABNT.'}
          </p>
        </div>

        {/* Services / Products List */}
        {profile.services && profile.services.length > 0 && (
          <div>
            <h4 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--ink)', marginBottom: '6px' }}>Serviços Especializados</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {profile.services.map((srv: string, i: number) => (
                <span key={i} className="chip on" style={{ fontSize: '10.5px' }}>
                  ✓ {srv}
                </span>
              ))}
            </div>
          </div>
        )}

        {profile.productTypes && profile.productTypes.length > 0 && (
          <div>
            <h4 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--ink)', marginBottom: '6px' }}>Produtos & Materiais em Catálogo</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {profile.productTypes.map((prod: string, i: number) => (
                <span key={i} className="chip on" style={{ fontSize: '10.5px' }}>
                  📦 {prod}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Reviews Section */}
        <div style={{ borderTop: '1px solid var(--steel-line)', paddingTop: '14px' }}>
          <h4 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--ink)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Star size={14} color="#D97706" /> Avaliações da Comunidade ({reviews.length})
          </h4>

          {reviews.length === 0 ? (
            <div style={{ fontSize: '11.5px', color: 'var(--steel)', fontStyle: 'italic', padding: '8px 0' }}>
              Seja o primeiro a avaliar este perfil após a realização de serviços ou cotações.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '180px', overflowY: 'auto', marginBottom: '12px' }}>
              {reviews.map((rev) => (
                <div key={rev.id} style={{ background: 'var(--paper)', border: '1px solid var(--steel-line)', padding: '8px 10px', borderRadius: '3px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                    <span style={{ fontWeight: 600, fontSize: '11.5px', color: 'var(--ink)' }}>{rev.reviewer_name}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '2px', color: '#D97706', fontSize: '10.5px' }}>
                      {'★'.repeat(rev.rating)}
                    </span>
                  </div>
                  <p style={{ fontSize: '11px', color: 'var(--graphite)' }}>{rev.comment}</p>
                </div>
              ))}
            </div>
          )}

          {/* Form to submit review */}
          <form onSubmit={handleSubmitReview} style={{ marginTop: '10px', background: 'var(--paper)', padding: '10px', borderRadius: '3px', border: '1px dashed var(--steel-line)' }}>
            <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--ink)', marginBottom: '4px' }}>
              Deixar uma Avaliação Real:
            </div>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ fontSize: '11px', color: 'var(--steel)' }}>Nota:</span>
              {[1, 2, 3, 4, 5].map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setNewRating(st)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', color: st <= newRating ? '#D97706' : 'var(--steel-line)' }}
                >
                  ★
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <input 
                type="text" 
                placeholder="Escreva sua experiência com o serviço..." 
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                style={{ flex: 1, fontSize: '11.5px', padding: '6px 8px' }}
                required
              />
              <button type="submit" disabled={submittingReview} className="btn primary" style={{ padding: '6px 10px', fontSize: '10.5px' }}>
                {submittingReview ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />} Avaliar
              </button>
            </div>
          </form>
        </div>

      </div>
    </Modal>
  );
};
