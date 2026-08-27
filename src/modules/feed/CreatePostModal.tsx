import React, { useState } from 'react';
import { Modal } from '../../components/Modal';
import { UserProfile, PostCategory } from '../../types';
import { ShieldCheck, Image, HardHat, FileCheck, Sparkles, CheckCircle2 } from 'lucide-react';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onSubmitPost: (postData: any) => void;
}

export const CreatePostModal: React.FC<CreatePostModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSubmitPost,
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<PostCategory>('obra_andamento');
  const [city, setCity] = useState(currentUser.city || 'São Paulo');
  const [state, setState] = useState(currentUser.state || 'SP');
  const [budget, setBudget] = useState('');
  const [deadline, setDeadline] = useState('');
  const [imageUrl, setImageUrl] = useState('https://images.unsplash.com/photo-1541888946425-d0fbb186a5b7?w=800&auto=format&fit=crop&q=80');
  const [moderationChecking, setModerationChecking] = useState(false);
  const [moderationPassed, setModerationPassed] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;

    setModerationChecking(true);
    setTimeout(() => {
      setModerationChecking(false);
      
      const badgeText = currentUser.role.includes('crea')
        ? `Engenheiro • ${currentUser.creaCauNumber}`
        : currentUser.role.includes('cau')
        ? `Arquiteto • ${currentUser.creaCauNumber}`
        : currentUser.role === 'empresa_cnpj'
        ? `Construtora • ${currentUser.cnpjNumber}`
        : 'Membro ALICERCE';

      onSubmitPost({
        authorId: currentUser.id,
        authorName: currentUser.name,
        authorAvatar: currentUser.avatar,
        authorRole: currentUser.role,
        authorBadge: badgeText,
        category,
        title,
        content,
        mediaUrls: imageUrl ? [imageUrl] : [],
        location: { city, state },
        budgetEstimated: budget ? parseFloat(budget) : undefined,
        deadlineDays: deadline ? parseInt(deadline, 10) : undefined,
      });

      onClose();
    }, 600);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Nova Publicação Técnica / Obra" maxWidth="600px">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        
        {/* Category selector */}
        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px' }}>Categoria da Publicação:</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
            <button
              type="button"
              onClick={() => setCategory('obra_andamento')}
              style={{ padding: '8px', border: '1px solid', borderColor: category === 'obra_andamento' ? 'var(--color-primary)' : 'var(--border-color)', background: category === 'obra_andamento' ? 'var(--color-primary-light)' : 'var(--bg-input)', borderRadius: 'var(--radius-md)', color: 'var(--text-main)', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
            >
              Obra em Andamento
            </button>
            <button
              type="button"
              onClick={() => setCategory('oportunidade')}
              style={{ padding: '8px', border: '1px solid', borderColor: category === 'oportunidade' ? 'var(--color-accent)' : 'var(--border-color)', background: category === 'oportunidade' ? 'var(--color-accent-light)' : 'var(--bg-input)', borderRadius: 'var(--radius-md)', color: 'var(--text-main)', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
            >
              Oportunidade / Vaga
            </button>
            <button
              type="button"
              onClick={() => setCategory('artigo_tecnico')}
              style={{ padding: '8px', border: '1px solid', borderColor: category === 'artigo_tecnico' ? 'var(--color-primary)' : 'var(--border-color)', background: category === 'artigo_tecnico' ? 'var(--color-primary-light)' : 'var(--bg-input)', borderRadius: 'var(--radius-md)', color: 'var(--text-main)', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
            >
              Artigo / Conceito
            </button>
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Título da Publicação *</label>
          <input 
            type="text" 
            className="input-field" 
            placeholder="Ex: Concretagem de Laje Protendida - Edifício Residencial" 
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Descrição Técnica / Detalhes da Obra *</label>
          <textarea 
            className="input-field" 
            rows={4}
            placeholder="Descreva o escopo executado, fck do concreto, normas técnicas aplicadas ou termos da oportunidade..."
            value={content}
            onChange={e => setContent(e.target.value)}
            required
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Orçamento Estimado (R$)</label>
            <input 
              type="number" 
              className="input-field mono" 
              placeholder="Ex: 250000"
              value={budget}
              onChange={e => setBudget(e.target.value)}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Prazo Estimado (Dias)</label>
            <input 
              type="number" 
              className="input-field mono" 
              placeholder="Ex: 60"
              value={deadline}
              onChange={e => setDeadline(e.target.value)}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '10px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Cidade</label>
            <input type="text" className="input-field" value={city} onChange={e => setCity(e.target.value)} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>UF</label>
            <input type="text" className="input-field mono" value={state} onChange={e => setState(e.target.value)} />
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>URL da Imagem da Obra (Compressão Automática CDN)</label>
          <input 
            type="url" 
            className="input-field mono" 
            placeholder="https://..."
            value={imageUrl}
            onChange={e => setImageUrl(e.target.value)}
          />
        </div>

        {/* Live Technical Stamp Preview */}
        <div style={{ background: 'rgba(15, 23, 42, 0.8)', border: '1px dashed var(--color-primary)', padding: '12px', borderRadius: 'var(--radius-md)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: 'var(--color-primary)', fontWeight: 600, marginBottom: '4px', textTransform: 'uppercase' }}>
            <ShieldCheck size={16} /> Chancela Técnica de Emissão Pré-visualizada
          </div>
          <div className="mono" style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            REGISTRO: {currentUser.creaCauNumber || currentUser.cnpjNumber || 'CPF VERIFICADO'} | HASH SHA-256 AUTO-GERADO
          </div>
        </div>

        <button type="submit" className="btn-primary" disabled={moderationChecking} style={{ width: '100%', justifyContent: 'center', marginTop: '6px' }}>
          {moderationChecking ? (
            <span>Processando Moderação Assíncrona...</span>
          ) : (
            <>
              <CheckCircle2 size={18} /> Publicar com Carimbo Técnico
            </>
          )}
        </button>
      </form>
    </Modal>
  );
};
