import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Compass,
  SlidersHorizontal,
  Briefcase,
  MessageSquare,
  Heart,
  ShieldAlert,
  Lock,
  Menu,
  X,
  ChevronDown,
  LogOut,
  ShieldCheck,
  ClipboardList,
  UserCog,
  Scale,
} from 'lucide-react';
import { UserProfile } from '../types';
import { BallastLogo } from './BallastLogo';

interface NavbarProps {
  currentUser: UserProfile;
  activeTab: string;
  onNavigate: (tab: string) => void;
  onOpenAuth: (mode?: 'login' | 'register', presetRole?: 'cliente' | 'profissional_cau') => void;
  onOpenLGPD: () => void;
  onOpenProfileEditor: () => void;
  onOpenCompare: () => void;
  onLogout: () => void;
  unreadMessagesCount: number;
  compareCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  activeTab,
  onNavigate,
  onOpenAuth,
  onOpenLGPD,
  onOpenProfileEditor,
  onOpenCompare,
  onLogout,
  unreadMessagesCount,
  compareCount,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onOutsideClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setAccountMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', onOutsideClick);
    return () => document.removeEventListener('mousedown', onOutsideClick);
  }, []);

  const handleNavClick = (tab: string) => {
    onNavigate(tab);
    setMobileMenuOpen(false);
    setAccountMenuOpen(false);
  };

  const isGuest = !currentUser || currentUser.id === 'usr_guest';
  const isAdmin = !isGuest && currentUser.role === 'admin';
  const isProfessional =
    !isGuest && ['profissional', 'profissional_cau', 'profissional_crea'].includes(currentUser.role);

  const primaryNav = [
    { id: 'directory', label: 'Arquitetos', icon: Search },
    { id: 'feed', label: 'Projetos', icon: Compass },
    { id: 'briefing', label: 'Briefing', icon: SlidersHorizontal },
    { id: 'opportunities', label: 'Demandas', icon: Briefcase },
    ...(!isGuest ? [{ id: 'checklist', label: 'Obra', icon: ClipboardList }] : []),
  ];

  const initials = (currentUser?.name || 'B')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join('');

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: 'rgba(255, 255, 255, 0.96)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid var(--border-color)',
      }}
    >
      <div
        className="ballast-container"
        style={{
          height: '66px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
        }}
      >
        {/* Brand Mark */}
        <button
          type="button"
          onClick={() => handleNavClick('landing')}
          style={{
            background: 'none',
            border: 'none',
            padding: 0,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            flexShrink: 0,
          }}
          aria-label="Ballast Architecture — Ir para a página inicial"
        >
          <BallastLogo variant="horizontal" surface="light" size={24} />
        </button>

        {/* Primary Desktop Navigation */}
        <nav className="desktop-nav" aria-label="Navegação principal" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {primaryNav.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id || (item.id === 'directory' && activeTab === 'architect');
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item.id)}
                aria-current={isActive ? 'page' : undefined}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '7px',
                  padding: '8px 13px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '13.5px',
                  fontWeight: isActive ? 600 : 500,
                  cursor: 'pointer',
                  border: 'none',
                  background: isActive ? 'var(--azul-lastro-soft)' : 'transparent',
                  color: isActive ? 'var(--azul-lastro)' : 'var(--grafite)',
                  transition: 'background-color 0.15s ease, color 0.15s ease',
                  whiteSpace: 'nowrap',
                }}
              >
                <Icon size={15} aria-hidden="true" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          {compareCount > 0 && (
            <button
              type="button"
              onClick={onOpenCompare}
              className="btn ghost"
              style={{ padding: '6px 11px', minHeight: '36px', fontSize: '12.5px' }}
              title="Comparar arquitetos selecionados"
            >
              <Scale size={14} />
              <span className="desktop-label">Comparar</span>
              <span
                style={{
                  background: 'var(--azul-lastro)',
                  color: '#FFFFFF',
                  borderRadius: '999px',
                  padding: '1px 6px',
                  fontSize: '11px',
                  fontWeight: 700,
                }}
              >
                {compareCount}
              </span>
            </button>
          )}

          {!isGuest && (
            <button
              type="button"
              onClick={() => handleNavClick('chat')}
              style={{
                position: 'relative',
                background: activeTab === 'chat' ? 'var(--azul-lastro-soft)' : 'transparent',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                padding: '8px 10px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                color: activeTab === 'chat' ? 'var(--azul-lastro)' : 'var(--grafite)',
                fontSize: '13px',
                fontWeight: 500,
              }}
              aria-label={`Mensagens${unreadMessagesCount > 0 ? ` (${unreadMessagesCount} não lidas)` : ''}`}
            >
              <MessageSquare size={16} aria-hidden="true" />
              <span className="desktop-label">Chat</span>
              {unreadMessagesCount > 0 && (
                <span
                  style={{
                    background: 'var(--azul-lastro)',
                    color: '#FFFFFF',
                    borderRadius: '999px',
                    padding: '1px 6px',
                    fontSize: '10.5px',
                    fontWeight: 700,
                  }}
                >
                  {unreadMessagesCount}
                </span>
              )}
            </button>
          )}

          <button
            type="button"
            onClick={() => handleNavClick('favorites')}
            style={{
              background: activeTab === 'favorites' ? 'var(--azul-lastro-soft)' : 'transparent',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              padding: '8px 10px',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              color: activeTab === 'favorites' ? 'var(--azul-lastro)' : 'var(--grafite)',
              fontSize: '13px',
              fontWeight: 500,
            }}
            aria-label="Salvos"
          >
            <Heart size={16} aria-hidden="true" />
            <span className="desktop-label">Salvos</span>
          </button>

          {isAdmin && (
            <button
              type="button"
              onClick={() => handleNavClick('admin')}
              className="btn ghost"
              style={{
                padding: '6px 11px',
                minHeight: '36px',
                fontSize: '12.5px',
                borderColor: activeTab === 'admin' ? 'var(--azul-lastro)' : '#FECDCA',
                color: activeTab === 'admin' ? 'var(--azul-lastro)' : 'var(--color-danger)',
              }}
            >
              <ShieldAlert size={14} />
              <span className="desktop-label">Admin</span>
            </button>
          )}

          {/* Account Menu / Auth CTAs */}
          {isGuest ? (
            <div className="desktop-nav" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <button
                type="button"
                onClick={() => onOpenAuth('register', 'profissional_cau')}
                className="btn ghost"
                style={{ padding: '7px 13px', minHeight: '36px', fontSize: '12.5px' }}
              >
                Sou arquiteto
              </button>
              <button
                type="button"
                onClick={() => onOpenAuth('login')}
                className="btn primary"
                style={{ padding: '7px 15px', minHeight: '36px', fontSize: '12.5px' }}
              >
                Entrar
              </button>
            </div>
          ) : (
            <div ref={menuRef} style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={() => setAccountMenuOpen((o) => !o)}
                aria-expanded={accountMenuOpen}
                aria-haspopup="menu"
                style={{
                  background: 'var(--branco)',
                  border: '1px solid var(--border-color)',
                  padding: '4px 10px 4px 5px',
                  borderRadius: '999px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  minHeight: '38px',
                }}
              >
                {currentUser.avatar ? (
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }}
                  />
                ) : (
                  <span
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      background: 'var(--azul-lastro)',
                      color: '#FFFFFF',
                      fontSize: '11px',
                      fontWeight: 700,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {initials}
                  </span>
                )}
                <span
                  className="desktop-label"
                  style={{
                    fontWeight: 600,
                    fontSize: '13px',
                    color: 'var(--grafite)',
                    maxWidth: '110px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {currentUser.name.split(' ')[0]}
                </span>
                <ChevronDown size={14} color="#546168" />
              </button>

              {accountMenuOpen && (
                <div
                  role="menu"
                  style={{
                    position: 'absolute',
                    right: 0,
                    top: '46px',
                    width: '260px',
                    background: 'var(--branco)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    padding: '10px',
                    boxShadow: 'var(--shadow-lg)',
                    zIndex: 120,
                  }}
                >
                  <div style={{ padding: '8px 10px 10px', borderBottom: '1px solid var(--border-color)', marginBottom: '8px' }}>
                    <div style={{ fontWeight: 700, fontSize: '13.5px', color: 'var(--grafite)' }}>{currentUser.name}</div>
                    <div style={{ fontSize: '12px', color: 'var(--steel)', wordBreak: 'break-all' }}>{currentUser.email}</div>
                    <div style={{ marginTop: '6px' }}>
                      {currentUser.verified ? (
                        <span className="badge verified">
                          <ShieldCheck size={12} /> Profissional verificado
                        </span>
                      ) : currentUser.creaCauNumber ? (
                        <span className="badge declared">Registro declarado · Em validação</span>
                      ) : (
                        <span className="badge">{isAdmin ? 'Administração' : isProfessional ? 'Perfil profissional' : 'Conta cliente'}</span>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setAccountMenuOpen(false);
                      onOpenProfileEditor();
                    }}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '8px 10px',
                      background: 'transparent',
                      border: 'none',
                      borderRadius: 'var(--radius-xs)',
                      color: 'var(--grafite)',
                      fontSize: '13px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontWeight: 500,
                    }}
                  >
                    <UserCog size={14} /> {isProfessional ? 'Perfil e Portfólio' : 'Meu Perfil'}
                  </button>

                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setAccountMenuOpen(false);
                      onOpenLGPD();
                    }}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '8px 10px',
                      background: 'transparent',
                      border: 'none',
                      borderRadius: 'var(--radius-xs)',
                      color: 'var(--grafite)',
                      fontSize: '13px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontWeight: 500,
                    }}
                  >
                    <Lock size={14} /> Privacidade e LGPD
                  </button>

                  <div style={{ borderTop: '1px solid var(--border-color)', marginTop: '6px', paddingTop: '6px' }}>
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setAccountMenuOpen(false);
                        onLogout();
                      }}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '8px 10px',
                        background: 'transparent',
                        border: 'none',
                        borderRadius: 'var(--radius-xs)',
                        color: 'var(--color-danger)',
                        fontSize: '13px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontWeight: 600,
                      }}
                    >
                      <LogOut size={14} /> Sair da conta
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            className="btn ghost mobile-nav-toggle"
            onClick={() => setMobileMenuOpen((o) => !o)}
            style={{ padding: '7px 9px', minHeight: '38px' }}
            aria-label={mobileMenuOpen ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <nav
          aria-label="Menu mobile"
          style={{
            padding: '14px 16px 18px',
            background: 'var(--branco)',
            borderTop: '1px solid var(--border-color)',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
          }}
        >
          {primaryNav.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                className="btn ghost"
                onClick={() => handleNavClick(item.id)}
                style={{ justifyContent: 'flex-start', width: '100%' }}
              >
                <Icon size={15} /> {item.label}
              </button>
            );
          })}
          {!isGuest && (
            <button
              type="button"
              className="btn ghost"
              onClick={() => handleNavClick('chat')}
              style={{ justifyContent: 'flex-start', width: '100%' }}
            >
              <MessageSquare size={15} /> Mensagens {unreadMessagesCount > 0 ? `(${unreadMessagesCount})` : ''}
            </button>
          )}
          <button
            type="button"
            className="btn ghost"
            onClick={() => handleNavClick('favorites')}
            style={{ justifyContent: 'flex-start', width: '100%' }}
          >
            <Heart size={15} /> Salvos e Comparação
          </button>

          {isAdmin && (
            <button
              type="button"
              className="btn ghost"
              onClick={() => handleNavClick('admin')}
              style={{ justifyContent: 'flex-start', width: '100%', color: 'var(--color-danger)' }}
            >
              <ShieldAlert size={15} /> Painel Administrativo
            </button>
          )}

          {isGuest && (
            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '12px', marginTop: '6px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button
                type="button"
                className="btn primary"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAuth('login');
                }}
                style={{ width: '100%' }}
              >
                Entrar
              </button>
              <button
                type="button"
                className="btn ghost"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAuth('register', 'profissional_cau');
                }}
                style={{ width: '100%' }}
              >
                Sou arquiteto — Cadastrar perfil
              </button>
            </div>
          )}
        </nav>
      )}
    </header>
  );
};
