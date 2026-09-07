import { UserProfile, Post, Opportunity, ConstructionProject, ChatThread, ChatMessage, AdCampaign, ModerationItem } from '../types';

export const INITIAL_USER: UserProfile = {
  id: 'usr_guest',
  name: 'Visitante',
  email: 'visitante@alicerce.com.br',
  role: 'cliente',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  bio: 'Novo membro no ecossistema ALICERCE.',
  city: 'São Paulo',
  state: 'SP',
  verified: false,
  consentLgpd: true,
  createdAt: '2026-01-01',
};

export const MOCK_POSTS: Post[] = [];
export const MOCK_OPPORTUNITIES: Opportunity[] = [];
export const MOCK_PROJECTS: ConstructionProject[] = [];
export const MOCK_CHAT_THREADS: ChatThread[] = [];
export const MOCK_MESSAGES: Record<string, ChatMessage[]> = {};
export const MOCK_CAMPAIGNS: AdCampaign[] = [];
export const MOCK_MODERATION: ModerationItem[] = [];
