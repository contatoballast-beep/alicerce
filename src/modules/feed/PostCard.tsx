import React, { useState, useEffect } from 'react';
import { Post, UserProfile } from '../../types';
import { CarimboTecnico } from '../../design-system/CarimboTecnico';
import { RealApiClient } from '../../services/realApiClient';
import { ThumbsUp, MessageSquare, Send, Bookmark, Sparkles, Cpu, Zap, ExternalLink } from 'lucide-react';

interface PostCardProps {
  post: Post & { rankingReason?: string; algorithmScore?: number };
  currentUser: UserProfile;
  onLike: (postId: string) => void;
  onOpenProposalModal: (oppId?: string) => void;
  onOpenChat: (authorId: string, authorName: string, authorRole?: string, authorAvatar?: string) => void;
}

export const PostCard: React.FC<PostCardProps> = ({
  post,
  currentUser,
  onLike,
  onOpenProposalModal,
  onOpenChat,
}) => {
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (post.isSponsored && post.id.startsWith('ad_post_')) {
      const campId = post.id.replace('ad_post_', '');
      RealApiClient.trackAdImpression(campId);
    }
  }, [post.id, post.isSponsored]);

  const handleAdClick = () => {
    if (post.isSponsored && post.id.startsWith('ad_post_')) {
      const campId = post.id.replace('ad_post_', '');
      RealApiClient.trackAdClick(campId);
    }
    onOpenChat(post.authorId, post.authorName, post.authorRole, post.authorAvatar);
  };

  return (
    <article className="card" style={{ marginBottom: '14px', position: 'relative', border: post.isSponsored ? '1.5px solid #2563EB' : undefined }}>
      
      {/* Sponsored Ad or Ranking Algorithm Badge */}
      {post.isSponsored ? (
        <div style={{ background: '#EFF6FF', borderBottom: '1px solid #BFDBFE', padding: '6px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#1D4ED8', fontSize: '11px', fontWeight: 700 }}>
            <Zap size={13} fill="#1D4ED8" />
            <span>ALICERCE ADS • DESTAQUE PATROCINADO</span>
          </div>
          <span className="mono" style={{ fontSize: '10px', color: '#2563EB', background: '#DBEAFE', padding: '1px 6px', borderRadius: '3px' }}>
            Score: {post.algorithmScore || 100} pts
          </span>
        </div>
      ) : post.rankingReason ? (
        <div style={{ background: 'var(--paper)', borderBottom: '1px solid var(--steel-line)', padding: '4px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '10.5px' }}>
          <span style={{ color: 'var(--steel)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Cpu size={12} color="var(--line)" /> {post.rankingReason}
          </span>
          <span className="mono" style={{ fontSize: '10px', color: 'var(--graphite)' }}>
            Score: {post.algorithmScore || 50} pts
          </span>
        </div>
      ) : null}

      {/* Author Header */}
      <div style={{ padding: '14px 14px 0 14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <img 
          src={post.authorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'} 
          alt={post.authorName} 
          style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--steel-line)' }} 
        />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--ink)' }}>{post.authorName}</div>
          <div style={{ fontSize: '11px', color: 'var(--steel)' }}>{post.authorBadge}</div>
        </div>
        <span className="badge verified" style={{ fontSize: '9px', textTransform: 'uppercase' }}>
          {post.category.replace('_', ' ')}
        </span>
      </div>

      {/* Content */}
      <div style={{ padding: '12px 14px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--ink)', marginBottom: '6px' }}>
          {post.title}
        </h3>
        <p style={{ fontSize: '12.5px', color: 'var(--graphite)', lineHeight: '1.5' }}>
          {post.content}
        </p>
      </div>

      {/* Media / Photo */}
      {post.mediaUrls && post.mediaUrls.length > 0 && (
        <div style={{ borderTop: '1px solid var(--steel-line)', borderBottom: '1px solid var(--steel-line)', maxHeight: '380px', overflow: 'hidden' }}>
          <img 
            src={post.mediaUrls[0]} 
            alt={post.title} 
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} 
          />
        </div>
      )}

      {/* Carimbo Técnico Chancela */}
      {post.technicalStamp && (
        <div style={{ padding: '0 13px 11px' }}>
          <CarimboTecnico stamp={post.technicalStamp} authorRole={post.authorRole} />
        </div>
      )}

      {/* Blueprint Titleblock Footer */}
      <div className="titleblock">
        <div className="tb-field">
          <div className="tb-label">Local</div>
          <div className="tb-value">{post.location.city}/{post.location.state}</div>
        </div>

        {post.budgetEstimated && (
          <div className="tb-field">
            <div className="tb-label">Orçamento</div>
            <div className="tb-value" style={{ color: 'var(--line)' }}>R$ {post.budgetEstimated.toLocaleString('pt-BR')}</div>
          </div>
        )}

        {post.deadlineDays && (
          <div className="tb-field">
            <div className="tb-label">Prazo</div>
            <div className="tb-value">{post.deadlineDays} dias</div>
          </div>
        )}

        <div className="tb-field" style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
          <button 
            onClick={() => onLike(post.id)}
            style={{ background: 'transparent', border: 'none', color: post.isLiked ? 'var(--accent)' : 'var(--steel)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: 600 }}
          >
            <ThumbsUp size={13} /> {post.likesCount}
          </button>

          {post.isSponsored && (
            <button onClick={handleAdClick} className="btn accent" style={{ padding: '4px 8px', fontSize: '9.5px', background: 'var(--line)', borderColor: 'var(--line)', color: '#FFF' }}>
              <ExternalLink size={10} /> Contatar Anunciante
            </button>
          )}

          {post.category === 'oportunidade' && (
            <button onClick={() => onOpenProposalModal()} className="btn accent" style={{ padding: '4px 8px', fontSize: '9.5px' }}>
              <Send size={10} /> Propor
            </button>
          )}

          <button 
            onClick={() => onOpenChat(post.authorId, post.authorName, post.authorRole, post.authorAvatar)} 
            className="btn ghost" 
            style={{ padding: '4px 8px', fontSize: '9.5px', gap: '4px' }}
          >
            <MessageSquare size={11} /> Conversar
          </button>
        </div>
      </div>

    </article>
  );
};
