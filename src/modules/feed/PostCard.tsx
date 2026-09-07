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
  onOpenChat: (authorId: string, authorName: string) => void;
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
    onOpenChat(post.authorId, post.authorName);
  };

  const initials = post.authorName.split(' ').map(n => n[0]).join('').substring(0, 2);

  return (
    <article className="card" style={{ marginBottom: '18px' }}>
      
      {/* Algorithm Relevance Bar */}
      {post.rankingReason && (
        <div style={{ background: 'var(--paper)', borderBottom: '1px solid var(--steel-line)', padding: '4px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '10px', color: 'var(--steel)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Zap size={11} color="var(--accent)" />
            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 500 }}>{post.rankingReason}</span>
          </div>
          {post.algorithmScore && post.algorithmScore < 900 && (
            <span className="mono" style={{ fontSize: '9px', color: 'var(--accent)' }}>Score: {post.algorithmScore} pts</span>
          )}
        </div>
      )}

      {/* Card Head */}
      <div className="card-head" style={{ display: 'flex', alignItems: 'center', gap: '9px', padding: '11px 13px 9px' }}>
        <div className="avatar">{initials}</div>
        <div className="who" style={{ flex: 1, minWidth: 0, lineHeight: 1.25 }}>
          <div className="name" style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--ink)' }}>
            {post.authorName}
          </div>
          <div className="role" style={{ fontSize: '10.5px', color: 'var(--steel)', fontFamily: 'var(--font-mono)' }}>
            {post.authorBadge}
          </div>
        </div>

        {post.isSponsored ? (
          <span className="tag warn" style={{ color: 'var(--line)', borderColor: 'var(--line)', display: 'flex', alignItems: 'center', gap: '3px' }}>
            <Sparkles size={10} /> PATROCINADO
          </span>
        ) : (
          <span className="tag">{post.category.replace('_', ' ').toUpperCase()}</span>
        )}
      </div>

      {/* Card Title & Content */}
      <div className="card-body" style={{ padding: '0 13px 11px', fontSize: '12.5px', lineHeight: 1.5, color: 'var(--graphite)' }}>
        <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--ink)', marginBottom: '4px' }}>
          {post.title}
        </h3>
        <p>{post.content}</p>
      </div>

      {/* Card Figure (Media or Blueprint Texture) */}
      {post.mediaUrls && post.mediaUrls.length > 0 ? (
        <div style={{ margin: '0 13px 11px', borderRadius: '2px', overflow: 'hidden', height: '180px', position: 'relative' }}>
          <img src={post.mediaUrls[0]} alt="Figura da Obra" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <div style={{ position: 'absolute', bottom: '8px', left: '8px', background: 'var(--ink)', color: '#FFF', fontFamily: 'var(--font-mono)', fontSize: '9.5px', padding: '3px 7px', textTransform: 'uppercase' }}>
            {post.title.substring(0, 30)}
          </div>
        </div>
      ) : (
        <div className="card-figure" style={{ margin: '0 13px 11px', height: '100px', border: '1px dashed var(--steel-line)', background: 'repeating-linear-gradient(45deg, var(--paper) 0 8px, var(--paper-deep) 8px 9px)', display: 'flex', alignItems: 'flex-end', padding: '6px' }}>
          <span className="cap">{post.title}</span>
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

          <button onClick={() => onOpenChat(post.authorId, post.authorName)} className="btn ghost" style={{ padding: '4px 8px', fontSize: '9.5px' }}>
            Msgs
          </button>
        </div>
      </div>

    </article>
  );
};
