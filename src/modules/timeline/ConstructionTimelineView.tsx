import React, { useState } from 'react';
import { ConstructionProject, ConstructionMilestone, UserProfile, TimelinePhase } from '../../types';
import { HardHat, CheckCircle2, Clock, Plus, Building2, Calendar, DollarSign, Image as ImageIcon } from 'lucide-react';

import { LocalApiService } from '../../services/api';

interface ConstructionTimelineViewProps {
  projects: ConstructionProject[];
  currentUser: UserProfile;
}

export const ConstructionTimelineView: React.FC<ConstructionTimelineViewProps> = ({ projects: initialProjects, currentUser }) => {
  const [projectList, setProjectList] = useState<ConstructionProject[]>(() => {
    const stored = LocalApiService.getProjects();
    return stored.length ? stored : initialProjects;
  });
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(initialProjects[0]?.id || null);
  
  // Creation States
  const [creatingProject, setCreatingProject] = useState(false);
  const [projTitle, setProjTitle] = useState('');
  const [projLocation, setProjLocation] = useState(`${currentUser.city || 'São Paulo'} - ${currentUser.state || 'SP'}`);
  const [projBudget, setProjBudget] = useState('500000');
  const [projRT, setProjRT] = useState(currentUser.name);

  // Milestone State
  const [addingMilestone, setAddingMilestone] = useState(false);
  const [mPhase, setMPhase] = useState<TimelinePhase>('Estrutura e Concreto');
  const [mTitle, setMTitle] = useState('');
  const [mDesc, setMDesc] = useState('');
  const [mCost, setMCost] = useState('50000');
  const [mProgress, setMProgress] = useState('100');
  const [mPhoto, setMPhoto] = useState('https://images.unsplash.com/photo-1541888946425-d0fbb186a5b7?w=600&auto=format&fit=crop&q=80');

  const selectedProject = projectList.find(p => p.id === selectedProjectId) || projectList[0] || null;

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projTitle) return;

    const newP: ConstructionProject = {
      id: `proj_${Date.now()}`,
      title: projTitle,
      location: projLocation,
      totalBudget: parseFloat(projBudget) || 100000,
      overallProgress: 0,
      responsavelTecnico: projRT,
      creaNumber: currentUser.creaCauNumber || 'CREA-SP 5069824/D',
      milestones: []
    };

    const updated = [newP, ...projectList];
    setProjectList(updated);
    LocalApiService.updateProjects(updated);
    setSelectedProjectId(newP.id);
    setProjTitle('');
    setCreatingProject(false);
  };

  const handleAddMilestone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject || !mTitle || !mDesc) return;

    const newM: ConstructionMilestone = {
      id: `m_${Date.now()}`,
      phase: mPhase,
      progressPercent: parseInt(mProgress, 10) || 100,
      title: mTitle,
      description: mDesc,
      photoUrls: mPhoto ? [mPhoto] : [],
      costIncurred: parseFloat(mCost) || 0,
      updatedAt: new Date().toLocaleDateString('pt-BR'),
      responsibleCrea: currentUser.creaCauNumber || selectedProject.creaNumber,
    };

    const updatedMilestones = [newM, ...(selectedProject.milestones || [])];
    const avgProg = Math.round(updatedMilestones.reduce((acc, m) => acc + m.progressPercent, 0) / updatedMilestones.length);

    const updatedList = projectList.map(p => {
      if (p.id === selectedProject.id) {
        return {
          ...p,
          milestones: updatedMilestones,
          overallProgress: avgProg
        };
      }
      return p;
    });

    setProjectList(updatedList);
    LocalApiService.updateProjects(updatedList);
    setMTitle('');
    setMDesc('');
    setAddingMilestone(false);
  };

  return (
    <div style={{ maxWidth: '680px', margin: '0 auto', padding: '20px 16px' }}>
      
      {/* Title & Top Action */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10.5px', color: 'var(--line)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            ACOMPANHAMENTO TÉCNICO & DIÁRIO DE OBRA
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--ink)' }}>
            Diário de Obras Digital
          </h2>
        </div>

        <button onClick={() => setCreatingProject(!creatingProject)} className="btn primary" style={{ fontSize: '11px' }}>
          <Plus size={13} /> {creatingProject ? 'Cancelar' : 'Nova Obra / Projeto'}
        </button>
      </div>

      {/* Project Creation Form */}
      {creatingProject && (
        <form onSubmit={handleCreateProject} className="card" style={{ padding: '16px', marginBottom: '18px', display: 'flex', flexDirection: 'column', gap: '12px', border: '2px solid var(--accent)' }}>
          <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--ink)', borderBottom: '1px solid var(--steel-line)', paddingBottom: '6px' }}>
            Iniciar Novo Livro de Diário de Obra
          </div>

          <div className="field">
            <label style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--steel)' }}>Nome / Título da Obra *</label>
            <input 
              type="text" 
              className="input-field" 
              placeholder="Ex: Reforma e Reforço Estrutural - Edifício Vila Mariana" 
              value={projTitle} 
              onChange={e => setProjTitle(e.target.value)} 
              required 
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div className="field">
              <label style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--steel)' }}>Localização / Endereço</label>
              <input 
                type="text" 
                className="input-field" 
                value={projLocation} 
                onChange={e => setProjLocation(e.target.value)} 
              />
            </div>

            <div className="field">
              <label style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--steel)' }}>Orçamento Total Estimado (R$)</label>
              <input 
                type="number" 
                className="input-field mono" 
                value={projBudget} 
                onChange={e => setProjBudget(e.target.value)} 
              />
            </div>
          </div>

          <div className="field">
            <label style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--steel)' }}>Responsável Técnico (RT)</label>
            <input 
              type="text" 
              className="input-field" 
              value={projRT} 
              onChange={e => setProjRT(e.target.value)} 
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <button type="button" onClick={() => setCreatingProject(false)} className="btn ghost" style={{ fontSize: '11px' }}>
              Cancelar
            </button>
            <button type="submit" className="btn primary" style={{ fontSize: '11px' }}>
              <CheckCircle2 size={13} /> Criar Livro de Obra
            </button>
          </div>
        </form>
      )}

      {/* Active Project Card */}
      {selectedProject ? (
        <>
          <div className="card" style={{ padding: '16px', marginBottom: '18px', borderLeft: '4px solid var(--accent)' }}>
            <div className="tb-label" style={{ color: 'var(--line)' }}>DIÁRIO DE OBRA DIGITAL — PROJETO ATIVO</div>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--ink)', margin: '2px 0 4px' }}>
              {selectedProject.title}
            </h2>
            <div style={{ fontSize: '11.5px', color: 'var(--steel)', marginBottom: '10px' }}>
              {selectedProject.location} • RT: <strong>{selectedProject.responsavelTecnico}</strong> ({selectedProject.creaNumber})
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
              <div className="tb-field">
                <div className="tb-label">Registros</div>
                <div className="tb-value">{selectedProject.milestones?.length || 0} lançamentos</div>
              </div>
            </div>
          </div>

          {/* Section for Milestones */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--ink)' }}>Registros de Execução & Ocorrências</h3>
            <button onClick={() => setAddingMilestone(!addingMilestone)} className="btn primary" style={{ fontSize: '10.5px', padding: '5px 10px' }}>
              <Plus size={12} /> {addingMilestone ? 'Cancelar' : 'Novo Lançamento'}
            </button>
          </div>

          {addingMilestone && (
            <form onSubmit={handleAddMilestone} className="card" style={{ padding: '14px', marginBottom: '18px', display: 'flex', flexDirection: 'column', gap: '10px', border: '1px solid var(--steel-line)' }}>
              <div className="tb-label">Novo Registro no Diário de Obra</div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div className="field">
                  <label style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--steel)' }}>Fase Construtiva</label>
                  <select className="input-field" value={mPhase} onChange={e => setMPhase(e.target.value as TimelinePhase)}>
                    <option value="Fundação e Terraplanagem">Fundação e Terraplanagem</option>
                    <option value="Estrutura e Concreto">Estrutura e Concreto</option>
                    <option value="Alvenaria e Vedações">Alvenaria e Vedações</option>
                    <option value="Instalações Elétricas e Hidráulicas">Instalações Elétricas e Hidráulicas</option>
                    <option value="Revestimentos e Acabamento">Revestimentos e Acabamento</option>
                    <option value="Vistoria e Habite-se">Vistoria e Habite-se</option>
                  </select>
                </div>

                <div className="field">
                  <label style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--steel)' }}>% de Conclusão da Etapa</label>
                  <input type="number" className="input-field mono" value={mProgress} onChange={e => setMProgress(e.target.value)} min="0" max="100" />
                </div>
              </div>

              <div className="field">
                <label style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--steel)' }}>Título da Ocorrência *</label>
                <input type="text" className="input-field" placeholder="Ex: Vistoria de Armadura e Concretagem dos Pilares" value={mTitle} onChange={e => setMTitle(e.target.value)} required />
              </div>

              <div className="field">
                <label style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--steel)' }}>Relatório Técnico da Execução *</label>
                <textarea className="input-field" rows={3} placeholder="Descreva o avanço técnico, ensaios realizados, fck do concreto, etc." value={mDesc} onChange={e => setMDesc(e.target.value)} required />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div className="field">
                  <label style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--steel)' }}>Custo Incorrido na Etapa (R$)</label>
                  <input type="number" className="input-field mono" value={mCost} onChange={e => setMCost(e.target.value)} />
                </div>
                <div className="field">
                  <label style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--steel)' }}>Foto / Evidência (URL)</label>
                  <input type="url" className="input-field mono" value={mPhoto} onChange={e => setMPhoto(e.target.value)} />
                </div>
              </div>

              <button type="submit" className="btn accent" style={{ justifyContent: 'center', fontSize: '11px', marginTop: '4px' }}>
                <CheckCircle2 size={13} /> Registrar no Livro de Obra
              </button>
            </form>
          )}

          {/* Timeline Milestones */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {selectedProject.milestones && selectedProject.milestones.length > 0 ? (
              selectedProject.milestones.map((m) => (
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
                    <p style={{ fontSize: '12.5px', color: 'var(--graphite)', lineHeight: 1.5 }}>{m.description}</p>
                  </div>

                  {m.photoUrls && m.photoUrls.length > 0 && (
                    <div style={{ margin: '0 13px 11px', height: '150px', borderRadius: '2px', overflow: 'hidden' }}>
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
                      <div className="tb-value" style={{ color: 'var(--accent)', fontWeight: 700 }}>{m.progressPercent}%</div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="card" style={{ padding: '36px', textAlign: 'center', color: 'var(--steel)' }}>
                <Clock size={32} color="var(--steel)" style={{ margin: '0 auto 8px' }} />
                <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--ink)' }}>Nenhum registro lançado nesta obra</div>
                <div style={{ fontSize: '11px', marginTop: '4px' }}>Clique em "Novo Lançamento" para cadastrar o avanço físico e relatórios fotográficos.</div>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="card" style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--steel)', background: 'var(--white)', border: '1px dashed var(--steel-line)' }}>
          <HardHat size={44} color="var(--accent)" style={{ margin: '0 auto 12px' }} />
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--ink)', marginBottom: '6px' }}>
            Nenhum Diário de Obra Ativo
          </h3>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--steel)', maxWidth: '400px', margin: '0 auto 18px', lineHeight: 1.4 }}>
            Crie o acompanhamento digital da sua obra para registrar ocorrências, marcos construtivos, laudos e fotos com validade técnica.
          </p>
          <button onClick={() => setCreatingProject(true)} className="btn primary" style={{ margin: '0 auto', fontSize: '11px' }}>
            <Plus size={14} /> Iniciar Novo Diário de Obra
          </button>
        </div>
      )}

    </div>
  );
};
