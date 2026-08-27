import React, { useState } from 'react';
import { ConstructionProject, ConstructionMilestone, UserProfile } from '../../types';
import { HardHat, CheckCircle2, Clock, Plus } from 'lucide-react';

interface ConstructionTimelineViewProps {
  projects: ConstructionProject[];
  currentUser: UserProfile;
}

export const ConstructionTimelineView: React.FC<ConstructionTimelineViewProps> = ({ projects, currentUser }) => {
  const [selectedProject] = useState<ConstructionProject>(projects[0]);
  const [adding, setAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newDesc) return;

    const newM: ConstructionMilestone = {
      id: `m_${Date.now()}`,
      phase: 'Estrutura e Concreto',
      progressPercent: 90,
      title: newTitle,
      description: newDesc,
      photoUrls: ['https://images.unsplash.com/photo-1541888946425-d0fbb186a5b7?w=600&auto=format&fit=crop&q=80'],
      costIncurred: 150000,
      updatedAt: new Date().toLocaleDateString('pt-BR'),
      responsibleCrea: currentUser.creaCauNumber || 'CREA-SP 5092182/D',
    };

    selectedProject.milestones.push(newM);
    setNewTitle('');
    setNewDesc('');
    setAdding(false);
  };

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto', padding: '20px 16px' }}>
      
      {/* Header */}
      <div className="card" style={{ padding: '16px', marginBottom: '18px', borderLeft: '4px solid var(--accent)' }}>
        <div className="tb-label" style={{ color: 'var(--line)' }}>DIÁRIO DE OBRA DIGITAL — PROJETO ATIVO</div>
        <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--ink)', margin: '2px 0 4px' }}>
          {selectedProject.title}
        </h2>
        <div style={{ fontSize: '11.5px', color: 'var(--steel)', marginBottom: '10px' }}>
          {selectedProject.location} • RT: <strong>{selectedProject.responsavelTecnico}</strong>
        </div>

        <div className="titleblock">
          <div className="tb-field">
            <div className="tb-label">Orçamento Total</div>
            <div className="tb-value" style={{ color: 'var(--line)' }}>R$ {selectedProject.totalBudget.toLocaleString('pt-BR')}</div>
          </div>
          <div className="tb-field">
            <div className="tb-label">Progresso Geral</div>
            <div className="tb-value" style={{ color: 'var(--accent)', fontWeight: 700 }}>{selectedProject.overallProgress}%</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--ink)' }}>Registros de Execução</h3>
        <button onClick={() => setAdding(!adding)} className="btn primary" style={{ fontSize: '10px', padding: '5px 10px' }}>
          <Plus size={12} /> Novo Registro
        </button>
      </div>

      {adding && (
        <form onSubmit={handleAdd} className="card" style={{ padding: '14px', marginBottom: '18px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div className="tb-label">Novo Lançamento no Diário</div>
          <input type="text" className="input-field" placeholder="Título da Ocorrência..." value={newTitle} onChange={e => setNewTitle(e.target.value)} required />
          <textarea className="input-field" rows={3} placeholder="Descrição técnica do avanço físico..." value={newDesc} onChange={e => setNewDesc(e.target.value)} required />
          <button type="submit" className="btn accent" style={{ justifyContent: 'center', fontSize: '10px' }}>
            <CheckCircle2 size={12} /> Registrar Ocorrência
          </button>
        </form>
      )}

      {/* Timeline Milestones */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {selectedProject.milestones.map((m) => (
          <div key={m.id} className="card">
            <div className="card-head">
              <div className="avatar">OB</div>
              <div className="who">
                <div className="name">{m.title}</div>
                <div className="role">{m.updatedAt} • {m.responsibleCrea}</div>
              </div>
              <span className="tag">{m.phase}</span>
            </div>

            <div className="card-body">
              <p style={{ fontSize: '12px', color: 'var(--graphite)' }}>{m.description}</p>
            </div>

            {m.photoUrls && m.photoUrls.length > 0 && (
              <div style={{ margin: '0 13px 11px', height: '140px', borderRadius: '2px', overflow: 'hidden' }}>
                <img src={m.photoUrls[0]} alt="Foto da Etapa" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            )}

            <div className="titleblock">
              <div className="tb-field">
                <div className="tb-label">Custo Etapa</div>
                <div className="tb-value">R$ {m.costIncurred.toLocaleString('pt-BR')}</div>
              </div>
              <div className="tb-field">
                <div className="tb-label">Conclusão</div>
                <div className="tb-value" style={{ color: 'var(--accent)' }}>{m.progressPercent}%</div>
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
