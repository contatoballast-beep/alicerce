import React, { useState } from 'react';
import { AdCampaign, UserProfile } from '../../types';
import { RealApiClient } from '../../services/realApiClient';
import { Megaphone, Plus, Sparkles, Eye, MousePointer, DollarSign, Target, Play, Pause, FileCheck, CheckCircle2, QrCode, ArrowUpRight } from 'lucide-react';

interface AdsCampaignViewProps {
  campaigns: AdCampaign[];
  currentUser: UserProfile;
  onCreateCampaign: (campData: any) => void;
  onOpenCheckout: (campaign: AdCampaign) => void;
}

export const AdsCampaignView: React.FC<AdsCampaignViewProps> = ({
  campaigns,
  currentUser,
  onCreateCampaign,
  onOpenCheckout,
}) => {
  const [creating, setCreating] = useState(false);
  const [title, setTitle] = useState('');
  const [objective, setObjective] = useState('Captação de Leads e Obras');
  const [targetRegion, setTargetRegion] = useState('São Paulo e Região Metropolitana');
  const [targetAudience, setTargetAudience] = useState<string[]>(['Engenheiros CREA', 'Construtoras']);
  const [dailyBudget, setDailyBudget] = useState('50');
  const [durationDays, setDurationDays] = useState('14');
  const [localCampaigns, setLocalCampaigns] = useState<AdCampaign[]>(campaigns);

  // Sync state if prop changes
  React.useEffect(() => {
    setLocalCampaigns(campaigns);
  }, [campaigns]);

  // Aggregate Metrics
  const totalImpressions = localCampaigns.reduce((acc, c) => acc + (c.impressionsCount || 0), 0);
  const totalClicks = localCampaigns.reduce((acc, c) => acc + (c.clicksCount || 0), 0);
  const totalBudget = localCampaigns.reduce((acc, c) => acc + (c.totalBudget || 0), 0);
  const avgCtr = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : '0.00';
  const activeCount = localCampaigns.filter(c => c.status === 'ativa').length;

  const handleToggleStatus = async (camp: AdCampaign) => {
    const nextStatus = camp.status === 'ativa' ? 'pausada' : 'ativa';
    await RealApiClient.toggleCampaign(camp.id, nextStatus);
    setLocalCampaigns(prev => prev.map(c => c.id === camp.id ? { ...c, status: nextStatus } : c));
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    const daily = parseFloat(dailyBudget) || 50;
    const days = parseInt(durationDays, 10) || 14;
    const total = daily * days;

    onCreateCampaign({
      userId: currentUser.id,
      title,
      objective,
      targetAudience,
      targetRegion,
      dailyBudget: daily,
      totalBudget: total,
      durationDays: days,
      paymentMethod: 'pix',
    });

    setTitle('');
    setCreating(false);
  };

  return (
    <div style={{ maxWidth: '780px', margin: '0 auto', padding: '24px 16px' }}>
      
      {/* Header Banner */}
      <div style={{ 
        background: 'var(--bg-card)', 
        border: '1px solid var(--border-color)', 
        borderRadius: 'var(--radius-lg)', 
        padding: '20px 24px', 
        marginBottom: '20px',
        boxShadow: 'var(--shadow-sm)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--accent-color)', display: 'flex', alignItems: 'center', gap: '6px', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
            <Megaphone size={13} /> ALICERCE ADS · GESTOR DE TRÁFEGO TÉCNICO
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-heading)', margin: 0, letterSpacing: '-0.02em' }}>
            Painel do Anunciante
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
            Divulgue serviços, materiais e capte contratos com engenheiros e construtoras verificadas.
          </p>
        </div>
        <button onClick={() => setCreating(!creating)} className="btn primary" style={{ padding: '10px 18px', fontSize: '13px' }}>
          <Plus size={15} /> {creating ? 'Fechar Formulário' : 'Nova Campanha'}
        </button>
      </div>

      {/* KPI Performance Dashboard */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', marginBottom: '24px' }}>
        <div className="card" style={{ padding: '16px' }}>
          <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px', textTransform: 'uppercase' }}>
            <Eye size={13} color="var(--primary-color)" /> Impressões
          </div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-heading)', marginTop: '8px', letterSpacing: '-0.02em' }}>
            {totalImpressions.toLocaleString('pt-BR')}
          </div>
          <div style={{ fontSize: '11px', color: '#10B981', fontWeight: 600, marginTop: '4px' }}>Exibições qualificadas</div>
        </div>

        <div className="card" style={{ padding: '16px' }}>
          <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px', textTransform: 'uppercase' }}>
            <MousePointer size={13} color="var(--accent-color)" /> Cliques Únicos
          </div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--accent-color)', marginTop: '8px', letterSpacing: '-0.02em' }}>
            {totalClicks}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>CTR médio: {avgCtr}%</div>
        </div>

        <div className="card" style={{ padding: '16px' }}>
          <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px', textTransform: 'uppercase' }}>
            <DollarSign size={13} color="var(--primary-color)" /> Investimento
          </div>
          <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--primary-color)', marginTop: '8px', fontFamily: 'var(--font-mono)' }}>
            R$ {totalBudget.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>Total alocado</div>
        </div>

        <div className="card" style={{ padding: '16px' }}>
          <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px', textTransform: 'uppercase' }}>
            <Target size={13} color="#10B981" /> Veiculações
          </div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: '#10B981', marginTop: '8px' }}>
            {activeCount} <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 500 }}>/ {localCampaigns.length}</span>
          </div>
          <div style={{ fontSize: '11px', color: '#10B981', fontWeight: 600, marginTop: '4px' }}>Campanhas ativas</div>
        </div>
      </div>

      {/* Creation Modal / Form */}
      {creating && (
        <form onSubmit={handleCreate} className="card" style={{ padding: '24px', marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '16px', border: '2px solid var(--accent-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
            <div>
              <div style={{ fontWeight: 800, fontSize: '16px', color: 'var(--text-heading)' }}>
                Criar Nova Campanha Patrocinada
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                Seu anúncio será inserido organicamente no Feed de Obras e no Catálogo Profissional.
              </div>
            </div>
            <span style={{ 
              fontSize: '11px', 
              fontWeight: 700, 
              padding: '4px 10px', 
              borderRadius: 'var(--radius-full)', 
              background: 'rgba(234, 88, 12, 0.1)', 
              color: 'var(--accent-color)' 
            }}>
              PIX AUTOMÁTICO
            </span>
          </div>

          <div className="field">
            <label>Título / Chamada Comercial do Anúncio *</label>
            <input 
              type="text" 
              placeholder="Ex: Fornecimento de Concreto Usinado fck 30 MPa com Bombeamento em SP" 
              value={title} 
              onChange={e => setTitle(e.target.value)} 
              required 
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
            <div className="field">
              <label>Objetivo Principal</label>
              <select value={objective} onChange={e => setObjective(e.target.value)}>
                <option value="Captação de Leads e Obras">Captação de Contratos & Obras</option>
                <option value="Venda Direta de Materiais">Venda Direta de Materiais/Insumos</option>
                <option value="Divulgação de Escritório/Construtora">Divulgação Institucional de Marca</option>
              </select>
            </div>

            <div className="field">
              <label>Região Geográfica Alvo</label>
              <input 
                type="text" 
                value={targetRegion} 
                onChange={e => setTargetRegion(e.target.value)} 
                placeholder="Ex: São Paulo e Campinas - SP"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '14px' }}>
            <div className="field">
              <label>Orçamento Diário (R$)</label>
              <input 
                type="number" 
                className="mono" 
                value={dailyBudget} 
                onChange={e => setDailyBudget(e.target.value)} 
                min="10"
              />
            </div>
            <div className="field">
              <label>Duração (Dias)</label>
              <input 
                type="number" 
                className="mono" 
                value={durationDays} 
                onChange={e => setDurationDays(e.target.value)} 
                min="1"
              />
            </div>
            <div className="field">
              <label>Investimento Total</label>
              <div style={{ 
                height: '42px', 
                display: 'flex', 
                alignItems: 'center', 
                fontWeight: 800, 
                fontSize: '15px', 
                color: 'var(--primary-color)',
                fontFamily: 'var(--font-mono)'
              }}>
                R$ {((parseFloat(dailyBudget) || 50) * (parseInt(durationDays, 10) || 14)).toFixed(2)}
              </div>
            </div>
          </div>

          <div style={{ 
            background: 'var(--primary-bg)', 
            padding: '12px 16px', 
            borderRadius: 'var(--radius-md)', 
            fontSize: '12px', 
            color: 'var(--text-body)',
            border: '1px solid rgba(37, 99, 235, 0.15)'
          }}>
            📊 <strong>Alcance Estimado:</strong> ~{((parseFloat(dailyBudget) || 50) * 120).toLocaleString('pt-BR')} impressões qualificadas para engenheiros e decisores na região selecionada.
          </div>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '6px' }}>
            <button type="button" onClick={() => setCreating(false)} className="btn ghost" style={{ fontSize: '12px' }}>
              Cancelar
            </button>
            <button type="submit" className="btn primary" style={{ fontSize: '12px' }}>
              Criar Campanha e Gerar QR Code Pix
            </button>
          </div>
        </form>
      )}

      {/* Campaigns List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>
          <span>SUAS CAMPANHAS ({localCampaigns.length})</span>
          <span>DISTRIBUIÇÃO ATIVA NO FEED</span>
        </div>

        {localCampaigns.map(camp => {
          const ctr = camp.impressionsCount > 0 ? ((camp.clicksCount / camp.impressionsCount) * 100).toFixed(1) : '0.0';
          const isAtiva = camp.status === 'ativa';

          return (
            <div key={camp.id} className="card" style={{ padding: '18px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ 
                    width: '38px', 
                    height: '38px', 
                    borderRadius: 'var(--radius-md)', 
                    background: isAtiva ? 'var(--primary-color)' : 'var(--text-muted)', 
                    color: '#FFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '13px'
                  }}>
                    AD
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '15px', color: 'var(--text-heading)' }}>{camp.title}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {camp.targetRegion} • {camp.objective}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ 
                    fontSize: '11px', 
                    fontWeight: 700, 
                    padding: '3px 8px', 
                    borderRadius: 'var(--radius-full)',
                    background: isAtiva ? 'rgba(16, 185, 129, 0.12)' : 'rgba(100, 116, 139, 0.12)',
                    color: isAtiva ? '#059669' : 'var(--text-muted)'
                  }}>
                    {camp.status.toUpperCase()}
                  </span>
                  <button 
                    onClick={() => handleToggleStatus(camp)} 
                    className="btn ghost" 
                    style={{ padding: '6px 12px', fontSize: '11.5px' }}
                    title={isAtiva ? 'Pausar Veiculação' : 'Ativar Veiculação'}
                  >
                    {isAtiva ? <Pause size={13} color="#D97706" /> : <Play size={13} color="#059669" />}
                    {isAtiva ? 'Pausar' : 'Ativar'}
                  </button>
                </div>
              </div>

              {/* Metrics Grid */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', 
                gap: '10px',
                background: 'var(--bg-subtle)',
                padding: '12px 16px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                alignItems: 'center'
              }}>
                <div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Impressões</div>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-heading)', fontFamily: 'var(--font-mono)' }}>
                    {camp.impressionsCount.toLocaleString('pt-BR')}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Cliques (CTR)</div>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--accent-color)', fontFamily: 'var(--font-mono)' }}>
                    {camp.clicksCount} <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500 }}>({ctr}%)</span>
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Investimento</div>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--primary-color)', fontFamily: 'var(--font-mono)' }}>
                    R$ {camp.totalBudget.toFixed(2)}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button onClick={() => onOpenCheckout(camp)} className="btn ghost" style={{ padding: '6px 12px', fontSize: '11.5px', gap: '6px' }}>
                    <QrCode size={13} /> Pix / NFS-e
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {localCampaigns.length === 0 && (
          <div className="card" style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Megaphone size={32} color="var(--text-muted)" style={{ margin: '0 auto 12px' }} />
            <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--text-heading)' }}>Nenhuma campanha cadastrada</div>
            <div style={{ fontSize: '13px', marginTop: '4px' }}>Clique em "Nova Campanha" para começar a anunciar no ecossistema ALICERCE.</div>
          </div>
        )}
      </div>

    </div>
  );
};
