export type UserRole = 
  | 'cliente'
  | 'pessoa_fisica' 
  | 'profissional'
  | 'profissional_crea' 
  | 'profissional_cau' 
  | 'empresa'
  | 'empresa_cnpj' 
  | 'fornecedor'
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
  phone?: string;
  whatsapp?: string;
  city: string;
  state: string;
  verified: boolean;
  twoFactorEnabled?: boolean;
  specialties?: string[];
  portfolioCount?: number;
  rating?: number;
  reviewsCount?: number;
  consentLgpd: boolean;
  plan?: string;
  createdAt: string;
}

export interface ProfessionalProfile {
  id: string;
  userId?: string;
  name: string;
  email?: string;
  avatar: string;
  profession: string;
  specialty: string;
  experienceYears: number;
  services: string[];
  creaCauNumber?: string;
  phone?: string;
  whatsapp?: string;
  bio?: string;
  city: string;
  state: string;
  rating: number;
  reviewsCount: number;
  availability: string;
  isVerified: boolean;
}

export interface CompanyProfile {
  id: string;
  name: string;
  tradeName?: string;
  cnpj: string;
  city: string;
  state: string;
  phone?: string;
  whatsapp?: string;
  website?: string;
  avatar?: string;
  categories: string[];
  services: string[];
  rating: number;
  reviewsCount: number;
  isVerified: boolean;
}

export interface SupplierProfile {
  id: string;
  name: string;
  cnpj?: string;
  category: string;
  productTypes: string[];
  deliveryAvailable: boolean;
  city: string;
  state: string;
  phone?: string;
  whatsapp?: string;
  website?: string;
  avatar?: string;
  rating: number;
  reviewsCount: number;
}

export interface QuoteItem {
  id?: string;
  productName: string;
  quantity: number;
  unit: string;
  notes?: string;
}

export interface QuoteResponse {
  id: string;
  supplierId: string;
  supplierName: string;
  unitPrice: number;
  totalPrice: number;
  shippingPrice: number;
  totalSum: number;
  deliveryDays: number;
  validityDays: number;
  notes?: string;
  createdAt: string;
}

export interface QuoteRequest {
  id: string;
  requesterId: string;
  requesterName: string;
  requesterPhone?: string;
  requesterWhatsapp?: string;
  supplierId?: string;
  supplierName?: string;
  deliveryAddress: string;
  city: string;
  state: string;
  status: 'aberta' | 'respondida' | 'fechada' | 'cancelada';
  notes?: string;
  createdAt: string;
  items: QuoteItem[];
  responses?: QuoteResponse[];
}

export interface TechnicalStamp {
  stampId: string; // Ex: ALC-2026-8849
  registrationNumber: string; // CREA/CAU/CNPJ
  issueDate?: string;
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

export type OpportunityStatus = 'aberta' | 'aberto' | 'em_negociacao' | 'contratado' | 'concluida' | 'cancelada';

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
  deadlineDays?: number;
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
  threadId?: string;
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

export interface FavoriteItem {
  id: string;
  user_id?: string;
  target_type: 'professional' | 'company' | 'supplier' | 'opportunity';
  target_id: string;
  target_title: string;
  target_subtitle?: string;
  target_avatar?: string;
  created_at: string;
}

export interface ReviewItem {
  id: string;
  reviewer_id: string;
  reviewer_name: string;
  reviewer_avatar?: string;
  target_user_id: string;
  rating: number;
  comment: string;
  contract_type?: string;
  created_at: string;
}

export interface AdCampaign {
  id: string;
  userId: string;
  title: string;
  objective: 'Destaque de Perfil' | 'Destaque de Obra' | 'Captação de Leads';
  targetAudience?: string[];
  targetRegion: string;
  dailyBudget: number;
  totalBudget: number;
  durationDays: number;
  impressionsCount: number;
  clicksCount: number;
  status: 'ativa' | 'pausada' | 'finalizada' | 'aguardando_pagamento';
  paymentMethod: 'pix' | 'cartao';
  pixQrCode?: string;
  pixCopiaCola?: string;
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

export interface AdminMetrics {
  totalUsers: number;
  totalProfessionals: number;
  totalCompanies: number;
  totalSuppliers: number;
  totalOpportunities: number;
  totalProposals: number;
  totalReviews: number;
  platformHealth: string;
}
