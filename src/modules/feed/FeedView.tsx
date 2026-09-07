import React, { useState, useMemo } from 'react';
import { Post, UserProfile, AdCampaign } from '../../types';
import { PostCard } from './PostCard';
import { rankFeedPosts, FeedRankingMode } from '../../services/feedAlgorithm';
import { 
  Plus, 
  Search, 
  HardHat, 
  Sparkles, 
  Cpu, 
  Clock, 
  Flame, 
  MapPin, 
  Zap, 
  Info,
  Layers,
  ChevronRight
} from 'lucide-react';

interface FeedViewProps {
  posts: Post[];
  campaigns?: AdCampaign[];
  currentUser: UserProfile;
  onLikePost: (postId: string) => void;
  onOpenCreatePost: () => void;
  onOpenProposalModal: (oppId?: string) => void;
  onOpenChat: (authorId: string, authorName: string, authorRole?: string, authorAvatar?: string) => void;
}

export const FeedView: React.FC<FeedViewProps> = ({
  posts,
  campaigns = [],
  currentUser,
  onLikePost,
  onOpenCreatePost,
  onOpenProposalModal,
  onOpenChat,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');
  const [rankingMode, setRankingMode] = useState<FeedRankingMode>('relevance');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAlgorithmDetails, setShowAlgorithmDetails] = useState(false);

  // Apply Algorithmic Ranking + Organic Ads Injection
  const rankedAndInjectedPosts = useMemo(() => {
    return rankFeedPosts(posts, currentUser, rankingMode, campaigns);
  }, [posts, currentUser, rankingMode, campaigns]);

  const filteredPosts = rankedAndInjectedPosts.filter(post => {
    const matchesCategory = selectedCategory === 'todos' || post.category === selectedCategory;
    const q = searchQuery.toLowerCase();
    const matchesSearch = 
      !q ||
      post.title.toLowerCase().includes(q) ||
      post.content.toLowerCase().includes(q) ||
      post.authorName.toLowerCase().includes(q) ||
      (post.location?.city && post.location.city.toLowerCase().includes(q));
    return matchesCategory && matchesSearch;
  });

  const categories = [
    { id: 'todos', label: 'Tudo' },
    { id: 'obra_andamento', label: 'Obras & Execução' },
    { id: 'oportunidade', label: 'Demandas & Oportunidades' },
    { id: 'artigo_tecnico', label: 'Artigos & Cálculos' },
    { id: 'patrocinado', label: 'Patrocinados' },
  ];

  return (
    <div style={{ maxWidth: '680px', margin: '0 auto', padding: '24px 16px' }}>
      
      {/* Top Banner: Create Post Trigger */}
      <div className="card" style={{
        padding: '16px',
        marginBottom: '20px',
        background: '#FFFFFF',
        borderRadius: '14px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        boxShadow: '0 1px 3px rgba(15, 23, 42, 0.05)'
      }}>
        <img 
          src={currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'} 
          alt={currentUser.name} 
          style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} 
        />
        
        <div 
          onClick={onOpenCreatePost}
          style={{
            flex: 1,
            background: '#F1F5F9',
            borderRadius: '9999px',
            padding: '10px 16px',
            fontSize: '13px',
            color: '#64748B',
            cursor: 'pointer',
            transition: 'background 0.15s ease'
          }}
        >
          Compartilhe o progresso de uma obra ou cálculo com ART/RRT...
        </div>

        <button 
          onClick={onOpenCreatePost} 
          className="btn primary" 
          style={{ padding: '9px 16px', fontSize: '12px', gap: '6px' }}
        >
          <Plus size={14} /> Publicar
        </button>
      </div>

      {/* View Header & Algorithm Toggle */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>
            Feed Técnico da Construção
          </h2>
          <div style={{ fontSize: '11.5px', color: '#64748B' }}>
            Obras verificadas, relatórios de campo e oportunidades reais
          </div>
        </div>

        <button 
          onClick={() => setShowAlgorithmDetails(!showAlgorithmDetails)} 
          className="btn ghost" 
          style={{ fontSize: '11px', padding: '6px 10px', gap: '5px' }}
          title="Ver critérios do algoritmo"
        >
          <Zap size={12} color="#2563EB" />
          <span>Algoritmo</span>
        </button>
      </div>

      {/* Algorithm Transparency Card */}
      {showAlgorithmDetails && (
        <div className="card" style={{
          padding: '16px',
          marginBottom: '16px',
          background: '#F8FAFC',
          borderLeft: '4px solid #2563EB',
          borderRadius: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, fontSize: '12.5px', color: '#0F172A', marginBottom: '4px' }}>
            <Cpu size={14} color="#2563EB" /> Algoritmo de Relevância Técnica ALICERCE
          </div>
          <p style={{ fontSize: '12px', color: '#475569', lineHeight: 1.5, marginBottom: '10px' }}>
            O feed classifica publicações calculando a pontuação por: <strong>ART/RRT registrada</strong> (+50 pts), <strong>chancela profissional</strong> (+25 pts), <strong>proximidade geográfica</strong> ({currentUser.city || 'São Paulo'}/{currentUser.state || 'SP'}) e engajamento técnico de propostas.
          </p>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            <span className="badge verified">✓ ART/RRT Verificada</span>
            <span className="badge">📍 Proximidade Regional</span>
            <span className="badge">⭐ Relevância Profissional</span>
          </div>
        </div>
      )}

      {/* Ranking Mode Tabs (Pill style) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '6px',
        background: '#E2E8F0',
        padding: '3px',
        borderRadius: '10px',
        marginBottom: '14px'
      }}>
        <button
          onClick={() => setRankingMode('relevance')}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '5px',
            padding: '7px 4px',
            border: 'none',
            borderRadius: '7px',
            fontSize: '11.5px',
            fontWeight: rankingMode === 'relevance' ? 700 : 500,
            cursor: 'pointer',
            background: rankingMode === 'relevance' ? '#FFFFFF' : 'transparent',
            color: rankingMode === 'relevance' ? '#0F172A' : '#64748B',
            boxShadow: rankingMode === 'relevance' ? '0 1px 2px rgba(15,23,42,0.06)' : 'none',
            transition: 'all 0.15s ease'
          }}
        >
          <Zap size={12} color={rankingMode === 'relevance' ? '#2563EB' : '#94A3B8'} /> Relevância
        </button>

        <button
          onClick={() => setRankingMode('recent')}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '5px',
            padding: '7px 4px',
            border: 'none',
            borderRadius: '7px',
            fontSize: '11.5px',
            fontWeight: rankingMode === 'recent' ? 700 : 500,
            cursor: 'pointer',
            background: rankingMode === 'recent' ? '#FFFFFF' : 'transparent',
            color: rankingMode === 'recent' ? '#0F172A' : '#64748B',
            boxShadow: rankingMode === 'recent' ? '0 1px 2px rgba(15,23,42,0.06)' : 'none',
            transition: 'all 0.15s ease'
          }}
        >
          <Clock size={12} color={rankingMode === 'recent' ? '#2563EB' : '#94A3B8'} /> Recentes
        </button>

        <button
          onClick={() => setRankingMode('engagement')}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '5px',
            padding: '7px 4px',
            border: 'none',
            borderRadius: '7px',
            fontSize: '11.5px',
            fontWeight: rankingMode === 'engagement' ? 700 : 500,
            cursor: 'pointer',
            background: rankingMode === 'engagement' ? '#FFFFFF' : 'transparent',
            color: rankingMode === 'engagement' ? '#0F172A' : '#64748B',
            boxShadow: rankingMode === 'engagement' ? '0 1px 2px rgba(15,23,42,0.06)' : 'none',
            transition: 'all 0.15s ease'
          }}
        >
          <Flame size={12} color={rankingMode === 'engagement' ? '#EA580C' : '#94A3B8'} /> Em Alta
        </button>

        <button
          onClick={() => setRankingMode('nearby')}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '5px',
            padding: '7px 4px',
            border: 'none',
            borderRadius: '7px',
            fontSize: '11.5px',
            fontWeight: rankingMode === 'nearby' ? 700 : 500,
            cursor: 'pointer',
            background: rankingMode === 'nearby' ? '#FFFFFF' : 'transparent',
            color: rankingMode === 'nearby' ? '#0F172A' : '#64748B',
            boxShadow: rankingMode === 'nearby' ? '0 1px 2px rgba(15,23,42,0.06)' : 'none',
            transition: 'all 0.15s ease'
          }}
        >
          <MapPin size={12} color={rankingMode === 'nearby' ? '#059669' : '#94A3B8'} /> Região
        </button>
      </div>

      {/* Search Input */}
      <div style={{ position: 'relative', marginBottom: '14px' }}>
        <Search size={14} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
        <input 
          type="text" 
          className="input-field" 
          placeholder="Buscar por laje, estrutura, cálculo, cidade ou engenheiro..." 
          style={{ paddingLeft: '34px', fontSize: '12.5px' }}
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Category Filter Chips */}
      <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px', marginBottom: '16px' }}>
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`chip ${selectedCategory === cat.id ? 'on' : ''}`}
            style={{ fontSize: '11.5px' }}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Feed Posts Stream */}
      <div>
        {filteredPosts.length > 0 ? (
          filteredPosts.map(post => (
            <PostCard 
              key={post.id}
              post={post}
              currentUser={currentUser}
              onLike={onLikePost}
              onOpenProposalModal={onOpenProposalModal}
              onOpenChat={onOpenChat}
            />
          ))
        ) : (
          <div className="card" style={{
            padding: '48px 24px',
            textAlign: 'center',
            background: '#FFFFFF',
            borderRadius: '14px',
            border: '1px dashed #CBD5E1'
          }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: '#EFF6FF',
              color: '#2563EB',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 14px'
            }}>
              <HardHat size={28} />
            </div>

            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', marginBottom: '6px' }}>
              Nenhuma publicação encontrada
            </h3>

            <p style={{ fontSize: '12.5px', color: '#64748B', maxWidth: '380px', margin: '0 auto 18px', lineHeight: 1.5 }}>
              O feed técnico está limpo e pronto para receber suas obras, laudos com ART/RRT e oportunidades reais da construção civil.
            </p>

            <button 
              onClick={onOpenCreatePost} 
              className="btn primary" 
              style={{ margin: '0 auto', fontSize: '12px', padding: '10px 20px', gap: '8px' }}
            >
              <Plus size={14} /> Publicar Primeira Obra no Feed
            </button>
          </div>
        )}
      </div>

    </div>
  );
};
