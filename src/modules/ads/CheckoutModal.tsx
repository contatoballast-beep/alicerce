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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div style={{ 
            background: 'var(--bg-subtle)', 
            border: '1px solid var(--border-color)', 
            borderRadius: 'var(--radius-md)',
            padding: '14px 16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Campanha Patrocinada</div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-heading)', marginTop: '2px' }}>{campaign.title.substring(0, 32)}...</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Total Pix</div>
              <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--primary-color)', fontFamily: 'var(--font-mono)' }}>
                R$ {campaign.totalBudget.toFixed(2)}
              </div>
            </div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div style={{ 
              background: '#FFFFFF', 
              padding: '12px', 
              borderRadius: 'var(--radius-md)', 
              display: 'inline-block',
              border: '1px solid var(--border-color)',
              boxShadow: 'var(--shadow-sm)',
              marginBottom: '12px'
            }}>
              <img 
                src={campaign.pixQrCode || `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(pixCode)}`} 
                alt="QR Code Pix" 
                style={{ width: '160px', height: '160px', display: 'block' }} 
              />
            </div>
            
            <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', margin: '0 0 12px 0' }}>
              Escaneie o QR Code no app do seu banco ou use a chave Pix Copia e Cola:
            </p>

            <div style={{ display: 'flex', gap: '6px', marginBottom: '14px' }}>
              <input 
                type="text" 
                value={pixCode} 
                readOnly 
                style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', textOverflow: 'ellipsis' }} 
              />
              <button onClick={handleCopyPix} className="btn ghost" style={{ flexShrink: 0, padding: '8px 14px', fontSize: '12px' }}>
                <Copy size={13} /> {copied ? 'Copiado!' : 'Copiar'}
              </button>
            </div>

            <div style={{ 
              background: 'rgba(16, 185, 129, 0.08)', 
              border: '1px solid rgba(16, 185, 129, 0.2)',
              padding: '10px 14px', 
              borderRadius: 'var(--radius-md)', 
              fontSize: '12px', 
              color: '#059669', 
              marginBottom: '16px', 
              textAlign: 'left', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              fontWeight: 500
            }}>
              <ShieldCheck size={16} color="#059669" />
              <span>Liberação imediata no feed com emissão automática de NFS-e.</span>
            </div>

            <button onClick={handlePay} className="btn primary" style={{ width: '100%', justifyContent: 'center', fontSize: '13px', padding: '10px 16px' }}>
              <CheckCircle2 size={16} /> Confirmar Pagamento Pix
            </button>
          </div>

        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '20px 8px' }}>
          <div style={{ 
            width: '56px', 
            height: '56px', 
            borderRadius: '50%', 
            background: 'rgba(16, 185, 129, 0.12)', 
            color: '#059669', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            margin: '0 auto 16px' 
          }}>
            <CheckCircle2 size={32} />
          </div>

          <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-heading)', margin: '0 0 6px 0', letterSpacing: '-0.02em' }}>
            Pagamento Pix Recebido!
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--text-body)', maxWidth: '380px', margin: '0 auto 20px', lineHeight: 1.5 }}>
            Sua campanha está <strong>ATIVA</strong> e já sendo distribuída no Feed e no Catálogo ALICERCE.
          </p>
          
          <div style={{ 
            background: 'var(--bg-subtle)', 
            border: '1px solid var(--border-color)', 
            padding: '12px 16px', 
            borderRadius: 'var(--radius-md)', 
            marginBottom: '20px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between' 
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', textAlign: 'left' }}>
              <FileText size={18} color="var(--primary-color)" />
              <div>
                <div style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--text-heading)' }}>{campaign.invoiceNfseUrl || 'NFS-e_ALICERCE_2026.pdf'}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Nota Fiscal Eletrônica Emitida com Sucesso</div>
              </div>
            </div>
            <button onClick={() => alert("Download do PDF da NFS-e iniciado.")} className="btn ghost" style={{ padding: '6px 10px', fontSize: '11px' }}>
              <Download size={13} /> Baixar
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
