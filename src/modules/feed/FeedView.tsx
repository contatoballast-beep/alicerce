import React, { useState } from 'react';
import { Post, UserProfile } from '../../types';
import { PostCard } from './PostCard';
import { PlusCircle, Search, HardHat, Building2, Sparkles } from 'lucide-react';

interface FeedViewProps {
  posts: Post[];
  currentUser: UserProfile;
  onLikePost: (postId: string) => void;
  onOpenCreatePost: () => void;
  onOpenProposalModal: (oppId?: string) => void;
  onOpenChat: (authorId: string, authorName: string) => void;
}

export const FeedView: React.FC<FeedViewProps> = ({
  posts,
  currentUser,
  onLikePost,
  onOpenCreatePost,
  onOpenProposalModal,
  onOpenChat,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPosts = posts.filter(post => {
    const matchesCategory = selectedCategory === 'todos' || post.category === selectedCategory;
    const matchesSearch = 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.authorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.location.city.toLowerCase().includes(searchQuery.toLowerCase());
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

        <button onClick={onOpenCreatePost} className="btn primary" style={{ fontSize: '11px' }}>
          <PlusCircle size={14} /> Publicar Obra
        </button>
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
          Tudo ({posts.length})
        </div>
        <div 
          className={`chip ${selectedCategory === 'obra_andamento' ? 'on' : ''}`}
          onClick={() => setSelectedCategory('obra_andamento')}
        >
          Obras
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
          Artigos
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
          <div className="card" style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--steel)' }}>
            <HardHat size={36} color="var(--steel)" style={{ margin: '0 auto 8px' }} />
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
              Nenhuma publicação encontrada no feed.
            </div>
          </div>
        )}
      </div>

    </div>
  );
};
