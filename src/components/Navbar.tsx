import React, { useState } from 'react';
import { 
  Building2, 
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
  Bell, 
  FileCode2,
  ChevronDown
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
    <header style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(15, 23, 42, 0.92)', backdropFilter: 'blur(16px)', borderBottom: '1px solid var(--border-color)' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 16px', height: '70px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        
        {/* Brand Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={() => handleNavClick('feed')}>
          <div style={{ background: 'linear-gradient(135deg, #539DC4, #B5654A)', padding: '10px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Building2 size={24} color="#FFFFFF" />
          </div>
          <div>
            <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.03em', color: '#FFFFFF' }}>
              ALICERCE
            </span>
            <span className="mono" style={{ display: 'block', fontSize: '0.65rem', color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              REDE B2B2C CONSTRUÇÃO
            </span>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '6px' }} className="desktop-nav">
          <button 
            className={`btn-outline ${activeTab === 'feed' ? 'active-nav' : ''}`}
            onClick={() => handleNavClick('feed')}
            style={activeTab === 'feed' ? { borderColor: 'var(--color-primary)', background: 'var(--color-primary-light)', color: 'var(--color-primary)' } : { border: 'none' }}
          >
            <Rss size={18} /> Feed & Obras
          </button>

          <button 
            className={`btn-outline ${activeTab === 'opportunities' ? 'active-nav' : ''}`}
            onClick={() => handleNavClick('opportunities')}
            style={activeTab === 'opportunities' ? { borderColor: 'var(--color-primary)', background: 'var(--color-primary-light)', color: 'var(--color-primary)' } : { border: 'none' }}
          >
            <Briefcase size={18} /> Oportunidades
          </button>

          <button 
            className={`btn-outline ${activeTab === 'timeline' ? 'active-nav' : ''}`}
            onClick={() => handleNavClick('timeline')}
            style={activeTab === 'timeline' ? { borderColor: 'var(--color-primary)', background: 'var(--color-primary-light)', color: 'var(--color-primary)' } : { border: 'none' }}
          >
            <HardHat size={18} /> Diário de Obra
          </button>

          <button 
            className={`btn-outline ${activeTab === 'chat' ? 'active-nav' : ''}`}
            onClick={() => handleNavClick('chat')}
            style={{ border: 'none', position: 'relative' }}
          >
            <MessageSquare size={18} /> Mensagens
            {unreadMessagesCount > 0 && (
              <span style={{ position: 'absolute', top: '4px', right: '4px', background: 'var(--color-accent)', color: '#FFF', fontSize: '0.65rem', fontWeight: 700, borderRadius: '50%', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {unreadMessagesCount}
              </span>
            )}
          </button>

          <button 
            className={`btn-outline ${activeTab === 'ads' ? 'active-nav' : ''}`}
            onClick={() => handleNavClick('ads')}
            style={activeTab === 'ads' ? { borderColor: 'var(--color-accent)', background: 'var(--color-accent-light)', color: 'var(--color-accent)' } : { border: 'none' }}
          >
            <Megaphone size={18} color="var(--color-accent)" /> ALICERCE Ads
          </button>

          {currentUser.role === 'admin' && (
            <button 
              className={`btn-outline ${activeTab === 'admin' ? 'active-nav' : ''}`}
              onClick={() => handleNavClick('admin')}
              style={{ border: 'none', color: '#FACC15' }}
            >
              <ShieldAlert size={18} /> Painel Admin
            </button>
          )}

          <button 
            className="btn-outline"
            onClick={() => handleNavClick('swagger')}
            style={{ border: 'none', color: 'var(--text-muted)' }}
            title="Especificação OpenAPI/Swagger 3.0"
          >
            <FileCode2 size={18} /> API Spec
          </button>
        </nav>

        {/* User Role Switcher & Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          
          {/* Role Switcher Dropdown */}
          <div style={{ position: 'relative' }}>
            <button 
              onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', padding: '6px 12px', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: 'var(--text-main)', fontSize: '0.85rem' }}
            >
              <img src={currentUser.avatar} alt="Avatar" style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }} />
              <div style={{ textAlign: 'left', display: 'none' }} className="user-name-desktop">
                <div style={{ fontWeight: 600, fontSize: '0.8rem', lineHeight: 1.2 }}>{currentUser.name}</div>
                <div className="mono" style={{ fontSize: '0.68rem', color: 'var(--color-primary)' }}>{currentUser.creaCauNumber || currentUser.cnpjNumber || 'Pessoa Física'}</div>
              </div>
              <ChevronDown size={14} color="var(--text-muted)" />
            </button>

            {roleDropdownOpen && (
              <div style={{ position: 'absolute', right: 0, top: '45px', width: '260px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '8px', boxShadow: 'var(--shadow-card)', zIndex: 110 }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', padding: '4px 8px', fontFamily: 'var(--font-mono)' }}>
                  Alternar Perfil Simulado (RBAC)
                </div>
                {rolesList.map(item => (
                  <button
                    key={item.role}
                    onClick={() => {
                      onSwitchRole(item.role);
                      setRoleDropdownOpen(false);
                    }}
                    style={{ width: '100%', textAlign: 'left', padding: '8px', background: currentUser.role === item.role ? 'var(--color-primary-light)' : 'transparent', border: 'none', borderRadius: 'var(--radius-sm)', color: currentUser.role === item.role ? 'var(--color-primary)' : 'var(--text-main)', cursor: 'pointer', display: 'block', marginBottom: '4px' }}
                  >
                    <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{item.label}</div>
                    <div className="mono" style={{ fontSize: '0.7rem', opacity: 0.8 }}>{item.sub}</div>
                  </button>
                ))}
                
                <div style={{ borderTop: '1px solid var(--border-color)', marginTop: '6px', paddingTop: '6px' }}>
                  <button 
                    onClick={() => { onOpenLGPD(); setRoleDropdownOpen(false); }}
                    style={{ width: '100%', textAlign: 'left', padding: '8px', background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Lock size={14} /> Privacidade & LGPD
                  </button>
                  <button 
                    onClick={() => { onOpenAuth(); setRoleDropdownOpen(false); }}
                    style={{ width: '100%', textAlign: 'left', padding: '8px', background: 'transparent', border: 'none', color: 'var(--color-primary)', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}
                  >
                    <UserCheck size={14} /> Novo Cadastro / Login
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Menu Trigger */}
          <button 
            className="mobile-trigger" 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-main)', cursor: 'pointer' }}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div style={{ background: 'var(--bg-darker)', borderBottom: '1px solid var(--border-color)', padding: '16px' }} className="mobile-menu">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button className="btn-outline" onClick={() => handleNavClick('feed')} style={{ justifyContent: 'flex-start' }}><Rss size={18} /> Feed & Obras</button>
            <button className="btn-outline" onClick={() => handleNavClick('opportunities')} style={{ justifyContent: 'flex-start' }}><Briefcase size={18} /> Oportunidades</button>
            <button className="btn-outline" onClick={() => handleNavClick('timeline')} style={{ justifyContent: 'flex-start' }}><HardHat size={18} /> Diário de Obra</button>
            <button className="btn-outline" onClick={() => handleNavClick('chat')} style={{ justifyContent: 'flex-start' }}><MessageSquare size={18} /> Mensagens ({unreadMessagesCount})</button>
            <button className="btn-outline" onClick={() => handleNavClick('ads')} style={{ justifyContent: 'flex-start', color: 'var(--color-accent)' }}><Megaphone size={18} /> ALICERCE Ads</button>
            <button className="btn-outline" onClick={() => handleNavClick('swagger')} style={{ justifyContent: 'flex-start' }}><FileCode2 size={18} /> Swagger / API Docs</button>
          </div>
        </div>
      )}
    </header>
  );
};
