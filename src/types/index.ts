export type UserRole = 
  | 'pessoa_fisica' 
  | 'profissional_crea' 
  | 'profissional_cau' 
  | 'empresa_cnpj' 
  | 'investidor' 
  | 'admin';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  bio?: string;
  creaCauNumber?: string; // Ex: CREA-SP 5069824/D or CAU A12345-6
  cnpjNumber?: string;    // Ex: 12.345.678/0001-90
  verified: boolean;
  twoFactorEnabled: boolean;
  phone?: string;
  city: string;
  state: string;
  specialties?: string[];
  portfolioCount?: number;
  rating?: number;
  reviewsCount?: number;
  consentLgpd: boolean;
  createdAt: string;
}

export interface TechnicalStamp {
  stampId: string; // Ex: ALC-2026-8849
  registrationNumber: string; // CREA/CAU/CNPJ
  issueDate: string;
  hashVerification: string; // SHA-256 preview
  artRrtCode?: string; // Ex: ART SP2026/099182
  status: 'valid' | 'pending' | 'revoked';
}

export type PostCategory = 'obra_andamento' | 'oportunidade' | 'artigo_tecnico' | 'portfolio' | 'patrocinado';

export interface Post {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  authorRole: UserRole;
  authorBadge: string;
  category: PostCategory;
  title: string;
  content: string;
  mediaUrls: string[];
  technicalStamp?: TechnicalStamp;
  location: {
    city: string;
    state: string;
  };
  budgetEstimated?: number;
  deadlineDays?: number;
  specialtyRequired?: string;
  likesCount: number;
  commentsCount: number;
  proposalsCount: number;
  isLiked?: boolean;
  isSaved?: boolean;
  isSponsored?: boolean;
  createdAt: string;
}

export type OpportunityStatus = 'aberto' | 'em_negociacao' | 'contratado' | 'concluido';

export interface Proposal {
  id: string;
  opportunityId: string;
  proposerId: string;
  proposerName: string;
  proposerRole: UserRole;
  proposerAvatar: string;
  creaCau?: string;
  value: number; // R$
  deadlineDays: number;
  scopeDescription: string;
  attachmentUrl?: string;
  status: 'pendente' | 'em_negociacao' | 'aceita' | 'recusada';
  createdAt: string;
}

export interface Opportunity {
  id: string;
  title: string;
  description: string;
  category: string;
  specialty: string;
  location: {
    city: string;
    state: string;
  };
  budgetRange: {
    min: number;
    max: number;
  };
  ownerId: string;
  ownerName: string;
  ownerAvatar: string;
  status: OpportunityStatus;
  proposalsCount: number;
  proposals: Proposal[];
  createdAt: string;
}

export type TimelinePhase = 
  | 'Fundação e Terraplanagem'
  | 'Estrutura e Concreto'
  | 'Alvenaria e Vedações'
  | 'Instalações Elétricas e Hidráulicas'
  | 'Revestimentos e Acabamento'
  | 'Vistoria e Habite-se';

export interface ConstructionMilestone {
  id: string;
  phase: TimelinePhase;
  progressPercent: number; // 0-100
  title: string;
  description: string;
  photoUrls: string[];
  costIncurred: number;
  updatedAt: string;
  responsibleCrea: string;
}

export interface ConstructionProject {
  id: string;
  title: string;
  location: string;
  totalBudget: number;
  overallProgress: number;
  responsavelTecnico: string;
  creaNumber: string;
  milestones: ConstructionMilestone[];
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  text: string;
  attachmentUrl?: string;
  timestamp: string;
  read: boolean;
}

export interface ChatThread {
  id: string;
  participantId: string;
  participantName: string;
  participantAvatar: string;
  participantRole: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

export interface AdCampaign {
  id: string;
  userId: string;
  title: string;
  objective: 'Destaque de Perfil' | 'Destaque de Obra' | 'Captação de Leads';
  targetAudience: string[];
  targetRegion: string;
  dailyBudget: number;
  totalBudget: number;
  durationDays: number;
  impressionsCount: number;
  clicksCount: number;
  status: 'ativa' | 'pausada' | 'finalizada' | 'aguardando_pagamento';
  paymentMethod: 'pix' | 'cartao';
  pixQrCode?: string;
  pixCopiaECola?: string;
  invoiceNfseUrl?: string;
  createdAt: string;
}

export interface ModerationItem {
  id: string;
  type: 'post' | 'user' | 'proposal';
  targetId: string;
  title: string;
  authorName: string;
  reason: string;
  reportsCount: number;
  status: 'pendente' | 'aprovado' | 'removido';
  createdAt: string;
}
