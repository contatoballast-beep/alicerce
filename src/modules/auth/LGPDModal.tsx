import React, { useState } from 'react';
import { Modal } from '../../components/Modal';
import { UserProfile } from '../../types';
import { Download, Lock, CheckCircle2, ShieldCheck } from 'lucide-react';

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
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Titular dos Dados</div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-heading)', marginTop: '2px' }}>{currentUser.name}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Consentimento</div>
            <div style={{ 
              fontSize: '11.5px', 
              fontWeight: 700, 
              color: '#059669', 
              background: 'rgba(16, 185, 129, 0.1)', 
              padding: '2px 8px', 
              borderRadius: 'var(--radius-full)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              marginTop: '2px'
            }}>
              <ShieldCheck size={12} /> ATIVO
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: '16px' }}>
          <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-heading)', marginBottom: '4px' }}>
            Portabilidade dos Dados Pessoais (JSON)
          </div>
          <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginBottom: '14px', lineHeight: 1.5 }}>
            Faça o download integral dos seus registros de ART/RRT, obras cadastradas e histórico de mensagens em formato estruturado (Lei nº 13.709/2018).
          </p>
          <button onClick={handleExportData} className="btn ghost" style={{ width: '100%', justifyContent: 'center', fontSize: '12px', padding: '10px' }}>
            <Download size={14} /> {downloadDone ? 'Re-exportar Arquivo JSON' : 'Exportar Meus Dados'}
          </button>
        </div>

      </div>
    </Modal>
  );
};
