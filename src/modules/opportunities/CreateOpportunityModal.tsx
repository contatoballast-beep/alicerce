import React, { useState } from 'react';
import { Modal } from '../../components/Modal';
import { UserProfile } from '../../types';
import { RealApiClient } from '../../services/realApiClient';
import { Send, Briefcase, DollarSign, Calendar, MapPin, Loader2 } from 'lucide-react';

interface CreateOpportunityModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onSubmitSuccess: () => void;
}

export const CreateOpportunityModal: React.FC<CreateOpportunityModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSubmitSuccess,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Projetos Estruturais & Fundações');
  const [specialty, setSpecialty] = useState('Cálculo Estrutural');
  const [city, setCity] = useState(currentUser.city || 'São Paulo');
  const [state, setState] = useState(currentUser.state || 'SP');
  const [budgetMin, setBudgetMin] = useState(5000);
  const [budgetMax, setBudgetMax] = useState(25000);
  const [deadlineDays, setDeadlineDays] = useState(30);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) return;

    setLoading(true);

    await RealApiClient.createOpportunity({
      title,
      description,
      category,
      specialty,
      city,
      state,
      budgetMin,
      budgetMax,
      deadlineDays,
      ownerId: currentUser.id,
      ownerName: currentUser.name,
      ownerAvatar: currentUser.avatar,
    });

    setLoading(false);
    onSubmitSuccess();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Publicar Demanda / Oportunidade de Obra" maxWidth="580px">
      <form onSubmit={handleSubmit} className="form-wrap" style={{ padding: 0 }}>
        
        <div className="field">
          <label>Título da Demanda *</label>
          <input 
            type="text" 
            placeholder="Ex: Projeto Estrutural para Edifício Residencial de 4 Pavimentos" 
            value={title}
            onChange={e => setTitle(e.target.value)}
            required 
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <div className="field">
            <label>Categoria de Serviço</label>
            <select 
              value={category}
              onChange={e => setCategory(e.target.value)}
            >
              <option value="Projetos Estruturais & Fundações">Projetos Estruturais & Fundações</option>
              <option value="Projetos de Arquitetura">Projetos de Arquitetura</option>
              <option value="Instalações Elétricas & Hidráulicas">Instalações Elétricas & Hidráulicas</option>
              <option value="Alvenaria, Reformas & Construção">Alvenaria, Reformas & Construção</option>
              <option value="Laudos Periciais & Vistorias">Laudos Periciais & Vistorias</option>
              <option value="Terraplanagem & Drenagem">Terraplanagem & Drenagem</option>
            </select>
          </div>

          <div className="field">
            <label>Especialidade Requerida</label>
            <input 
              type="text" 
              placeholder="Ex: Concreto Armado / Alvenaria" 
              value={specialty}
              onChange={e => setSpecialty(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="field">
          <label>Descrição Detalhada do Escopo e Necessidade *</label>
          <textarea 
            rows={4} 
            placeholder="Descreva a metragem quadrada, características do terreno, localização aproximada e documentação disponível..."
            value={description}
            onChange={e => setDescription(e.target.value)}
            required
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
          <div className="field">
            <label>Orçamento Mín (R$)</label>
            <input 
              type="number" 
              className="mono"
              value={budgetMin}
              onChange={e => setBudgetMin(Number(e.target.value))}
              required
            />
          </div>
          <div className="field">
            <label>Orçamento Máx (R$)</label>
            <input 
              type="number" 
              className="mono"
              value={budgetMax}
              onChange={e => setBudgetMax(Number(e.target.value))}
              required
            />
          </div>
          <div className="field">
            <label>Prazo (Dias)</label>
            <input 
              type="number" 
              className="mono"
              value={deadlineDays}
              onChange={e => setDeadlineDays(Number(e.target.value))}
              required
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '10px' }}>
          <div className="field">
            <label>Cidade da Obra</label>
            <input 
              type="text" 
              value={city}
              onChange={e => setCity(e.target.value)}
              required
            />
          </div>
          <div className="field">
            <label>UF</label>
            <input 
              type="text" 
              value={state}
              onChange={e => setState(e.target.value)}
              maxLength={2}
              required
            />
          </div>
        </div>

        <button type="submit" disabled={loading} className="btn primary" style={{ width: '100%', justifyContent: 'center', marginTop: '6px', padding: '10px 16px', fontSize: '13px' }}>
          {loading ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />} Publicar Oportunidade no Ecossistema
        </button>
      </form>
    </Modal>
  );
};
