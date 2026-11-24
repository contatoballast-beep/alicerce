import React, { useState, useMemo } from 'react';
import { Post, UserProfile, AdCampaign } from '../../types';
import { PostCard } from './PostCard';
import { rankFeedPosts, FeedRankingMode } from '../../services/feedAlgorithm';
import { Plus, Search, Compass, AlertTriangle, RefreshCw } from 'lucide-react';

interface FeedViewProps {
  posts: Post[];
  campaigns?: AdCampaign[];
  currentUser: UserProfile;
  loading?: boolean;
  serviceError?: string | null;
  onRetry?: () => void;
  onLikePost: (postId: string) => void;
  onOpenCreatePost: () => void;
  onOpenChat: (authorId: string, authorName: string, projectTitle?: string) => void;
  onOpenAuthorProfile: (authorId: string) => void;
  onShareProject: (post: Post) => void;
}

export const FeedView: React.FC<FeedViewProps> = ({
  posts,
  campaigns = [],
  currentUser,
  loading = false,
  serviceError = null,
  onRetry,
  onLikePost,
  onOpenCreatePost,
  onOpenChat,
  onOpenAuthorProfile,
  onShareProject,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');
  const [rankingMode, setRankingMode] = useState<FeedRankingMode>('recent');
  const [searchQuery, setSearchQuery] = useState('');

  const rankedPosts = useMemo(
    () => rankFeedPosts(posts, currentUser, rankingMode, campaigns),
    [posts, currentUser, rankingMode, campaigns]
  );

  const filteredPosts = rankedPosts.filter((post) => {
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
    { id: 'todos', label: 'Todos' },
    { id: 'portfolio', label: 'Portfólio' },
    { id: 'obra_andamento', label: 'Obra em andamento' },
    { id: 'artigo_tecnico', label: 'Modos de Morar' },
  ];

  return (
    <div className="ballast-container" style={{ maxWidth: '820px', paddingTop: '32px', paddingBottom: '56px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '14px', marginBottom: '22px' }}>
        <div>
          <div className="meta-label" style={{ color: 'var(--azul-lastro)', marginBottom: '6px' }}>
            MODOS DE MORAR & PORTFÓLIOS
          </div>
          <h1 style={{ fontSize: 'clamp(28px, 4vw, 40px)', marginBottom: '6px' }}>Explorar projetos</h1>
          <p style={{ fontSize: '14.5px', color: 'var(--steel)', margin: 0 }}>
            Projetos arquitetônicos, reformas e estudos publicados por profissionais cadastrados.
          </p>
        </div>

        <button type="button" onClick={onOpenCreatePost} className="btn primary">
          <Plus size={15} /> Publicar projeto
        </button>
      </div>

      {/* Filters Bar */}
      <div className="card" style={{ padding: '14px 16px', marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div className="responsive-2col" style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '10px' }}>
          <div style={{ position: 'relative' }}>
            <Search size={15} color="#546168" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="search"
              aria-label="Buscar projetos"
              placeholder="Buscar por projeto, cidade ou arquiteto..."
              style={{ paddingLeft: '36px' }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <select aria-label="Ordenação" value={rankingMode} onChange={(e) => setRankingMode(e.target.value as FeedRankingMode)}>
            <option value="recent">Mais recentes</option>
            <option value="relevance">Relevância</option>
            <option value="nearby">Próximos à minha cidade</option>
            <option value="engagement">Mais curtidos</option>
          </select>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`chip ${selectedCategory === cat.id ? 'on' : ''}`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Service Unavailable State */}
      {serviceError && (
        <div role="alert" className="card" style={{ padding: '36px 24px', textAlign: 'center', borderColor: '#FECDCA', background: 'var(--color-danger-light)' }}>
          <AlertTriangle size={28} color="#B42318" style={{ margin: '0 auto 10px' }} />
          <h2 style={{ fontSize: '20px', marginBottom: '6px' }}>Não foi possível carregar os projetos</h2>
          <p style={{ fontSize: '13.5px', color: 'var(--grafite)', marginBottom: '16px' }}>{serviceError}</p>
          {onRetry && (
            <button type="button" onClick={onRetry} className="btn primary">
              <RefreshCw size={14} /> Tentar novamente
            </button>
          )}
        </div>
      )}

      {/* Loading */}
      {loading && !serviceError && (
        <div className="card" style={{ padding: '36px 24px', textAlign: 'center', color: 'var(--steel)' }}>
          Carregando projetos publicados...
        </div>
      )}

      {/* Stream */}
      {!loading && !serviceError && filteredPosts.length > 0 && (
        <div>
          {filteredPosts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              currentUser={currentUser}
              onLike={onLikePost}
              onOpenChat={onOpenChat}
              onOpenAuthorProfile={onOpenAuthorProfile}
              onShareProject={onShareProject}
            />
          ))}
        </div>
      )}

      {/* Genuine Empty State */}
      {!loading && !serviceError && filteredPosts.length === 0 && (
        <div className="card" style={{ padding: '48px 24px', textAlign: 'center' }}>
          <Compass size={32} color="#2F5872" style={{ margin: '0 auto 12px' }} />
          <h2 style={{ fontSize: '22px', marginBottom: '8px' }}>Nenhum projeto encontrado</h2>
          <p style={{ fontSize: '14px', color: 'var(--steel)', maxWidth: '420px', margin: '0 auto 20px' }}>
            {searchQuery || selectedCategory !== 'todos'
              ? 'Tente ajustar os filtros ou buscar por outro termo.'
              : 'Publique o primeiro projeto arquitetônico com contexto, fotos e localização.'}
          </p>
          <button type="button" onClick={onOpenCreatePost} className="btn primary">
            <Plus size={15} /> Publicar projeto
          </button>
        </div>
      )}
    </div>
  );
};
