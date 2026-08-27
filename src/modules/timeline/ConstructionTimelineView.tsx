import React, { useState } from 'react';
import { ConstructionProject, ConstructionMilestone, UserProfile } from '../../types';
import { HardHat, CheckCircle2, Clock, Camera, Plus, DollarSign, ShieldCheck, FileCheck } from 'lucide-react';

interface ConstructionTimelineViewProps {
  projects: ConstructionProject[];
  currentUser: UserProfile;
}

export const ConstructionTimelineView: React.FC<ConstructionTimelineViewProps> = ({ projects, currentUser }) => {
  const [selectedProject, setSelectedProject] = useState<ConstructionProject>(projects[0]);
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [addingMilestone, setAddingMilestone] = useState(false);

  const handleAddMilestone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newDesc) return;

    const newM: ConstructionMilestone = {
      id: `m_${Date.now()}`,
      phase: 'Estrutura e Concreto',
      progressPercent: 90,
      title: newTitle,
      description: newDesc,
      photoUrls: [newPhotoUrl || 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b7?w=600&auto=format&fit=crop&q=80'],
      costIncurred: 150000,
      updatedAt: new Date().toLocaleDateString('pt-BR'),
      responsibleCrea: currentUser.creaCauNumber || 'CREA-SP 5092182/D',
    };

    selectedProject.milestones.push(newM);
    setNewTitle('');
    setNewDesc('');
    setAddingMilestone(false);
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '24px 16px' }}>
      
      {/* Header Project Selector */}
      <div className="glass-card" style={{ padding: '24px', marginBottom: '24px', borderLeft: '4px solid var(--color-primary)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <span className="stamp-badge">DIÁRIO DE OBRA DIGITAL</span>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#FFF', marginTop: '4px' }}>
              {selectedProject.title}
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
              {selectedProject.location} • Resp. Técnico: <strong>{selectedProject.responsavelTecnico} ({selectedProject.creaNumber})</strong>
            </p>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Progresso Geral da Obra</span>
            <div className="mono" style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-primary)' }}>
              {selectedProject.overallProgress}%
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ background: 'var(--bg-input)', height: '10px', borderRadius: '5px', overflow: 'hidden', marginTop: '16px', border: '1px solid var(--border-color)' }}>
          <div style={{ width: `${selectedProject.overallProgress}%`, height: '100%', background: 'linear-gradient(90deg, #539DC4, #4ADE80)', transition: 'width 0.5s ease' }}></div>
        </div>
      </div>

      {/* Action Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#FFF', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Clock size={20} color="var(--color-primary)" /> Linha do Tempo & Histórico de Ocorrências
        </h3>

        <button onClick={() => setAddingMilestone(!addingMilestone)} className="btn-primary" style={{ fontSize: '0.85rem' }}>
          <Plus size={16} /> Novo Registro de Obra
        </button>
      </div>

      {/* Add New Milestone Form */}
      {addingMilestone && (
        <form onSubmit={handleAddMilestone} className="glass-card" style={{ padding: '18px', marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h4 style={{ fontSize: '1rem', color: '#FFF' }}>Registrar Nova Ocorrência / Atualização de Etapa</h4>
          <input 
            type="text" 
            className="input-field" 
            placeholder="Título da Atualização (Ex: Vistoria da Armadura da Laje do 12º Andar)" 
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            required
          />
          <textarea 
            className="input-field" 
            rows={3} 
            placeholder="Relatório descritivo de medição ou avanço físico..."
            value={newDesc}
            onChange={e => setNewDesc(e.target.value)}
            required
          />
          <input 
            type="url" 
            className="input-field mono" 
            placeholder="URL da Foto do Canteiro (https://...)" 
            value={newPhotoUrl}
            onChange={e => setNewPhotoUrl(e.target.value)}
          />
          <button type="submit" className="btn-accent" style={{ justifyContent: 'center' }}>
            <CheckCircle2 size={16} /> Gravar no Diário Oficial de Obra
          </button>
        </form>
      )}

      {/* Timeline Steps */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', position: 'relative' }}>
        {selectedProject.milestones.map((m, idx) => (
          <div key={m.id} className="glass-card" style={{ padding: '20px', display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '16px', alignItems: 'flex-start' }}>
            
            {/* Timeline icon indicator */}
            <div style={{ background: m.progressPercent === 100 ? 'rgba(34, 197, 94, 0.15)' : 'var(--color-primary-light)', border: `2px solid ${m.progressPercent === 100 ? '#4ADE80' : 'var(--color-primary)'}`, padding: '10px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle2 size={20} color={m.progressPercent === 100 ? '#4ADE80' : 'var(--color-primary)'} />
            </div>

            {/* Content */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '6px' }}>
                <span className="stamp-badge">{m.phase}</span>
                <span className="mono" style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Atualizado em: {m.updatedAt} • Resp: {m.responsibleCrea}
                </span>
              </div>

              <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#FFF', marginBottom: '6px' }}>
                {m.title}
              </h4>
              <p style={{ color: 'var(--text-main)', fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '14px' }}>
                {m.description}
              </p>

              {/* Photos */}
              {m.photoUrls && m.photoUrls.length > 0 && (
                <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', marginBottom: '12px' }}>
                  {m.photoUrls.map((url, i) => (
                    <img key={i} src={url} alt="Foto da etapa" style={{ width: '160px', height: '110px', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }} />
                  ))}
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                <span style={{ color: '#4ADE80' }} className="mono">Custo Acumulado da Etapa: R$ {m.costIncurred.toLocaleString('pt-BR')}</span>
                <span>Conclusão: <strong>{m.progressPercent}%</strong></span>
              </div>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
};
