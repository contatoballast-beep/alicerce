import React, { useState } from 'react';
import { Post, UserProfile } from '../../types';
import { CarimboTecnico } from '../../design-system/CarimboTecnico';
import { ThumbsUp, MessageSquare, Send, Bookmark, MapPin, Calendar, DollarSign, Sparkles } from 'lucide-react';

interface PostCardProps {
  post: Post;
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

  return (
    <article className="glass-card" style={{ padding: '20px', marginBottom: '20px', position: 'relative' }}>
      
      {/* Sponsored Badge */}
      {post.isSponsored && (
        <div style={{ position: 'absolute', top: '16px', right: '16px', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span className="status-badge status-ad">
            <Sparkles size={12} /> PATROCINADO (ALICERCE ADS)
          </span>
        </div>
      )}

      {/* Author Info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
        <img 
          src={post.authorAvatar} 
          alt={post.authorName} 
          style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--border-color)' }} 
        />
        <div>
          <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-heading)', lineHeight: 1.2 }}>
            {post.authorName}
          </h4>
          <span className="mono" style={{ fontSize: '0.75rem', color: 'var(--color-primary)' }}>
            {post.authorBadge}
          </span>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>
            {post.createdAt} • {post.location.city}/{post.location.state}
          </span>
        </div>
      </div>

      {/* Post Title & Text */}
      <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#FFF', marginBottom: '8px', lineHeight: 1.3 }}>
        {post.title}
      </h3>
      <p style={{ color: 'var(--text-main)', fontSize: '0.92rem', lineHeight: 1.6, marginBottom: '14px' }}>
        {post.content}
      </p>

      {/* Structured Info Bar (Budget / Location / Deadline) */}
      {(post.budgetEstimated || post.deadlineDays) && (
        <div style={{ background: 'var(--bg-input)', padding: '10px 14px', borderRadius: 'var(--radius-md)', display: 'flex', flexWrap: 'wrap', gap: '16px', marginBottom: '14px', fontSize: '0.85rem' }}>
          {post.budgetEstimated && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#4ADE80' }}>
              <DollarSign size={16} />
              <span>Orçamento Estimado: <strong>R$ {post.budgetEstimated.toLocaleString('pt-BR')}</strong></span>
            </div>
          )}
          {post.deadlineDays && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)' }}>
              <Calendar size={16} />
              <span>Prazo Execução: <strong>{post.deadlineDays} dias</strong></span>
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)' }}>
            <MapPin size={16} />
            <span>{post.location.city} - {post.location.state}</span>
          </div>
        </div>
      )}

      {/* Media Attachments */}
      {post.mediaUrls && post.mediaUrls.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: post.mediaUrls.length > 1 ? '1fr 1fr' : '1fr', gap: '10px', marginBottom: '16px', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
          {post.mediaUrls.map((url, idx) => (
            <img 
              key={idx} 
              src={url} 
              alt="Foto da Obra" 
              style={{ width: '100%', height: '260px', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }} 
            />
          ))}
        </div>
      )}

      {/* Carimbo Técnico Component */}
      {post.technicalStamp && (
        <div style={{ marginBottom: '16px' }}>
          <CarimboTecnico stamp={post.technicalStamp} authorRole={post.authorRole} />
        </div>
      )}

      {/* Action Footer */}
      <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button 
            onClick={() => onLike(post.id)}
            style={{ background: 'transparent', border: 'none', color: post.isLiked ? 'var(--color-primary)' : 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 600 }}
          >
            <ThumbsUp size={18} fill={post.isLiked ? 'var(--color-primary)' : 'transparent'} />
            <span>{post.likesCount}</span>
          </button>

          <button 
            onClick={() => onOpenChat(post.authorId, post.authorName)}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}
          >
            <MessageSquare size={18} />
            <span>{post.commentsCount} Comentários</span>
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button 
            onClick={() => setSaved(!saved)}
            style={{ background: 'transparent', border: 'none', color: saved ? 'var(--color-accent)' : 'var(--text-muted)', cursor: 'pointer', padding: '6px' }}
            title="Salvar Publicação"
          >
            <Bookmark size={18} fill={saved ? 'var(--color-accent)' : 'transparent'} />
          </button>

          {post.category === 'oportunidade' && (
            <button onClick={() => onOpenProposalModal()} className="btn-accent" style={{ fontSize: '0.85rem', padding: '6px 12px' }}>
              <Send size={14} /> Enviar Proposta
            </button>
          )}

          <button onClick={() => onOpenChat(post.authorId, post.authorName)} className="btn-outline" style={{ fontSize: '0.85rem', padding: '6px 12px' }}>
            Enviar Mensagem
          </button>
        </div>
      </div>

    </article>
  );
};
