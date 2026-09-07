import React, { useState, useEffect } from 'react';
import { Modal } from '../../components/Modal';
import { UserRole, UserProfile } from '../../types';
import { RealApiClient } from '../../services/realApiClient';
import { CheckCircle2, Loader2, AlertCircle, ArrowRight, UserCheck, HardHat, Building2, Truck, ShieldCheck, Mail, Lock, User, Phone, MapPin, FileBadge } from 'lucide-react';

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

  const roleOptions: { id: UserRole; title: string; desc: string; icon: any }[] = [
    { id: 'profissional_crea', title: 'Engenheiro', desc: 'CREA / Laudos', icon: HardHat },
    { id: 'profissional_cau', title: 'Arquiteto', desc: 'CAU / Projetos', icon: Building2 },
    { id: 'empresa_cnpj', title: 'Construtora', desc: 'CNPJ / Obras', icon: Building2 },
    { id: 'fornecedor', title: 'Fornecedor', desc: 'Materiais & Insumos', icon: Truck },
    { id: 'cliente', title: 'Proprietário', desc: 'Contratante', icon: User },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={mode === 'login' ? 'Entrar no ALICERCE' : 'Criar Nova Conta'} maxWidth="460px">
      
      {/* Mode Switcher Segments */}
      <div style={{
        display: 'flex',
        background: '#F1F5F9',
        padding: '4px',
        borderRadius: '8px',
        gap: '4px',
        border: '1px solid #E2E8F0',
        marginBottom: '20px'
      }}>
        <button
          type="button"
          onClick={() => { setMode('login'); setErrorMessage(null); }}
          style={{
            flex: 1,
            textAlign: 'center',
            padding: '8px 14px',
            fontSize: '13px',
            fontWeight: mode === 'login' ? 700 : 500,
            borderRadius: '6px',
            cursor: 'pointer',
            border: 'none',
            background: mode === 'login' ? '#FFFFFF' : 'transparent',
            color: mode === 'login' ? '#0F172A' : '#64748B',
            boxShadow: mode === 'login' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
            transition: 'all 0.15s ease'
          }}
        >
          Acessar Minha Conta
        </button>
        <button
          type="button"
          onClick={() => { setMode('register'); setErrorMessage(null); }}
          style={{
            flex: 1,
            textAlign: 'center',
            padding: '8px 14px',
            fontSize: '13px',
            fontWeight: mode === 'register' ? 700 : 500,
            borderRadius: '6px',
            cursor: 'pointer',
            border: 'none',
            background: mode === 'register' ? '#FFFFFF' : 'transparent',
            color: mode === 'register' ? '#0F172A' : '#64748B',
            boxShadow: mode === 'register' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
            transition: 'all 0.15s ease'
          }}
        >
          Cadastrar-se
        </button>
      </div>

      {errorMessage && (
        <div style={{ 
          background: '#FEF2F2', 
          border: '1px solid #FECACA', 
          color: '#DC2626', 
          padding: '10px 14px', 
          borderRadius: '8px', 
          fontSize: '12.5px', 
          marginBottom: '16px', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px', 
          fontWeight: 600 
        }}>
          <AlertCircle size={15} /> {errorMessage}
        </div>
      )}

      {mode === 'login' ? (
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>
              E-mail Cadastrado *
            </label>
            <div style={{ position: 'relative' }}>
              <input 
                type="email" 
                placeholder="seuemail@empresa.com.br" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                required 
                style={{
                  width: '100%',
                  height: '42px',
                  padding: '0 12px',
                  border: '1.5px solid #CBD5E1',
                  borderRadius: '8px',
                  fontSize: '14px',
                  background: '#FFFFFF',
                  color: '#0F172A',
                  outline: 'none',
                  transition: 'all 0.15s ease'
                }}
              />
            </div>
          </div>
          
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>
              Senha *
            </label>
            <input 
              type="password" 
              placeholder="••••••••" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              required 
              style={{
                width: '100%',
                height: '42px',
                padding: '0 12px',
                border: '1.5px solid #CBD5E1',
                borderRadius: '8px',
                fontSize: '14px',
                background: '#FFFFFF',
                color: '#0F172A',
                outline: 'none',
                transition: 'all 0.15s ease'
              }}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            style={{ 
              width: '100%', 
              height: '44px',
              marginTop: '6px',
              background: '#2563EB',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 2px 4px rgba(37, 99, 235, 0.25)',
              transition: 'all 0.15s ease'
            }}
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <UserCheck size={16} />}
            <span>Entrar na Plataforma</span>
          </button>
        </form>
      ) : (
        <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
              Tipo de Perfil no Ecossistema *
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
              {roleOptions.map(r => {
                const isSelected = selectedRole === r.id;
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setSelectedRole(r.id)}
                    style={{
                      padding: '8px 4px',
                      borderRadius: '8px',
                      border: isSelected ? '1.5px solid #2563EB' : '1px solid #E2E8F0',
                      background: isSelected ? '#EFF6FF' : '#FFFFFF',
                      color: isSelected ? '#2563EB' : '#475569',
                      fontWeight: isSelected ? 700 : 500,
                      fontSize: '11px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      textAlign: 'center'
                    }}
                  >
                    {r.title}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
              Nome Completo / Razão Social *
            </label>
            <input 
              type="text" 
              placeholder="Ex: Eng. Lucas Ferreira" 
              value={name} 
              onChange={e => setName(e.target.value)} 
              required 
              style={{
                width: '100%',
                height: '40px',
                padding: '0 12px',
                border: '1.5px solid #CBD5E1',
                borderRadius: '8px',
                fontSize: '13.5px',
                background: '#FFFFFF',
                color: '#0F172A',
                outline: 'none'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
              E-mail Profissional *
            </label>
            <input 
              type="email" 
              placeholder="seuemail@empresa.com.br" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              required 
              style={{
                width: '100%',
                height: '40px',
                padding: '0 12px',
                border: '1.5px solid #CBD5E1',
                borderRadius: '8px',
                fontSize: '13.5px',
                background: '#FFFFFF',
                color: '#0F172A',
                outline: 'none'
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                {selectedRole.includes('crea') || selectedRole.includes('cau') ? 'Registro CREA / CAU' : 'CNPJ da Empresa'}
              </label>
              <input 
                type="text" 
                placeholder={selectedRole.includes('crea') ? 'CREA-SP 123456/D' : '12.345.678/0001-90'} 
                value={selectedRole.includes('crea') || selectedRole.includes('cau') ? creaCau : cnpj} 
                onChange={e => selectedRole.includes('crea') || selectedRole.includes('cau') ? setCreaCau(e.target.value) : setCnpj(e.target.value)} 
                style={{
                  width: '100%',
                  height: '40px',
                  padding: '0 12px',
                  border: '1.5px solid #CBD5E1',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontFamily: 'var(--font-mono)',
                  background: '#FFFFFF',
                  color: '#0F172A',
                  outline: 'none'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                WhatsApp / Telefone *
              </label>
              <input 
                type="text" 
                placeholder="(11) 98765-4321" 
                value={phone}
                onChange={e => setPhone(e.target.value)}
                required
                style={{
                  width: '100%',
                  height: '40px',
                  padding: '0 12px',
                  border: '1.5px solid #CBD5E1',
                  borderRadius: '8px',
                  fontSize: '13.5px',
                  background: '#FFFFFF',
                  color: '#0F172A',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                Cidade
              </label>
              <input 
                type="text" 
                value={city} 
                onChange={e => setCity(e.target.value)} 
                required 
                style={{
                  width: '100%',
                  height: '40px',
                  padding: '0 12px',
                  border: '1.5px solid #CBD5E1',
                  borderRadius: '8px',
                  fontSize: '13.5px',
                  background: '#FFFFFF',
                  color: '#0F172A',
                  outline: 'none'
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                UF
              </label>
              <input 
                type="text" 
                value={state} 
                onChange={e => setState(e.target.value)} 
                maxLength={2} 
                required 
                style={{
                  width: '100%',
                  height: '40px',
                  padding: '0 12px',
                  border: '1.5px solid #CBD5E1',
                  borderRadius: '8px',
                  fontSize: '13.5px',
                  background: '#FFFFFF',
                  color: '#0F172A',
                  outline: 'none',
                  textTransform: 'uppercase'
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
              Senha de Acesso *
            </label>
            <input 
              type="password" 
              placeholder="••••••••" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              required 
              style={{
                width: '100%',
                height: '40px',
                padding: '0 12px',
                border: '1.5px solid #CBD5E1',
                borderRadius: '8px',
                fontSize: '13.5px',
                background: '#FFFFFF',
                color: '#0F172A',
                outline: 'none'
              }}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            style={{ 
              width: '100%', 
              height: '44px',
              marginTop: '6px',
              background: '#2563EB',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 2px 4px rgba(37, 99, 235, 0.25)',
              transition: 'all 0.15s ease'
            }}
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
            <span>Finalizar Cadastro Seguro</span>
          </button>
        </form>
      )}

    </Modal>
  );
};
