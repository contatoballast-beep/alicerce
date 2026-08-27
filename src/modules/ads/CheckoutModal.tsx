import React, { useState } from 'react';
import { Modal } from '../../components/Modal';
import { AdCampaign } from '../../types';
import { QrCode, CreditCard, CheckCircle2, FileText, ShieldCheck, Copy, Download } from 'lucide-react';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaign: AdCampaign | null;
  onConfirmPayment: (campaignId: string) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  campaign,
  onConfirmPayment,
}) => {
  const [tab, setTab] = useState<'pix' | 'cartao'>('pix');
  const [copied, setCopied] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [cardExp, setCardExp] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [paid, setPaid] = useState(false);

  if (!campaign) return null;

  const handleCopyPix = () => {
    if (campaign.pixCopiaECola) {
      navigator.clipboard.writeText(campaign.pixCopiaECola);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    setPaid(true);
    setTimeout(() => {
      onConfirmPayment(campaign.id);
    }, 1500);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Checkout ALICERCE Ads & Emissão de NFS-e" maxWidth="600px">
      
      {!paid ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Order Summary */}
          <div style={{ background: 'var(--bg-input)', padding: '14px', borderRadius: 'var(--radius-md)', borderLeft: '4px solid var(--color-accent)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-accent)', fontWeight: 700, textTransform: 'uppercase' }}>
              RESUMO DO PEDIDO - CAMPANHA PATROCINADA
            </div>
            <div style={{ fontWeight: 700, fontSize: '1rem', color: '#FFF' }}>{campaign.title}</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              <span>Duração: {campaign.durationDays} dias</span>
              <span className="mono" style={{ color: '#4ADE80', fontWeight: 800, fontSize: '1.1rem' }}>
                TOTAL: R$ {campaign.totalBudget.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div style={{ display: 'flex', gap: '8px', background: 'var(--bg-input)', padding: '4px', borderRadius: 'var(--radius-md)' }}>
            <button 
              type="button" 
              onClick={() => setTab('pix')} 
              style={{ flex: 1, padding: '10px', border: 'none', borderRadius: 'var(--radius-sm)', background: tab === 'pix' ? 'var(--color-primary)' : 'transparent', color: tab === 'pix' ? '#FFF' : 'var(--text-muted)', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
            >
              <QrCode size={16} /> Pagamento Pix (Instantâneo)
            </button>
            <button 
              type="button" 
              onClick={() => setTab('cartao')} 
              style={{ flex: 1, padding: '10px', border: 'none', borderRadius: 'var(--radius-sm)', background: tab === 'cartao' ? 'var(--color-primary)' : 'transparent', color: tab === 'cartao' ? '#FFF' : 'var(--text-muted)', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
            >
              <CreditCard size={16} /> Cartão de Crédito
            </button>
          </div>

          {/* Pix Tab */}
          {tab === 'pix' && (
            <div style={{ textAlign: 'center', padding: '10px 0' }}>
              <img 
                src={campaign.pixQrCode} 
                alt="QR Code Pix" 
                style={{ width: '180px', height: '180px', margin: '0 auto 12px', background: '#FFF', padding: '10px', borderRadius: 'var(--radius-md)' }} 
              />
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
                Escaneie o QR Code acima pelo app do seu banco ou utilize a chave copia-e-cola abaixo.
              </p>

              <div style={{ display: 'flex', gap: '6px', marginBottom: '16px' }}>
                <input 
                  type="text" 
                  className="input-field mono" 
                  value={campaign.pixCopiaECola} 
                  readOnly 
                  style={{ fontSize: '0.75rem' }} 
                />
                <button onClick={handleCopyPix} className="btn-outline" style={{ flexShrink: 0 }}>
                  <Copy size={16} /> {copied ? 'Copiado!' : 'Copiar'}
                </button>
              </div>

              <button onClick={handlePay} className="btn-accent" style={{ width: '100%', justifyContent: 'center' }}>
                <CheckCircle2 size={18} /> Simular Confirmação do Pix
              </button>
            </div>
          )}

          {/* Credit Card Tab */}
          {tab === 'cartao' && (
            <form onSubmit={handlePay} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Número do Cartão</label>
                <input type="text" className="input-field mono" placeholder="4532 •••• •••• 8829" required />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '8px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Nome no Cartão</label>
                  <input type="text" className="input-field" placeholder="ROBERTO SILVA" required />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Validade</label>
                  <input type="text" className="input-field mono" placeholder="12/28" required />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>CVC</label>
                  <input type="text" className="input-field mono" placeholder="881" required />
                </div>
              </div>

              <button type="submit" className="btn-accent" style={{ width: '100%', justifyContent: 'center', marginTop: '10px' }}>
                <CreditCard size={18} /> Pagar R$ {campaign.totalBudget.toFixed(2)} e Ativar
              </button>
            </form>
          )}

        </div>
      ) : (
        /* Success & Invoice Preview */
        <div style={{ textAlign: 'center', padding: '20px 10px' }}>
          <div style={{ background: 'rgba(34, 197, 94, 0.15)', border: '2px solid #4ADE80', padding: '16px', borderRadius: '50%', width: '64px', height: '64px', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle2 size={36} color="#4ADE80" />
          </div>

          <h3 style={{ fontSize: '1.3rem', color: '#FFF', marginBottom: '6px' }}>Pagamento Confirmado!</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '20px' }}>
            Sua campanha patrocinada foi ativada com sucesso e já está sendo impulsionada no feed.
          </p>

          <div className="glass-card" style={{ padding: '16px', textAlign: 'left', marginBottom: '20px', fontSize: '0.85rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-primary)', fontWeight: 700, marginBottom: '8px' }}>
              <FileText size={18} /> NOTA FISCAL ELETRÔNICA (NFS-e) EMITIDA
            </div>
            <div className="mono" style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>
              Nº DA NOTA: NFS-e 2026/009812 | CHAVE: 3526082849100200018455001000009812100889
            </div>
          </div>

          <button onClick={onClose} className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
            Concluir e Ir para Painel de Campanhas
          </button>
        </div>
      )}

    </Modal>
  );
};
