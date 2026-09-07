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
  Sparkles,
  ShieldCheck,
  Building2,
  FileText
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
    { role: 'admin', label: 'Administrador da Plataforma', sub: 'Gestão Geral & Auditoria' },
    { role: 'profissional_crea', label: 'Engenheiro Civil (CREA)', sub: 'CREA-SP 5069824/D' },
    { role: 'profissional_cau', label: 'Arquiteto & Urbanista (CAU)', sub: 'CAU A88291-0' },
    { role: 'empresa_cnpj', label: 'Construtora / Empreiteira', sub: '33.910.402/0001-12' },
    { role: 'fornecedor', label: 'Fornecedor de Materiais', sub: 'Polimix Concreto' },
    { role: 'cliente', label: 'Proprietário / Investidor', sub: 'Pessoa Física / Jurídica' },
  ];

  const handleNavClick = (tab: string) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  const isGuest = !currentUser || currentUser.id === 'usr_guest';
  const isAdmin = currentUser && currentUser.role === 'admin';

  // Primary navigation tabs (Central)
  const primaryNav = [
    { id: 'feed', label: 'Feed', icon: Rss },
    { id: 'directory', label: 'Catálogo', icon: Search },
    { id: 'opportunities', label: 'Demandas', icon: Briefcase },
    { id: 'quotes', label: 'Cotações', icon: Truck },
    { id: 'timeline', label: 'Diário de Obra', icon: HardHat },
  ];

  return (
    <nav style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderBottom: '1px solid var(--border-color)',
      boxShadow: '0 1px 3px 0 rgba(15, 23, 42, 0.04)'
    }}>
      <div style={{ 
        maxWidth: '1280px', 
        margin: '0 auto', 
        padding: '0 20px', 
        height: '64px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        gap: '16px'
      }}>
        
        {/* Left: Brand Monogram & Name */}
        <div 
          style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }} 
          onClick={() => handleNavClick('feed')}
        >
          <div style={{
            width: '32px',
            height: '32px',
            background: 'linear-gradient(135deg, #1E3A8A 0%, #2563EB 100%)',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            fontWeight: 900,
            fontSize: '16px',
            boxShadow: '0 2px 6px rgba(37, 99, 235, 0.3)'
          }}>
            A
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
            <span style={{ fontSize: '17px', letterSpacing: '-0.03em', fontWeight: 900, color: 'var(--text-heading)' }}>
              ALICERCE
            </span>
            <span style={{ fontSize: '9px', fontWeight: 700, color: 'var(--accent-color)', letterSpacing: '0.08em', marginTop: '2px' }}>
              CONTECH ECOSYSTEM
            </span>
          </div>
        </div>

        {/* Center: Primary Navigation Tabs (Desktop) */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '4px',
          background: 'var(--bg-subtle)',
          padding: '4px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-color)'
        }} className="desktop-nav">
          {primaryNav.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '12.5px',
                  fontWeight: isActive ? 700 : 500,
                  cursor: 'pointer',
                  border: 'none',
                  background: isActive ? '#FFFFFF' : 'transparent',
                  color: isActive ? 'var(--text-heading)' : 'var(--text-muted)',
                  boxShadow: isActive ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                <Icon size={14} color={isActive ? 'var(--primary-color)' : 'var(--text-muted)'} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right: Secondary Actions (Chat, Favorites, Ads, Admin & User) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          
          {/* Quick Chat Shortcut */}
          <button
            onClick={() => handleNavClick('chat')}
            style={{
              position: 'relative',
              background: activeTab === 'chat' ? 'var(--primary-bg)' : 'transparent',
              border: activeTab === 'chat' ? '1px solid rgba(37, 99, 235, 0.2)' : '1px solid transparent',
              borderRadius: 'var(--radius-sm)',
              padding: '6px 9px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: activeTab === 'chat' ? 'var(--primary-color)' : 'var(--text-muted)',
              fontSize: '12px',
              fontWeight: 600,
              transition: 'all 0.15s ease'
            }}
            title="Mensagens & Chat em Tempo Real"
          >
            <MessageSquare size={15} />
            <span className="desktop-label">Chat</span>
            {unreadMessagesCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '4px',
                right: '4px',
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                background: 'var(--accent-color)'
              }} />
            )}
          </button>

          {/* Favorites Shortcut */}
          <button
            onClick={() => handleNavClick('favorites')}
            style={{
              background: activeTab === 'favorites' ? 'rgba(234, 88, 12, 0.08)' : 'transparent',
              border: activeTab === 'favorites' ? '1px solid rgba(234, 88, 12, 0.2)' : '1px solid transparent',
              borderRadius: 'var(--radius-sm)',
              padding: '6px 9px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: activeTab === 'favorites' ? 'var(--accent-color)' : 'var(--text-muted)',
              fontSize: '12px',
              fontWeight: 600,
              transition: 'all 0.15s ease'
            }}
            title="Itens e Obras Salvas"
          >
            <Heart size={15} />
            <span className="desktop-label">Salvos</span>
          </button>

          {/* ALICERCE Ads Pill */}
          <button
            onClick={() => handleNavClick('ads')}
            style={{
              background: activeTab === 'ads' ? 'var(--primary-color)' : 'var(--primary-bg)',
              color: activeTab === 'ads' ? '#FFFFFF' : 'var(--primary-color)',
              border: '1px solid rgba(37, 99, 235, 0.2)',
              borderRadius: 'var(--radius-full)',
              padding: '5px 12px',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '11.5px',
              fontWeight: 700,
              transition: 'all 0.15s ease'
            }}
          >
            <Megaphone size={13} />
            <span>Anunciar</span>
          </button>

          {/* Admin Panel Button (Exclusive for Admin) */}
          {isAdmin && (
            <button
              onClick={() => handleNavClick('admin')}
              style={{
                background: activeTab === 'admin' ? '#DC2626' : 'rgba(239, 68, 68, 0.08)',
                color: activeTab === 'admin' ? '#FFFFFF' : '#DC2626',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                borderRadius: 'var(--radius-full)',
                padding: '5px 12px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                fontSize: '11.5px',
                fontWeight: 700,
                transition: 'all 0.15s ease'
              }}
            >
              <ShieldAlert size={13} />
              <span>Admin</span>
            </button>
          )}

          {/* Divider */}
          <div style={{ width: '1px', height: '22px', background: 'var(--border-color)', margin: '0 2px' }} />

          {/* User Account Menu / Auth */}
          {isGuest ? (
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <button 
                onClick={() => onOpenAuth('login')}
                className="btn ghost" 
                style={{ padding: '6px 12px', fontSize: '12px' }}
              >
                Entrar
              </button>
              <button 
                onClick={() => onOpenAuth('register')}
                className="btn primary" 
                style={{ padding: '6px 14px', fontSize: '12px' }}
              >
                Cadastrar
              </button>
            </div>
          ) : (
            <div style={{ position: 'relative' }}>
              <button 
                onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                style={{
                  background: '#FFFFFF',
                  border: '1px solid var(--border-color)',
                  padding: '4px 10px 4px 6px',
                  borderRadius: 'var(--radius-full)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  boxShadow: '0 1px 2px rgba(15, 23, 42, 0.05)',
                  transition: 'border-color 0.15s ease'
                }}
              >
                <div style={{ position: 'relative' }}>
                  <img 
                    src={currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'} 
                    alt={currentUser.name} 
                    style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }} 
                  />
                  <span style={{ position: 'absolute', bottom: 0, right: 0, width: '8px', height: '8px', borderRadius: '50%', background: '#10B981', border: '1.5px solid #FFF' }}></span>
                </div>
                
                <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
                  <div style={{ fontWeight: 700, fontSize: '12px', color: 'var(--text-heading)' }}>
                    {currentUser.name.split(' ')[0]}
                  </div>
                  <div style={{ fontSize: '10px', color: isAdmin ? '#DC2626' : 'var(--primary-color)', fontWeight: 600 }}>
                    {isAdmin ? 'ADMIN GERAL' : currentUser.role.replace('_', ' ').toUpperCase()}
                  </div>
                </div>

                <ChevronDown size={13} color="var(--text-muted)" />
              </button>

              {/* User Dropdown Menu */}
              {roleDropdownOpen && (
                <div style={{
                  position: 'absolute',
                  right: 0,
                  top: '46px',
                  width: '270px',
                  background: '#FFFFFF',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '8px',
                  boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.12), 0 8px 10px -6px rgba(15, 23, 42, 0.04)',
                  zIndex: 110
                }}>
                  
                  {/* Current user header */}
                  <div style={{ padding: '10px 12px', borderBottom: '1px solid var(--border-color)', marginBottom: '8px' }}>
                    <div style={{ fontWeight: 800, fontSize: '13.5px', color: 'var(--text-heading)' }}>{currentUser.name}</div>
                    <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>{currentUser.email}</div>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '10.5px', color: '#059669', background: 'rgba(16, 185, 129, 0.1)', padding: '2px 6px', borderRadius: '4px', marginTop: '6px', fontWeight: 600 }}>
                      <ShieldCheck size={12} /> {currentUser.creaCauNumber || currentUser.cnpjNumber || (isAdmin ? 'Acesso Master Root' : 'Conta Verificada')}
                    </div>
                  </div>

                  <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', padding: '4px 8px', letterSpacing: '0.04em' }}>
                    Alternar Tipo de Perfil:
                  </div>
                  
                  {rolesList.map(item => (
                    <button
                      key={item.role}
                      onClick={() => {
                        onSwitchRole(item.role);
                        setRoleDropdownOpen(false);
                      }}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '6px 10px',
                        background: currentUser.role === item.role ? 'var(--bg-subtle)' : 'transparent',
                        border: 'none',
                        borderRadius: 'var(--radius-sm)',
                        color: 'var(--text-heading)',
                        cursor: 'pointer',
                        display: 'block',
                        marginBottom: '2px',
                        transition: 'background 0.1s ease'
                      }}
                    >
                      <div style={{ fontWeight: 600, fontSize: '11.5px' }}>{item.label}</div>
                      <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{item.sub}</div>
                    </button>
                  ))}
                  
                  <div style={{ borderTop: '1px solid var(--border-color)', marginTop: '8px', paddingTop: '6px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <button 
                      onClick={() => { onOpenAuth('login'); setRoleDropdownOpen(false); }}
                      style={{ width: '100%', textAlign: 'left', padding: '6px 10px', background: 'transparent', border: 'none', color: 'var(--primary-color)', fontSize: '11.5px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}
                    >
                      <UserCheck size={13} /> Trocar de Conta (Login)
                    </button>
                    <button 
                      onClick={() => { onOpenLGPD(); setRoleDropdownOpen(false); }}
                      style={{ width: '100%', textAlign: 'left', padding: '6px 10px', background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '11.5px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <Lock size={13} /> Privacidade LGPD
                    </button>
                    <button 
                      onClick={() => { onLogout(); setRoleDropdownOpen(false); }}
                      style={{ width: '100%', textAlign: 'left', padding: '6px 10px', background: 'transparent', border: 'none', color: '#DC2626', fontSize: '11.5px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}
                    >
                      <LogOut size={13} /> Sair da Conta
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Mobile Menu Button */}
          <button 
            className="btn ghost mobile-nav-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{ padding: '6px 8px' }}
            aria-label="Abrir menu mobile"
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>

        </div>

      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div style={{ padding: '14px 18px', background: '#FFFFFF', borderTop: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {primaryNav.map(item => {
            const Icon = item.icon;
            return (
              <button 
                key={item.id} 
                className="btn ghost" 
                onClick={() => handleNavClick(item.id)}
                style={{ justifyContent: 'flex-start', padding: '10px 14px' }}
              >
                <Icon size={15} /> {item.label}
              </button>
            );
          })}
          <button 
            className="btn ghost" 
            onClick={() => handleNavClick('chat')}
            style={{ justifyContent: 'flex-start', padding: '10px 14px' }}
          >
            <MessageSquare size={15} /> Mensagens & Chat
          </button>
          <button 
            className="btn ghost" 
            onClick={() => handleNavClick('favorites')}
            style={{ justifyContent: 'flex-start', padding: '10px 14px' }}
          >
            <Heart size={15} /> Itens Salvos
          </button>
          <button 
            className="btn ghost" 
            onClick={() => handleNavClick('ads')}
            style={{ justifyContent: 'flex-start', padding: '10px 14px', color: 'var(--primary-color)' }}
          >
            <Megaphone size={15} /> ALICERCE Ads
          </button>

          {isAdmin && (
            <button 
              className="btn ghost" 
              onClick={() => handleNavClick('admin')}
              style={{ justifyContent: 'flex-start', padding: '10px 14px', color: '#DC2626' }}
            >
              <ShieldAlert size={15} /> Painel Administrativo
            </button>
          )}
          
          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '12px', marginTop: '6px', display: 'flex', gap: '8px' }}>
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
