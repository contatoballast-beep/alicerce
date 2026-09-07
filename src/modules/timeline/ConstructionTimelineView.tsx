import React, { useState } from 'react';
import { ConstructionProject, ConstructionMilestone, UserProfile, TimelinePhase } from '../../types';
import { HardHat, CheckCircle2, Clock, Plus, Building2, Calendar, DollarSign, Image as ImageIcon, MapPin, UserCheck, ShieldCheck } from 'lucide-react';
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
  const [mPhoto, setMPhoto] = useState('https://images.unsplash.com/photo-1541888946425-d0fbb186a5b7?w=600');

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
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '24px 16px' }}>
      
      {/* Title & Top Action */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>
            Diário de Obras Digital
          </h2>
          <p style={{ fontSize: '13px', color: '#64748B', marginTop: '3px' }}>
            Registro fotográfico, controle físico-financeiro e rastreabilidade técnica por ART/CREA.
          </p>
        </div>

        <button 
          onClick={() => setCreatingProject(!creatingProject)} 
          className="btn primary" 
          style={{ fontSize: '12px', padding: '9px 16px', gap: '6px' }}
        >
          <Plus size={14} /> {creatingProject ? 'Cancelar' : 'Nova Obra'}
        </button>
      </div>

      {/* Project Creation Form */}
      {creatingProject && (
        <form onSubmit={handleCreateProject} className="card" style={{ padding: '20px', marginBottom: '22px', display: 'flex', flexDirection: 'column', gap: '14px', border: '1.5px solid #3B82F6' }}>
          <div style={{ fontWeight: 700, fontSize: '14.5px', color: '#0F172A', borderBottom: '1px solid #E2E8F0', paddingBottom: '8px' }}>
            Iniciar Novo Livro de Diário de Obra
          </div>

          <div>
            <label style={{ fontSize: '11.5px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '4px' }}>Nome / Título da Obra *</label>
            <input 
              type="text" 
              className="input-field" 
              placeholder="Ex: Reforma e Reforço Estrutural - Edifício Vila Mariana" 
              value={projTitle} 
              onChange={e => setProjTitle(e.target.value)} 
              required 
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '11.5px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '4px' }}>Localização / Endereço</label>
              <input 
                type="text" 
                className="input-field" 
                value={projLocation} 
                onChange={e => setProjLocation(e.target.value)} 
              />
            </div>

            <div>
              <label style={{ fontSize: '11.5px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '4px' }}>Orçamento Total Estimado (R$)</label>
              <input 
                type="number" 
                className="input-field" 
                value={projBudget} 
                onChange={e => setProjBudget(e.target.value)} 
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '11.5px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '4px' }}>Responsável Técnico (RT)</label>
            <input 
              type="text" 
              className="input-field" 
              value={projRT} 
              onChange={e => setProjRT(e.target.value)} 
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '6px' }}>
            <button type="button" onClick={() => setCreatingProject(false)} className="btn ghost">
              Cancelar
            </button>
            <button type="submit" className="btn accent">
              Criar Livro de Obra
            </button>
          </div>
        </form>
      )}

      {/* Projects Tabs (if more than 1) */}
      {projectList.length > 1 && (
        <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', marginBottom: '16px' }}>
          {projectList.map(p => (
            <button
              key={p.id}
              onClick={() => setSelectedProjectId(p.id)}
              className={`chip ${selectedProject?.id === p.id ? 'on' : ''}`}
            >
              {p.title}
            </button>
          ))}
        </div>
      )}

      {/* Selected Project Card */}
      {selectedProject ? (
        <div>
          <div className="card" style={{ padding: '20px', marginBottom: '20px', borderRadius: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <span className="badge" style={{ background: '#ECFDF5', color: '#047857', borderColor: '#A7F3D0', marginBottom: '6px' }}>
                  ✓ PROJETO ATIVO
                </span>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', marginTop: '4px' }}>
                  {selectedProject.title}
                </h3>
                <div style={{ fontSize: '12px', color: '#64748B', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                  <MapPin size={13} /> {selectedProject.location} • RT: {selectedProject.responsavelTecnico} ({selectedProject.creaNumber})
                </div>
              </div>

              <button 
                onClick={() => setAddingMilestone(!addingMilestone)} 
                className="btn accent" 
                style={{ fontSize: '12px', padding: '8px 16px', gap: '6px' }}
              >
                <Plus size={14} /> Novo Registro
              </button>
            </div>

            {/* Overall Progress & Budget Strip */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '12px',
              marginTop: '16px',
              padding: '14px',
              background: '#F8FAFC',
              borderRadius: '10px',
              border: '1px solid #E2E8F0'
            }}>
              <div>
                <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>Orçamento Total</div>
                <div style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', marginTop: '2px' }}>
                  R$ {selectedProject.totalBudget.toLocaleString('pt-BR')}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>Progresso Físico Geral</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                  <div style={{ flex: 1, height: '8px', background: '#E2E8F0', borderRadius: '9999px', overflow: 'hidden' }}>
                    <div style={{ width: `${selectedProject.overallProgress}%`, height: '100%', background: '#2563EB', borderRadius: '9999px', transition: 'width 0.3s ease' }}></div>
                  </div>
                  <span style={{ fontSize: '13px', fontWeight: 800, color: '#2563EB' }}>
                    {selectedProject.overallProgress}%
                  </span>
                </div>
              </div>

              <div>
                <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>Registros Técnicos</div>
                <div style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A', marginTop: '2px' }}>
                  {selectedProject.milestones?.length || 0} etapas
                </div>
              </div>
            </div>
          </div>

          {/* Add Milestone Form */}
          {addingMilestone && (
            <form onSubmit={handleAddMilestone} className="card" style={{ padding: '20px', marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '14px', border: '1.5px solid #2563EB' }}>
              <div style={{ fontWeight: 700, fontSize: '14px', color: '#0F172A', borderBottom: '1px solid #E2E8F0', paddingBottom: '8px' }}>
                Novo Registro no Diário de Obra
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '11.5px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '4px' }}>Fase da Construção</label>
                  <select 
                    className="input-field" 
                    value={mPhase} 
                    onChange={e => setMPhase(e.target.value as TimelinePhase)}
                  >
                    <option value="Fundação e Terraplanagem">Fundação e Terraplanagem</option>
                    <option value="Estrutura e Concreto">Estrutura e Concreto</option>
                    <option value="Alvenaria e Vedações">Alvenaria e Vedações</option>
                    <option value="Instalações Elétricas e Hidráulicas">Instalações Elétricas e Hidráulicas</option>
                    <option value="Revestimentos e Acabamento">Revestimentos e Acabamento</option>
                    <option value="Vistoria e Habite-se">Vistoria e Habite-se</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '11.5px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '4px' }}>Percentual Concluído (%)</label>
                  <input 
                    type="number" 
                    className="input-field" 
                    min="0" 
                    max="100" 
                    value={mProgress} 
                    onChange={e => setMProgress(e.target.value)} 
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '11.5px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '4px' }}>Título da Atividade / Etapa *</label>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="Ex: Concretagem das Vigas Baldrame e Pilares do Térreo" 
                  value={mTitle} 
                  onChange={e => setMTitle(e.target.value)} 
                  required 
                />
              </div>

              <div>
                <label style={{ fontSize: '11.5px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '4px' }}>Descrição Técnica / Relato de Campo *</label>
                <textarea 
                  className="input-field" 
                  rows={3} 
                  placeholder="Descreva materiais utilizados, condições climáticas, equipe presente e conformidade com projeto estrutural..." 
                  value={mDesc} 
                  onChange={e => setMDesc(e.target.value)} 
                  required 
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '11.5px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '4px' }}>Custo da Etapa (R$)</label>
                  <input 
                    type="number" 
                    className="input-field" 
                    value={mCost} 
                    onChange={e => setMCost(e.target.value)} 
                  />
                </div>

                <div>
                  <label style={{ fontSize: '11.5px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '4px' }}>URL Foto da Etapa</label>
                  <input 
                    type="text" 
                    className="input-field" 
                    value={mPhoto} 
                    onChange={e => setMPhoto(e.target.value)} 
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '6px' }}>
                <button type="button" onClick={() => setAddingMilestone(false)} className="btn ghost">
                  Cancelar
                </button>
                <button type="submit" className="btn primary">
                  Registrar no Diário
                </button>
              </div>
            </form>
          )}

          {/* Milestones Stream */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {selectedProject.milestones && selectedProject.milestones.length > 0 ? (
              selectedProject.milestones.map((m, idx) => (
                <div key={m.id} className="card" style={{ padding: '18px', borderRadius: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div>
                      <div style={{ fontSize: '11px', color: '#2563EB', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        {m.phase}
                      </div>
                      <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A', marginTop: '2px' }}>
                        {m.title}
                      </h4>
                      <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>
                        {m.updatedAt} • RT: {m.responsibleCrea}
                      </div>
                    </div>

                    <span className="badge verified" style={{ fontSize: '11px' }}>
                      {m.progressPercent}% Concluído
                    </span>
                  </div>

                  <p style={{ fontSize: '13px', color: '#334155', lineHeight: 1.55, margin: '8px 0' }}>
                    {m.description}
                  </p>

                  {m.photoUrls && m.photoUrls.length > 0 && (
                    <div style={{ maxHeight: '280px', overflow: 'hidden', borderRadius: '10px', marginTop: '10px' }}>
                      <img 
                        src={m.photoUrls[0]} 
                        alt={m.title} 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                      />
                    </div>
                  )}

                  {m.costIncurred > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px', fontSize: '12px', fontWeight: 600, color: '#0F172A' }}>
                      Custo da Etapa: <span style={{ color: '#059669', marginLeft: '4px' }}>R$ {m.costIncurred.toLocaleString('pt-BR')}</span>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="card" style={{ padding: '40px 20px', textAlign: 'center', background: '#FFFFFF', borderRadius: '14px', border: '1px dashed #CBD5E1' }}>
                <HardHat size={32} color="#94A3B8" style={{ margin: '0 auto 10px' }} />
                <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A' }}>Nenhum registro de etapa ainda</h4>
                <p style={{ fontSize: '12.5px', color: '#64748B', maxWidth: '380px', margin: '4px auto 16px', lineHeight: 1.5 }}>
                  Comece registrando o estacamento, fundação ou concretagem para acompanhar a evolução física e fotográfica da obra.
                </p>
                <button onClick={() => setAddingMilestone(true)} className="btn primary" style={{ margin: '0 auto', fontSize: '12px' }}>
                  <Plus size={14} /> Fazer Primeiro Registro
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="card" style={{ padding: '50px 24px', textAlign: 'center', background: '#FFFFFF', borderRadius: '14px', border: '1px dashed #CBD5E1' }}>
          <Building2 size={36} color="#94A3B8" style={{ margin: '0 auto 12px' }} />
          <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#0F172A' }}>
            Nenhum Livro de Diário de Obra Ativo
          </h3>
          <p style={{ fontSize: '13px', color: '#64748B', maxWidth: '420px', margin: '6px auto 20px', lineHeight: 1.5 }}>
            Inicie o diário da sua construção para manter registros com chancela técnica, ART e upload de fotos da evolução física.
          </p>
          <button onClick={() => setCreatingProject(true)} className="btn primary" style={{ margin: '0 auto', fontSize: '12px', padding: '10px 20px' }}>
            <Plus size={14} /> Iniciar Diário de Obra
          </button>
        </div>
      )}

    </div>
  );
};
