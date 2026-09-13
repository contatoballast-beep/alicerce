import React from 'react';
import {
  Building2,
  Users,
  Briefcase,
  MessageSquare,
  ClipboardList,
  Truck,
  Star,
  ArrowRight,
  CheckCircle2,
  HardHat,
  ShieldCheck,
  Rss,
} from 'lucide-react';

interface LandingPageProps {
  onOpenAuth: (mode: 'login' | 'register') => void;
  onEnterApp: () => void;
}

const features = [
  {
    icon: Rss,
    color: '#2563EB',
    bg: '#EFF6FF',
    title: 'Feed de Obras',
    desc: 'Acompanhe publicações técnicas, avanços de obras e chancelas de profissionais verificados.',
  },
  {
    icon: Briefcase,
    color: '#7C3AED',
    bg: '#F5F3FF',
    title: 'Demandas & Propostas',
    desc: 'Publique ou encontre demandas de obras, envie propostas técnicas e orçamentárias.',
  },
  {
    icon: Truck,
    color: '#EA580C',
    bg: '#FFF7ED',
    title: 'Cotações de Materiais',
    desc: 'Solicite cotações diretamente a fornecedores e compare preços em tempo real.',
  },
  {
    icon: MessageSquare,
    color: '#059669',
    bg: '#ECFDF5',
    title: 'Chat em Tempo Real',
    desc: 'Converse com engenheiros, arquitetos e fornecedores diretamente pela plataforma.',
  },
  {
    icon: ClipboardList,
    color: '#EA580C',
    bg: '#FFF7ED',
    title: 'Checklist de Obra',
    desc: 'Acompanhe visualmente o progresso da sua construção com a casa que vai sendo pintada.',
  },
  {
    icon: Users,
    color: '#0891B2',
    bg: '#ECFEFF',
    title: 'Catálogo de Profissionais',
    desc: 'Encontre engenheiros, arquitetos, construtoras e fornecedores verificados na sua região.',
  },
];

const stats = [
  { value: '4.800+', label: 'Profissionais verificados' },
  { value: '1.200+', label: 'Obras publicadas' },
  { value: 'R$ 380M+', label: 'Em contratos intermediados' },
  { value: '98%', label: 'Satisfação dos usuários' },
];

const roles = [
  { icon: '👷', label: 'Engenheiros Civil (CREA)' },
  { icon: '🏛️', label: 'Arquitetos & Urbanistas (CAU)' },
  { icon: '🏗️', label: 'Construtoras & Empreiteiras' },
  { icon: '🚛', label: 'Fornecedores de Materiais' },
  { icon: '🏠', label: 'Proprietários & Investidores' },
];

export const LandingPage: React.FC<LandingPageProps> = ({ onOpenAuth, onEnterApp }) => {
  return (
    <div style={{ fontFamily: 'var(--font-body)', color: 'var(--ink)', overflowX: 'hidden' }}>

      {/* ── TOP NAVBAR ── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border-color)',
        padding: '0 24px',
        height: 58,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <div style={{
            width: 28, height: 28, background: '#2563EB', borderRadius: 6,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 900, fontSize: 15, letterSpacing: '-0.02em',
            boxShadow: '0 2px 4px rgba(37,99,235,0.2)',
          }}>A</div>
          <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--ink)', letterSpacing: '-0.02em' }}>
            ALICERCE
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            id="landing-btn-entrar"
            onClick={() => onOpenAuth('login')}
            style={{
              background: 'transparent', border: '1.5px solid var(--border-color)',
              borderRadius: 7, padding: '7px 16px', fontWeight: 600, fontSize: 13,
              cursor: 'pointer', color: 'var(--ink)', fontFamily: 'var(--font-body)',
              transition: 'border-color 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--accent)')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border-color)')}
          >
            Entrar
          </button>
          <button
            id="landing-btn-criar-conta"
            onClick={() => onOpenAuth('register')}
            style={{
              background: 'var(--accent)', color: '#fff',
              border: 'none', borderRadius: 7, padding: '7px 16px',
              fontWeight: 700, fontSize: 13, cursor: 'pointer',
              fontFamily: 'var(--font-body)',
              boxShadow: '0 2px 8px rgba(37,99,235,0.3)',
              transition: 'background 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-primary-hover)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'var(--accent)')}
          >
            Criar conta
          </button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{
        background: 'linear-gradient(135deg, #0F172A 0%, #1E3A8A 50%, #1E40AF 100%)',
        minHeight: '88vh',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '80px 24px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Background grid */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }} />
        {/* Glow orb */}
        <div style={{
          position: 'absolute', top: '10%', right: '5%',
          width: 500, height: 500, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(37,99,235,0.3) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }} />
        <div style={{
          position: 'absolute', bottom: '-10%', left: '-5%',
          width: 400, height: 400, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(234,88,12,0.2) 0%, transparent 70%)',
          filter: 'blur(50px)',
        }} />

        <div style={{ maxWidth: 760, textAlign: 'center', position: 'relative', zIndex: 1 }}>
          {/* Badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(37,99,235,0.2)', border: '1px solid rgba(37,99,235,0.4)',
            borderRadius: 999, padding: '6px 16px', marginBottom: 28,
          }}>
            <ShieldCheck size={14} color="#60A5FA" />
            <span style={{ fontSize: 12, fontWeight: 700, color: '#93C5FD', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              Plataforma verificada para profissionais
            </span>
          </div>

          {/* Headline */}
          <h1 style={{
            fontSize: 'clamp(36px, 7vw, 68px)',
            fontWeight: 900, color: '#FFFFFF',
            lineHeight: 1.08, marginBottom: 20,
            fontFamily: 'var(--font-display)',
            letterSpacing: '-0.03em',
          }}>
            O ecossistema digital<br />
            <span style={{
              background: 'linear-gradient(90deg, #60A5FA, #EA580C)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              da construção civil.
            </span>
          </h1>

          <p style={{
            fontSize: 'clamp(15px, 2.5vw, 19px)',
            color: '#94A3B8', lineHeight: 1.65,
            marginBottom: 40, maxWidth: 560, margin: '0 auto 40px',
          }}>
            Conecte engenheiros, arquitetos, construtoras e fornecedores.
            Gerencie obras, demandas e cotações em um só lugar.
          </p>

          {/* CTA Buttons */}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              id="landing-hero-criar-conta"
              onClick={() => onOpenAuth('register')}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 10,
                background: '#EA580C', color: '#fff',
                border: 'none', borderRadius: 10, padding: '14px 28px',
                fontWeight: 800, fontSize: 15, cursor: 'pointer',
                fontFamily: 'var(--font-body)',
                boxShadow: '0 4px 20px rgba(234,88,12,0.4)',
                transition: 'transform 0.15s, box-shadow 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(234,88,12,0.5)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(234,88,12,0.4)'; }}
            >
              Criar conta grátis
              <ArrowRight size={16} />
            </button>
            <button
              id="landing-hero-ver-forum"
              onClick={onEnterApp}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: 'rgba(255,255,255,0.08)', color: '#E2E8F0',
                border: '1.5px solid rgba(255,255,255,0.15)',
                borderRadius: 10, padding: '14px 28px',
                fontWeight: 600, fontSize: 15, cursor: 'pointer',
                fontFamily: 'var(--font-body)',
                transition: 'background 0.2s, border-color 0.2s',
                backdropFilter: 'blur(4px)',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.14)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
            >
              <Rss size={15} />
              Ver o fórum
            </button>
          </div>

          {/* Social proof */}
          <div style={{ marginTop: 48, display: 'flex', gap: 32, justifyContent: 'center', flexWrap: 'wrap' }}>
            {stats.map(s => (
              <div key={s.label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 26, fontWeight: 900, color: '#fff', lineHeight: 1, marginBottom: 4, fontFamily: 'var(--font-display)' }}>
                  {s.value}
                </div>
                <div style={{ fontSize: 12, color: '#64748B', fontWeight: 500 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHO IS IT FOR ── */}
      <section style={{ background: '#fff', padding: '72px 24px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-accent)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>
            Para quem é
          </p>
          <h2 style={{ fontSize: 'clamp(24px, 4vw, 38px)', fontWeight: 800, color: 'var(--ink)', marginBottom: 40, letterSpacing: '-0.02em' }}>
            Feito para quem constrói o Brasil
          </h2>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            {roles.map(r => (
              <div key={r.label} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                background: 'var(--paper)', borderRadius: 999,
                padding: '10px 20px', border: '1.5px solid var(--border-color)',
                fontSize: 14, fontWeight: 600, color: 'var(--graphite)',
              }}>
                <span style={{ fontSize: 18 }}>{r.icon}</span>
                {r.label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES GRID ── */}
      <section style={{ background: 'var(--canvas)', padding: '72px 24px' }}>
        <div style={{ maxWidth: 1060, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>
              Funcionalidades
            </p>
            <h2 style={{ fontSize: 'clamp(24px, 4vw, 38px)', fontWeight: 800, color: 'var(--ink)', letterSpacing: '-0.02em' }}>
              Tudo que sua obra precisa
            </h2>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: 20,
          }}>
            {features.map(f => {
              const Icon = f.icon;
              return (
                <div key={f.title} style={{
                  background: '#fff',
                  borderRadius: 14,
                  border: '1px solid var(--border-color)',
                  padding: '24px',
                  boxShadow: 'var(--shadow-sm)',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  cursor: 'default',
                }}
                  onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)'; (e.currentTarget as HTMLDivElement).style.boxShadow = 'var(--shadow-lg)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLDivElement).style.boxShadow = 'var(--shadow-sm)'; }}
                >
                  <div style={{
                    width: 44, height: 44, borderRadius: 10,
                    background: f.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: 16,
                  }}>
                    <Icon size={22} color={f.color} />
                  </div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--ink)', marginBottom: 8 }}>
                    {f.title}
                  </h3>
                  <p style={{ fontSize: 13.5, color: 'var(--steel)', lineHeight: 1.6 }}>
                    {f.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section style={{
        background: 'linear-gradient(135deg, #1E3A8A 0%, #0F172A 100%)',
        padding: '80px 24px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 600, height: 300, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(37,99,235,0.25) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 560, margin: '0 auto' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🏠</div>
          <h2 style={{
            fontSize: 'clamp(26px, 5vw, 44px)', fontWeight: 900, color: '#fff',
            marginBottom: 16, letterSpacing: '-0.03em', fontFamily: 'var(--font-display)',
          }}>
            Comece a construir agora.
          </h2>
          <p style={{ fontSize: 16, color: '#94A3B8', marginBottom: 36, lineHeight: 1.6 }}>
            Crie sua conta gratuita e faça parte do maior ecossistema digital da construção civil brasileira.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              id="landing-cta-criar-conta"
              onClick={() => onOpenAuth('register')}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 10,
                background: '#EA580C', color: '#fff',
                border: 'none', borderRadius: 10, padding: '14px 32px',
                fontWeight: 800, fontSize: 15, cursor: 'pointer',
                fontFamily: 'var(--font-body)',
                boxShadow: '0 4px 24px rgba(234,88,12,0.45)',
                transition: 'transform 0.15s, box-shadow 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              Criar conta grátis <ArrowRight size={16} />
            </button>
            <button
              id="landing-cta-entrar"
              onClick={() => onOpenAuth('login')}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: 'transparent', color: '#CBD5E1',
                border: '1.5px solid rgba(255,255,255,0.2)',
                borderRadius: 10, padding: '14px 28px',
                fontWeight: 600, fontSize: 15, cursor: 'pointer',
                fontFamily: 'var(--font-body)',
                transition: 'border-color 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.5)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; }}
            >
              Já tenho conta
            </button>
          </div>

          {/* Trust badges */}
          <div style={{ marginTop: 40, display: 'flex', gap: 20, justifyContent: 'center', flexWrap: 'wrap' }}>
            {['LGPD Conforme', 'SSL Seguro', 'Gratuito para começar'].map(badge => (
              <div key={badge} style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#64748B', fontSize: 12 }}>
                <CheckCircle2 size={13} color="#059669" />
                {badge}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER MÍNIMO ── */}
      <footer style={{
        background: '#0F172A', padding: '24px',
        textAlign: 'center', color: '#475569', fontSize: 12,
        borderTop: '1px solid rgba(255,255,255,0.05)',
      }}>
        <span style={{ fontWeight: 800, color: '#64748B' }}>ALICERCE</span>
        {' · '}© {new Date().getFullYear()} · Plataforma digital da construção civil brasileira
      </footer>
    </div>
  );
};
