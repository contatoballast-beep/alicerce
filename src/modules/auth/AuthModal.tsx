import React, { useState, useEffect } from 'react';
import { Modal } from '../../components/Modal';
import { UserRole, UserProfile } from '../../types';
import { RealApiClient } from '../../services/realApiClient';
import { trackEvent } from '../../services/telemetry';
import { PROJECT_TYPES, ARCHITECTURAL_STYLES, INVESTMENT_RANGES } from '../../utils/compatibility';
import { CheckCircle2, Loader2, AlertCircle, ArrowLeft, ArrowRight, UserCheck } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserProfile) => void;
  initialMode?: 'login' | 'register';
  presetRole?: 'cliente' | 'profissional_cau';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  initialMode = 'login',
  presetRole,
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [step, setStep] = useState<number>(1);
  const [selectedRole, setSelectedRole] = useState<UserRole>(presetRole || 'cliente');

  // Basic credentials
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('SP');
  const [consentLgpd, setConsentLgpd] = useState(true);

  // Professional onboarding fields
  const [specialty, setSpecialty] = useState('Arquitetura Residencial');
  const [experienceYears, setExperienceYears] = useState('5');
  const [serviceArea, setServiceArea] = useState('');
  const [creaCauNumber, setCreaCauNumber] = useState('');
  const [availability, setAvailability] = useState<'disponivel' | 'agenda_limitada' | 'lista_espera'>('disponivel');
  const [styles, setStyles] = useState<string[]>([]);
  const [projectTypes, setProjectTypes] = useState<string[]>(['Arquitetura Residencial']);
  const [investmentRanges, setInvestmentRanges] = useState<string[]>([]);
  const [bio, setBio] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isProfessional = ['profissional_cau', 'profissional_crea', 'profissional'].includes(selectedRole);
  const totalSteps = isProfessional ? 3 : 2;

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setStep(1);
      if (presetRole) setSelectedRole(presetRole);
      setErrorMessage(null);
    }
  }, [initialMode, presetRole, isOpen]);

  const toggleArr = (arr: string[], val: string, setter: (v: string[]) => void) => {
    setter(arr.includes(val) ? arr.filter((i) => i !== val) : [...arr, val]);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    if (!email.trim() || !password) {
      setErrorMessage('Informe seu e-mail e sua senha.');
      return;
    }

    setLoading(true);
    const res = await RealApiClient.login(email.trim(), password);
    setLoading(false);

    if (res.ok && res.data?.user && res.data?.token) {
      onLoginSuccess(res.data.user);
      onClose();
    } else {
      setErrorMessage(res.error || 'Não foi possível entrar. Verifique suas credenciais.');
    }
  };

  const handleNextStep = () => {
    setErrorMessage(null);
    if (step === 1) {
      setStep(2);
      return;
    }
    if (step === 2) {
      if (!name.trim() || name.trim().length < 2) {
        setErrorMessage('Informe seu nome completo.');
        return;
      }
      if (!email.trim() || !email.includes('@')) {
        setErrorMessage('Informe um e-mail válido.');
        return;
      }
      if (password.length < 8) {
        setErrorMessage('A senha deve ter no mínimo 8 caracteres.');
        return;
      }
      if (!city.trim() || state.trim().length !== 2) {
        setErrorMessage('Informe sua cidade e UF (2 letras).');
        return;
      }
      if (!consentLgpd) {
        setErrorMessage('Você precisa aceitar a Política de Privacidade (LGPD) para criar conta.');
        return;
      }
      if (isProfessional) {
        setStep(3);
      }
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (isProfessional && step < 3) {
      handleNextStep();
      return;
    }

    if (!name.trim() || !email.trim() || password.length < 8 || !city.trim() || state.trim().length !== 2) {
      setErrorMessage('Verifique os campos obrigatórios (senha com mínimo de 8 caracteres).');
      return;
    }
    if (!consentLgpd) {
      setErrorMessage('Aceite a Política de Privacidade (LGPD) para finalizar o cadastro.');
      return;
    }

    setLoading(true);
    const res = await RealApiClient.register({
      name: name.trim(),
      email: email.trim(),
      password,
      role: selectedRole,
      creaCauNumber: creaCauNumber.trim() || undefined,
      phone: phone.trim() || undefined,
      whatsapp: phone.trim() || undefined,
      city: city.trim(),
      state: state.trim().toUpperCase(),
      bio: bio.trim() || undefined,
      profession: selectedRole === 'profissional_cau' ? 'Arquiteto e Urbanista' : selectedRole === 'profissional_crea' ? 'Engenheiro Civil' : undefined,
      specialty: isProfessional ? specialty : undefined,
      experienceYears: isProfessional ? parseInt(experienceYears, 10) || 0 : undefined,
      serviceArea: isProfessional ? serviceArea.trim() || `${city.trim()}, ${state.trim().toUpperCase()}` : undefined,
      styles: isProfessional ? styles : undefined,
      projectTypes: isProfessional ? projectTypes : undefined,
      investmentRanges: isProfessional ? investmentRanges : undefined,
      availability: isProfessional ? availability : undefined,
      consentLgpd,
    });
    setLoading(false);

    if (res.ok && res.data?.user && res.data?.token) {
      trackEvent('signup_completed', { role: selectedRole });
      if (isProfessional) trackEvent('profile_published', { role: selectedRole });
      onLoginSuccess(res.data.user);
      onClose();
    } else {
      setErrorMessage(res.error || 'Não foi possível concluir o cadastro no servidor.');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'login' ? 'Entrar na Ballast' : 'Criar conta na Ballast'}
      maxWidth="520px"
    >
      {/* Mode Switcher */}
      <div className="segrow" role="tablist" aria-label="Modo de acesso">
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'login'}
          className={`seg ${mode === 'login' ? 'on' : ''}`}
          onClick={() => {
            setMode('login');
            setErrorMessage(null);
          }}
        >
          Entrar
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'register'}
          className={`seg ${mode === 'register' ? 'on' : ''}`}
          onClick={() => {
            setMode('register');
            setStep(1);
            setErrorMessage(null);
          }}
        >
          Criar conta
        </button>
      </div>

      {errorMessage && (
        <div
          role="alert"
          style={{
            background: 'var(--color-danger-light)',
            border: '1px solid #FECDCA',
            color: 'var(--color-danger)',
            padding: '10px 14px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '13px',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontWeight: 500,
          }}
        >
          <AlertCircle size={16} style={{ flexShrink: 0 }} />
          <span>{errorMessage}</span>
        </div>
      )}

      {mode === 'login' ? (
        <form onSubmit={handleLogin} className="form-wrap" noValidate>
          <div className="field">
            <label htmlFor="auth-login-email">E-mail *</label>
            <input
              id="auth-login-email"
              type="email"
              autoComplete="email"
              placeholder="nome@exemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="field">
            <label htmlFor="auth-login-password">Senha *</label>
            <input
              id="auth-login-password"
              type="password"
              autoComplete="current-password"
              placeholder="Sua senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" disabled={loading} className="btn primary" style={{ width: '100%', marginTop: '6px' }}>
            {loading ? <Loader2 size={16} className="animate-spin" /> : <UserCheck size={16} />}
            <span>Entrar na plataforma</span>
          </button>
        </form>
      ) : (
        <form onSubmit={handleRegister} className="form-wrap" noValidate>
          {/* Progress Indicator */}
          <div style={{ marginBottom: '18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--steel)', marginBottom: '6px' }}>
              <span>Etapa {step} de {totalSteps}</span>
              <span>
                {step === 1 ? 'Tipo de conta' : step === 2 ? 'Dados e acesso' : 'Perfil profissional'}
              </span>
            </div>
            <div style={{ height: '5px', background: 'var(--paper)', borderRadius: '999px', overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  width: `${(step / totalSteps) * 100}%`,
                  background: 'var(--azul-lastro)',
                  transition: 'width 0.2s ease',
                }}
              />
            </div>
          </div>

          {/* STEP 1: Role Selection */}
          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <p style={{ fontSize: '13.5px', color: 'var(--steel)', marginBottom: '4px' }}>
                Como você pretende utilizar a Ballast Architecture?
              </p>

              {[
                {
                  id: 'cliente' as UserRole,
                  title: 'Quero construir ou reformar',
                  desc: 'Encontrar arquitetos compatíveis, salvar favoritos e solicitar propostas.',
                },
                {
                  id: 'profissional_cau' as UserRole,
                  title: 'Sou arquiteto ou escritório (CAU)',
                  desc: 'Criar perfil profissional completo, publicar portfólio e receber briefings.',
                },
                {
                  id: 'profissional_crea' as UserRole,
                  title: 'Sou engenheiro ou projetista complementar (CREA)',
                  desc: 'Atuar em projetos complementares e parcerias técnicas.',
                },
                {
                  id: 'empresa_cnpj' as UserRole,
                  title: 'Construtora ou incorporadora',
                  desc: 'Conectar-se a arquitetos e publicar demandas de projeto.',
                },
              ].map((opt) => {
                const active = selectedRole === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setSelectedRole(opt.id)}
                    aria-pressed={active}
                    style={{
                      textAlign: 'left',
                      padding: '14px 16px',
                      borderRadius: 'var(--radius-sm)',
                      border: active ? '2px solid var(--azul-lastro)' : '1px solid var(--border-color)',
                      background: active ? 'var(--azul-lastro-soft)' : 'var(--branco)',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--grafite)' }}>{opt.title}</div>
                    <div style={{ fontSize: '12.5px', color: 'var(--steel)', marginTop: '2px' }}>{opt.desc}</div>
                  </button>
                );
              })}

              <button type="button" onClick={handleNextStep} className="btn primary" style={{ width: '100%', marginTop: '10px' }}>
                Continuar <ArrowRight size={15} />
              </button>
            </div>
          )}

          {/* STEP 2: Basic Info & Credentials */}
          {step === 2 && (
            <div>
              <div className="field">
                <label htmlFor="auth-reg-name">Nome completo ou nome do escritório *</label>
                <input
                  id="auth-reg-name"
                  type="text"
                  autoComplete="name"
                  placeholder="Ex: Marina Costa Arquitetura"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="field">
                <label htmlFor="auth-reg-email">E-mail *</label>
                <input
                  id="auth-reg-email"
                  type="email"
                  autoComplete="email"
                  placeholder="contato@estudio.com.br"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="field">
                <label htmlFor="auth-reg-password">Senha (mínimo 8 caracteres) *</label>
                <input
                  id="auth-reg-password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Mínimo 8 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={8}
                  required
                />
              </div>

              <div className="responsive-2col" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '10px' }}>
                <div className="field">
                  <label htmlFor="auth-reg-city">Cidade *</label>
                  <input
                    id="auth-reg-city"
                    type="text"
                    placeholder="Ex: São Paulo"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    required
                  />
                </div>
                <div className="field">
                  <label htmlFor="auth-reg-state">UF *</label>
                  <input
                    id="auth-reg-state"
                    type="text"
                    maxLength={2}
                    value={state}
                    onChange={(e) => setState(e.target.value.toUpperCase())}
                    required
                  />
                </div>
              </div>

              <div className="field">
                <label htmlFor="auth-reg-phone">Telefone / WhatsApp (opcional, mantido privado)</label>
                <input
                  id="auth-reg-phone"
                  type="tel"
                  placeholder="(11) 90000-0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <label
                htmlFor="auth-reg-lgpd"
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  fontSize: '12.5px',
                  color: 'var(--text-body)',
                  fontWeight: 400,
                  marginBottom: '16px',
                  cursor: 'pointer',
                }}
              >
                <input
                  id="auth-reg-lgpd"
                  type="checkbox"
                  checked={consentLgpd}
                  onChange={(e) => setConsentLgpd(e.target.checked)}
                  style={{ width: '16px', height: '16px', marginTop: '2px', flexShrink: 0 }}
                />
                <span>
                  Concordo com o tratamento dos meus dados pela Ballast Architecture conforme a LGPD (Lei nº 13.709/2018),
                  com direito a exportação e exclusão permanente da conta a qualquer momento.
                </span>
              </label>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="button" onClick={() => setStep(1)} className="btn ghost">
                  <ArrowLeft size={15} /> Voltar
                </button>
                {isProfessional ? (
                  <button type="button" onClick={handleNextStep} className="btn primary" style={{ flex: 1 }}>
                    Dados profissionais <ArrowRight size={15} />
                  </button>
                ) : (
                  <button type="submit" disabled={loading} className="btn primary" style={{ flex: 1 }}>
                    {loading ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle2 size={15} />}
                    Criar conta
                  </button>
                )}
              </div>
            </div>
          )}

          {/* STEP 3: Architect / Professional Details */}
          {step === 3 && isProfessional && (
            <div>
              <div className="field">
                <label htmlFor="auth-prof-specialty">Especialidade principal *</label>
                <select id="auth-prof-specialty" value={specialty} onChange={(e) => setSpecialty(e.target.value)}>
                  {PROJECT_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div className="responsive-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div className="field">
                  <label htmlFor="auth-prof-reg">Registro CAU ou CREA (opcional)</label>
                  <input
                    id="auth-prof-reg"
                    type="text"
                    placeholder="Ex: CAU A123456-7"
                    value={creaCauNumber}
                    onChange={(e) => setCreaCauNumber(e.target.value)}
                  />
                  <span style={{ fontSize: '11px', color: 'var(--steel)' }}>
                    Exibido como “declarado” até validação real pela equipe Ballast.
                  </span>
                </div>
                <div className="field">
                  <label htmlFor="auth-prof-exp">Anos de experiência</label>
                  <input
                    id="auth-prof-exp"
                    type="number"
                    min="0"
                    max="60"
                    value={experienceYears}
                    onChange={(e) => setExperienceYears(e.target.value)}
                  />
                </div>
              </div>

              <div className="responsive-2col" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '10px' }}>
                <div className="field">
                  <label htmlFor="auth-prof-area">Área de atendimento</label>
                  <input
                    id="auth-prof-area"
                    type="text"
                    placeholder="Ex: Grande São Paulo e projetos remotos"
                    value={serviceArea}
                    onChange={(e) => setServiceArea(e.target.value)}
                  />
                </div>
                <div className="field">
                  <label htmlFor="auth-prof-avail">Disponibilidade</label>
                  <select
                    id="auth-prof-avail"
                    value={availability}
                    onChange={(e) => setAvailability(e.target.value as any)}
                  >
                    <option value="disponivel">Disponível</option>
                    <option value="agenda_limitada">Agenda limitada</option>
                    <option value="lista_espera">Lista de espera</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <div style={{ fontSize: '12.5px', fontWeight: 600, marginBottom: '6px' }}>Tipos de projeto atendidos</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {PROJECT_TYPES.map((t) => (
                    <button
                      key={t}
                      type="button"
                      className={`chip ${projectTypes.includes(t) ? 'on' : ''}`}
                      style={{ fontSize: '11.5px', padding: '4px 10px' }}
                      onClick={() => toggleArr(projectTypes, t, setProjectTypes)}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <div style={{ fontSize: '12.5px', fontWeight: 600, marginBottom: '6px' }}>Estilos de referência</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {ARCHITECTURAL_STYLES.map((s) => (
                    <button
                      key={s}
                      type="button"
                      className={`chip ${styles.includes(s) ? 'on' : ''}`}
                      style={{ fontSize: '11.5px', padding: '4px 10px' }}
                      onClick={() => toggleArr(styles, s, setStyles)}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <div style={{ fontSize: '12.5px', fontWeight: 600, marginBottom: '6px' }}>Faixas de investimento atendidas</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {INVESTMENT_RANGES.map((r) => (
                    <button
                      key={r}
                      type="button"
                      className={`chip ${investmentRanges.includes(r) ? 'on' : ''}`}
                      style={{ fontSize: '11.5px', padding: '4px 10px' }}
                      onClick={() => toggleArr(investmentRanges, r, setInvestmentRanges)}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <div className="field">
                <label htmlFor="auth-prof-bio">Apresentação do seu trabalho</label>
                <textarea
                  id="auth-prof-bio"
                  rows={3}
                  placeholder="Conte brevemente sua abordagem arquitetônica, processo de trabalho e diferenciais..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="button" onClick={() => setStep(2)} className="btn ghost">
                  <ArrowLeft size={15} /> Voltar
                </button>
                <button type="submit" disabled={loading} className="btn primary" style={{ flex: 1 }}>
                  {loading ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle2 size={15} />}
                  Publicar perfil profissional
                </button>
              </div>
            </div>
          )}
        </form>
      )}
    </Modal>
  );
};
