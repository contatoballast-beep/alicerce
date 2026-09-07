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
  FileCode2,
  ChevronDown,
  Heart,
  Truck,
  Users
} from 'lucide-react';
import { UserProfile, UserRole } from '../types';

interface NavbarProps {
  currentUser: UserProfile;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenAuth: () => void;
  onOpenLGPD: () => void;
  onSwitchRole: (role: UserRole) => void;
  unreadMessagesCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  activeTab,
  setActiveTab,
  onOpenAuth,
  onOpenLGPD,
  onSwitchRole,
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

          {currentUser.role === 'admin' && (
            <button 
              className={`btn ghost`}
              onClick={() => handleNavClick('admin')}
              style={{ color: 'var(--ink-soft)' }}
            >
              <ShieldAlert size={14} /> Admin
            </button>
          )}
        </div>

        {/* User Role Switcher Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          
          <div style={{ position: 'relative' }}>
            <button 
              onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
              style={{ background: 'var(--white)', border: '1px solid var(--steel-line)', padding: '4px 8px', borderRadius: '3px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
            >
              <div className="avatar" style={{ width: '24px', height: '24px', fontSize: '10px' }}>
                {currentUser.name.substring(0, 2).toUpperCase()}
              </div>
              <div style={{ textAlign: 'left', display: 'none' }} className="user-name-desktop">
                <div style={{ fontWeight: 600, fontSize: '11.5px', color: 'var(--ink)' }}>{currentUser.name}</div>
                <div className="mono" style={{ fontSize: '9px', color: 'var(--steel)' }}>{currentUser.role}</div>
              </div>
              <ChevronDown size={12} color="var(--steel)" />
            </button>

            {roleDropdownOpen && (
              <div style={{ position: 'absolute', right: 0, top: '38px', width: '250px', background: 'var(--white)', border: '1px solid var(--steel-line)', borderRadius: '3px', padding: '6px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', zIndex: 110 }}>
                <div style={{ fontSize: '9px', color: 'var(--steel)', textTransform: 'uppercase', padding: '4px 6px', fontFamily: 'var(--font-mono)' }}>
                  Alternar Perfil Ativo (RBAC)
                </div>
                {rolesList.map(item => (
                  <button
                    key={item.role}
                    onClick={() => {
                      onSwitchRole(item.role);
                      setRoleDropdownOpen(false);
                    }}
                    style={{ width: '100%', textAlign: 'left', padding: '6px 8px', background: currentUser.role === item.role ? 'var(--paper)' : 'transparent', border: 'none', borderRadius: '2px', color: 'var(--ink)', cursor: 'pointer', display: 'block', marginBottom: '2px' }}
                  >
                    <div style={{ fontWeight: 600, fontSize: '11.5px' }}>{item.label}</div>
                    <div className="mono" style={{ fontSize: '9px', color: 'var(--steel)' }}>{item.sub}</div>
                  </button>
                ))}
                
                <div style={{ borderTop: '1px solid var(--steel-line)', marginTop: '4px', paddingTop: '4px' }}>
                  <button 
                    onClick={() => { onOpenLGPD(); setRoleDropdownOpen(false); }}
                    style={{ width: '100%', textAlign: 'left', padding: '6px 8px', background: 'transparent', border: 'none', color: 'var(--steel)', fontSize: '11px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Lock size={12} /> Privacidade LGPD
                  </button>
                  <button 
                    onClick={() => { onOpenAuth(); setRoleDropdownOpen(false); }}
                    style={{ width: '100%', textAlign: 'left', padding: '6px 8px', background: 'transparent', border: 'none', color: 'var(--accent)', fontSize: '11px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}
                  >
                    <UserCheck size={12} /> Entrar / Novo Cadastro
                  </button>
                </div>
              </div>
            )}
          </div>

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
        </div>
      )}
    </nav>
  );
};
