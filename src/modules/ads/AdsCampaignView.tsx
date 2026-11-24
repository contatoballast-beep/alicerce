import React, { useState, useEffect } from 'react';
import { AdCampaign, UserProfile } from '../../types';
import { RealApiClient } from '../../services/realApiClient';
import { Megaphone, Plus, Eye, MousePointer, Pause, Play, Info, AlertCircle } from 'lucide-react';

interface AdsCampaignViewProps {
  campaigns: AdCampaign[];
  currentUser: UserProfile;
  onCreateCampaign: (campData: any) => Promise<void>;
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
  const [objective, setObjective] = useState('Destaque de Perfil');
  const [targetRegion, setTargetRegion] = useState(currentUser.city ? `${currentUser.city} - ${currentUser.state}` : 'São Paulo - SP');
  const [dailyBudget, setDailyBudget] = useState('50');
  const [durationDays, setDurationDays] = useState('14');
  const [localCampaigns, setLocalCampaigns] = useState<AdCampaign[]>(campaigns);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    setLocalCampaigns(campaigns);
  }, [campaigns]);

  const handleToggleStatus = async (camp: AdCampaign) => {
    setErrorMsg(null);
    const nextStatus = camp.status === 'ativa' ? 'pausada' : 'ativa';
    const res = await RealApiClient.toggleCampaign(camp.id, nextStatus);
    if (res.ok) {
      setLocalCampaigns((prev) => prev.map((c) => (c.id === camp.id ? { ...c, status: nextStatus } : c)));
    } else {
      setErrorMsg(res.error || 'Não foi possível alterar o status da campanha.');
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setErrorMsg(null);
    const daily = Math.max(10, parseFloat(dailyBudget) || 50);
    const days = Math.max(1, parseInt(durationDays, 10) || 14);
    await onCreateCampaign({
      title: title.trim(),
      objective,
      targetRegion: targetRegion.trim(),
      dailyBudget: daily,
      durationDays: days,
    });
    setTitle('');
    setCreating(false);
  };

  return (
    <div className="ballast-container" style={{ maxWidth: '860px', paddingTop: '28px', paddingBottom: '56px' }}>
      <div className="card" style={{ padding: '24px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div className="meta-label" style={{ color: 'var(--azul-lastro)', marginBottom: '4px' }}>BALLAST DESTAQUES</div>
          <h1 style={{ fontSize: '28px', margin: 0 }}>Campanhas patrocinadas</h1>
          <p style={{ fontSize: '13.5px', color: 'var(--steel)', marginTop: '4px' }}>
            Rascunhos de campanha ficam aguardando pagamento autenticado via provedor Pix.
          </p>
        </div>
        <button type="button" onClick={() => setCreating((v) => !v)} className="btn primary">
          <Plus size={15} /> {creating ? 'Fechar' : 'Nova campanha'}
        </button>
      </div>

      {errorMsg && (
        <div role="alert" style={{ background: 'var(--color-danger-light)', border: '1px solid #FECDCA', color: 'var(--color-danger)', padding: '10px 14px', borderRadius: 'var(--radius-sm)', fontSize: '13px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertCircle size={15} /> {errorMsg}
        </div>
      )}

      {creating && (
        <form onSubmit={handleCreate} className="card" style={{ padding: '22px', marginBottom: '22px' }}>
          <h2 style={{ fontSize: '20px', marginBottom: '14px' }}>Criar rascunho de campanha</h2>
          <div className="field">
            <label htmlFor="ad-title">Título do destaque *</label>
            <input id="ad-title" type="text" placeholder="Ex: Estúdio especializado em reformas residenciais em Curitiba" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div className="responsive-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="field">
              <label htmlFor="ad-obj">Objetivo</label>
              <select id="ad-obj" value={objective} onChange={(e) => setObjective(e.target.value)}>
                <option value="Destaque de Perfil">Destaque de Perfil</option>
                <option value="Destaque de Projeto">Destaque de Projeto</option>
                <option value="Parceria Imobiliária">Parceria Imobiliária</option>
              </select>
            </div>
            <div className="field">
              <label htmlFor="ad-region">Região alvo</label>
              <input id="ad-region" type="text" value={targetRegion} onChange={(e) => setTargetRegion(e.target.value)} />
            </div>
          </div>
          <div className="responsive-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="field">
              <label htmlFor="ad-daily">Orçamento diário (R$)</label>
              <input id="ad-daily" type="number" min="10" value={dailyBudget} onChange={(e) => setDailyBudget(e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="ad-days">Duração (dias)</label>
              <input id="ad-days" type="number" min="1" max="90" value={durationDays} onChange={(e) => setDurationDays(e.target.value)} />
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <button type="button" onClick={() => setCreating(false)} className="btn ghost">Cancelar</button>
            <button type="submit" className="btn primary">Salvar campanha</button>
          </div>
        </form>
      )}

      {localCampaigns.length === 0 ? (
        <div className="card" style={{ padding: '44px 24px', textAlign: 'center', color: 'var(--steel)' }}>
          <Megaphone size={28} style={{ margin: '0 auto 10px', opacity: 0.5 }} />
          <div style={{ fontWeight: 600, color: 'var(--grafite)' }}>Nenhuma campanha registrada</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {localCampaigns.map((camp) => {
            const isAtiva = camp.status === 'ativa';
            return (
              <div key={camp.id} className="card" style={{ padding: '18px 20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px', marginBottom: '12px' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '15px' }}>{camp.title}</div>
                    <div style={{ fontSize: '12.5px', color: 'var(--steel)' }}>{camp.targetRegion} · {camp.objective}</div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span className={`badge ${isAtiva ? 'verified' : ''}`}>
                      {camp.status.replace('_', ' ')}
                    </span>
                    {camp.status !== 'aguardando_pagamento' && (
                      <button type="button" onClick={() => handleToggleStatus(camp)} className="btn ghost" style={{ minHeight: '34px', padding: '5px 10px', fontSize: '12px' }}>
                        {isAtiva ? <Pause size={13} /> : <Play size={13} />} {isAtiva ? 'Pausar' : 'Ativar'}
                      </button>
                    )}
                    <button type="button" onClick={() => onOpenCheckout(camp)} className="btn ghost" style={{ minHeight: '34px', padding: '5px 10px', fontSize: '12px' }}>
                      <Info size={13} /> Detalhes
                    </button>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', fontSize: '12.5px', color: 'var(--steel)' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}><Eye size={13} /> {camp.impressionsCount} impressões</span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}><MousePointer size={13} /> {camp.clicksCount} cliques</span>
                  <span className="mono">Previsto: R$ {camp.totalBudget.toFixed(2)}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
