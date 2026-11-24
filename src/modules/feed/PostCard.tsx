import React, { useEffect } from 'react';
import { Post, UserProfile } from '../../types';
import { CarimboTecnico } from '../../design-system/CarimboTecnico';
import { RealApiClient } from '../../services/realApiClient';
import {
  ThumbsUp,
  MessageSquare,
  MapPin,
  Clock,
  ShieldCheck,
  Share2,
  ExternalLink,
} from 'lucide-react';

interface PostCardProps {
  post: Post & { rankingReason?: string };
  currentUser: UserProfile;
  onLike: (postId: string) => void;
  onOpenChat: (authorId: string, authorName: string, projectTitle?: string) => void;
  onOpenAuthorProfile?: (authorId: string) => void;
  onShareProject?: (post: Post) => void;
}

export const PostCard: React.FC<PostCardProps> = ({
  post,
  onLike,
  onOpenChat,
  onOpenAuthorProfile,
  onShareProject,
}) => {
  useEffect(() => {
    if (post.isSponsored && post.id.startsWith('ad_post_')) {
      const campId = post.id.replace('ad_post_', '');
      void RealApiClient.trackAdImpression(campId);
    }
  }, [post.id, post.isSponsored]);

  const initials = (post.authorName || 'B')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join('');

  return (
    <article className="card" style={{ marginBottom: '20px', overflow: 'hidden' }}>
      {post.isSponsored && (
        <div
          style={{
            background: 'var(--azul-lastro-soft)',
            borderBottom: '1px solid #C4D6E2',
            padding: '7px 16px',
            fontSize: '11.5px',
            fontWeight: 600,
            color: 'var(--azul-lastro)',
          }}
        >
          Conteúdo patrocinado · Ballast
        </div>
      )}

      {/* Author Header */}
      <div style={{ padding: '18px 20px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
        <button
          type="button"
          onClick={() => onOpenAuthorProfile?.(post.authorId)}
          style={{
            background: 'none',
            border: 'none',
            padding: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            cursor: onOpenAuthorProfile ? 'pointer' : 'default',
            textAlign: 'left',
            minWidth: 0,
          }}
        >
          {post.authorAvatar ? (
            <img
              src={post.authorAvatar}
              alt={post.authorName}
              loading="lazy"
              style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--border-color)' }}
            />
          ) : (
            <span
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                background: 'var(--azul-lastro)',
                color: '#FFFFFF',
                fontWeight: 700,
                fontSize: '14px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {initials}
            </span>
          )}

          <div style={{ minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '14.5px', fontWeight: 700, color: 'var(--grafite)' }}>{post.authorName}</span>
              {post.authorVerified && <ShieldCheck size={14} color="#1E6B4B" aria-label="Profissional verificado" />}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--steel)' }}>{post.authorBadge}</div>
          </div>
        </button>

        <span className="badge" style={{ textTransform: 'capitalize' }}>
          {post.category.replace('_', ' ')}
        </span>
      </div>

      {/* Content */}
      <div style={{ padding: '4px 20px 16px' }}>
        <h3 style={{ fontSize: '22px', marginBottom: '8px' }}>{post.title}</h3>
        <p style={{ fontSize: '14px', lineHeight: 1.65, margin: 0, whiteSpace: 'pre-wrap' }}>{post.content}</p>
      </div>

      {/* Media */}
      {post.mediaUrls && post.mediaUrls.length > 0 && (
        <div style={{ maxHeight: '440px', overflow: 'hidden', background: 'var(--grafite)' }}>
          <img
            src={post.mediaUrls[0]}
            alt={post.title}
            loading="lazy"
            decoding="async"
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        </div>
      )}

      {/* Technical Stamp (if registration provided) */}
      {post.technicalStamp && (
        <div style={{ padding: '14px 20px 4px' }}>
          <CarimboTecnico stamp={post.technicalStamp} authorRole={post.authorRole} />
        </div>
      )}

      {/* Meta Strip */}
      {(post.location?.city || post.deadlineDays) && (
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '14px',
            alignItems: 'center',
            padding: '10px 20px',
            background: 'var(--bg-subtle)',
            borderTop: '1px solid var(--border-color)',
            fontSize: '12.5px',
            color: 'var(--steel)',
            marginTop: '12px',
          }}
        >
          {post.location?.city && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <MapPin size={13} /> {post.location.city}{post.location.state ? `, ${post.location.state}` : ''}
            </span>
          )}
          {post.deadlineDays && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <Clock size={13} /> {post.deadlineDays} dias
            </span>
          )}
          <span style={{ marginLeft: 'auto', fontSize: '11.5px' }}>
            {post.createdAt ? new Date(post.createdAt).toLocaleDateString('pt-BR') : ''}
          </span>
        </div>
      )}

      {/* Actions */}
      <div
        style={{
          padding: '12px 20px',
          borderTop: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '8px',
        }}
      >
        <button
          type="button"
          onClick={() => onLike(post.id)}
          className={`btn ${post.isLiked ? 'primary' : 'ghost'}`}
          style={{ minHeight: '34px', padding: '6px 12px', fontSize: '12.5px' }}
        >
          <ThumbsUp size={13} />
          <span>{post.likesCount}</span>
        </button>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {onShareProject && !post.isSponsored && (
            <button
              type="button"
              onClick={() => onShareProject(post)}
              className="btn ghost"
              style={{ minHeight: '34px', padding: '6px 12px', fontSize: '12.5px' }}
            >
              <Share2 size={13} /> Compartilhar
            </button>
          )}
          {post.isSponsored ? (
            <button
              type="button"
              onClick={() => {
                if (post.id.startsWith('ad_post_')) void RealApiClient.trackAdClick(post.id.replace('ad_post_', ''));
                onOpenChat(post.authorId, post.authorName, post.title);
              }}
              className="btn primary"
              style={{ minHeight: '34px', padding: '6px 12px', fontSize: '12.5px' }}
            >
              <ExternalLink size={13} /> Entrar em contato
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onOpenChat(post.authorId, post.authorName, post.title)}
              className="btn ghost"
              style={{ minHeight: '34px', padding: '6px 12px', fontSize: '12.5px' }}
            >
              <MessageSquare size={13} /> Conversar
            </button>
          )}
        </div>
      </div>
    </article>
  );
};
