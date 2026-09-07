import React, { useState, useEffect } from 'react';
import { Modal } from '../../components/Modal';
import { UserRole, UserProfile } from '../../types';
import { RealApiClient } from '../../services/realApiClient';
import { CheckCircle2, Loader2, AlertCircle, Key, UserCheck, HardHat, Building2, Truck, ShieldAlert } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserProfile) => void;
  initialMode?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({ 
  isOpen, 
  onClose, 
  onLoginSuccess,
  initialMode = 'login'
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [selectedRole, setSelectedRole] = useState<UserRole>('profissional_crea');

  useEffect(() => {
    if (initialMode) {
      setMode(initialMode);
    }
    setErrorMessage(null);
  }, [initialMode, isOpen]);
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [creaCau, setCreaCau] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('São Paulo');
  const [state, setState] = useState('SP');
  
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !name) {
      setErrorMessage('Preencha seu nome, e-mail e senha.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    const res = await RealApiClient.register({
      name,
      email,
      password,
      role: selectedRole,
      creaCauNumber: creaCau || (selectedRole.includes('crea') ? 'CREA-SP 5099812/D' : undefined),
      cnpjNumber: cnpj || (selectedRole === 'empresa_cnpj' ? '12.345.678/0001-90' : undefined),
      phone,
      whatsapp: phone,
      city,
      state,
    });

    setLoading(false);

    if (res.user && !res.error) {
      onLoginSuccess(res.user);
      onClose();
    } else {
      setErrorMessage(res.error || 'Erro ao realizar cadastro.');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage('Informe seu e-mail e senha.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    const res = await RealApiClient.login(email, password);
    setLoading(false);

    if (res.user && !res.error) {
      onLoginSuccess(res.user);
      onClose();
    } else {
      setErrorMessage(res.error || 'Credenciais inválidas. Verifique o e-mail e a senha.');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={mode === 'login' ? 'Entrar no ALICERCE' : 'Criar Nova Conta'} maxWidth="480px">
      
      {/* Mode Switcher Segments */}
      <div className="segrow" style={{ marginBottom: '18px' }}>
        <div className={`seg ${mode === 'login' ? 'on' : ''}`} onClick={() => { setMode('login'); setErrorMessage(null); }}>
          Acessar Minha Conta
        </div>
        <div className={`seg ${mode === 'register' ? 'on' : ''}`} onClick={() => { setMode('register'); setErrorMessage(null); }}>
          Cadastrar-se
        </div>
      </div>

      {errorMessage && (
        <div style={{ 
          background: 'rgba(239, 68, 68, 0.08)', 
          border: '1px solid rgba(239, 68, 68, 0.25)', 
          color: '#DC2626', 
          padding: '10px 14px', 
          borderRadius: 'var(--radius-md)', 
          fontSize: '12px', 
          marginBottom: '16px', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px', 
          fontWeight: 600 
        }}>
          <AlertCircle size={16} /> {errorMessage}
        </div>
      )}

      {mode === 'login' ? (
        <form onSubmit={handleLogin} className="form-wrap" style={{ padding: 0 }}>
          <div className="field">
            <label>E-mail Cadastrado *</label>
            <input 
              type="email" 
              placeholder="seuemail@empresa.com.br" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              required 
            />
          </div>
          
          <div className="field">
            <label>Senha *</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              required 
            />
          </div>

          <button type="submit" disabled={loading} className="btn primary" style={{ width: '100%', justifyContent: 'center', marginTop: '10px', padding: '11px 16px', fontSize: '13.5px' }}>
            {loading ? <Loader2 size={16} className="animate-spin" /> : <UserCheck size={16} />} Entrar na Plataforma
          </button>
        </form>
      ) : (
        <form onSubmit={handleRegister} className="form-wrap" style={{ padding: 0 }}>
          <div className="field">
            <label>Tipo de Perfil no Ecossistema *</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
              <button
                type="button"
                className={`btn ${selectedRole === 'profissional_crea' ? 'primary' : 'ghost'}`}
                onClick={() => setSelectedRole('profissional_crea')}
                style={{ fontSize: '11px', padding: '8px 4px' }}
              >
                Engenheiro
              </button>
              <button
                type="button"
                className={`btn ${selectedRole === 'profissional_cau' ? 'primary' : 'ghost'}`}
                onClick={() => setSelectedRole('profissional_cau')}
                style={{ fontSize: '11px', padding: '8px 4px' }}
              >
                Arquiteto
              </button>
              <button
                type="button"
                className={`btn ${selectedRole === 'empresa_cnpj' ? 'accent' : 'ghost'}`}
                onClick={() => setSelectedRole('empresa_cnpj')}
                style={{ fontSize: '11px', padding: '8px 4px' }}
              >
                Construtora
              </button>
              <button
                type="button"
                className={`btn ${selectedRole === 'fornecedor' ? 'accent' : 'ghost'}`}
                onClick={() => setSelectedRole('fornecedor')}
                style={{ fontSize: '11px', padding: '8px 4px' }}
              >
                Fornecedor
              </button>
              <button
                type="button"
                className={`btn ${selectedRole === 'cliente' ? 'primary' : 'ghost'}`}
                onClick={() => setSelectedRole('cliente')}
                style={{ gridColumn: 'span 2', fontSize: '11px', padding: '8px 4px' }}
              >
                Proprietário / Cliente
              </button>
            </div>
          </div>

          <div className="field">
            <label>Nome Completo / Razão Social *</label>
            <input 
              type="text" 
              placeholder="Ex: Eng. Lucas Ferreira" 
              value={name} 
              onChange={e => setName(e.target.value)} 
              required 
            />
          </div>

          <div className="field">
            <label>E-mail Profissional *</label>
            <input 
              type="email" 
              placeholder="seuemail@empresa.com.br" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              required 
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {selectedRole.includes('crea') || selectedRole.includes('cau') ? (
              <div className="field">
                <label>Registro CREA / CAU</label>
                <input 
                  type="text" 
                  className="mono" 
                  placeholder="CREA-SP 123456-SP" 
                  value={creaCau} 
                  onChange={e => setCreaCau(e.target.value)} 
                />
              </div>
            ) : selectedRole === 'empresa_cnpj' || selectedRole === 'fornecedor' ? (
              <div className="field">
                <label>CNPJ da Empresa</label>
                <input 
                  type="text" 
                  className="mono" 
                  placeholder="12.345.678/0001-90" 
                  value={cnpj} 
                  onChange={e => setCnpj(e.target.value)} 
                />
              </div>
            ) : (
              <div className="field">
                <label>CPF / Documento</label>
                <input 
                  type="text" 
                  className="mono" 
                  placeholder="000.000.000-00" 
                />
              </div>
            )}

            <div className="field">
              <label>WhatsApp / Telefone *</label>
              <input 
                type="text" 
                placeholder="(11) 98765-4321" 
                value={phone}
                onChange={e => setPhone(e.target.value)}
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '10px' }}>
            <div className="field">
              <label>Cidade</label>
              <input 
                type="text" 
                value={city} 
                onChange={e => setCity(e.target.value)} 
                required 
              />
            </div>
            <div className="field">
              <label>UF</label>
              <input 
                type="text" 
                value={state} 
                onChange={e => setState(e.target.value)} 
                maxLength={2} 
                required 
              />
            </div>
          </div>

          <div className="field">
            <label>Senha de Acesso *</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              required 
            />
          </div>

          <button type="submit" disabled={loading} className="btn primary" style={{ width: '100%', justifyContent: 'center', marginTop: '6px', padding: '10px 16px', fontSize: '13px' }}>
            {loading ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle2 size={15} />} Finalizar Cadastro Seguro
          </button>
        </form>
      )}

    </Modal>
  );
};
