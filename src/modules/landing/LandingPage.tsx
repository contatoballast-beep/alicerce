import React from 'react';
import {
  ArrowRight,
  Compass,
  SlidersHorizontal,
  ShieldCheck,
  MessageSquare,
  Scale,
  CheckCircle2,
} from 'lucide-react';
import { BallastLogo } from '../../components/BallastLogo';

interface LandingPageProps {
  onExploreCatalog: () => void;
  onExploreProjects: () => void;
  onOpenBriefing: () => void;
  onOpenAuth: (mode: 'login' | 'register', presetRole?: 'cliente' | 'profissional_cau') => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onExploreCatalog,
  onExploreProjects,
  onOpenBriefing,
  onOpenAuth,
}) => {
  return (
    <div style={{ background: 'var(--marfim)', color: 'var(--grafite)' }}>
      {/* ── HERO — Swiss Asymmetric Split (Ballast Identidade Visual 2.0) ── */}
      <section style={{ borderBottom: '1px solid var(--border-color)', background: 'var(--marfim)' }}>
        <div
          className="ballast-container responsive-split"
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1.15fr) minmax(0, 0.85fr)',
            gap: 'clamp(28px, 5vw, 56px)',
            alignItems: 'center',
            paddingTop: 'clamp(36px, 6vw, 72px)',
            paddingBottom: 'clamp(44px, 6vw, 76px)',
          }}
        >
          {/* Left Manifesto Column */}
          <div>
            <div style={{ marginBottom: '22px' }}>
              <BallastLogo variant="minimal" surface="light" size={30} />
            </div>

            <div className="meta-label" style={{ color: 'var(--azul-lastro)', marginBottom: '14px' }}>
              BALLAST ARCHITECTURE · CONEXÃO EM ARQUITETURA
            </div>

            <h1
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(34px, 5.2vw, 62px)',
                fontWeight: 500,
                lineHeight: 1.04,
                color: 'var(--grafite)',
                marginBottom: '20px',
              }}
            >
              O projeto certo começa em você.
            </h1>

            <p
              style={{
                fontSize: 'clamp(15.5px, 1.8vw, 18px)',
                color: 'var(--text-body)',
                lineHeight: 1.65,
                maxWidth: '540px',
                marginBottom: '30px',
              }}
            >
              Conectamos pessoas que desejam construir ou reformar a arquitetos compatíveis com seu
              estilo, orçamento e momento — com portfólios reais, critérios claros e conversa direta.
            </p>

            {/* Primary & Secondary Actions (Zero mandatory signup to explore) */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '24px' }}>
              <button
                type="button"
                id="landing-cta-encontrar-arquitetos"
                onClick={onExploreCatalog}
                className="btn primary"
                style={{ padding: '13px 24px', fontSize: '14.5px' }}
              >
                Encontrar arquitetos
                <ArrowRight size={16} />
              </button>

              <button
                type="button"
                id="landing-cta-explorar-projetos"
                onClick={onExploreProjects}
                className="btn ghost"
                style={{ padding: '13px 22px', fontSize: '14.5px' }}
              >
                <Compass size={16} />
                Explorar projetos
              </button>
            </div>

            {/* Distinct path for Architects */}
            <div
              style={{
                paddingTop: '18px',
                borderTop: '1px solid var(--border-color)',
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                gap: '12px',
                fontSize: '13.5px',
                color: 'var(--steel)',
              }}
            >
              <span>É arquiteto ou escritório?</span>
              <button
                type="button"
                id="landing-cta-sou-arquiteto"
                onClick={() => onOpenAuth('register', 'profissional_cau')}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  color: 'var(--azul-lastro)',
                  fontWeight: 700,
                  fontSize: '13.5px',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  textUnderlineOffset: '3px',
                }}
              >
                Sou arquiteto — criar perfil profissional
              </button>
            </div>
          </div>

          {/* Right Architectural Editorial Photography Frame */}
          <figure style={{ margin: 0, position: 'relative' }}>
            <div
              style={{
                borderLeft: '6px solid var(--azul-lastro)',
                borderRadius: '0 var(--radius-md) var(--radius-md) 0',
                overflow: 'hidden',
                background: 'var(--grafite)',
                boxShadow: 'var(--shadow-lg)',
                aspectRatio: '4 / 5',
                maxHeight: '520px',
                width: '100%',
              }}
            >
              <img
                src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=960&auto=format&fit=crop&q=80"
                alt="Ambiente residencial com luz natural, pedra e madeira em arquitetura contemporânea"
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                decoding="async"
                fetchPriority="high"
              />
            </div>
            <figcaption
              style={{
                marginTop: '10px',
                fontSize: '11.5px',
                color: 'var(--steel)',
                display: 'flex',
                justifyContent: 'space-between',
                gap: '8px',
                flexWrap: 'wrap',
              }}
            >
              <span>Luz natural, materiais em uso e arquitetura vivida.</span>
              <span>Foto: Unsplash / Arquitetura Residencial</span>
            </figcaption>
          </figure>
        </div>
      </section>

      {/* ── MANIFESTO BAND (Grafite + Azul Luz divider — PDF Page 3) ── */}
      <section style={{ background: 'var(--grafite)', color: '#FFFFFF', borderLeft: '6px solid var(--azul-luz)' }}>
        <div className="ballast-container" style={{ paddingTop: '56px', paddingBottom: '56px' }}>
          <div
            className="responsive-2col"
            style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', alignItems: 'end' }}
          >
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(28px, 4vw, 44px)',
                fontWeight: 400,
                color: '#FFFFFF',
                lineHeight: 1.08,
                margin: 0,
              }}
            >
              “A beleza também tem função.”
            </h2>

            <div style={{ borderTop: '1px solid rgba(83, 156, 195, 0.45)', paddingTop: '18px' }}>
              <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.84)', lineHeight: 1.65, margin: 0 }}>
                Design que transforma decisões em sentido — com clareza, sensibilidade e lastro.
                Explore portfólios e entenda a compatibilidade antes mesmo de criar uma conta.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS — Clear client & architect value without artificial claims ── */}
      <section style={{ background: 'var(--branco)', borderBottom: '1px solid var(--border-color)' }}>
        <div className="ballast-container" style={{ paddingTop: '64px', paddingBottom: '64px' }}>
          <div style={{ maxWidth: '620px', marginBottom: '40px' }}>
            <div className="meta-label" style={{ color: 'var(--azul-lastro)', marginBottom: '10px' }}>
              COMO FUNCIONA A BALLAST
            </div>
            <h2 style={{ fontSize: 'clamp(26px, 3.6vw, 40px)', marginBottom: '12px' }}>
              Da ideia inicial à escolha do arquiteto certo.
            </h2>
            <p style={{ fontSize: '15px', color: 'var(--steel)' }}>
              Um processo direto, transparente e sem ruído comercial para construir ou reformar com segurança.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '20px',
            }}
          >
            {[
              {
                step: '01',
                icon: SlidersHorizontal,
                title: 'Defina seu briefing e referências',
                desc: 'Informe tipo de obra, cidade, faixa de investimento, prazo e ambientes que inspiram seu modo de morar.',
              },
              {
                step: '02',
                icon: Scale,
                title: 'Compare arquitetos compatíveis',
                desc: 'Veja especialidades, portfólios reais, status do registro CAU/CREA e os motivos objetivos da compatibilidade.',
              },
              {
                step: '03',
                icon: MessageSquare,
                title: 'Converse e solicite proposta',
                desc: 'Envie um pedido estruturado vinculado à conversa privada e acompanhe o retorno do profissional.',
              },
              {
                step: '04',
                icon: ShieldCheck,
                title: 'Credenciais com clareza',
                desc: 'Distinguimos registros profissionais declarados de registros efetivamente verificados pela plataforma.',
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.step}
                  style={{
                    background: 'var(--bg-subtle)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    padding: '24px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="mono" style={{ fontSize: '12px', fontWeight: 600, color: 'var(--azul-lastro)' }}>
                      {item.step}
                    </span>
                    <Icon size={18} color="#2F5872" />
                  </div>
                  <h3 style={{ fontFamily: 'var(--font-body)', fontSize: '16px', fontWeight: 600, color: 'var(--grafite)' }}>
                    {item.title}
                  </h3>
                  <p style={{ fontSize: '13.5px', color: 'var(--text-body)', lineHeight: 1.6, margin: 0 }}>
                    {item.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── DUAL PATH: CLIENTE vs ARQUITETO ── */}
      <section style={{ background: 'var(--marfim)' }}>
        <div className="ballast-container" style={{ paddingTop: '64px', paddingBottom: '72px' }}>
          <div
            className="responsive-2col"
            style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}
          >
            {/* Card Cliente */}
            <div className="card" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="meta-label" style={{ color: 'var(--azul-lastro)' }}>PARA QUEM VAI CONSTRUIR OU REFORMAR</div>
              <h3 style={{ fontSize: '28px' }}>Comece pelo seu briefing</h3>
              <p style={{ fontSize: '14.5px', lineHeight: 1.65 }}>
                Responda poucas perguntas sobre o seu projeto e selecione referências visuais opcionais para
                destacar arquitetos compatíveis no catálogo.
              </p>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13.5px', color: 'var(--grafite)' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2 size={15} color="#2F5872" /> Explore perfis e portfólios sem cadastro obrigatório
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2 size={15} color="#2F5872" /> Salve favoritos e compare até 3 arquitetos lado a lado
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2 size={15} color="#2F5872" /> Envie pedidos estruturados diretamente no chat
                </li>
              </ul>
              <div style={{ marginTop: 'auto', paddingTop: '8px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button type="button" onClick={onOpenBriefing} className="btn primary">
                  Montar meu briefing <ArrowRight size={15} />
                </button>
                <button type="button" onClick={onExploreCatalog} className="btn ghost">
                  Ver catálogo
                </button>
              </div>
            </div>

            {/* Card Arquiteto */}
            <div
              style={{
                background: 'var(--azul-lastro)',
                color: '#FFFFFF',
                borderRadius: 'var(--radius-md)',
                padding: '32px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
              }}
            >
              <div style={{ fontSize: '11.5px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#BBD8E8' }}>
                PARA ARQUITETOS E ESCRITÓRIOS
              </div>
              <h3 style={{ fontSize: '28px', color: '#FFFFFF' }}>Receba briefings compatíveis</h3>
              <p style={{ fontSize: '14.5px', color: 'rgba(255,255,255,0.88)', lineHeight: 1.65 }}>
                Estruture seu perfil com especialidades, área de atendimento, registro profissional e portfólio
                com autoria e contexto — sem competir por preço em portais genéricos.
              </p>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13.5px', color: 'rgba(255,255,255,0.92)' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2 size={15} color="#BBD8E8" /> Página pública com URL compartilhável para seu estúdio
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2 size={15} color="#BBD8E8" /> Solicitações com tipo de obra, cidade, orçamento e prazo
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2 size={15} color="#BBD8E8" /> Validação real de registro CAU / CREA pela plataforma
                </li>
              </ul>
              <div style={{ marginTop: 'auto', paddingTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => onOpenAuth('register', 'profissional_cau')}
                  className="btn"
                  style={{ background: '#FFFFFF', color: 'var(--grafite)', borderColor: '#FFFFFF' }}
                >
                  Cadastrar meu perfil de arquiteto <ArrowRight size={15} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
