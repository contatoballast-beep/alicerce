import { UserProfile, ConstructionProject, ClientBriefing, ProfessionalProfile } from '../types';

export const GUEST_USER: UserProfile = {
  id: 'usr_guest',
  name: 'Visitante',
  email: '',
  role: 'cliente',
  avatar: '',
  city: '',
  state: '',
  verified: false,
  verificationStatus: 'unverified',
  consentLgpd: false,
  createdAt: '',
};

const STORAGE_KEYS = {
  BRIEFING: 'ballast_client_briefing_v1',
  COMPARE: 'ballast_compare_list_v1',
  PROJECTS: 'ballast_timeline_projects_v1',
};

function getStored<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function setStored<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

export const LocalPreferencesService = {
  getBriefing(): ClientBriefing | null {
    return getStored<ClientBriefing | null>(STORAGE_KEYS.BRIEFING, null);
  },

  saveBriefing(briefing: ClientBriefing): void {
    setStored(STORAGE_KEYS.BRIEFING, briefing);
  },

  clearBriefing(): void {
    localStorage.removeItem(STORAGE_KEYS.BRIEFING);
  },

  getCompareList(): ProfessionalProfile[] {
    return getStored<ProfessionalProfile[]>(STORAGE_KEYS.COMPARE, []);
  },

  saveCompareList(items: ProfessionalProfile[]): void {
    setStored(STORAGE_KEYS.COMPARE, items.slice(0, 3));
  },

  getTimelineProjects(): ConstructionProject[] {
    return getStored<ConstructionProject[]>(STORAGE_KEYS.PROJECTS, []);
  },

  saveTimelineProjects(projects: ConstructionProject[]): void {
    setStored(STORAGE_KEYS.PROJECTS, projects);
  },

  clearLegacyCaches(): void {
    const legacyKeys = [
      'Ballast_user',
      'Ballast_posts',
      'Ballast_opportunities',
      'Ballast_projects',
      'Ballast_campaigns',
      'Ballast_messages',
      'Ballast_chat_threads',
      'Ballast_moderation',
      'Ballast_jwt_token',
      'Ballast_entered_app',
    ];
    for (const k of legacyKeys) {
      localStorage.removeItem(k);
    }
  },
};
