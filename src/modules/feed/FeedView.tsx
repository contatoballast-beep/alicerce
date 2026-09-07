import React, { useState, useMemo } from 'react';
import { Post, UserProfile, AdCampaign } from '../../types';
import { PostCard } from './PostCard';
import { rankFeedPosts, FeedRankingMode } from '../../services/feedAlgorithm';
import { PlusCircle, Search, HardHat, Building2, Sparkles, Cpu, Clock, Flame, MapPin, Zap, SlidersHorizontal } from 'lucide-react';

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

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto', padding: '20px 16px' }}>
      
      {/* Header Info & Publish Button */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10.5px', color: 'var(--line)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            FEED DE OBRAS & PROJETOS
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--ink)' }}>
            ALICERCE
          </h2>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            onClick={() => setShowAlgorithmDetails(!showAlgorithmDetails)} 
            className="btn ghost" 
            style={{ fontSize: '11px', padding: '6px 10px' }}
            title="Entenda o Algoritmo"
          >
            <Zap size={13} color="var(--accent)" /> Algoritmo
          </button>
          <button onClick={onOpenCreatePost} className="btn primary" style={{ fontSize: '11px' }}>
            <PlusCircle size={14} /> Publicar Obra
          </button>
        </div>
      </div>

      {/* Algorithm Transparency Card */}
      {showAlgorithmDetails && (
        <div className="card" style={{ padding: '14px', marginBottom: '16px', background: 'var(--paper)', borderLeft: '4px solid var(--accent)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, fontSize: '12px', color: 'var(--ink)', marginBottom: '4px' }}>
            <Cpu size={14} color="var(--accent)" /> Algoritmo de Relevância Técnica ALICERCE
          </div>
          <p style={{ fontSize: '11.5px', color: 'var(--graphite)', lineHeight: 1.4, margin: '0 0 8px 0' }}>
            O feed prioriza publicações com <strong>ART/RRT registrada</strong> (+35 pts), profissionais verificados pelo <strong>CREA/CAU</strong> (+25 pts), obras próximas da sua praça de atuação (<strong>{currentUser.city || 'São Paulo'}/{currentUser.state || 'SP'}</strong>) e discussões técnicas com alto engajamento.
          </p>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--steel)' }}>
            <span className="tag">ART/RRT Verificada</span>
            <span className="tag">Proximidade Geográfica</span>
            <span className="tag">Afinidade com {currentUser.role}</span>
          </div>
        </div>
      )}

      {/* Algorithm Sorting Tabs */}
      <div className="segrow" style={{ marginBottom: '12px' }}>
        <div 
          className={`seg ${rankingMode === 'relevance' ? 'on' : ''}`}
          onClick={() => setRankingMode('relevance')}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
        >
          <Zap size={11} /> Relevância
        </div>
        <div 
          className={`seg ${rankingMode === 'recent' ? 'on' : ''}`}
          onClick={() => setRankingMode('recent')}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
        >
          <Clock size={11} /> Recentes
        </div>
        <div 
          className={`seg ${rankingMode === 'engagement' ? 'on' : ''}`}
          onClick={() => setRankingMode('engagement')}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
        >
          <Flame size={11} /> Em Alta
        </div>
        <div 
          className={`seg ${rankingMode === 'nearby' ? 'on' : ''}`}
          onClick={() => setRankingMode('nearby')}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
        >
          <MapPin size={11} /> Minha Região
        </div>
      </div>

      {/* Search Input */}
      <div style={{ position: 'relative', marginBottom: '14px' }}>
        <Search size={14} color="var(--steel)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
        <input 
          type="text" 
          className="input-field" 
          placeholder="Buscar por laje, obra, cálculo, cidade ou engenheiro..." 
          style={{ paddingLeft: '34px' }}
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Chiprow Filter */}
      <div className="chiprow" style={{ marginBottom: '18px' }}>
        <div 
          className={`chip ${selectedCategory === 'todos' ? 'on' : ''}`}
          onClick={() => setSelectedCategory('todos')}
        >
          Tudo ({rankedAndInjectedPosts.length})
        </div>
        <div 
          className={`chip ${selectedCategory === 'obra_andamento' ? 'on' : ''}`}
          onClick={() => setSelectedCategory('obra_andamento')}
        >
          Obras & Estruturas
        </div>
        <div 
          className={`chip ${selectedCategory === 'oportunidade' ? 'on' : ''}`}
          onClick={() => setSelectedCategory('oportunidade')}
        >
          Oportunidades
        </div>
        <div 
          className={`chip ${selectedCategory === 'artigo_tecnico' ? 'on' : ''}`}
          onClick={() => setSelectedCategory('artigo_tecnico')}
        >
          Artigos & Cálculos
        </div>
        <div 
          className={`chip ${selectedCategory === 'patrocinado' ? 'on' : ''}`}
          onClick={() => setSelectedCategory('patrocinado')}
        >
          Patrocinados
        </div>
      </div>

      {/* Feed Posts */}
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
          <div className="card" style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--steel)', background: 'var(--white)', border: '1px dashed var(--steel-line)' }}>
            <HardHat size={40} color="var(--accent)" style={{ margin: '0 auto 12px' }} />
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--ink)', marginBottom: '6px' }}>
              Nenhuma publicação encontrada
            </h3>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--steel)', maxWidth: '380px', margin: '0 auto 16px', lineHeight: 1.4 }}>
              O feed está pronto para receber suas obras, laudos com ART/RRT e oportunidades reais da construção civil.
            </p>
            <button onClick={onOpenCreatePost} className="btn primary" style={{ margin: '0 auto', fontSize: '11px' }}>
              <PlusCircle size={14} /> Publicar Primeira Obra no Feed
            </button>
          </div>
        )}
      </div>

    </div>
  );
};
