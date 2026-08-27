import React, { useState } from 'react';
import { AdCampaign, UserProfile } from '../../types';
import { Megaphone, Plus, Sparkles, TrendingUp, Eye, MousePointer, DollarSign, CheckCircle2 } from 'lucide-react';

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
  const [objective, setObjective] = useState<'Destaque de Perfil' | 'Destaque de Obra' | 'Captação de Leads'>('Captação de Leads');
  const [dailyBudget, setDailyBudget] = useState('50');
  const [durationDays, setDurationDays] = useState('14');
  const [targetRegion, setTargetRegion] = useState('São Paulo e Grande SP');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    const daily = parseFloat(dailyBudget);
    const days = parseInt(durationDays, 10);
    const total = daily * days;

    onCreateCampaign({
      title,
      objective,
      targetAudience: ['Engenheiros', 'Construtoras', 'Incorporadoras'],
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
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '24px 16px' }}>
      
      {/* Header Banner */}
      <div className="glass-card" style={{ padding: '24px', marginBottom: '24px', borderLeft: '4px solid var(--color-accent)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <span className="stamp-badge terracotta">ALICERCE ADS SELF-SERVICE</span>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#FFF', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Megaphone size={28} color="var(--color-accent)" /> Painel do Anunciante
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Destaque seu perfil profissional ou suas obras no topo do feed e na busca geolocalizada.
            </p>
          </div>

          <button onClick={() => setCreating(!creating)} className="btn-accent" style={{ padding: '12px 20px', fontSize: '0.95rem' }}>
            <Plus size={18} /> Criar Nova Campanha
          </button>
        </div>
      </div>

      {/* Form Wizard */}
      {creating && (
        <form onSubmit={handleCreate} className="glass-card" style={{ padding: '20px', marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <h3 style={{ fontSize: '1.1rem', color: '#FFF', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={20} color="var(--color-accent)" /> Nova Campanha Patrocinada
          </h3>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Título da Campanha *</label>
            <input 
              type="text" 
              className="input-field" 
              placeholder="Ex: Destaque de Perfil - Engenharia Estrutural SP" 
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Objetivo da Campanha</label>
              <select className="input-field" value={objective} onChange={e => setObjective(e.target.value as any)}>
                <option value="Captação de Leads" style={{ background: 'var(--bg-card)' }}>Captação de Leads</option>
                <option value="Destaque de Perfil" style={{ background: 'var(--bg-card)' }}>Destaque de Perfil</option>
                <option value="Destaque de Obra" style={{ background: 'var(--bg-card)' }}>Destaque de Obra</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Região de Segmentação</label>
              <input type="text" className="input-field" value={targetRegion} onChange={e => setTargetRegion(e.target.value)} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Orçamento Diário (R$)</label>
              <input type="number" className="input-field mono" value={dailyBudget} onChange={e => setDailyBudget(e.target.value)} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Duração (Dias)</label>
              <input type="number" className="input-field mono" value={durationDays} onChange={e => setDurationDays(e.target.value)} />
            </div>
          </div>

          <div style={{ background: 'var(--bg-input)', padding: '12px', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Investimento Total Estimado:</span>
            <strong className="mono" style={{ fontSize: '1.2rem', color: '#4ADE80' }}>
              R$ {(parseFloat(dailyBudget || '0') * parseInt(durationDays || '0', 10)).toFixed(2)}
            </strong>
          </div>

          <button type="submit" className="btn-accent" style={{ justifyContent: 'center' }}>
            <CheckCircle2 size={18} /> Salvar e Ir para Pagamento Pix / Cartão
          </button>
        </form>
      )}

      {/* Campaigns Dashboard List */}
      <div>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#FFF', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <TrendingUp size={20} color="var(--color-primary)" /> Suas Campanhas Ativas e Desempenho
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {campaigns.map(camp => (
            <div key={camp.id} className="glass-card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginBottom: '12px' }}>
                <div>
                  <span className="status-badge status-ad">{camp.objective}</span>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#FFF', marginTop: '4px' }}>{camp.title}</h4>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Segmentação: {camp.targetRegion}</span>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span className="status-badge status-verified">STATUS: {camp.status.toUpperCase()}</span>
                  <div className="mono" style={{ fontSize: '1.1rem', fontWeight: 800, color: '#4ADE80', marginTop: '4px' }}>
                    R$ {camp.totalBudget.toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Stats Row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', background: 'var(--bg-input)', padding: '12px', borderRadius: 'var(--radius-md)', marginBottom: '12px' }}>
                <div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Eye size={12} /> IMPRESSÕES
                  </span>
                  <strong className="mono" style={{ fontSize: '1.1rem', color: '#FFF' }}>
                    {camp.impressionsCount.toLocaleString('pt-BR')}
                  </strong>
                </div>

                <div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <MousePointer size={12} /> CLIQUES
                  </span>
                  <strong className="mono" style={{ fontSize: '1.1rem', color: 'var(--color-primary)' }}>
                    {camp.clicksCount.toLocaleString('pt-BR')}
                  </strong>
                </div>

                <div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>TAXA DE CLIQUE (CTR)</span>
                  <strong className="mono" style={{ fontSize: '1.1rem', color: '#4ADE80' }}>
                    {((camp.clicksCount / (camp.impressionsCount || 1)) * 100).toFixed(2)}%
                  </strong>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button onClick={() => onOpenCheckout(camp)} className="btn-primary" style={{ padding: '6px 14px', fontSize: '0.85rem' }}>
                  Ver QR Code Pix / Nota Fiscal NFS-e
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
