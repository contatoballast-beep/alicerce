import React, { useState } from 'react';
import { 
  Rss, 
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
  Search
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
    { role: 'pessoa_fisica', label: 'Proprietário (PF)', sub: 'Pessoa Física' },
    { role: 'investidor', label: 'Investidor', sub: 'Aportes Imobiliários' },
    { role: 'admin', label: 'Administrador', sub: 'Painel de Gestão' },
  ];

  const handleNavClick = (tab: string) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <nav style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(234, 241, 246, 0.95)', backdropFilter: 'blur(8px)', borderBottom: '1px solid var(--steel-line)' }}>
      <div style={{ maxWidth: '1120px', margin: '0 auto', padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        
        {/* Brand Logo */}
        <div className="wordmark" style={{ cursor: 'pointer' }} onClick={() => handleNavClick('feed')}>
          <span className="mark"></span>
          <span>ALICERCE</span>
        </div>

        {/* Navigation Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }} className="desktop-nav">
          <button 
            className={`btn ghost ${activeTab === 'feed' ? 'primary' : ''}`}
            onClick={() => handleNavClick('feed')}
            style={activeTab === 'feed' ? { background: 'var(--ink)', borderColor: 'var(--ink)', color: '#FFF' } : {}}
          >
            <Rss size={15} /> Feed
          </button>

          <button 
            className={`btn ghost ${activeTab === 'opportunities' ? 'primary' : ''}`}
            onClick={() => handleNavClick('opportunities')}
            style={activeTab === 'opportunities' ? { background: 'var(--ink)', borderColor: 'var(--ink)', color: '#FFF' } : {}}
          >
            <Briefcase size={15} /> Explorar
          </button>

          <button 
            className={`btn ghost ${activeTab === 'timeline' ? 'primary' : ''}`}
            onClick={() => handleNavClick('timeline')}
            style={activeTab === 'timeline' ? { background: 'var(--ink)', borderColor: 'var(--ink)', color: '#FFF' } : {}}
          >
            <HardHat size={15} /> Diário de Obra
          </button>

          <button 
            className={`btn ghost ${activeTab === 'chat' ? 'primary' : ''}`}
            onClick={() => handleNavClick('chat')}
            style={{ position: 'relative' }}
          >
            <MessageSquare size={15} /> Msgs
            {unreadMessagesCount > 0 && (
              <span style={{ position: 'absolute', top: '2px', right: '2px', width: '6px', height: '6px', background: 'var(--line)', borderRadius: '50%' }} />
            )}
          </button>

          <button 
            className={`btn ghost ${activeTab === 'ads' ? 'primary' : ''}`}
            onClick={() => handleNavClick('ads')}
            style={activeTab === 'ads' ? { background: 'var(--line)', borderColor: 'var(--line)', color: '#FFF' } : { color: 'var(--line)' }}
          >
            <Megaphone size={15} /> Ads
          </button>

          {currentUser.role === 'admin' && (
            <button 
              className={`btn ghost`}
              onClick={() => handleNavClick('admin')}
              style={{ color: 'var(--ink-soft)' }}
            >
              <ShieldAlert size={15} /> Admin
            </button>
          )}

          <button 
            className="btn ghost"
            onClick={() => handleNavClick('swagger')}
            title="OpenAPI Spec"
          >
            <FileCode2 size={15} /> API
          </button>
        </div>

        {/* User Role Switcher Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          
          <div style={{ position: 'relative' }}>
            <button 
              onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
              style={{ background: 'var(--white)', border: '1px solid var(--steel-line)', padding: '5px 10px', borderRadius: '3px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
            >
              <div className="avatar">{currentUser.name.split(' ').map(n => n[0]).join('').substring(0, 2)}</div>
              <div style={{ textAlign: 'left', display: 'none' }} className="user-name-desktop">
                <div style={{ fontWeight: 600, fontSize: '12px', color: 'var(--ink)' }}>{currentUser.name}</div>
                <div className="mono" style={{ fontSize: '9.5px', color: 'var(--steel)' }}>{currentUser.creaCauNumber || currentUser.cnpjNumber || 'Pessoa Física'}</div>
              </div>
              <ChevronDown size={14} color="var(--steel)" />
            </button>

            {roleDropdownOpen && (
              <div style={{ position: 'absolute', right: 0, top: '42px', width: '250px', background: 'var(--white)', border: '1px solid var(--steel-line)', borderRadius: '3px', padding: '6px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', zIndex: 110 }}>
                <div style={{ fontSize: '9px', color: 'var(--steel)', textTransform: 'uppercase', padding: '4px 6px', fontFamily: 'var(--font-mono)' }}>
                  Alternar Perfil (RBAC)
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
                    <div style={{ fontWeight: 600, fontSize: '12px' }}>{item.label}</div>
                    <div className="mono" style={{ fontSize: '9.5px', color: 'var(--steel)' }}>{item.sub}</div>
                  </button>
                ))}
                
                <div style={{ borderTop: '1px solid var(--steel-line)', marginTop: '4px', paddingTop: '4px' }}>
                  <button 
                    onClick={() => { onOpenLGPD(); setRoleDropdownOpen(false); }}
                    style={{ width: '100%', textAlign: 'left', padding: '6px 8px', background: 'transparent', border: 'none', color: 'var(--steel)', fontSize: '11px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Lock size={12} /> Centro LGPD
                  </button>
                  <button 
                    onClick={() => { onOpenAuth(); setRoleDropdownOpen(false); }}
                    style={{ width: '100%', textAlign: 'left', padding: '6px 8px', background: 'transparent', border: 'none', color: 'var(--accent)', fontSize: '11px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}
                  >
                    <UserCheck size={12} /> Login / Novo Cadastro
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>

      </div>
    </nav>
  );
};
