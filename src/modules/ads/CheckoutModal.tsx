import React, { useState } from 'react';
import { Modal } from '../../components/Modal';
import { AdCampaign } from '../../types';
import { QrCode, CheckCircle2, Copy, FileText, Download, ShieldCheck } from 'lucide-react';

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

  const pixCode = campaign.pixCopiaCola || campaign.pixCopiaECola || `00020126580014BR.GOV.BCB.PIX0136alicerce-pay@bancopix.com.br520400005303986540${campaign.totalBudget.toFixed(2)}5802BR5916ALICERCE ADS6009SAO PAULO62070503***6304`;

  const handleCopyPix = () => {
    navigator.clipboard.writeText(pixCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePay = () => {
    setPaid(true);
    setTimeout(() => {
      onConfirmPayment(campaign.id);
    }, 1000);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Checkout Pix & Emissão de NFS-e" maxWidth="480px">
      
      {!paid ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          
          <div className="titleblock" style={{ border: '1px solid var(--steel-line)', borderRadius: '3px' }}>
            <div className="tb-field">
              <div className="tb-label">Campanha Patrocinada</div>
              <div className="tb-value">{campaign.title.substring(0, 30)}...</div>
            </div>
            <div className="tb-field">
              <div className="tb-label">Valor a Pagar (Pix)</div>
              <div className="tb-value" style={{ color: 'var(--line)', fontWeight: 700 }}>
                R$ {campaign.totalBudget.toFixed(2)}
              </div>
            </div>
          </div>

          <div style={{ textAlign: 'center', padding: '6px 0' }}>
            <img 
              src={campaign.pixQrCode || `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(pixCode)}`} 
              alt="QR Code Pix" 
              style={{ width: '160px', height: '160px', margin: '0 auto 8px', background: '#FFF', padding: '6px', border: '1px solid var(--steel-line)', borderRadius: '3px', display: 'block' }} 
            />
            <p style={{ fontSize: '11px', color: 'var(--steel)', marginBottom: '10px' }}>
              Escaneie o QR Code no app do seu banco ou copie a chave Pix Copia e Cola:
            </p>

            <div style={{ display: 'flex', gap: '4px', marginBottom: '14px' }}>
              <input type="text" className="input-field mono" value={pixCode} readOnly style={{ fontSize: '9.5px', textOverflow: 'ellipsis' }} />
              <button onClick={handleCopyPix} className="btn ghost" style={{ flexShrink: 0, padding: '4px 10px', fontSize: '10px' }}>
                <Copy size={12} /> {copied ? 'Copiado!' : 'Copiar'}
              </button>
            </div>

            <div style={{ background: 'var(--paper)', padding: '8px 10px', borderRadius: '3px', fontSize: '10.5px', color: 'var(--steel)', marginBottom: '14px', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShieldCheck size={14} color="#059669" />
              <span>Liberação imediata do anúncio no feed e emissão automática de NFS-e.</span>
            </div>

            <button onClick={handlePay} className="btn primary" style={{ width: '100%', justifyContent: 'center', fontSize: '11.5px', padding: '9px 12px' }}>
              <CheckCircle2 size={14} /> Confirmar Pagamento Pix
            </button>
          </div>

        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '24px 12px' }}>
          <CheckCircle2 size={44} color="#059669" style={{ margin: '0 auto 10px' }} />
          <h3 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--ink)', marginBottom: '4px' }}>
            Pagamento Pix Recebido!
          </h3>
          <p style={{ fontSize: '12px', color: 'var(--graphite)', marginBottom: '16px', lineHeight: 1.4 }}>
            Sua campanha está <strong>ATIVA</strong> e já sendo veiculada no Feed e no Catálogo ALICERCE para engenheiros e decisores.
          </p>
          
          <div style={{ background: 'var(--paper)', border: '1px solid var(--steel-line)', padding: '10px', borderRadius: '3px', marginBottom: '18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', textAlign: 'left' }}>
              <FileText size={16} color="var(--line)" />
              <div>
                <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--ink)' }}>{campaign.invoiceNfseUrl || 'NFS-e_ALICERCE_2026.pdf'}</div>
                <div className="mono" style={{ fontSize: '9px', color: 'var(--steel)' }}>Nota Fiscal de Serviço Eletrônica Emitida</div>
              </div>
            </div>
            <button onClick={() => alert("Download do PDF da NFS-e iniciado com sucesso.")} className="btn ghost" style={{ padding: '3px 8px', fontSize: '10px' }}>
              <Download size={11} /> Baixar
            </button>
          </div>

          <button onClick={onClose} className="btn primary" style={{ width: '100%', justifyContent: 'center' }}>
            Ir para o Painel de Anúncios
          </button>
        </div>
      )}

    </Modal>
  );
};
