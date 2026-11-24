import React, { useState, useEffect } from 'react';
import { Modal } from '../../components/Modal';
import { UserProfile } from '../../types';
import { RealApiClient } from '../../services/realApiClient';
import { trackEvent } from '../../services/telemetry';
import { PROJECT_TYPES, ARCHITECTURAL_STYLES, INVESTMENT_RANGES } from '../../utils/compatibility';
import { CheckCircle2, Loader2, AlertCircle, Plus, Image as ImageIcon } from 'lucide-react';

interface ProfileEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onProfileUpdated: (user: UserProfile) => void;
  onPortfolioPublished: () => void;
}

export const ProfileEditorModal: React.FC<ProfileEditorModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onProfileUpdated,
  onPortfolioPublished,
}) => {
  const [tab, setTab] = useState<'profile' | 'portfolio'>('profile');

  // Profile fields
  const [name, setName] = useState(currentUser.name || '');
  const [city, setCity] = useState(currentUser.city || '');
  const [state, setState] = useState(currentUser.state || 'SP');
  const [bio, setBio] = useState(currentUser.bio || '');
  const [avatar, setAvatar] = useState(currentUser.avatar || '');
  const [creaCauNumber, setCreaCauNumber] = useState(currentUser.creaCauNumber || '');
  const [specialty, setSpecialty] = useState(currentUser.professionalProfile?.specialty || 'Arquitetura Residencial');
  const [serviceArea, setServiceArea] = useState(currentUser.professionalProfile?.serviceArea || '');
  const [experienceYears, setExperienceYears] = useState(String(currentUser.professionalProfile?.experienceYears ?? 0));
  const [availability, setAvailability] = useState(currentUser.professionalProfile?.availability || 'disponivel');
  const [styles, setStyles] = useState<string[]>(currentUser.professionalProfile?.styles || []);
  const [projectTypes, setProjectTypes] = useState<string[]>(currentUser.professionalProfile?.projectTypes || []);
  const [investmentRanges, setInvestmentRanges] = useState<string[]>(currentUser.professionalProfile?.investmentRanges || []);

  // Portfolio item fields
  const [projTitle, setProjTitle] = useState('');
  const [projType, setProjType] = useState(PROJECT_TYPES[0]);
  const [projCity, setProjCity] = useState(currentUser.city || '');
  const [projState, setProjState] = useState(currentUser.state || 'SP');
  const [projYear, setProjYear] = useState(String(new Date().getFullYear()));
  const [projContext, setProjContext] = useState('');
  const [projDesc, setProjDesc] = useState('');
  const [projPhotoUrl, setProjPhotoUrl] = useState('');
  const [projPhotoCredit, setProjPhotoCredit] = useState('');

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const isProfessional = ['profissional', 'profissional_cau', 'profissional_crea'].includes(currentUser.role);

  useEffect(() => {
    if (isOpen) {
      setName(currentUser.name || '');
      setCity(currentUser.city || '');
      setState(currentUser.state || 'SP');
      setBio(currentUser.bio || '');
      setAvatar(currentUser.avatar || '');
      setCreaCauNumber(currentUser.creaCauNumber || '');
      setSpecialty(currentUser.professionalProfile?.specialty || 'Arquitetura Residencial');
      setServiceArea(currentUser.professionalProfile?.serviceArea || '');
      setExperienceYears(String(currentUser.professionalProfile?.experienceYears ?? 0));
      setAvailability(currentUser.professionalProfile?.availability || 'disponivel');
      setStyles(currentUser.professionalProfile?.styles || []);
      setProjectTypes(currentUser.professionalProfile?.projectTypes || []);
      setInvestmentRanges(currentUser.professionalProfile?.investmentRanges || []);
      setProjCity(currentUser.city || '');
      setProjState(currentUser.state || 'SP');
      setError(null);
      setSuccessMsg(null);
    }
  }, [isOpen, currentUser]);

  const toggleArr = (arr: string[], val: string, setter: (v: string[]) => void) => {
    setter(arr.includes(val) ? arr.filter((i) => i !== val) : [...arr, val]);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccessMsg(null);

    const res = await RealApiClient.updateProfile({
      name: name.trim(),
      city: city.trim(),
      state: state.trim().toUpperCase(),
      bio: bio.trim(),
      avatar: avatar.trim(),
      creaCauNumber: creaCauNumber.trim(),
      specialty,
      serviceArea: serviceArea.trim(),
      experienceYears: parseInt(experienceYears, 10) || 0,
      availability,
      styles,
      projectTypes,
      investmentRanges,
    });
    setSaving(false);

    if (res.ok && res.data?.user) {
      trackEvent('profile_published', { role: currentUser.role });
      onProfileUpdated(res.data.user);
      setSuccessMsg('Perfil confirmado e salvo no servidor.');
    } else {
      setError(res.error || 'Não foi possível salvar o perfil no servidor.');
    }
  };

  const handlePublishPortfolio = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    if (!projTitle.trim() || !projDesc.trim()) {
      setError('Informe o título e a descrição do projeto.');
      return;
    }

    setSaving(true);
    const res = await RealApiClient.createPortfolioItem({
      title: projTitle.trim(),
      description: projDesc.trim(),
      context: projContext.trim() || undefined,
      projectType: projType,
      city: projCity.trim() || currentUser.city,
      state: projState.trim().toUpperCase() || currentUser.state,
      year: projYear.trim() || undefined,
      photoCredit: projPhotoCredit.trim() || undefined,
      mediaUrls: projPhotoUrl.trim() ? [projPhotoUrl.trim()] : [],
    });
    setSaving(false);

    if (res.ok && res.data) {
      trackEvent('portfolio_published', { projectType: projType });
      setProjTitle('');
      setProjDesc('');
      setProjContext('');
      setProjPhotoUrl('');
      setProjPhotoCredit('');
      setSuccessMsg('Projeto publicado no seu portfólio com confirmação do servidor.');
      onPortfolioPublished();
    } else {
      setError(res.error || 'Erro ao publicar projeto. Nenhuma alteração foi salva.');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isProfessional ? 'Perfil Profissional e Portfólio' : 'Meu Perfil'} maxWidth="600px">
      {isProfessional && (
        <div className="segrow">
          <button type="button" className={`seg ${tab === 'profile' ? 'on' : ''}`} onClick={() => { setTab('profile'); setError(null); setSuccessMsg(null); }}>
            Dados profissionais
          </button>
          <button type="button" className={`seg ${tab === 'portfolio' ? 'on' : ''}`} onClick={() => { setTab('portfolio'); setError(null); setSuccessMsg(null); }}>
            Publicar projeto no portfólio
          </button>
        </div>
      )}

      {error && (
        <div role="alert" style={{ background: 'var(--color-danger-light)', border: '1px solid #FECDCA', color: 'var(--color-danger)', padding: '10px 14px', borderRadius: 'var(--radius-sm)', fontSize: '13px', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertCircle size={15} /> {error}
        </div>
      )}
      {successMsg && (
        <div role="status" style={{ background: 'var(--color-success-light)', border: '1px solid #B4DEC9', color: 'var(--color-success)', padding: '10px 14px', borderRadius: 'var(--radius-sm)', fontSize: '13px', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle2 size={15} /> {successMsg}
        </div>
      )}

      {tab === 'profile' ? (
        <form onSubmit={handleSaveProfile} className="form-wrap">
          <div className="field">
            <label htmlFor="prof-edit-name">Nome / Escritório *</label>
            <input id="prof-edit-name" type="text" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>

          <div className="responsive-2col" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '10px' }}>
            <div className="field">
              <label htmlFor="prof-edit-city">Cidade *</label>
              <input id="prof-edit-city" type="text" value={city} onChange={(e) => setCity(e.target.value)} required />
            </div>
            <div className="field">
              <label htmlFor="prof-edit-state">UF *</label>
              <input id="prof-edit-state" type="text" maxLength={2} value={state} onChange={(e) => setState(e.target.value.toUpperCase())} required />
            </div>
          </div>

          <div className="field">
            <label htmlFor="prof-edit-avatar">Foto de perfil (URL HTTPS opcional)</label>
            <input id="prof-edit-avatar" type="url" placeholder="https://..." value={avatar} onChange={(e) => setAvatar(e.target.value)} />
          </div>

          {isProfessional && (
            <>
              <div className="responsive-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div className="field">
                  <label htmlFor="prof-edit-spec">Especialidade principal</label>
                  <select id="prof-edit-spec" value={specialty} onChange={(e) => setSpecialty(e.target.value)}>
                    {PROJECT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="field">
                  <label htmlFor="prof-edit-avail">Disponibilidade</label>
                  <select id="prof-edit-avail" value={availability} onChange={(e) => setAvailability(e.target.value)}>
                    <option value="disponivel">Disponível</option>
                    <option value="agenda_limitada">Agenda limitada</option>
                    <option value="lista_espera">Lista de espera</option>
                  </select>
                </div>
              </div>

              <div className="responsive-2col" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '10px' }}>
                <div className="field">
                  <label htmlFor="prof-edit-area">Área de atendimento</label>
                  <input id="prof-edit-area" type="text" placeholder="Ex: São Paulo, Interior e remoto" value={serviceArea} onChange={(e) => setServiceArea(e.target.value)} />
                </div>
                <div className="field">
                  <label htmlFor="prof-edit-exp">Anos de experiência</label>
                  <input id="prof-edit-exp" type="number" min="0" max="60" value={experienceYears} onChange={(e) => setExperienceYears(e.target.value)} />
                </div>
              </div>

              <div className="field">
                <label htmlFor="prof-edit-reg">Registro profissional CAU / CREA (declarado)</label>
                <input id="prof-edit-reg" type="text" placeholder="Ex: CAU A123456-7" value={creaCauNumber} onChange={(e) => setCreaCauNumber(e.target.value)} />
                <span style={{ fontSize: '11.5px', color: 'var(--steel)' }}>
                  Ao alterar o número do registro, o status volta para “Registro declarado” até validação real pela equipe Ballast.
                </span>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <div style={{ fontSize: '12.5px', fontWeight: 600, marginBottom: '6px' }}>Tipos de projeto</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {PROJECT_TYPES.map((t) => (
                    <button key={t} type="button" className={`chip ${projectTypes.includes(t) ? 'on' : ''}`} style={{ fontSize: '11.5px', padding: '4px 10px' }} onClick={() => toggleArr(projectTypes, t, setProjectTypes)}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <div style={{ fontSize: '12.5px', fontWeight: 600, marginBottom: '6px' }}>Estilos arquitetônicos</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {ARCHITECTURAL_STYLES.map((s) => (
                    <button key={s} type="button" className={`chip ${styles.includes(s) ? 'on' : ''}`} style={{ fontSize: '11.5px', padding: '4px 10px' }} onClick={() => toggleArr(styles, s, setStyles)}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <div style={{ fontSize: '12.5px', fontWeight: 600, marginBottom: '6px' }}>Faixas de investimento</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {INVESTMENT_RANGES.map((r) => (
                    <button key={r} type="button" className={`chip ${investmentRanges.includes(r) ? 'on' : ''}`} style={{ fontSize: '11.5px', padding: '4px 10px' }} onClick={() => toggleArr(investmentRanges, r, setInvestmentRanges)}>
                      {r}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          <div className="field">
            <label htmlFor="prof-edit-bio">Sobre seu trabalho</label>
            <textarea id="prof-edit-bio" rows={3} value={bio} onChange={(e) => setBio(e.target.value)} />
          </div>

          <button type="submit" disabled={saving} className="btn primary" style={{ width: '100%' }}>
            {saving ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle2 size={15} />}
            Salvar alterações no servidor
          </button>
        </form>
      ) : (
        <form onSubmit={handlePublishPortfolio} className="form-wrap">
          <div className="field">
            <label htmlFor="port-title">Título do projeto *</label>
            <input id="port-title" type="text" placeholder="Ex: Casa Pátio Alto de Pinheiros" value={projTitle} onChange={(e) => setProjTitle(e.target.value)} required />
          </div>

          <div className="responsive-2col" style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: '10px' }}>
            <div className="field">
              <label htmlFor="port-type">Tipo de obra *</label>
              <select id="port-type" value={projType} onChange={(e) => setProjType(e.target.value)}>
                {PROJECT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="field">
              <label htmlFor="port-year">Ano</label>
              <input id="port-year" type="text" maxLength={4} value={projYear} onChange={(e) => setProjYear(e.target.value)} />
            </div>
          </div>

          <div className="responsive-2col" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '10px' }}>
            <div className="field">
              <label htmlFor="port-city">Cidade</label>
              <input id="port-city" type="text" value={projCity} onChange={(e) => setProjCity(e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="port-state">UF</label>
              <input id="port-state" type="text" maxLength={2} value={projState} onChange={(e) => setProjState(e.target.value.toUpperCase())} />
            </div>
          </div>

          <div className="field">
            <label htmlFor="port-desc">Descrição arquitetônica *</label>
            <textarea id="port-desc" rows={3} placeholder="Soluções espaciais, iluminação natural, materialidade..." value={projDesc} onChange={(e) => setProjDesc(e.target.value)} required />
          </div>

          <div className="field">
            <label htmlFor="port-context">Contexto do terreno ou reforma (opcional)</label>
            <input id="port-context" type="text" placeholder="Ex: Reforma de apartamento dos anos 1970 com 140 m²" value={projContext} onChange={(e) => setProjContext(e.target.value)} />
          </div>

          <div className="field">
            <label htmlFor="port-photo">Fotografia principal (URL HTTPS)</label>
            <input id="port-photo" type="url" placeholder="https://..." value={projPhotoUrl} onChange={(e) => setProjPhotoUrl(e.target.value)} />
          </div>

          <div className="field">
            <label htmlFor="port-credit">Autoria / Crédito fotográfico</label>
            <input id="port-credit" type="text" placeholder="Ex: Foto por João Silva / Estúdio Marina Costa" value={projPhotoCredit} onChange={(e) => setProjPhotoCredit(e.target.value)} />
          </div>

          <button type="submit" disabled={saving} className="btn primary" style={{ width: '100%' }}>
            {saving ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />}
            <ImageIcon size={15} /> Publicar no portfólio
          </button>
        </form>
      )}
    </Modal>
  );
};
