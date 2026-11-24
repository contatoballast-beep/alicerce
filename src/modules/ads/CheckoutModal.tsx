import React from 'react';
import { Modal } from '../../components/Modal';
import { AdCampaign } from '../../types';
import { ShieldAlert, ExternalLink, FileText } from 'lucide-react';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaign: AdCampaign | null;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  campaign,
}) => {
  if (!campaign) return null;

  const hasVerifiedInvoice = Boolean(
    campaign.invoiceNfseUrl && campaign.invoiceNfseUrl.startsWith('https://')
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Pagamento e Nota Fiscal" maxWidth="500px">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '14px 16px' }}>
          <div className="meta-label">CAMPANHA</div>
          <div style={{ fontSize: '15px', fontWeight: 700, marginTop: '4px' }}>{campaign.title}</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', fontSize: '13.5px' }}>
            <span style={{ color: 'var(--steel)' }}>Valor previsto</span>
            <strong className="mono">R$ {campaign.totalBudget.toFixed(2)}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px', fontSize: '13.5px' }}>
            <span style={{ color: 'var(--steel)' }}>Situação</span>
            <strong>{campaign.status === 'ativa' ? 'Ativa' : 'Aguardando integração de pagamento'}</strong>
          </div>
        </div>

        {campaign.status !== 'ativa' && (
          <div
            style={{
              background: 'var(--color-warn-light)',
              border: '1px solid #F5D799',
              borderRadius: 'var(--radius-md)',
              padding: '14px 16px',
              display: 'flex',
              gap: '10px',
              alignItems: 'flex-start',
              fontSize: '13px',
              color: 'var(--grafite)',
            }}
          >
            <ShieldAlert size={18} color="#8A5300" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong>Pagamento Pix em integração.</strong> Por segurança, pagamentos não podem ser confirmados
              manualmente pelo navegador. A ativação automática de campanhas será habilitada assim que o provedor
              Pix autenticado via webhook estiver ativo.
            </div>
          </div>
        )}

        <div style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '14px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, fontSize: '13.5px', marginBottom: '6px' }}>
            <FileText size={15} color="#2F5872" /> Nota Fiscal de Serviços (NFS-e)
          </div>
          {hasVerifiedInvoice ? (
            <a
              href={campaign.invoiceNfseUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn ghost"
              style={{ width: '100%' }}
            >
              <ExternalLink size={14} /> Abrir NFS-e emitida
            </a>
          ) : (
            <p style={{ fontSize: '12.5px', color: 'var(--steel)', margin: 0 }}>
              Emissão e download de NFS-e indisponíveis até a conclusão da integração fiscal e confirmação efetiva do pagamento.
            </p>
          )}
        </div>

        <button type="button" onClick={onClose} className="btn primary" style={{ width: '100%' }}>
          Fechar
        </button>
      </div>
    </Modal>
  );
};
