import React, { useState } from 'react';
import { Modal } from '../../components/Modal';
import { UserProfile } from '../../types';
import { Download, Lock, CheckCircle2 } from 'lucide-react';

interface LGPDModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
}

export const LGPDModal: React.FC<LGPDModalProps> = ({ isOpen, onClose, currentUser }) => {
  const [downloadDone, setDownloadDone] = useState(false);

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
    <Modal isOpen={isOpen} onClose={onClose} title="Centro de Privacidade LGPD" maxWidth="480px">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        
        <div className="titleblock" style={{ border: '1px solid var(--steel-line)', borderRadius: '3px' }}>
          <div className="tb-field">
            <div className="tb-label">Titular</div>
            <div className="tb-value">{currentUser.name}</div>
          </div>
          <div className="tb-field">
            <div className="tb-label">Consentimento</div>
            <div className="tb-value" style={{ color: 'var(--accent)' }}>ATIVO</div>
          </div>
        </div>

        <div className="card" style={{ padding: '12px' }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--ink)', marginBottom: '4px' }}>
            Portabilidade dos Dados (JSON)
          </div>
          <p style={{ fontSize: '11px', color: 'var(--steel)', marginBottom: '10px' }}>
            Faça o download integral dos seus registros, publicações e histórico em formato estruturado.
          </p>
          <button onClick={handleExportData} className="btn ghost" style={{ width: '100%', justifyContent: 'center', fontSize: '10px' }}>
            <Download size={12} /> {downloadDone ? 'Re-exportar JSON' : 'Exportar Meus Dados'}
          </button>
        </div>

      </div>
    </Modal>
  );
};
