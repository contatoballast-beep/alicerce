import React, { useState, useEffect } from 'react';
import { Post, UserProfile } from '../../types';
import { CarimboTecnico } from '../../design-system/CarimboTecnico';
import { RealApiClient } from '../../services/realApiClient';
import { 
  ThumbsUp, 
  MessageSquare, 
  Send, 
  Sparkles, 
  Cpu, 
  Zap, 
  ExternalLink, 
  MapPin, 
  DollarSign, 
  Clock,
  ShieldCheck
} from 'lucide-react';

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
    <article className="card" style={{
      marginBottom: '16px',
      position: 'relative',
      borderRadius: '14px',
      overflow: 'hidden',
      border: post.isSponsored ? '1.5px solid #3B82F6' : '1px solid #E2E8F0',
      boxShadow: post.isSponsored ? '0 4px 14px rgba(37, 99, 235, 0.08)' : '0 1px 3px rgba(15, 23, 42, 0.04)'
    }}>
      
      {/* Sponsored Ad or Ranking Algorithm Badge */}
      {post.isSponsored ? (
        <div style={{
          background: 'linear-gradient(90deg, #EFF6FF 0%, #DBEAFE 100%)',
          borderBottom: '1px solid #BFDBFE',
          padding: '7px 14px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#1D4ED8', fontSize: '11.5px', fontWeight: 700 }}>
            <Zap size={14} fill="#1D4ED8" />
            <span>ALICERCE ADS • DESTAQUE PATROCINADO</span>
          </div>
          <span style={{ fontSize: '10.5px', color: '#1E40AF', background: 'rgba(255,255,255,0.8)', padding: '2px 8px', borderRadius: '9999px', fontWeight: 700 }}>
            Prioridade Máxima
          </span>
        </div>
      ) : post.rankingReason ? (
        <div style={{
          background: '#F8FAFC',
          borderBottom: '1px solid #E2E8F0',
          padding: '5px 14px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '11px'
        }}>
          <span style={{ color: '#64748B', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Cpu size={12} color="#2563EB" /> {post.rankingReason}
          </span>
          <span style={{ fontSize: '10.5px', color: '#0F172A', fontWeight: 600 }}>
            Score: {post.algorithmScore || 50} pts
          </span>
        </div>
      ) : null}

      {/* Author Header */}
      <div style={{ padding: '16px 16px 10px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <img 
          src={post.authorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'} 
          alt={post.authorName} 
          style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover', border: '1px solid #E2E8F0' }} 
        />
        
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '13.5px', fontWeight: 700, color: '#0F172A' }}>
              {post.authorName}
            </span>
            <ShieldCheck size={13} color="#059669" />
          </div>
          <div style={{ fontSize: '11px', color: '#64748B', marginTop: '1px' }}>
            {post.authorBadge}
          </div>
        </div>

        <span className="badge" style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          {post.category.replace('_', ' ')}
        </span>
      </div>

      {/* Post Text Content */}
      <div style={{ padding: '4px 16px 14px 16px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A', lineHeight: 1.35, marginBottom: '6px' }}>
          {post.title}
        </h3>
        <p style={{ fontSize: '13px', color: '#334155', lineHeight: 1.55 }}>
          {post.content}
        </p>
      </div>

      {/* Post Media / Photo */}
      {post.mediaUrls && post.mediaUrls.length > 0 && (
        <div style={{ maxHeight: '420px', overflow: 'hidden', background: '#0F172A' }}>
          <img 
            src={post.mediaUrls[0]} 
            alt={post.title} 
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} 
          />
        </div>
      )}

      {/* Carimbo Técnico Chancela */}
      {post.technicalStamp && (
        <div style={{ padding: '12px 16px 4px 16px' }}>
          <CarimboTecnico stamp={post.technicalStamp} authorRole={post.authorRole} />
        </div>
      )}

      {/* Technical Details Strip (Local, Orçamento, Prazo) */}
      {(post.location?.city || post.budgetEstimated || post.deadlineDays) && (
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '12px',
          alignItems: 'center',
          padding: '10px 16px',
          background: '#F8FAFC',
          borderTop: '1px solid #E2E8F0',
          fontSize: '11.5px',
          color: '#475569',
          marginTop: '10px'
        }}>
          {post.location?.city && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <MapPin size={12} color="#64748B" /> {post.location.city}/{post.location.state}
            </span>
          )}
          {post.budgetEstimated && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600, color: '#0F172A' }}>
              <DollarSign size={12} color="#059669" /> R$ {post.budgetEstimated.toLocaleString('pt-BR')}
            </span>
          )}
          {post.deadlineDays && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Clock size={12} color="#64748B" /> {post.deadlineDays} dias
            </span>
          )}
          <span style={{ marginLeft: 'auto', fontSize: '10.5px', color: '#94A3B8' }}>
            {post.createdAt}
          </span>
        </div>
      )}

      {/* Bottom Interactive Bar */}
      <div style={{
        padding: '10px 16px',
        borderTop: '1px solid #E2E8F0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: '#FFFFFF'
      }}>
        <button 
          onClick={() => onLike(post.id)} 
          className={`btn ${post.isLiked ? 'primary' : 'ghost'}`}
          style={{
            padding: '6px 12px',
            fontSize: '11.5px',
            gap: '6px',
            borderRadius: '8px'
          }}
        >
          <ThumbsUp size={13} />
          <span>{post.likesCount} Curtidas</span>
        </button>

        <div style={{ display: 'flex', gap: '8px' }}>
          {post.isSponsored && (
            <button 
              onClick={handleAdClick} 
              className="btn accent" 
              style={{ padding: '6px 12px', fontSize: '11.5px' }}
            >
              <ExternalLink size={12} /> Contatar Anunciante
            </button>
          )}

          {post.category === 'oportunidade' && (
            <button 
              onClick={() => onOpenProposalModal()} 
              className="btn accent" 
              style={{ padding: '6px 12px', fontSize: '11.5px' }}
            >
              <Send size={12} /> Enviar Proposta
            </button>
          )}

          <button 
            onClick={() => onOpenChat(post.authorId, post.authorName, post.authorRole, post.authorAvatar)} 
            className="btn ghost" 
            style={{ padding: '6px 12px', fontSize: '11.5px', gap: '6px' }}
          >
            <MessageSquare size={13} /> Conversar
          </button>
        </div>
      </div>

    </article>
  );
};
