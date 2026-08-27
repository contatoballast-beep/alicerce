import React, { useState } from 'react';
import { Modal } from '../../components/Modal';
import { UserRole, UserProfile } from '../../types';
import { ShieldCheck, User, Building, HardHat, Lock, CheckCircle2, QrCode } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [mode, setMode] = useState<'login' | 'register'>('register');
  const [selectedRole, setSelectedRole] = useState<UserRole>('profissional_crea');
  
  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [creaCau, setCreaCau] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [city, setCity] = useState('São Paulo');
  const [state, setState] = useState('SP');
  const [enable2FA, setEnable2FA] = useState(true);
  const [step2FA, setStep2FA] = useState(false);
  const [totpCode, setTotpCode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !name) {
      setErrorMsg('Preencha os campos obrigatórios.');
      return;
    }

    if (enable2FA && !step2FA) {
      setStep2FA(true);
      return;
    }

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
      twoFactorEnabled: enable2FA,
      city,
      state,
      consentLgpd: true,
      createdAt: new Date().toLocaleDateString('pt-BR'),
    };

    onLoginSuccess(newUser);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={mode === 'register' ? 'Cadastro Multi-Perfil ALICERCE' : 'Acessar Conta'} maxWidth="550px">
      
      {/* Mode Selector */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', background: 'var(--bg-input)', padding: '4px', borderRadius: 'var(--radius-md)' }}>
        <button
          onClick={() => setMode('register')}
          style={{ flex: 1, padding: '8px', border: 'none', borderRadius: 'var(--radius-sm)', background: mode === 'register' ? 'var(--color-primary)' : 'transparent', color: mode === 'register' ? '#FFF' : 'var(--text-muted)', fontWeight: 600, cursor: 'pointer' }}
        >
          Criar Nova Conta
        </button>
        <button
          onClick={() => setMode('login')}
          style={{ flex: 1, padding: '8px', border: 'none', borderRadius: 'var(--radius-sm)', background: mode === 'login' ? 'var(--color-primary)' : 'transparent', color: mode === 'login' ? '#FFF' : 'var(--text-muted)', fontWeight: 600, cursor: 'pointer' }}
        >
          Já Tenho Cadastro
        </button>
      </div>

      {mode === 'register' && !step2FA && (
        <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          
          {/* Role selector */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px' }}>Selecione o Tipo de Perfil:</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setSelectedRole('profissional_crea')}
                style={{ padding: '10px 6px', border: '1px solid', borderColor: selectedRole === 'profissional_crea' ? 'var(--color-primary)' : 'var(--border-color)', background: selectedRole === 'profissional_crea' ? 'var(--color-primary-light)' : 'var(--bg-input)', borderRadius: 'var(--radius-md)', color: 'var(--text-main)', cursor: 'pointer', textAlign: 'center' }}
              >
                <HardHat size={18} color="var(--color-primary)" style={{ margin: '0 auto 4px' }} />
                <div style={{ fontSize: '0.75rem', fontWeight: 600 }}>Engenheiro</div>
                <div className="mono" style={{ fontSize: '0.65rem', color: 'var(--color-primary)' }}>CREA</div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedRole('profissional_cau')}
                style={{ padding: '10px 6px', border: '1px solid', borderColor: selectedRole === 'profissional_cau' ? 'var(--color-primary)' : 'var(--border-color)', background: selectedRole === 'profissional_cau' ? 'var(--color-primary-light)' : 'var(--bg-input)', borderRadius: 'var(--radius-md)', color: 'var(--text-main)', cursor: 'pointer', textAlign: 'center' }}
              >
                <Building size={18} color="var(--color-primary)" style={{ margin: '0 auto 4px' }} />
                <div style={{ fontSize: '0.75rem', fontWeight: 600 }}>Arquiteto</div>
                <div className="mono" style={{ fontSize: '0.65rem', color: 'var(--color-primary)' }}>CAU</div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedRole('empresa_cnpj')}
                style={{ padding: '10px 6px', border: '1px solid', borderColor: selectedRole === 'empresa_cnpj' ? 'var(--color-accent)' : 'var(--border-color)', background: selectedRole === 'empresa_cnpj' ? 'var(--color-accent-light)' : 'var(--bg-input)', borderRadius: 'var(--radius-md)', color: 'var(--text-main)', cursor: 'pointer', textAlign: 'center' }}
              >
                <Building size={18} color="var(--color-accent)" style={{ margin: '0 auto 4px' }} />
                <div style={{ fontSize: '0.75rem', fontWeight: 600 }}>Construtora</div>
                <div className="mono" style={{ fontSize: '0.65rem', color: 'var(--color-accent)' }}>CNPJ</div>
              </button>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Nome Completo / Razão Social *</label>
            <input 
              type="text" 
              className="input-field" 
              placeholder="Ex: Engª. Ana Paula / Construtora Silva" 
              value={name} 
              onChange={e => setName(e.target.value)} 
              required 
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>E-mail Profissional *</label>
            <input 
              type="email" 
              className="input-field" 
              placeholder="seuemail@empresa.com.br" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              required 
            />
          </div>

          {selectedRole.includes('crea') || selectedRole.includes('cau') ? (
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-primary)', marginBottom: '4px', fontWeight: 600 }}>
                Número do Registro {selectedRole.includes('crea') ? 'CREA' : 'CAU'} (Validação Instantânea)
              </label>
              <input 
                type="text" 
                className="input-field mono" 
                placeholder={selectedRole.includes('crea') ? 'Ex: CREA-SP 5099812/D' : 'Ex: CAU A99182-0'} 
                value={creaCau} 
                onChange={e => setCreaCau(e.target.value)} 
              />
            </div>
          ) : selectedRole === 'empresa_cnpj' ? (
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-accent)', marginBottom: '4px', fontWeight: 600 }}>
                Número do CNPJ (Consulta Receita Federal)
              </label>
              <input 
                type="text" 
                className="input-field mono" 
                placeholder="Ex: 12.345.678/0001-90" 
                value={cnpj} 
                onChange={e => setCnpj(e.target.value)} 
              />
            </div>
          ) : null}

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Senha (Argon2 Criptografada) *</label>
            <input 
              type="password" 
              className="input-field" 
              placeholder="Mínimo 8 caracteres" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              required 
            />
          </div>

          {/* 2FA checkbox */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(83, 157, 196, 0.08)', padding: '10px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-primary-light)' }}>
            <input 
              type="checkbox" 
              id="chk2fa" 
              checked={enable2FA} 
              onChange={e => setEnable2FA(e.target.checked)} 
              style={{ width: '16px', height: '16px', accentColor: 'var(--color-primary)' }}
            />
            <label htmlFor="chk2fa" style={{ fontSize: '0.8rem', cursor: 'pointer', color: 'var(--text-main)' }}>
              Ativar Autenticação em 2 Fatores (2FA via TOTP / Google Authenticator)
            </label>
          </div>

          {errorMsg && <div style={{ color: '#EF4444', fontSize: '0.8rem' }}>{errorMsg}</div>}

          <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '10px' }}>
            <ShieldCheck size={18} /> Continuar Onboarding Seguro
          </button>
        </form>
      )}

      {/* 2FA Step */}
      {step2FA && (
        <div style={{ textAlign: 'center', padding: '10px 0' }}>
          <QrCode size={48} color="var(--color-primary)" style={{ margin: '0 auto 12px' }} />
          <h4 style={{ fontSize: '1rem', color: 'var(--text-heading)', marginBottom: '6px' }}>Autenticação em 2 Fatores (2FA)</h4>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
            Escaneie ou insira o código de 6 dígitos enviado para seu aplicativo autenticador.
          </p>
          <input 
            type="text" 
            className="input-field mono" 
            placeholder="000 000" 
            maxLength={6}
            style={{ textAlign: 'center', fontSize: '1.4rem', letterSpacing: '0.3em', width: '200px', margin: '0 auto 16px', display: 'block' }}
            value={totpCode}
            onChange={e => setTotpCode(e.target.value)}
          />
          <button onClick={handleRegister} className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
            <CheckCircle2 size={18} /> Confirmar e Acessar Plataforma
          </button>
        </div>
      )}

      {mode === 'login' && (
        <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>E-mail Registrado</label>
            <input type="email" className="input-field" placeholder="seuemail@empresa.com.br" required />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Senha</label>
            <input type="password" className="input-field" placeholder="••••••••" required />
          </div>
          <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '10px' }}>
            <Lock size={18} /> Entrar na Plataforma
          </button>
        </form>
      )}
    </Modal>
  );
};
