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

export type VerificationStatus = 'unverified' | 'declared' | 'verified';

export interface ProfessionalDetails {
  profession: string;
  specialty: string;
  experienceYears: number;
  services: string[];
  styles: string[];
  projectTypes: string[];
  investmentRanges: string[];
  serviceArea: string;
  availability: 'disponivel' | 'agenda_limitada' | 'lista_espera' | string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  bio?: string;
  creaCauNumber?: string;
  cnpjNumber?: string;
  phone?: string;
  whatsapp?: string;
  city: string;
  state: string;
  verified: boolean;
  verificationStatus?: VerificationStatus;
  consentLgpd: boolean;
  plan?: string;
  createdAt: string;
  professionalProfile?: ProfessionalDetails;
}

export interface PortfolioItem {
  id: string;
  userId?: string;
  title: string;
  description?: string;
  context?: string;
  category?: string;
  projectType?: string;
  city?: string;
  state?: string;
  year?: string;
  photoCredit?: string;
  mediaUrls: string[];
  budget?: number;
  createdAt?: string;
}

export interface ProfessionalProfile {
  id: string;
  userId?: string;
  name: string;
  role?: UserRole;
  avatar: string;
  profession: string;
  specialty: string;
  experienceYears: number;
  services: string[];
  styles: string[];
  projectTypes: string[];
  investmentRanges: string[];
  serviceArea: string;
  creaCauNumber?: string;
  bio?: string;
  city: string;
  state: string;
  rating: number;
  reviewsCount: number;
  availability: string;
  isVerified: boolean;
  verificationStatus: VerificationStatus;
  portfolioPreview?: PortfolioItem[];
  portfolio?: PortfolioItem[];
  reviews?: ReviewItem[];
  createdAt?: string;
}

export interface CompanyProfile {
  id: string;
  name: string;
  tradeName?: string;
  city: string;
  state: string;
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
  category: string;
  productTypes: string[];
  deliveryAvailable: boolean;
  city: string;
  state: string;
  website?: string;
  avatar?: string;
  rating: number;
  reviewsCount: number;
  isVerified?: boolean;
}

export interface ClientBriefing {
  projectType: string;
  city: string;
  state: string;
  budgetRange: string;
  timeline: string;
  currentStage: string;
  needs: string;
  stylePreferences: string[];
  roomPreferences: string[];
}

export interface ProposalRequest {
  id: string;
  clientId: string;
  clientName: string;
  architectId: string;
  architectName: string;
  threadId?: string;
  projectType: string;
  city: string;
  state: string;
  budgetRange?: string;
  timeline?: string;
  currentStage?: string;
  description: string;
  stylePreferences: string[];
  status: 'enviada' | 'em_analise' | 'respondida' | 'recusada' | 'cancelada';
  architectResponse?: string;
  createdAt: string;
  updatedAt: string;
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
  stampId?: string;
  registrationNumber: string;
  issueDate?: string;
  hashVerification?: string;
  artRrtCode?: string;
  status: 'valid' | 'pending' | 'revoked';
}

export type PostCategory = 'portfolio' | 'obra_andamento' | 'oportunidade' | 'artigo_tecnico' | 'patrocinado';

export interface Post {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  authorRole: UserRole;
  authorBadge: string;
  authorVerified?: boolean;
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
  value: number;
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
  currentStage?: string;
  stylePreferences?: string[];
  proposalsCount: number;
  proposals: Proposal[];
  createdAt: string;
}

export type TimelinePhase =
  | 'Estudo Preliminar e Anteprojeto'
  | 'Projeto Legal e Aprovação'
  | 'Fundação e Terraplanagem'
  | 'Estrutura e Concreto'
  | 'Alvenaria e Vedações'
  | 'Instalações Elétricas e Hidráulicas'
  | 'Revestimentos e Acabamento'
  | 'Vistoria e Entrega';

export interface ConstructionMilestone {
  id: string;
  phase: TimelinePhase;
  progressPercent: number;
  title: string;
  description: string;
  photoUrls: string[];
  costIncurred: number;
  updatedAt: string;
  responsibleCrea?: string;
}

export interface ConstructionProject {
  id: string;
  title: string;
  location: string;
  totalBudget: number;
  overallProgress: number;
  responsavelTecnico: string;
  creaNumber?: string;
  milestones: ConstructionMilestone[];
}

export type ChatMessageStatus = 'sending' | 'sent' | 'failed' | 'read';

export interface ChatMessage {
  id: string;
  threadId: string;
  clientMessageId?: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  text: string;
  attachmentUrl?: string;
  timestamp: string;
  read: boolean;
  status?: ChatMessageStatus;
  createdAt?: string;
}

export interface ChatThread {
  id: string;
  participantId: string;
  participantName: string;
  participantAvatar: string;
  participantRole: string;
  participantVerified?: boolean;
  projectTitle?: string;
  opportunityId?: string;
  proposalRequestId?: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  updatedAt?: string;
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
  objective: string;
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
  invoiceNfseUrl?: string;
  createdAt: string;
}

export interface ReportItem {
  id: string;
  reporter_id: string;
  reporter_name?: string;
  target_type: string;
  target_id: string;
  reason: string;
  details?: string;
  status: 'pendente' | 'aprovado' | 'removido' | 'resolvido';
  created_at: string;
}

export interface AdminMetrics {
  totalUsers: number;
  totalProfessionals: number;
  totalCompanies: number;
  totalSuppliers: number;
  totalOpportunities: number;
  totalProposals: number;
  totalReviews: number;
  pendingReports?: number;
  platformHealth: string;
}

export interface ApiResult<T> {
  ok: boolean;
  data?: T;
  error?: string;
  status?: number;
  offline?: boolean;
}
