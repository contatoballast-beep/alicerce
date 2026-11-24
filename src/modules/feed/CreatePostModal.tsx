import React, { useState } from 'react';
import { Modal } from '../../components/Modal';
import { UserProfile, PostCategory } from '../../types';
import { CheckCircle2, Loader2, AlertCircle } from 'lucide-react';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onSubmitPost: (postData: any) => Promise<{ ok: boolean; error?: string }>;
}

export const CreatePostModal: React.FC<CreatePostModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSubmitPost,
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<PostCategory>('portfolio');
  const [city, setCity] = useState(currentUser.city || '');
  const [state, setState] = useState(currentUser.state || 'SP');
  const [artRrtCode, setArtRrtCode] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!title.trim() || !content.trim()) {
      setError('Preencha o título e a descrição do projeto.');
      return;
    }

    setLoading(true);
    const res = await onSubmitPost({
      category,
      title: title.trim(),
      content: content.trim(),
      mediaUrls: imageUrl.trim() ? [imageUrl.trim()] : [],
      location: { city: city.trim() || currentUser.city || 'São Paulo', state: state.trim().toUpperCase() || 'SP' },
      artRrtCode: artRrtCode.trim() || undefined,
    });
    setLoading(false);

    if (res.ok) {
      setTitle('');
      setContent('');
      setImageUrl('');
      setArtRrtCode('');
      onClose();
    } else {
      setError(res.error || 'O servidor não confirmou a publicação. Tente novamente.');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Publicar Projeto" maxWidth="560px">
      <form onSubmit={handleSubmit} className="form-wrap">
        {error && (
          <div role="alert" style={{ background: 'var(--color-danger-light)', border: '1px solid #FECDCA', color: 'var(--color-danger)', padding: '10px 14px', borderRadius: 'var(--radius-sm)', fontSize: '13px', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={15} /> {error}
          </div>
        )}

        <div className="segrow">
          <button type="button" className={`seg ${category === 'portfolio' ? 'on' : ''}`} onClick={() => setCategory('portfolio')}>
            Portfólio
          </button>
          <button type="button" className={`seg ${category === 'obra_andamento' ? 'on' : ''}`} onClick={() => setCategory('obra_andamento')}>
            Obra em andamento
          </button>
          <button type="button" className={`seg ${category === 'artigo_tecnico' ? 'on' : ''}`} onClick={() => setCategory('artigo_tecnico')}>
            Modos de Morar
          </button>
        </div>

        <div className="field">
          <label htmlFor="post-title">Título do projeto *</label>
          <input id="post-title" type="text" placeholder="Ex: Reforma Residencial Vila Madalena" value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>

        <div className="field">
          <label htmlFor="post-content">Contexto, conceito e soluções adotadas *</label>
          <textarea id="post-content" rows={4} placeholder="Descreva o partido arquitetônico, materiais, iluminação e contexto do projeto..." value={content} onChange={(e) => setContent(e.target.value)} required />
        </div>

        <div className="responsive-2col" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '10px' }}>
          <div className="field">
            <label htmlFor="post-city">Cidade *</label>
            <input id="post-city" type="text" value={city} onChange={(e) => setCity(e.target.value)} required />
          </div>
          <div className="field">
            <label htmlFor="post-state">UF *</label>
            <input id="post-state" type="text" value={state} onChange={(e) => setState(e.target.value.toUpperCase())} maxLength={2} required />
          </div>
        </div>

        <div className="field">
          <label htmlFor="post-photo">Fotografia principal (URL HTTPS opcional)</label>
          <input id="post-photo" type="url" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://..." />
        </div>

        <div className="field">
          <label htmlFor="post-rrt">Número de RRT / ART (opcional, declarado)</label>
          <input id="post-rrt" type="text" value={artRrtCode} onChange={(e) => setArtRrtCode(e.target.value)} placeholder="Ex: RRT 12345678" />
        </div>

        <button type="submit" disabled={loading} className="btn primary" style={{ width: '100%' }}>
          {loading ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle2 size={15} />}
          Publicar projeto
        </button>
      </form>
    </Modal>
  );
};
