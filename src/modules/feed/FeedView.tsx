import React, { useState } from 'react';
import { Post, UserProfile, PostCategory } from '../../types';
import { PostCard } from './PostCard';
import { PlusCircle, Search, Filter, HardHat, Sparkles, Building2 } from 'lucide-react';

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
    <div style={{ maxWidth: '880px', margin: '0 auto', padding: '24px 16px' }}>
      
      {/* Hero Welcome Banner */}
      <div className="glass-card" style={{ padding: '24px', marginBottom: '24px', background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.9), rgba(15, 23, 42, 0.95))', borderLeft: '4px solid var(--color-primary)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span className="stamp-badge">PERFIL ATIVO</span>
              <span className="mono" style={{ fontSize: '0.8rem', color: 'var(--color-primary)' }}>{currentUser.creaCauNumber || currentUser.cnpjNumber || 'CONTA VERIFICADA'}</span>
            </div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#FFF' }}>
              Bem-vindo ao Feed ALICERCE, {currentUser.name.split(' ')[0]}!
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
              Conecte-se com engenheiros, arquiteto(a)s, construtoras e fornecedores técnicos de todo o Brasil.
            </p>
          </div>

          <button onClick={onOpenCreatePost} className="btn-accent" style={{ fontSize: '0.95rem', padding: '12px 20px' }}>
            <PlusCircle size={20} /> Publicar Obra / Projeto
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
        
        {/* Search Input */}
        <div style={{ position: 'relative' }}>
          <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
          <input 
            type="text" 
            className="input-field" 
            placeholder="Buscar por obra, laje, cálculo estrutural, cidade ou profissional..." 
            style={{ paddingLeft: '40px' }}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Category Pills */}
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
          <button 
            onClick={() => setSelectedCategory('todos')}
            className={`btn-outline ${selectedCategory === 'todos' ? 'active-cat' : ''}`}
            style={selectedCategory === 'todos' ? { background: 'var(--color-primary)', color: '#FFF', borderColor: 'var(--color-primary)' } : {}}
          >
            Todas as Publicações ({posts.length})
          </button>

          <button 
            onClick={() => setSelectedCategory('obra_andamento')}
            className={`btn-outline ${selectedCategory === 'obra_andamento' ? 'active-cat' : ''}`}
            style={selectedCategory === 'obra_andamento' ? { background: 'var(--color-primary)', color: '#FFF', borderColor: 'var(--color-primary)' } : {}}
          >
            <HardHat size={16} /> Obras em Andamento
          </button>

          <button 
            onClick={() => setSelectedCategory('oportunidade')}
            className={`btn-outline ${selectedCategory === 'oportunidade' ? 'active-cat' : ''}`}
            style={selectedCategory === 'oportunidade' ? { background: 'var(--color-accent)', color: '#FFF', borderColor: 'var(--color-accent)' } : {}}
          >
            <Building2 size={16} /> Oportunidades & Vagas
          </button>

          <button 
            onClick={() => setSelectedCategory('artigo_tecnico')}
            className={`btn-outline ${selectedCategory === 'artigo_tecnico' ? 'active-cat' : ''}`}
            style={selectedCategory === 'artigo_tecnico' ? { background: 'var(--color-primary)', color: '#FFF', borderColor: 'var(--color-primary)' } : {}}
          >
            Artigos Técnicos
          </button>

          <button 
            onClick={() => setSelectedCategory('patrocinado')}
            className={`btn-outline ${selectedCategory === 'patrocinado' ? 'active-cat' : ''}`}
            style={selectedCategory === 'patrocinado' ? { background: 'var(--color-accent)', color: '#FFF', borderColor: 'var(--color-accent)' } : {}}
          >
            <Sparkles size={16} /> Patrocinados
          </button>
        </div>
      </div>

      {/* Feed List */}
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
          <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
            <HardHat size={48} color="var(--text-muted)" style={{ margin: '0 auto 12px' }} />
            <h3 style={{ fontSize: '1.1rem', color: 'var(--text-heading)' }}>Nenhuma publicação encontrada</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '4px' }}>
              Tente alterar os termos de busca ou selecione outra categoria.
            </p>
          </div>
        )}
      </div>

    </div>
  );
};
