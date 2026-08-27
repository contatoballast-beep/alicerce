import React, { useState } from 'react';
import { AdCampaign, UserProfile } from '../../types';
import { Megaphone, Plus, Sparkles, Eye, MousePointer } from 'lucide-react';

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
  const [dailyBudget, setDailyBudget] = useState('50');
  const [durationDays, setDurationDays] = useState('14');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    const daily = parseFloat(dailyBudget);
    const days = parseInt(durationDays, 10);
    const total = daily * days;

    onCreateCampaign({
      title,
      objective: 'Captação de Leads',
      targetAudience: ['Engenheiros', 'Construtoras'],
      targetRegion: 'São Paulo e SP',
      dailyBudget: daily,
      totalBudget: total,
      durationDays: days,
      paymentMethod: 'pix',
    });

    setTitle('');
    setCreating(false);
  };

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto', padding: '20px 16px' }}>
      
      {/* Header */}
      <div className="card" style={{ padding: '16px', marginBottom: '18px', borderLeft: '4px solid var(--line)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div className="tb-label" style={{ color: 'var(--line)' }}>ALICERCE ADS — PATROCINADOS</div>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--ink)' }}>
              Painel do Anunciante
            </h2>
          </div>
          <button onClick={() => setCreating(!creating)} className="btn accent" style={{ fontSize: '10px' }}>
            <Plus size={12} /> Nova Campanha
          </button>
        </div>
      </div>

      {creating && (
        <form onSubmit={handleCreate} className="card" style={{ padding: '14px', marginBottom: '18px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div className="tb-label">Nova Campanha Patrocinada</div>
          <input type="text" className="input-field" placeholder="Título da Campanha..." value={title} onChange={e => setTitle(e.target.value)} required />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <div>
              <label style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', color: 'var(--steel)' }}>Orçamento Diário (R$)</label>
              <input type="number" className="input-field mono" value={dailyBudget} onChange={e => setDailyBudget(e.target.value)} />
            </div>
            <div>
              <label style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', color: 'var(--steel)' }}>Duração (Dias)</label>
              <input type="number" className="input-field mono" value={durationDays} onChange={e => setDurationDays(e.target.value)} />
            </div>
          </div>
          <button type="submit" className="btn primary" style={{ justifyContent: 'center', fontSize: '10px' }}>
            Criar e Ir para Checkout Pix
          </button>
        </form>
      )}

      {/* Campaigns List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {campaigns.map(camp => (
          <div key={camp.id} className="card">
            <div className="card-head">
              <div className="avatar">AD</div>
              <div className="who">
                <div className="name">{camp.title}</div>
                <div className="role">{camp.targetRegion}</div>
              </div>
              <span className="tag warn">{camp.status.toUpperCase()}</span>
            </div>

            <div className="titleblock">
              <div className="tb-field">
                <div className="tb-label">Impressões</div>
                <div className="tb-value">{camp.impressionsCount}</div>
              </div>
              <div className="tb-field">
                <div className="tb-label">Cliques</div>
                <div className="tb-value" style={{ color: 'var(--accent)' }}>{camp.clicksCount}</div>
              </div>
              <div className="tb-field">
                <div className="tb-label">Investimento</div>
                <div className="tb-value" style={{ color: 'var(--line)' }}>R$ {camp.totalBudget.toFixed(2)}</div>
              </div>
              <div className="tb-field" style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                <button onClick={() => onOpenCheckout(camp)} className="btn ghost" style={{ padding: '3px 6px', fontSize: '9px' }}>
                  QR Code Pix / NFS-e
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
