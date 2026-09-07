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
    <div style={{ maxWidth: '680px', margin: '0 auto', padding: '20px 16px' }}>
      
      {/* Header Banner */}
      <div className="card" style={{ padding: '16px', marginBottom: '18px', borderLeft: '4px solid var(--line)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div className="tb-label" style={{ color: 'var(--line)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Megaphone size={12} /> ALICERCE ADS — MARKETING DA CONSTRUÇÃO CIVIL
            </div>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--ink)' }}>
              Painel do Anunciante
            </h2>
            <div style={{ fontSize: '11px', color: 'var(--steel)', marginTop: '2px' }}>
              Divulgue serviços, materiais e capte contratos com engenheiros e construtoras verificados.
            </div>
          </div>
          <button onClick={() => setCreating(!creating)} className="btn primary" style={{ fontSize: '11px' }}>
            <Plus size={13} /> {creating ? 'Cancelar' : 'Nova Campanha'}
          </button>
        </div>
      </div>

      {/* KPI Performance Dashboard */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '18px' }}>
        <div className="card" style={{ padding: '10px' }}>
          <div className="tb-label" style={{ fontSize: '9px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Eye size={10} color="var(--steel)" /> Impressões
          </div>
          <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--ink)', marginTop: '2px' }}>
            {totalImpressions.toLocaleString('pt-BR')}
          </div>
          <div style={{ fontSize: '9px', color: '#059669', marginTop: '2px' }}>Exibições reais</div>
        </div>

        <div className="card" style={{ padding: '10px' }}>
          <div className="tb-label" style={{ fontSize: '9px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <MousePointer size={10} color="var(--accent)" /> Cliques
          </div>
          <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--accent)', marginTop: '2px' }}>
            {totalClicks}
          </div>
          <div style={{ fontSize: '9px', color: 'var(--steel)', marginTop: '2px' }}>CTR: {avgCtr}%</div>
        </div>

        <div className="card" style={{ padding: '10px' }}>
          <div className="tb-label" style={{ fontSize: '9px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <DollarSign size={10} color="var(--line)" /> Investimento
          </div>
          <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--line)', marginTop: '2px' }}>
            R$ {totalBudget.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: '9px', color: 'var(--steel)', marginTop: '2px' }}>Total alocado</div>
        </div>

        <div className="card" style={{ padding: '10px' }}>
          <div className="tb-label" style={{ fontSize: '9px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Target size={10} color="#059669" /> Campanhas
          </div>
          <div style={{ fontSize: '16px', fontWeight: 700, color: '#059669', marginTop: '2px' }}>
            {activeCount} <span style={{ fontSize: '11px', color: 'var(--steel)', fontWeight: 400 }}>/ {localCampaigns.length}</span>
          </div>
          <div style={{ fontSize: '9px', color: '#059669', marginTop: '2px' }}>Veiculando no feed</div>
        </div>
      </div>

      {/* Creation Modal / Form */}
      {creating && (
        <form onSubmit={handleCreate} className="card" style={{ padding: '16px', marginBottom: '18px', display: 'flex', flexDirection: 'column', gap: '12px', border: '2px solid var(--accent)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--steel-line)', paddingBottom: '8px' }}>
            <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--ink)' }}>
              Criar Nova Campanha Patrocinada
            </div>
            <span className="tag warn" style={{ fontSize: '9.5px' }}>PIX AUTOMÁTICO</span>
          </div>

          <div className="field">
            <label style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--steel)', textTransform: 'uppercase' }}>Título / Chamada do Anúncio *</label>
            <input 
              type="text" 
              className="input-field" 
              placeholder="Ex: Fornecimento de Concreto Usinado fck 30 MPa com Bombeamento em SP" 
              value={title} 
              onChange={e => setTitle(e.target.value)} 
              required 
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div className="field">
              <label style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--steel)', textTransform: 'uppercase' }}>Objetivo Principal</label>
              <select className="input-field" value={objective} onChange={e => setObjective(e.target.value)}>
                <option value="Captação de Leads e Obras">Captação de Contratos & Obras</option>
                <option value="Venda Direta de Materiais">Venda Direta de Materiais/Insumos</option>
                <option value="Divulgação de Escritório/Construtora">Divulgação Institucional de Marca</option>
              </select>
            </div>

            <div className="field">
              <label style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--steel)', textTransform: 'uppercase' }}>Região Alvo</label>
              <input 
                type="text" 
                className="input-field" 
                value={targetRegion} 
                onChange={e => setTargetRegion(e.target.value)} 
                placeholder="Ex: São Paulo e Campinas - SP"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
            <div className="field">
              <label style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--steel)', textTransform: 'uppercase' }}>Orçamento Diário (R$)</label>
              <input 
                type="number" 
                className="input-field mono" 
                value={dailyBudget} 
                onChange={e => setDailyBudget(e.target.value)} 
                min="10"
              />
            </div>
            <div className="field">
              <label style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--steel)', textTransform: 'uppercase' }}>Duração (Dias)</label>
              <input 
                type="number" 
                className="input-field mono" 
                value={durationDays} 
                onChange={e => setDurationDays(e.target.value)} 
                min="1"
              />
            </div>
            <div className="field">
              <label style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--steel)', textTransform: 'uppercase' }}>Total Estimado</label>
              <div style={{ height: '36px', display: 'flex', alignItems: 'center', fontWeight: 700, fontSize: '13px', color: 'var(--line)' }}>
                R$ {((parseFloat(dailyBudget) || 50) * (parseInt(durationDays, 10) || 14)).toFixed(2)}
              </div>
            </div>
          </div>

          <div style={{ background: 'var(--paper)', padding: '8px 12px', borderRadius: '3px', fontSize: '11px', color: 'var(--steel)' }}>
            📊 <strong>Alcance Estimado:</strong> ~{((parseFloat(dailyBudget) || 50) * 120).toLocaleString('pt-BR')} impressões qualificadas para engenheiros e decisores na região selecionada.
          </div>

          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '4px' }}>
            <button type="button" onClick={() => setCreating(false)} className="btn ghost" style={{ fontSize: '11px' }}>
              Cancelar
            </button>
            <button type="submit" className="btn primary" style={{ fontSize: '11px' }}>
              Criar Campanha e Gerar QR Code Pix
            </button>
          </div>
        </form>
      )}

      {/* Campaigns List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px', color: 'var(--steel)', fontFamily: 'var(--font-mono)' }}>
          <span>SUAS CAMPANHAS ({localCampaigns.length})</span>
          <span>DISTRIBUIÇÃO: FEED & CATÁLOGO</span>
        </div>

        {localCampaigns.map(camp => {
          const ctr = camp.impressionsCount > 0 ? ((camp.clicksCount / camp.impressionsCount) * 100).toFixed(1) : '0.0';
          const isAtiva = camp.status === 'ativa';

          return (
            <div key={camp.id} className="card">
              <div className="card-head" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div className="avatar" style={{ background: isAtiva ? 'var(--line)' : 'var(--steel)', color: '#FFF' }}>
                    AD
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--ink)' }}>{camp.title}</div>
                    <div className="mono" style={{ fontSize: '10px', color: 'var(--steel)' }}>
                      {camp.targetRegion} • {camp.objective}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span className={`tag ${isAtiva ? '' : 'warn'}`} style={{ fontWeight: 600 }}>
                    {camp.status.toUpperCase()}
                  </span>
                  <button 
                    onClick={() => handleToggleStatus(camp)} 
                    className="btn ghost" 
                    style={{ padding: '4px 8px', fontSize: '10px' }}
                    title={isAtiva ? 'Pausar Veiculação' : 'Ativar Veiculação'}
                  >
                    {isAtiva ? <Pause size={12} color="#D97706" /> : <Play size={12} color="#059669" />}
                    {isAtiva ? 'Pausar' : 'Ativar'}
                  </button>
                </div>
              </div>

              <div className="titleblock" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
                <div className="tb-field">
                  <div className="tb-label">Impressões</div>
                  <div className="tb-value">{camp.impressionsCount.toLocaleString('pt-BR')}</div>
                </div>
                <div className="tb-field">
                  <div className="tb-label">Cliques (CTR)</div>
                  <div className="tb-value" style={{ color: 'var(--accent)' }}>
                    {camp.clicksCount} <span style={{ fontSize: '9.5px', color: 'var(--steel)' }}>({ctr}%)</span>
                  </div>
                </div>
                <div className="tb-field">
                  <div className="tb-label">Investimento Total</div>
                  <div className="tb-value" style={{ color: 'var(--line)' }}>R$ {camp.totalBudget.toFixed(2)}</div>
                </div>
                <div className="tb-field" style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                  <button onClick={() => onOpenCheckout(camp)} className="btn ghost" style={{ padding: '4px 8px', fontSize: '9.5px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <QrCode size={11} /> Pix / NFS-e
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {localCampaigns.length === 0 && (
          <div className="card" style={{ padding: '36px', textAlign: 'center', color: 'var(--steel)' }}>
            <Megaphone size={32} color="var(--steel)" style={{ margin: '0 auto 8px' }} />
            <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--ink)' }}>Nenhuma campanha cadastrada</div>
            <div style={{ fontSize: '11px', marginTop: '4px' }}>Clique em "Nova Campanha" para começar a anunciar no ecossistema ALICERCE.</div>
          </div>
        )}
      </div>

    </div>
  );
};
