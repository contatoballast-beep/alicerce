import React, { useState } from 'react';
import { Modal } from '../../components/Modal';
import { UserProfile, PostCategory } from '../../types';
import { CheckCircle2, Image as ImageIcon, MapPin, DollarSign, Calendar } from 'lucide-react';

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;

    const badgeText = currentUser.role.includes('crea')
      ? `Eng. Civil · ${currentUser.creaCauNumber}`
      : currentUser.role.includes('cau')
      ? `Arquiteto · ${currentUser.creaCauNumber}`
      : currentUser.role === 'empresa_cnpj'
      ? `Incorporadora · ${currentUser.cnpjNumber}`
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
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Publicar Obra ou Projeto Técnico" maxWidth="560px">
      <form onSubmit={handleSubmit} className="form-wrap" style={{ padding: 0 }}>
        
        <div className="segrow" style={{ marginBottom: '14px' }}>
          <div className={`seg ${category === 'obra_andamento' ? 'on' : ''}`} onClick={() => setCategory('obra_andamento')}>Obra em Andamento</div>
          <div className={`seg ${category === 'oportunidade' ? 'on' : ''}`} onClick={() => setCategory('oportunidade')}>Oportunidade / Demanda</div>
          <div className={`seg ${category === 'artigo_tecnico' ? 'on' : ''}`} onClick={() => setCategory('artigo_tecnico')}>Artigo Técnico</div>
        </div>

        <div className="field">
          <label>Título da Obra / Publicação *</label>
          <input 
            type="text" 
            placeholder="Ex: Concretagem de Laje Protendida - Edifício Horizon" 
            value={title} 
            onChange={e => setTitle(e.target.value)} 
            required 
          />
        </div>

        <div className="field">
          <label>Descrição Técnica / Especificação dos Materiais *</label>
          <textarea 
            rows={4}
            placeholder="Descreva o escopo executado, fck do concreto utilizado, aditivos, armaduras ou normas técnicas aplicadas..." 
            value={content} 
            onChange={e => setContent(e.target.value)} 
            required 
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <div className="field">
            <label>Orçamento Estimado (R$)</label>
            <input type="number" className="mono" placeholder="1250000" value={budget} onChange={e => setBudget(e.target.value)} />
          </div>

          <div className="field">
            <label>Prazo de Execução (Dias)</label>
            <input type="number" className="mono" placeholder="180" value={deadline} onChange={e => setDeadline(e.target.value)} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '10px' }}>
          <div className="field">
            <label>Cidade da Obra</label>
            <input type="text" value={city} onChange={e => setCity(e.target.value)} />
          </div>
          <div className="field">
            <label>UF</label>
            <input type="text" value={state} onChange={e => setState(e.target.value)} maxLength={2} />
          </div>
        </div>

        <div className="field">
          <label>Foto / Imagem da Obra (URL)</label>
          <input type="url" value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="https://..." />
        </div>

        <button type="submit" className="btn primary" style={{ width: '100%', justifyContent: 'center', marginTop: '6px', padding: '10px 16px', fontSize: '13px' }}>
          <CheckCircle2 size={16} /> Publicar no Feed com Carimbo Técnico Digital
        </button>
      </form>
    </Modal>
  );
};
