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
  ShieldCheck
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
    { role: 'profissional_crea', label: 'Engenheiro Civil (CREA)', sub: 'CREA-SP 5069824/D' },
    { role: 'profissional_cau', label: 'Arquiteto & Urbanista (CAU)', sub: 'CAU A88291-0' },
    { role: 'empresa_cnpj', label: 'Construtora / Empreiteira', sub: '33.910.402/0001-12' },
    { role: 'fornecedor', label: 'Fornecedor de Materiais', sub: 'Polimix Concreto' },
    { role: 'cliente', label: 'Proprietário / Investidor', sub: 'Pessoa Física / Jurídica' },
    { role: 'admin', label: 'Administrador da Plataforma', sub: 'Painel de Moderação' },
  ];

  const handleNavClick = (tab: string) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  const isGuest = !currentUser || currentUser.id === 'usr_guest';

  const navItems = [
    { id: 'feed', label: 'Feed Técnico', icon: Rss },
    { id: 'directory', label: 'Catálogo', icon: Search },
    { id: 'opportunities', label: 'Demandas', icon: Briefcase },
    { id: 'quotes', label: 'Cotações', icon: Truck },
    { id: 'timeline', label: 'Diário de Obra', icon: HardHat },
    { id: 'chat', label: 'Mensagens', icon: MessageSquare, badge: unreadMessagesCount },
    { id: 'favorites', label: 'Salvos', icon: Heart },
    { id: 'ads', label: 'ALICERCE Ads', icon: Megaphone, highlight: true },
  ];

  return (
    <nav style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      background: 'rgba(255, 255, 255, 0.92)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      borderBottom: '1px solid rgba(226, 232, 240, 0.8)',
      boxShadow: '0 1px 3px 0 rgba(15, 23, 42, 0.03)'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 18px', height: '62px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        
        {/* Brand Monogram & Name */}
        <div 
          className="wordmark" 
          style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '9px' }} 
          onClick={() => handleNavClick('feed')}
        >
          <span className="mark"></span>
          <span style={{ fontSize: '18px', letterSpacing: '-0.03em', fontWeight: 800, color: '#0F172A' }}>
            ALICERCE
          </span>
        </div>

        {/* Navigation Tabs (Desktop) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }} className="desktop-nav">
          {navItems.map(item => {
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
                  borderRadius: '8px',
                  fontSize: '12.5px',
                  fontWeight: isActive ? 700 : 500,
                  cursor: 'pointer',
                  border: 'none',
                  background: isActive 
                    ? '#0F172A' 
                    : item.highlight 
                      ? '#EFF6FF' 
                      : 'transparent',
                  color: isActive 
                    ? '#FFFFFF' 
                    : item.highlight 
                      ? '#2563EB' 
                      : '#475569',
                  transition: 'all 0.15s ease',
                  position: 'relative'
                }}
              >
                <Icon size={14} color={isActive ? '#FFFFFF' : item.highlight ? '#2563EB' : '#64748B'} />
                <span>{item.label}</span>
                {Boolean(item.badge && item.badge > 0) && (
                  <span style={{ 
                    position: 'absolute', 
                    top: '4px', 
                    right: '4px', 
                    width: '6px', 
                    height: '6px', 
                    borderRadius: '50%', 
                    background: '#EA580C' 
                  }} />
                )}
              </button>
            );
          })}

          {currentUser && currentUser.role === 'admin' && (
            <button
              onClick={() => handleNavClick('admin')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '7px 11px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                border: '1px solid #FECACA',
                background: '#FEF2F2',
                color: '#DC2626',
              }}
            >
              <ShieldAlert size={13} /> Admin
            </button>
          )}
        </div>

        {/* User Account / Auth Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          
          {isGuest ? (
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <button 
                onClick={() => onOpenAuth('login')}
                className="btn ghost" 
                style={{ padding: '7px 14px', fontSize: '12px' }}
              >
                Entrar
              </button>
              <button 
                onClick={() => onOpenAuth('register')}
                className="btn primary" 
                style={{ padding: '7px 15px', fontSize: '12px' }}
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
                  padding: '5px 10px 5px 6px',
                  borderRadius: '9999px',
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
                  <div style={{ fontWeight: 700, fontSize: '12px', color: '#0F172A' }}>
                    {currentUser.name.split(' ')[0]}
                  </div>
                  <div style={{ fontSize: '10px', color: '#64748B' }}>
                    {currentUser.role.replace('_', ' ')}
                  </div>
                </div>

                <ChevronDown size={13} color="#94A3B8" />
              </button>

              {/* User Dropdown Menu */}
              {roleDropdownOpen && (
                <div style={{
                  position: 'absolute',
                  right: 0,
                  top: '44px',
                  width: '270px',
                  background: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: '12px',
                  padding: '8px',
                  boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.12), 0 8px 10px -6px rgba(15, 23, 42, 0.04)',
                  zIndex: 110
                }}>
                  
                  {/* Current user header */}
                  <div style={{ padding: '8px 10px', borderBottom: '1px solid #F1F5F9', marginBottom: '6px' }}>
                    <div style={{ fontWeight: 700, fontSize: '13px', color: '#0F172A' }}>{currentUser.name}</div>
                    <div style={{ fontSize: '11px', color: '#64748B' }}>{currentUser.email}</div>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '10.5px', color: '#059669', background: '#ECFDF5', padding: '2px 6px', borderRadius: '4px', marginTop: '4px', fontWeight: 600 }}>
                      <ShieldCheck size={11} /> {currentUser.creaCauNumber || currentUser.cnpjNumber || 'Conta Verificada'}
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
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>

        </div>

      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div style={{ padding: '12px 16px', background: '#FFFFFF', borderTop: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {navItems.map(item => {
            const Icon = item.icon;
            return (
              <button 
                key={item.id} 
                className="btn ghost" 
                onClick={() => handleNavClick(item.id)}
                style={{ justifyContent: 'flex-start', padding: '10px 14px' }}
              >
                <Icon size={14} /> {item.label}
              </button>
            );
          })}
          
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
    </nav>
  );
};
