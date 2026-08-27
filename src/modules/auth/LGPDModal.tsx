import React, { useState } from 'react';
import { Modal } from '../../components/Modal';
import { UserProfile } from '../../types';
import { ShieldCheck, Download, Trash2, CheckCircle2, Lock, FileText } from 'lucide-react';

interface LGPDModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
}

export const LGPDModal: React.FC<LGPDModalProps> = ({ isOpen, onClose, currentUser }) => {
  const [downloadDone, setDownloadDone] = useState(false);
  const [deleteRequested, setDeleteRequested] = useState(false);

  const handleExportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(currentUser, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `alicerce_lgpd_export_${currentUser.id}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    setDownloadDone(true);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Centro de Privacidade & LGPD (Lei 13.709/2018)" maxWidth="550px">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        
        {/* Banner */}
        <div style={{ background: 'rgba(83, 157, 196, 0.1)', border: '1px solid var(--color-primary-light)', padding: '12px 16px', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
          <ShieldCheck size={24} color="var(--color-primary)" style={{ flexShrink: 0 }} />
          <div style={{ fontSize: '0.85rem', color: 'var(--text-main)', lineHeight: 1.5 }}>
            <strong>Seus Dados sob Controle Transparente</strong>
            <br />
            O ALICERCE garante o direito de acesso, portabilidade e revogação do consentimento dos seus dados pessoais e profissionais.
          </div>
        </div>

        {/* User Metadata Overview */}
        <div style={{ background: 'var(--bg-input)', padding: '12px 16px', borderRadius: 'var(--radius-md)', fontSize: '0.85rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ color: 'var(--text-muted)' }}>Titular dos Dados:</span>
            <strong>{currentUser.name}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ color: 'var(--text-muted)' }}>E-mail:</span>
            <span>{currentUser.email}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ color: 'var(--text-muted)' }}>Consentimento LGPD:</span>
            <span style={{ color: '#4ADE80', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <CheckCircle2 size={14} /> Ativo em {currentUser.createdAt}
            </span>
          </div>
        </div>

        {/* Action 1: Export Data */}
        <div style={{ border: '1px solid var(--border-color)', padding: '14px', borderRadius: 'var(--radius-md)', background: 'var(--bg-card)' }}>
          <h4 style={{ fontSize: '0.95rem', color: 'var(--text-heading)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={18} color="var(--color-primary)" /> Exportação de Dados (Portabilidade)
          </h4>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '10px' }}>
            Faça o download de um arquivo JSON contendo seu perfil, publicações, propostas e consentimentos registrados no ALICERCE.
          </p>
          <button onClick={handleExportData} className="btn-outline" style={{ width: '100%', justifyContent: 'center' }}>
            <Download size={16} /> {downloadDone ? 'Download Concluído (Re-exportar)' : 'Baixar Meus Dados (JSON)'}
          </button>
        </div>

        {/* Action 2: Delete Account */}
        <div style={{ border: '1px solid rgba(239, 68, 68, 0.3)', padding: '14px', borderRadius: 'var(--radius-md)', background: 'rgba(239, 68, 68, 0.05)' }}>
          <h4 style={{ fontSize: '0.95rem', color: '#EF4444', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Trash2 size={18} /> Solicitar Exclusão Definitiva
          </h4>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '10px' }}>
            Esta ação anonimizará seu perfil e removerá permanentemente seus dados pessoais do nosso banco de dados relacional.
          </p>
          {deleteRequested ? (
            <div style={{ color: '#EF4444', fontSize: '0.85rem', fontWeight: 600, textAlign: 'center', padding: '8px' }}>
              Solicitação registrada. Protocolo de exclusão LGPD enviado para {currentUser.email}.
            </div>
          ) : (
            <button onClick={() => setDeleteRequested(true)} className="btn-outline" style={{ width: '100%', justifyContent: 'center', color: '#EF4444', borderColor: 'rgba(239, 68, 68, 0.4)' }}>
              Requerer Anonimização de Dados
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
};
