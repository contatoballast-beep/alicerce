import React, { useState, useEffect } from 'react';
import { Plus, Trash2, CheckCircle2, Circle, Home, ClipboardList, ChevronDown, ChevronRight } from 'lucide-react';
import { HouseSVG } from './HouseSVG';

interface ChecklistTask {
  id: string;
  label: string;
  done: boolean;
  createdAt: string;
}

interface ConstructionProject {
  id: string;
  name: string;
  tasks: ChecklistTask[];
  createdAt: string;
}

const STORAGE_KEY = 'alicerce_checklist_v1';

const loadProjects = (): ConstructionProject[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveProjects = (projects: ConstructionProject[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
};

const calcProgress = (tasks: ChecklistTask[]) => {
  if (tasks.length === 0) return 0;
  const done = tasks.filter(t => t.done).length;
  return Math.round((done / tasks.length) * 100);
};

export const ConstructionChecklistView: React.FC = () => {
  const [projects, setProjects] = useState<ConstructionProject[]>(loadProjects);
  const [selectedId, setSelectedId] = useState<string | null>(() => {
    const p = loadProjects();
    return p.length > 0 ? p[0].id : null;
  });
  const [newProjectName, setNewProjectName] = useState('');
  const [showNewProjectInput, setShowNewProjectInput] = useState(false);
  const [newTaskLabel, setNewTaskLabel] = useState('');
  const [showNewTaskInput, setShowNewTaskInput] = useState(false);
  const [projectListOpen, setProjectListOpen] = useState(true);

  useEffect(() => {
    saveProjects(projects);
  }, [projects]);

  const selectedProject = projects.find(p => p.id === selectedId) ?? null;
  const progress = selectedProject ? calcProgress(selectedProject.tasks) : 0;

  const handleCreateProject = () => {
    const name = newProjectName.trim();
    if (!name) return;
    const newProject: ConstructionProject = {
      id: `proj_${Date.now()}`,
      name,
      tasks: [],
      createdAt: new Date().toLocaleDateString('pt-BR'),
    };
    const updated = [...projects, newProject];
    setProjects(updated);
    setSelectedId(newProject.id);
    setNewProjectName('');
    setShowNewProjectInput(false);
  };

  const handleDeleteProject = (id: string) => {
    const updated = projects.filter(p => p.id !== id);
    setProjects(updated);
    if (selectedId === id) {
      setSelectedId(updated.length > 0 ? updated[0].id : null);
    }
  };

  const handleAddTask = () => {
    const label = newTaskLabel.trim();
    if (!label || !selectedId) return;
    const newTask: ChecklistTask = {
      id: `task_${Date.now()}`,
      label,
      done: false,
      createdAt: new Date().toLocaleDateString('pt-BR'),
    };
    setProjects(prev =>
      prev.map(p =>
        p.id === selectedId ? { ...p, tasks: [...p.tasks, newTask] } : p
      )
    );
    setNewTaskLabel('');
    setShowNewTaskInput(false);
  };

  const handleToggleTask = (taskId: string) => {
    setProjects(prev =>
      prev.map(p =>
        p.id === selectedId
          ? { ...p, tasks: p.tasks.map(t => (t.id === taskId ? { ...t, done: !t.done } : t)) }
          : p
      )
    );
  };

  const handleDeleteTask = (taskId: string) => {
    setProjects(prev =>
      prev.map(p =>
        p.id === selectedId ? { ...p, tasks: p.tasks.filter(t => t.id !== taskId) } : p
      )
    );
  };

  const getProgressColor = (pct: number) => {
    if (pct === 100) return '#059669';
    if (pct >= 60) return '#D97706';
    return '#EA580C';
  };

  const getProgressLabel = (pct: number) => {
    if (pct === 0) return 'Aguardando início';
    if (pct < 30) return 'Em planejamento';
    if (pct < 60) return 'Em andamento';
    if (pct < 100) return 'Fase de acabamento';
    return '🎉 Obra concluída!';
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--canvas)', padding: '32px 16px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: 32, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--color-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Home size={20} color="#fff" />
              </div>
              <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--ink)', margin: 0, fontFamily: 'var(--font-display)' }}>
                Checklist de Obra
              </h1>
            </div>
            <p style={{ color: 'var(--steel)', fontSize: 14, margin: 0 }}>
              Acompanhe o progresso da sua construção visualmente
            </p>
          </div>
          <button
            id="btn-nova-construcao"
            onClick={() => setShowNewProjectInput(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: 'var(--color-accent)', color: '#fff',
              border: 'none', borderRadius: 8, padding: '10px 18px',
              fontWeight: 700, fontSize: 14, cursor: 'pointer',
              fontFamily: 'var(--font-body)',
              boxShadow: '0 4px 14px rgba(234,88,12,0.3)',
              transition: 'background 0.2s, transform 0.1s',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-accent-hover)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'var(--color-accent)')}
          >
            <Plus size={16} />
            Nova Construção
          </button>
        </div>

        {/* New project input */}
        {showNewProjectInput && (
          <div style={{
            background: '#fff', border: '2px solid var(--color-accent)',
            borderRadius: 12, padding: 20, marginBottom: 24,
            boxShadow: '0 4px 20px rgba(234,88,12,0.15)',
            animation: 'fadeIn 0.2s ease-out',
          }}>
            <p style={{ fontWeight: 700, fontSize: 14, color: 'var(--ink)', margin: '0 0 12px 0' }}>
              📋 Nome da nova construção
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <input
                id="input-nome-construcao"
                autoFocus
                value={newProjectName}
                onChange={e => setNewProjectName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleCreateProject()}
                placeholder="Ex: Casa no Sítio, Apartamento Centro..."
                style={{
                  flex: 1, padding: '10px 14px', borderRadius: 8,
                  border: '1.5px solid var(--border-color)',
                  fontSize: 14, fontFamily: 'var(--font-body)',
                  outline: 'none', color: 'var(--ink)',
                }}
              />
              <button
                onClick={handleCreateProject}
                style={{
                  background: 'var(--color-accent)', color: '#fff',
                  border: 'none', borderRadius: 8, padding: '10px 18px',
                  fontWeight: 700, fontSize: 14, cursor: 'pointer',
                  fontFamily: 'var(--font-body)',
                }}
              >
                Criar
              </button>
              <button
                onClick={() => { setShowNewProjectInput(false); setNewProjectName(''); }}
                style={{
                  background: 'var(--paper)', color: 'var(--steel)',
                  border: 'none', borderRadius: 8, padding: '10px 14px',
                  fontSize: 14, cursor: 'pointer', fontFamily: 'var(--font-body)',
                }}
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        {projects.length === 0 ? (
          /* Empty state */
          <div style={{
            textAlign: 'center', padding: '80px 20px',
            background: '#fff', borderRadius: 16,
            border: '2px dashed var(--paper-deep)',
          }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>🏠</div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--ink)', margin: '0 0 8px 0' }}>
              Nenhuma construção ainda
            </h2>
            <p style={{ color: 'var(--steel)', fontSize: 14, marginBottom: 24 }}>
              Clique em "Nova Construção" para começar a acompanhar sua obra
            </p>
            <button
              onClick={() => setShowNewProjectInput(true)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: 'var(--color-accent)', color: '#fff',
                border: 'none', borderRadius: 8, padding: '12px 24px',
                fontWeight: 700, fontSize: 14, cursor: 'pointer',
                fontFamily: 'var(--font-body)',
              }}
            >
              <Plus size={16} /> Nova Construção
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 24, alignItems: 'start' }}>

            {/* Left sidebar: project list */}
            <div style={{ background: '#fff', borderRadius: 14, border: '1px solid var(--border-color)', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
              <button
                onClick={() => setProjectListOpen(v => !v)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '14px 16px', background: 'var(--paper)', border: 'none', cursor: 'pointer',
                  fontWeight: 700, fontSize: 13, color: 'var(--steel)', fontFamily: 'var(--font-body)',
                  letterSpacing: '0.05em', textTransform: 'uppercase',
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <ClipboardList size={14} />
                  Minhas Obras ({projects.length})
                </span>
                {projectListOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </button>

              {projectListOpen && (
                <ul style={{ listStyle: 'none', margin: 0, padding: '8px 0' }}>
                  {projects.map(proj => {
                    const pct = calcProgress(proj.tasks);
                    const isSelected = proj.id === selectedId;
                    return (
                      <li key={proj.id}>
                        <div
                          onClick={() => setSelectedId(proj.id)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 10,
                            padding: '10px 16px', cursor: 'pointer',
                            background: isSelected ? 'var(--color-accent-light)' : 'transparent',
                            borderLeft: isSelected ? '3px solid var(--color-accent)' : '3px solid transparent',
                            transition: 'background 0.15s',
                          }}
                        >
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: 600, fontSize: 13, color: isSelected ? 'var(--color-accent)' : 'var(--ink)', marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {proj.name}
                            </div>
                            {/* Mini progress bar */}
                            <div style={{ height: 4, background: 'var(--paper-deep)', borderRadius: 2, overflow: 'hidden' }}>
                              <div style={{
                                height: '100%', borderRadius: 2,
                                width: `${pct}%`,
                                background: getProgressColor(pct),
                                transition: 'width 0.5s ease',
                              }} />
                            </div>
                            <div style={{ fontSize: 11, color: 'var(--steel)', marginTop: 3 }}>
                              {pct}% • {proj.tasks.filter(t => t.done).length}/{proj.tasks.length} tarefas
                            </div>
                          </div>
                          <button
                            id={`btn-delete-proj-${proj.id}`}
                            onClick={e => { e.stopPropagation(); handleDeleteProject(proj.id); }}
                            style={{
                              background: 'transparent', border: 'none', cursor: 'pointer',
                              color: 'var(--steel)', padding: 4, borderRadius: 4, lineHeight: 1,
                              opacity: 0.5, transition: 'opacity 0.2s',
                            }}
                            onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                            onMouseLeave={e => (e.currentTarget.style.opacity = '0.5')}
                            title="Remover obra"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {/* Right panel: house + checklist */}
            {selectedProject ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

                {/* House visualization card */}
                <div style={{
                  background: '#fff', borderRadius: 14,
                  border: '1px solid var(--border-color)',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                  padding: '28px 24px',
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 28,
                  alignItems: 'center',
                }}>
                  {/* House SVG */}
                  <div>
                    <HouseSVG progress={progress} />
                  </div>

                  {/* Progress info */}
                  <div>
                    <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--ink)', margin: '0 0 6px 0', fontFamily: 'var(--font-display)' }}>
                      {selectedProject.name}
                    </h2>
                    <p style={{ fontSize: 12, color: 'var(--steel)', margin: '0 0 20px 0' }}>
                      Criada em {selectedProject.createdAt}
                    </p>

                    {/* Big progress number */}
                    <div style={{ marginBottom: 16 }}>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 8 }}>
                        <span style={{ fontSize: 48, fontWeight: 900, color: getProgressColor(progress), lineHeight: 1, fontFamily: 'var(--font-display)' }}>
                          {progress}
                        </span>
                        <span style={{ fontSize: 24, fontWeight: 700, color: getProgressColor(progress) }}>%</span>
                      </div>
                      <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--steel)', marginBottom: 10 }}>
                        {getProgressLabel(progress)}
                      </div>
                      {/* Progress bar */}
                      <div style={{ height: 10, background: 'var(--paper-deep)', borderRadius: 8, overflow: 'hidden' }}>
                        <div style={{
                          height: '100%', borderRadius: 8,
                          width: `${progress}%`,
                          background: `linear-gradient(90deg, ${getProgressColor(progress)}, ${getProgressColor(progress)}CC)`,
                          transition: 'width 0.7s cubic-bezier(0.4, 0, 0.2, 1)',
                          boxShadow: `0 0 8px ${getProgressColor(progress)}66`,
                        }} />
                      </div>
                    </div>

                    {/* Stats */}
                    <div style={{ display: 'flex', gap: 16 }}>
                      <div style={{ textAlign: 'center', background: 'var(--color-success-light)', borderRadius: 8, padding: '10px 16px', flex: 1 }}>
                        <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--color-success)' }}>
                          {selectedProject.tasks.filter(t => t.done).length}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--color-success)', fontWeight: 600 }}>Concluídas</div>
                      </div>
                      <div style={{ textAlign: 'center', background: 'var(--color-warn-light)', borderRadius: 8, padding: '10px 16px', flex: 1 }}>
                        <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--color-warn)' }}>
                          {selectedProject.tasks.filter(t => !t.done).length}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--color-warn)', fontWeight: 600 }}>Pendentes</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Checklist card */}
                <div style={{
                  background: '#fff', borderRadius: 14,
                  border: '1px solid var(--border-color)',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                  overflow: 'hidden',
                }}>
                  {/* Checklist header */}
                  <div style={{
                    padding: '16px 20px',
                    borderBottom: '1px solid var(--border-color)',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    background: 'var(--paper)',
                  }}>
                    <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--ink)', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <ClipboardList size={16} color="var(--color-accent)" />
                      Etapas da Obra
                    </span>
                    <button
                      id="btn-nova-etapa"
                      onClick={() => setShowNewTaskInput(true)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 6,
                        background: 'var(--color-accent)', color: '#fff',
                        border: 'none', borderRadius: 6, padding: '7px 14px',
                        fontWeight: 700, fontSize: 13, cursor: 'pointer',
                        fontFamily: 'var(--font-body)',
                      }}
                    >
                      <Plus size={14} /> Nova Etapa
                    </button>
                  </div>

                  {/* New task input */}
                  {showNewTaskInput && (
                    <div style={{
                      padding: '14px 20px',
                      background: 'var(--color-accent-light)',
                      borderBottom: '1px solid var(--border-color)',
                      display: 'flex', gap: 10,
                      animation: 'fadeIn 0.15s ease-out',
                    }}>
                      <input
                        id="input-nova-etapa"
                        autoFocus
                        value={newTaskLabel}
                        onChange={e => setNewTaskLabel(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleAddTask()}
                        placeholder="Ex: Concretagem da laje, Instalação elétrica..."
                        style={{
                          flex: 1, padding: '9px 12px', borderRadius: 6,
                          border: '1.5px solid var(--color-accent)',
                          fontSize: 13, fontFamily: 'var(--font-body)',
                          outline: 'none', color: 'var(--ink)',
                        }}
                      />
                      <button onClick={handleAddTask}
                        style={{ background: 'var(--color-accent)', color: '#fff', border: 'none', borderRadius: 6, padding: '9px 16px', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
                        Adicionar
                      </button>
                      <button onClick={() => { setShowNewTaskInput(false); setNewTaskLabel(''); }}
                        style={{ background: 'transparent', color: 'var(--steel)', border: '1px solid var(--border-color)', borderRadius: 6, padding: '9px 12px', fontSize: 13, cursor: 'pointer' }}>
                        ✕
                      </button>
                    </div>
                  )}

                  {/* Task list */}
                  {selectedProject.tasks.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--steel)' }}>
                      <div style={{ fontSize: 32, marginBottom: 10 }}>📋</div>
                      <p style={{ fontSize: 13, margin: 0 }}>Nenhuma etapa cadastrada. Clique em "Nova Etapa" para começar.</p>
                    </div>
                  ) : (
                    <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                      {selectedProject.tasks.map((task, idx) => (
                        <li
                          key={task.id}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 12,
                            padding: '14px 20px',
                            borderBottom: idx < selectedProject.tasks.length - 1 ? '1px solid var(--paper-deep)' : 'none',
                            background: task.done ? 'var(--color-success-light)' : '#fff',
                            transition: 'background 0.25s',
                          }}
                        >
                          <button
                            id={`btn-toggle-${task.id}`}
                            onClick={() => handleToggleTask(task.id)}
                            style={{
                              background: 'transparent', border: 'none', cursor: 'pointer',
                              padding: 0, lineHeight: 1, flexShrink: 0,
                              transition: 'transform 0.15s',
                            }}
                            onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.15)')}
                            onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
                            title={task.done ? 'Desmarcar' : 'Marcar como concluído'}
                          >
                            {task.done
                              ? <CheckCircle2 size={22} color="var(--color-success)" />
                              : <Circle size={22} color="var(--steel)" />
                            }
                          </button>
                          <span style={{
                            flex: 1, fontSize: 14, fontWeight: task.done ? 500 : 600,
                            color: task.done ? 'var(--steel)' : 'var(--ink)',
                            textDecoration: task.done ? 'line-through' : 'none',
                            transition: 'all 0.25s',
                          }}>
                            {task.label}
                          </span>
                          {task.done && (
                            <span style={{ fontSize: 11, color: 'var(--color-success)', fontWeight: 700, background: 'var(--color-success-light)', padding: '2px 8px', borderRadius: 20, border: '1px solid var(--color-success)', opacity: 0.8 }}>
                              ✓ Concluído
                            </span>
                          )}
                          <button
                            id={`btn-delete-task-${task.id}`}
                            onClick={() => handleDeleteTask(task.id)}
                            style={{
                              background: 'transparent', border: 'none', cursor: 'pointer',
                              color: 'var(--steel)', padding: 4, borderRadius: 4,
                              opacity: 0.4, transition: 'opacity 0.2s', lineHeight: 1, flexShrink: 0,
                            }}
                            onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                            onMouseLeave={e => (e.currentTarget.style.opacity = '0.4')}
                            title="Remover etapa"
                          >
                            <Trash2 size={14} />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* Celebration message */}
                  {progress === 100 && (
                    <div style={{
                      padding: '20px', textAlign: 'center',
                      background: 'linear-gradient(135deg, var(--color-success-light), #DCFCE7)',
                      borderTop: '1px solid var(--color-success)',
                    }}>
                      <div style={{ fontSize: 32, marginBottom: 8 }}>🎉</div>
                      <p style={{ fontWeight: 800, fontSize: 16, color: 'var(--color-success)', margin: '0 0 4px' }}>
                        Obra Concluída!
                      </p>
                      <p style={{ fontSize: 13, color: 'var(--color-success)', margin: 0, opacity: 0.8 }}>
                        Parabéns! Todas as etapas foram finalizadas com sucesso.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
};
