import React, { useState } from 'react';
import { Modal } from '../../components/Modal';
import { AdCampaign } from '../../types';
import { QrCode, CheckCircle2, Copy } from 'lucide-react';

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
  const [copied, setCopied] = useState(false);
  const [paid, setPaid] = useState(false);

  if (!campaign) return null;

  const handleCopyPix = () => {
    if (campaign.pixCopiaECola) {
      navigator.clipboard.writeText(campaign.pixCopiaECola);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePay = () => {
    setPaid(true);
    setTimeout(() => {
      onConfirmPayment(campaign.id);
    }, 1200);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Checkout Pix & NFS-e" maxWidth="480px">
      
      {!paid ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          
          <div className="titleblock" style={{ border: '1px solid var(--steel-line)', borderRadius: '3px' }}>
            <div className="tb-field">
              <div className="tb-label">Campanha</div>
              <div className="tb-value">{campaign.title.substring(0, 20)}...</div>
            </div>
            <div className="tb-field">
              <div className="tb-label">Total Pix</div>
              <div className="tb-value" style={{ color: 'var(--line)', fontWeight: 700 }}>
                R$ {campaign.totalBudget.toFixed(2)}
              </div>
            </div>
          </div>

          <div style={{ textAlign: 'center', padding: '10px 0' }}>
            <img 
              src={campaign.pixQrCode} 
              alt="QR Code Pix" 
              style={{ width: '160px', height: '160px', margin: '0 auto 8px', background: '#FFF', padding: '6px', border: '1px solid var(--steel-line)', borderRadius: '3px' }} 
            />
            <p style={{ fontSize: '11px', color: 'var(--steel)', marginBottom: '10px' }}>
              Escaneie o QR Code ou utilize o código copia-e-cola:
            </p>

            <div style={{ display: 'flex', gap: '4px', marginBottom: '12px' }}>
              <input type="text" className="input-field mono" value={campaign.pixCopiaECola} readOnly style={{ fontSize: '9.5px' }} />
              <button onClick={handleCopyPix} className="btn ghost" style={{ flexShrink: 0, padding: '4px 8px', fontSize: '10px' }}>
                <Copy size={12} /> {copied ? 'Copiado!' : 'Copiar'}
              </button>
            </div>

            <button onClick={handlePay} className="btn primary" style={{ width: '100%', justifyContent: 'center', fontSize: '11px' }}>
              <CheckCircle2 size={14} /> Confirmar Recebimento do Pix
            </button>
          </div>

        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '20px 10px' }}>
          <CheckCircle2 size={40} color="var(--accent)" style={{ margin: '0 auto 8px' }} />
          <h3 style={{ fontSize: '16px', color: 'var(--ink)' }}>Pagamento Confirmado!</h3>
          <p style={{ fontSize: '12px', color: 'var(--steel)', marginBottom: '14px' }}>
            Campanha ativada no feed. Nota fiscal NFS-e gerada em PDF.
          </p>
          <button onClick={onClose} className="btn primary" style={{ width: '100%', justifyContent: 'center' }}>
            Concluir
          </button>
        </div>
      )}

    </Modal>
  );
};
