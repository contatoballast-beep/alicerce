import React, { useState } from 'react';
import { Modal } from '../../components/Modal';
import { UserRole, UserProfile } from '../../types';
import { ShieldCheck, HardHat, Building, CheckCircle2 } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [mode, setMode] = useState<'login' | 'register'>('register');
  const [selectedRole, setSelectedRole] = useState<UserRole>('profissional_crea');
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [creaCau, setCreaCau] = useState('');
  const [cnpj, setCnpj] = useState('');

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !name) return;

    const newUser: UserProfile = {
      id: `usr_${Date.now()}`,
      name,
      email,
      role: selectedRole,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      bio: 'Perfil cadastrado na plataforma ALICERCE.',
      creaCauNumber: selectedRole.includes('crea') ? (creaCau || 'CREA-SP 5099812/D') : selectedRole.includes('cau') ? (creaCau || 'CAU A99182-0') : undefined,
      cnpjNumber: selectedRole === 'empresa_cnpj' ? (cnpj || '12.345.678/0001-90') : undefined,
      verified: true,
      twoFactorEnabled: true,
      city: 'São Paulo',
      state: 'SP',
      consentLgpd: true,
      createdAt: new Date().toLocaleDateString('pt-BR'),
    };

    onLoginSuccess(newUser);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={mode === 'register' ? 'Criar Conta ALICERCE' : 'Entrar'} maxWidth="480px">
      <div className="segrow" style={{ marginBottom: '14px' }}>
        <div className={`seg ${mode === 'register' ? 'on' : ''}`} onClick={() => setMode('register')}>Cadastro</div>
        <div className={`seg ${mode === 'login' ? 'on' : ''}`} onClick={() => setMode('login')}>Acessar Conta</div>
      </div>

      {mode === 'register' ? (
        <form onSubmit={handleRegister} className="form-wrap" style={{ padding: 0 }}>
          <div className="field">
            <label>Tipo de Perfil</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
              <button
                type="button"
                className={`btn ${selectedRole === 'profissional_crea' ? 'primary' : 'ghost'}`}
                onClick={() => setSelectedRole('profissional_crea')}
                style={{ fontSize: '10px', padding: '6px 2px' }}
              >
                Engenheiro
              </button>
              <button
                type="button"
                className={`btn ${selectedRole === 'profissional_cau' ? 'primary' : 'ghost'}`}
                onClick={() => setSelectedRole('profissional_cau')}
                style={{ fontSize: '10px', padding: '6px 2px' }}
              >
                Arquiteto
              </button>
              <button
                type="button"
                className={`btn ${selectedRole === 'empresa_cnpj' ? 'accent' : 'ghost'}`}
                onClick={() => setSelectedRole('empresa_cnpj')}
                style={{ fontSize: '10px', padding: '6px 2px' }}
              >
                Construtora
              </button>
            </div>
          </div>

          <div className="field">
            <label>Nome Completo / Razão Social *</label>
            <input type="text" placeholder="Ex: Engª. Marina Costa" value={name} onChange={e => setName(e.target.value)} required />
          </div>

          <div className="field">
            <label>E-mail Profissional *</label>
            <input type="email" placeholder="seuemail@empresa.com.br" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>

          {selectedRole.includes('crea') || selectedRole.includes('cau') ? (
            <div className="field">
              <label>Registro CREA / CAU</label>
              <input type="text" className="mono" placeholder="CREA-SP 123456-SP" value={creaCau} onChange={e => setCreaCau(e.target.value)} />
            </div>
          ) : selectedRole === 'empresa_cnpj' ? (
            <div className="field">
              <label>CNPJ da Empresa</label>
              <input type="text" className="mono" placeholder="12.345.678/0001-90" value={cnpj} onChange={e => setCnpj(e.target.value)} />
            </div>
          ) : null}

          <div className="field">
            <label>Senha *</label>
            <input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>

          <button type="submit" className="btn primary" style={{ width: '100%', justifyContent: 'center', marginTop: '4px' }}>
            <CheckCircle2 size={14} /> Finalizar Cadastro Seguro
          </button>
        </form>
      ) : (
        <form onSubmit={handleRegister} className="form-wrap" style={{ padding: 0 }}>
          <div className="field">
            <label>E-mail Cadastrado</label>
            <input type="email" placeholder="seuemail@empresa.com.br" required />
          </div>
          <div className="field">
            <label>Senha</label>
            <input type="password" placeholder="••••••••" required />
          </div>
          <button type="submit" className="btn primary" style={{ width: '100%', justifyContent: 'center', marginTop: '4px' }}>
            Entrar no ALICERCE
          </button>
        </form>
      )}
    </Modal>
  );
};
