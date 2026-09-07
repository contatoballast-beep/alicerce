import React, { useState } from 'react';
import { 
  Rss, 
  Search, 
  Briefcase, 
  HardHat, 
  MessageSquare, 
  Megaphone, 
  ShieldAlert, 
  UserCheck, 
  Lock, 
  Menu, 
  X, 
  ChevronDown, 
  Heart, 
  Truck, 
  LogOut,
  User
} from 'lucide-react';
import { UserProfile, UserRole } from '../types';

interface NavbarProps {
  currentUser: UserProfile;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenAuth: (mode?: 'login' | 'register') => void;
  onOpenLGPD: () => void;
  onSwitchRole: (role: UserRole) => void;
  onLogout: () => void;
  unreadMessagesCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  activeTab,
  setActiveTab,
  onOpenAuth,
  onOpenLGPD,
  onSwitchRole,
  onLogout,
  unreadMessagesCount,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  const rolesList: { role: UserRole; label: string; sub: string }[] = [
    { role: 'profissional_crea', label: 'Engenheiro (CREA)', sub: 'CREA-SP 5069824/D' },
    { role: 'profissional_cau', label: 'Arquiteto (CAU)', sub: 'CAU A88291-0' },
    { role: 'empresa_cnpj', label: 'Construtora (CNPJ)', sub: '33.910.402/0001-12' },
    { role: 'fornecedor', label: 'Fornecedor de Materiais', sub: 'Polimix Concreto' },
    { role: 'cliente', label: 'Proprietário / Cliente', sub: 'Pessoa Física' },
    { role: 'admin', label: 'Administrador', sub: 'Painel de Gestão' },
  ];

  const handleNavClick = (tab: string) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  const isGuest = !currentUser || currentUser.id === 'usr_guest';

  return (
    <nav style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(234, 241, 246, 0.98)', backdropFilter: 'blur(8px)', borderBottom: '1px solid var(--steel-line)' }}>
      <div style={{ maxWidth: '1140px', margin: '0 auto', padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        
        {/* Brand Logo */}
        <div className="wordmark" style={{ cursor: 'pointer' }} onClick={() => handleNavClick('feed')}>
          <span className="mark"></span>
          <span>ALICERCE</span>
        </div>

        {/* Navigation Tabs (Desktop) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }} className="desktop-nav">
          <button 
            className={`btn ghost ${activeTab === 'feed' ? 'primary' : ''}`}
            onClick={() => handleNavClick('feed')}
            style={activeTab === 'feed' ? { background: 'var(--ink)', borderColor: 'var(--ink)', color: '#FFF' } : {}}
          >
            <Rss size={14} /> Feed
          </button>

          <button 
            className={`btn ghost ${activeTab === 'directory' ? 'primary' : ''}`}
            onClick={() => handleNavClick('directory')}
            style={activeTab === 'directory' ? { background: 'var(--ink)', borderColor: 'var(--ink)', color: '#FFF' } : {}}
          >
            <Search size={14} /> Catálogo
          </button>

          <button 
            className={`btn ghost ${activeTab === 'opportunities' ? 'primary' : ''}`}
            onClick={() => handleNavClick('opportunities')}
            style={activeTab === 'opportunities' ? { background: 'var(--ink)', borderColor: 'var(--ink)', color: '#FFF' } : {}}
          >
            <Briefcase size={14} /> Oportunidades
          </button>

          <button 
            className={`btn ghost ${activeTab === 'quotes' ? 'primary' : ''}`}
            onClick={() => handleNavClick('quotes')}
            style={activeTab === 'quotes' ? { background: 'var(--ink)', borderColor: 'var(--ink)', color: '#FFF' } : {}}
          >
            <Truck size={14} /> Cotações
          </button>

          <button 
            className={`btn ghost ${activeTab === 'timeline' ? 'primary' : ''}`}
            onClick={() => handleNavClick('timeline')}
            style={activeTab === 'timeline' ? { background: 'var(--ink)', borderColor: 'var(--ink)', color: '#FFF' } : {}}
          >
            <HardHat size={14} /> Diário
          </button>

          <button 
            className={`btn ghost ${activeTab === 'chat' ? 'primary' : ''}`}
            onClick={() => handleNavClick('chat')}
            style={{ position: 'relative' }}
          >
            <MessageSquare size={14} /> Chat
            {unreadMessagesCount > 0 && (
              <span style={{ position: 'absolute', top: '2px', right: '2px', width: '6px', height: '6px', background: 'var(--line)', borderRadius: '50%' }} />
            )}
          </button>

          <button 
            className={`btn ghost ${activeTab === 'favorites' ? 'primary' : ''}`}
            onClick={() => handleNavClick('favorites')}
            style={activeTab === 'favorites' ? { background: 'var(--line)', borderColor: 'var(--line)', color: '#FFF' } : {}}
          >
            <Heart size={14} /> Salvos
          </button>

          <button 
            className={`btn ghost ${activeTab === 'ads' ? 'primary' : ''}`}
            onClick={() => handleNavClick('ads')}
            style={activeTab === 'ads' ? { background: 'var(--line)', borderColor: 'var(--line)', color: '#FFF' } : { color: 'var(--line)' }}
          >
            <Megaphone size={14} /> Ads
          </button>

          {currentUser && currentUser.role === 'admin' && (
            <button 
              className={`btn ghost`}
              onClick={() => handleNavClick('admin')}
              style={{ color: 'var(--ink-soft)' }}
            >
              <ShieldAlert size={14} /> Admin
            </button>
          )}
        </div>

        {/* User Auth / Account Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          
          {isGuest ? (
            <div style={{ display: 'flex', gap: '6px' }}>
              <button 
                onClick={() => onOpenAuth('login')}
                className="btn ghost" 
                style={{ padding: '6px 12px', fontSize: '11px' }}
              >
                Entrar
              </button>
              <button 
                onClick={() => onOpenAuth('register')}
                className="btn primary" 
                style={{ padding: '6px 12px', fontSize: '11px' }}
              >
                Cadastrar
              </button>
            </div>
          ) : (
            <div style={{ position: 'relative' }}>
              <button 
                onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                style={{ background: 'var(--white)', border: '1px solid var(--steel-line)', padding: '4px 8px', borderRadius: '3px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
              >
                <div className="avatar" style={{ width: '24px', height: '24px', fontSize: '10px' }}>
                  {currentUser.name.substring(0, 2).toUpperCase()}
                </div>
                <div style={{ textAlign: 'left', display: 'none' }} className="user-name-desktop">
                  <div style={{ fontWeight: 600, fontSize: '11.5px', color: 'var(--ink)' }}>{currentUser.name.split(' ')[0]}</div>
                  <div className="mono" style={{ fontSize: '9px', color: 'var(--steel)' }}>{currentUser.role}</div>
                </div>
                <ChevronDown size={12} color="var(--steel)" />
              </button>

              {roleDropdownOpen && (
                <div style={{ position: 'absolute', right: 0, top: '38px', width: '260px', background: 'var(--white)', border: '1px solid var(--steel-line)', borderRadius: '3px', padding: '6px', boxShadow: '0 10px 30px rgba(0,0,0,0.12)', zIndex: 110 }}>
                  
                  {/* Current user header */}
                  <div style={{ padding: '6px 8px', borderBottom: '1px solid var(--steel-line)', marginBottom: '4px' }}>
                    <div style={{ fontWeight: 700, fontSize: '12px', color: 'var(--ink)' }}>{currentUser.name}</div>
                    <div style={{ fontSize: '10.5px', color: 'var(--steel)' }}>{currentUser.email}</div>
                    <div className="mono" style={{ fontSize: '9.5px', color: 'var(--accent)', marginTop: '2px' }}>
                      {currentUser.creaCauNumber || currentUser.cnpjNumber || 'Conta Verificada'}
                    </div>
                  </div>

                  <div style={{ fontSize: '9px', color: 'var(--steel)', textTransform: 'uppercase', padding: '4px 6px', fontFamily: 'var(--font-mono)' }}>
                    Alternar Tipo de Perfil (RBAC Demo):
                  </div>
                  
                  {rolesList.map(item => (
                    <button
                      key={item.role}
                      onClick={() => {
                        onSwitchRole(item.role);
                        setRoleDropdownOpen(false);
                      }}
                      style={{ width: '100%', textAlign: 'left', padding: '5px 8px', background: currentUser.role === item.role ? 'var(--paper)' : 'transparent', border: 'none', borderRadius: '2px', color: 'var(--ink)', cursor: 'pointer', display: 'block', marginBottom: '2px' }}
                    >
                      <div style={{ fontWeight: 600, fontSize: '11px' }}>{item.label}</div>
                      <div className="mono" style={{ fontSize: '9px', color: 'var(--steel)' }}>{item.sub}</div>
                    </button>
                  ))}
                  
                  <div style={{ borderTop: '1px solid var(--steel-line)', marginTop: '4px', paddingTop: '4px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <button 
                      onClick={() => { onOpenAuth('login'); setRoleDropdownOpen(false); }}
                      style={{ width: '100%', textAlign: 'left', padding: '5px 8px', background: 'transparent', border: 'none', color: 'var(--accent)', fontSize: '11px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}
                    >
                      <UserCheck size={12} /> Trocar de Conta (Login)
                    </button>
                    <button 
                      onClick={() => { onOpenLGPD(); setRoleDropdownOpen(false); }}
                      style={{ width: '100%', textAlign: 'left', padding: '5px 8px', background: 'transparent', border: 'none', color: 'var(--steel)', fontSize: '11px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <Lock size={12} /> Privacidade LGPD
                    </button>
                    <button 
                      onClick={() => { onLogout(); setRoleDropdownOpen(false); }}
                      style={{ width: '100%', textAlign: 'left', padding: '5px 8px', background: 'transparent', border: 'none', color: '#DC2626', fontSize: '11px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}
                    >
                      <LogOut size={12} /> Sair da Conta
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button 
            className="btn ghost mobile-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{ padding: '6px' }}
          >
            {mobileMenuOpen ? <X size={16} /> : <Menu size={16} />}
          </button>

        </div>

      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div style={{ padding: '10px 16px', background: 'var(--white)', borderTop: '1px solid var(--steel-line)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <button className="btn ghost" onClick={() => handleNavClick('feed')}><Rss size={13} /> Feed</button>
          <button className="btn ghost" onClick={() => handleNavClick('directory')}><Search size={13} /> Catálogo de Profissionais & Lojas</button>
          <button className="btn ghost" onClick={() => handleNavClick('opportunities')}><Briefcase size={13} /> Oportunidades & Demandas</button>
          <button className="btn ghost" onClick={() => handleNavClick('quotes')}><Truck size={13} /> Cotações de Materiais</button>
          <button className="btn ghost" onClick={() => handleNavClick('timeline')}><HardHat size={13} /> Diário de Obra</button>
          <button className="btn ghost" onClick={() => handleNavClick('chat')}><MessageSquare size={13} /> Mensagens</button>
          <button className="btn ghost" onClick={() => handleNavClick('favorites')}><Heart size={13} /> Salvos & Favoritos</button>
          <button className="btn ghost" onClick={() => handleNavClick('ads')}><Megaphone size={13} /> ALICERCE Ads</button>
          
          <div style={{ borderTop: '1px solid var(--steel-line)', paddingTop: '6px', display: 'flex', gap: '6px' }}>
            <button className="btn primary" onClick={() => { onOpenAuth('login'); setMobileMenuOpen(false); }} style={{ flex: 1 }}>
              Entrar
            </button>
            <button className="btn ghost" onClick={() => { onOpenAuth('register'); setMobileMenuOpen(false); }} style={{ flex: 1 }}>
              Cadastrar
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};
