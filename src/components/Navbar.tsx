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

  // Primary navigation tabs
  const primaryNav = [
    { id: 'feed', label: 'Feed', icon: Rss },
    { id: 'directory', label: 'Catálogo', icon: Search },
    { id: 'opportunities', label: 'Demandas', icon: Briefcase },
    { id: 'quotes', label: 'Cotações', icon: Truck },
    { id: 'timeline', label: 'Diário', icon: HardHat },
  ];

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      background: '#FFFFFF',
      borderBottom: '1px solid #E2E8F0',
      boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)'
    }}>
      <div style={{ 
        maxWidth: '1240px', 
        margin: '0 auto', 
        padding: '0 20px', 
        height: '58px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        gap: '20px'
      }}>
        
        {/* Left: Brand Monogram & Name */}
        <div 
          style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '9px', flexShrink: 0 }} 
          onClick={() => handleNavClick('feed')}
        >
          <div style={{
            width: '28px',
            height: '28px',
            background: '#2563EB',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            fontWeight: 900,
            fontSize: '15px',
            letterSpacing: '-0.02em',
            boxShadow: '0 2px 4px rgba(37, 99, 235, 0.2)'
          }}>
            A
          </div>
          <span style={{ fontSize: '16px', letterSpacing: '-0.02em', fontWeight: 800, color: '#0F172A' }}>
            ALICERCE
          </span>
        </div>

        {/* Center: Primary Navigation Tabs (Desktop) */}
        <nav style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '2px',
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
                  padding: '7px 12px',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: isActive ? 600 : 500,
                  cursor: 'pointer',
                  border: 'none',
                  background: isActive ? '#F1F5F9' : 'transparent',
                  color: isActive ? '#0F172A' : '#64748B',
                  transition: 'all 0.15s ease',
                  whiteSpace: 'nowrap'
                }}
              >
                <Icon size={14} color={isActive ? '#2563EB' : '#64748B'} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right: Secondary Actions (Chat, Favorites, Ads, Admin & User) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          
          {/* Quick Chat Shortcut */}
          <button
            onClick={() => handleNavClick('chat')}
            style={{
              position: 'relative',
              background: activeTab === 'chat' ? '#EFF6FF' : 'transparent',
              border: 'none',
              borderRadius: '6px',
              padding: '7px 10px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: activeTab === 'chat' ? '#2563EB' : '#64748B',
              fontSize: '12.5px',
              fontWeight: 500,
              transition: 'all 0.15s ease'
            }}
            title="Mensagens & Chat em Tempo Real"
          >
            <MessageSquare size={15} color={activeTab === 'chat' ? '#2563EB' : '#64748B'} />
            <span className="desktop-label">Chat</span>
            {unreadMessagesCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '5px',
                right: '5px',
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: '#EA580C'
              }} />
            )}
          </button>

          {/* Favorites Shortcut */}
          <button
            onClick={() => handleNavClick('favorites')}
            style={{
              background: activeTab === 'favorites' ? '#FFF7ED' : 'transparent',
              border: 'none',
              borderRadius: '6px',
              padding: '7px 10px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: activeTab === 'favorites' ? '#EA580C' : '#64748B',
              fontSize: '12.5px',
              fontWeight: 500,
              transition: 'all 0.15s ease'
            }}
            title="Itens Salvos"
          >
            <Heart size={15} color={activeTab === 'favorites' ? '#EA580C' : '#64748B'} />
            <span className="desktop-label">Salvos</span>
          </button>

          {/* ALICERCE Ads Pill */}
          <button
            onClick={() => handleNavClick('ads')}
            style={{
              background: activeTab === 'ads' ? '#2563EB' : '#EFF6FF',
              color: activeTab === 'ads' ? '#FFFFFF' : '#2563EB',
              border: '1px solid rgba(37, 99, 235, 0.15)',
              borderRadius: '6px',
              padding: '6px 12px',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12px',
              fontWeight: 600,
              transition: 'all 0.15s ease',
              whiteSpace: 'nowrap'
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
                background: activeTab === 'admin' ? '#DC2626' : '#FEF2F2',
                color: activeTab === 'admin' ? '#FFFFFF' : '#DC2626',
                border: '1px solid #FECACA',
                borderRadius: '6px',
                padding: '6px 11px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                fontSize: '12px',
                fontWeight: 600,
                transition: 'all 0.15s ease',
                whiteSpace: 'nowrap'
              }}
            >
              <ShieldAlert size={13} />
              <span>Admin</span>
            </button>
          )}

          {/* Divider */}
          <div style={{ width: '1px', height: '20px', background: '#E2E8F0', margin: '0 4px' }} />

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
                  border: '1px solid #E2E8F0',
                  padding: '4px 8px 4px 5px',
                  borderRadius: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '7px',
                  cursor: 'pointer',
                  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
                  transition: 'border-color 0.15s ease'
                }}
              >
                <div style={{ position: 'relative' }}>
                  <img 
                    src={currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'} 
                    alt={currentUser.name} 
                    style={{ width: '26px', height: '26px', borderRadius: '50%', objectFit: 'cover' }} 
                  />
                  <span style={{ position: 'absolute', bottom: 0, right: 0, width: '7px', height: '7px', borderRadius: '50%', background: '#10B981', border: '1.5px solid #FFF' }}></span>
                </div>
                
                <span style={{ fontWeight: 600, fontSize: '12px', color: '#0F172A', maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {currentUser.name.split(' ')[0]}
                </span>

                <ChevronDown size={13} color="#94A3B8" />
              </button>

              {/* User Dropdown Menu */}
              {roleDropdownOpen && (
                <div style={{
                  position: 'absolute',
                  right: 0,
                  top: '42px',
                  width: '260px',
                  background: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: '10px',
                  padding: '8px',
                  boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.12), 0 8px 10px -6px rgba(15, 23, 42, 0.04)',
                  zIndex: 110
                }}>
                  
                  {/* Current user header */}
                  <div style={{ padding: '8px 10px', borderBottom: '1px solid #F1F5F9', marginBottom: '6px' }}>
                    <div style={{ fontWeight: 700, fontSize: '13px', color: '#0F172A' }}>{currentUser.name}</div>
                    <div style={{ fontSize: '11px', color: '#64748B' }}>{currentUser.email}</div>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '10px', color: '#059669', background: '#ECFDF5', padding: '2px 6px', borderRadius: '4px', marginTop: '4px', fontWeight: 600 }}>
                      <ShieldCheck size={11} /> {currentUser.creaCauNumber || currentUser.cnpjNumber || (isAdmin ? 'Admin Master' : 'Conta Verificada')}
                    </div>
                  </div>

                  <div style={{ fontSize: '10px', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase', padding: '4px 8px', letterSpacing: '0.04em' }}>
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
                        background: currentUser.role === item.role ? '#F1F5F9' : 'transparent',
                        border: 'none',
                        borderRadius: '6px',
                        color: '#0F172A',
                        cursor: 'pointer',
                        display: 'block',
                        marginBottom: '2px',
                        transition: 'background 0.1s ease'
                      }}
                    >
                      <div style={{ fontWeight: 600, fontSize: '11.5px' }}>{item.label}</div>
                      <div style={{ fontSize: '10px', color: '#64748B' }}>{item.sub}</div>
                    </button>
                  ))}
                  
                  <div style={{ borderTop: '1px solid #F1F5F9', marginTop: '6px', paddingTop: '6px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <button 
                      onClick={() => { onOpenAuth('login'); setRoleDropdownOpen(false); }}
                      style={{ width: '100%', textAlign: 'left', padding: '6px 10px', background: 'transparent', border: 'none', color: '#2563EB', fontSize: '11.5px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}
                    >
                      <UserCheck size={13} /> Trocar de Conta (Login)
                    </button>
                    <button 
                      onClick={() => { onOpenLGPD(); setRoleDropdownOpen(false); }}
                      style={{ width: '100%', textAlign: 'left', padding: '6px 10px', background: 'transparent', border: 'none', color: '#64748B', fontSize: '11.5px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
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
        <div style={{ padding: '12px 16px', background: '#FFFFFF', borderTop: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {primaryNav.map(item => {
            const Icon = item.icon;
            return (
              <button 
                key={item.id} 
                className="btn ghost" 
                onClick={() => handleNavClick(item.id)}
                style={{ justifyContent: 'flex-start', padding: '9px 12px', fontSize: '13px' }}
              >
                <Icon size={15} /> {item.label}
              </button>
            );
          })}
          <button 
            className="btn ghost" 
            onClick={() => handleNavClick('chat')}
            style={{ justifyContent: 'flex-start', padding: '9px 12px', fontSize: '13px' }}
          >
            <MessageSquare size={15} /> Mensagens & Chat
          </button>
          <button 
            className="btn ghost" 
            onClick={() => handleNavClick('favorites')}
            style={{ justifyContent: 'flex-start', padding: '9px 12px', fontSize: '13px' }}
          >
            <Heart size={15} /> Itens Salvos
          </button>
          <button 
            className="btn ghost" 
            onClick={() => handleNavClick('ads')}
            style={{ justifyContent: 'flex-start', padding: '9px 12px', color: '#2563EB', fontSize: '13px' }}
          >
            <Megaphone size={15} /> ALICERCE Ads
          </button>

          {isAdmin && (
            <button 
              className="btn ghost" 
              onClick={() => handleNavClick('admin')}
              style={{ justifyContent: 'flex-start', padding: '9px 12px', color: '#DC2626', fontSize: '13px' }}
            >
              <ShieldAlert size={15} /> Painel Administrativo
            </button>
          )}
          
          <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '10px', marginTop: '6px', display: 'flex', gap: '8px' }}>
            <button className="btn primary" onClick={() => { onOpenAuth('login'); setMobileMenuOpen(false); }} style={{ flex: 1 }}>
              Entrar
            </button>
            <button className="btn ghost" onClick={() => { onOpenAuth('register'); setMobileMenuOpen(false); }} style={{ flex: 1 }}>
              Cadastrar
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
