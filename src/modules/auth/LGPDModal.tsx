import React, { useState } from 'react';
import { Modal } from '../../components/Modal';
import { UserProfile } from '../../types';
import { RealApiClient } from '../../services/realApiClient';
import { Download, ShieldCheck, Trash2, AlertCircle, Loader2 } from 'lucide-react';

interface LGPDModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onAccountDeleted: () => void;
}

export const LGPDModal: React.FC<LGPDModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onAccountDeleted,
}) => {
  const [exporting, setExporting] = useState(false);
  const [exportDone, setExportDone] = useState(false);
  const [deleteStep, setDeleteStep] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);

  const isGuest = !currentUser || currentUser.id === 'usr_guest';

  const handleExportData = async () => {
    setFeedbackError(null);
    if (isGuest) {
      setFeedbackError('Visitantes não possuem dados pessoais armazenados no servidor Ballast.');
      return;
    }
    setExporting(true);
    const res = await RealApiClient.exportMyData();
    setExporting(false);

    if (!res.ok || !res.data) {
      setFeedbackError(res.error || 'Não foi possível exportar seus dados no momento.');
      return;
    }

    const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `ballast_lgpd_export_${currentUser.id}.json`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
    setExportDone(true);
  };

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedbackError(null);
    if (!confirmPassword) {
      setFeedbackError('Informe sua senha atual para confirmar a exclusão permanente.');
      return;
    }
    setDeleting(true);
    const res = await RealApiClient.deleteMyAccount(confirmPassword);
    setDeleting(false);

    if (res.ok && res.data?.deleted) {
      setConfirmPassword('');
      setDeleteStep(false);
      onClose();
      onAccountDeleted();
    } else {
      setFeedbackError(res.error || 'Não foi possível excluir a conta.');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Privacidade e LGPD" maxWidth="540px">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {feedbackError && (
          <div
            role="alert"
            style={{
              background: 'var(--color-danger-light)',
              border: '1px solid #FECDCA',
              color: 'var(--color-danger)',
              padding: '10px 14px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <AlertCircle size={15} /> {feedbackError}
          </div>
        )}

        <div style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '16px' }}>
          <div className="meta-label" style={{ marginBottom: '6px' }}>POLÍTICA DE TRATAMENTO DE DADOS</div>
          <p style={{ fontSize: '13px', lineHeight: 1.6, margin: 0 }}>
            A Ballast Architecture armazena apenas os dados necessários para autenticação, exibição pública do perfil
            profissional (sem expor e-mail ou telefone a visitantes) e comunicação privada entre participantes autorizados.
            Sessões são validadas no servidor via token JWT e senhas são protegidas com hash criptográfico bcrypt.
          </p>
        </div>

        {!isGuest ? (
          <>
            <div style={{ background: 'var(--branco)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 700 }}>{currentUser.name}</div>
                  <div style={{ fontSize: '12px', color: 'var(--steel)' }}>{currentUser.email}</div>
                </div>
                <span className="badge verified">
                  <ShieldCheck size={12} /> Consentimento ativo
                </span>
              </div>

              <p style={{ fontSize: '13px', color: 'var(--steel)', marginBottom: '12px' }}>
                Exporte uma cópia integral em JSON dos dados associados à sua conta no servidor (perfil, portfólio,
                favoritos, solicitações e mensagens), conforme a Lei nº 13.709/2018.
              </p>
              <button type="button" onClick={handleExportData} disabled={exporting} className="btn ghost" style={{ width: '100%' }}>
                {exporting ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                {exportDone ? 'Exportar novamente (JSON)' : 'Baixar meus dados (JSON)'}
              </button>
            </div>

            <div style={{ background: 'var(--color-danger-light)', border: '1px solid #FECDCA', borderRadius: 'var(--radius-md)', padding: '16px' }}>
              <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-danger)', marginBottom: '4px' }}>
                Exclusão permanente da conta
              </div>
              <p style={{ fontSize: '12.5px', color: 'var(--grafite)', marginBottom: '12px', lineHeight: 1.55 }}>
                Esta ação remove permanentemente sua conta, perfil profissional, portfólio, favoritos, cotações e
                mensagens dos servidores da Ballast. Não pode ser desfeita.
              </p>

              {!deleteStep ? (
                <button type="button" onClick={() => setDeleteStep(true)} className="btn danger" style={{ width: '100%' }}>
                  <Trash2 size={14} /> Solicitar exclusão da minha conta
                </button>
              ) : (
                <form onSubmit={handleDeleteAccount} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div>
                    <label htmlFor="lgpd-confirm-password">Digite sua senha para confirmar</label>
                    <input
                      id="lgpd-confirm-password"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Sua senha atual"
                      required
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button type="button" onClick={() => { setDeleteStep(false); setConfirmPassword(''); }} className="btn ghost" style={{ flex: 1 }}>
                      Cancelar
                    </button>
                    <button type="submit" disabled={deleting} className="btn danger" style={{ flex: 1 }}>
                      {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                      Confirmar exclusão
                    </button>
                  </div>
                </form>
              )}
            </div>
          </>
        ) : (
          <p style={{ fontSize: '13px', color: 'var(--steel)', margin: 0 }}>
            Você está navegando como visitante. Preferências de briefing ou comparação ficam salvas apenas localmente
            no seu navegador e podem ser limpas a qualquer momento.
          </p>
        )}
      </div>
    </Modal>
  );
};
