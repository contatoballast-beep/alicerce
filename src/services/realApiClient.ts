import {
  Post,
  Opportunity,
  AdCampaign,
  ChatMessage,
  ChatThread,
  UserProfile,
  UserRole,
  ProfessionalProfile,
  CompanyProfile,
  SupplierProfile,
  QuoteRequest,
  FavoriteItem,
  ReviewItem,
  AdminMetrics,
  PortfolioItem,
  ProposalRequest,
  ReportItem,
  ApiResult,
} from '../types';

const getApiBaseUrl = (): string => {
  const rawEnv = import.meta.env.VITE_API_URL?.trim();
  if (rawEnv) {
    const cleaned = rawEnv.replace(/\/+$/, '');
    if (cleaned.startsWith('http://') || cleaned.startsWith('https://') || cleaned.startsWith('/')) {
      return cleaned;
    }
    return `https://${cleaned}`;
  }
  if (typeof window !== 'undefined') {
    const isDevPort = window.location.port === '3000' || window.location.port === '5173';
    if (!isDevPort) {
      return '';
    }
  }
  return 'http://localhost:4000';
};

const getWebSocketUrl = (token: string): string => {
  const apiBase = getApiBaseUrl();
  let base = 'ws://localhost:4000';
  if (apiBase.startsWith('http://')) {
    base = apiBase.replace('http://', 'ws://');
  } else if (apiBase.startsWith('https://')) {
    base = apiBase.replace('https://', 'wss://');
  } else if (typeof window !== 'undefined') {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const isDevPort = window.location.port === '3000' || window.location.port === '5173';
    base = isDevPort ? 'ws://localhost:4000' : `${protocol}//${window.location.host}`;
  }
  return `${base}?token=${encodeURIComponent(token)}`;
};

export const API_BASE_URL = getApiBaseUrl();

const TOKEN_KEY = 'ballast_jwt_token';
export const getAuthToken = () => localStorage.getItem(TOKEN_KEY);
export const setAuthToken = (token: string) => localStorage.setItem(TOKEN_KEY, token);
export const removeAuthToken = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem('Ballast_jwt_token');
};

function notifySessionExpired() {
  removeAuthToken();
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('ballast:session-expired'));
  }
}

async function request<T>(
  path: string,
  options: RequestInit & { requireAuth?: boolean } = {}
): Promise<ApiResult<T>> {
  const { requireAuth = false, ...fetchOptions } = options;
  const token = getAuthToken();

  if (requireAuth && !token) {
    return { ok: false, status: 401, error: 'Faça login para realizar esta ação.' };
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((fetchOptions.headers as Record<string, string>) || {}),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(`${API_BASE_URL}${path}`, {
      ...fetchOptions,
      headers,
    });

    const contentType = res.headers.get('content-type') || '';
    const isJson = contentType.includes('application/json');
    const body = isJson ? await res.json().catch(() => null) : null;

    if (res.status === 401 && token && path !== '/api/auth/login') {
      notifySessionExpired();
    }

    if (!res.ok) {
      return {
        ok: false,
        status: res.status,
        error:
          (body && typeof body.error === 'string' && body.error) ||
          (res.status === 404
            ? 'Serviço da API indisponível no momento (404). Verifique a conexão com o servidor.'
            : `Erro na comunicação com o servidor (HTTP ${res.status}).`),
      };
    }

    return { ok: true, status: res.status, data: body as T };
  } catch {
    return {
      ok: false,
      offline: true,
      error: 'Não foi possível conectar ao servidor Ballast. Verifique sua conexão e tente novamente.',
    };
  }
}

export const RealApiClient = {
  // 1. Health Check
  async checkHealth(): Promise<ApiResult<{ ok: boolean; status: string; database: string; version?: string }>> {
    return request('/api/health');
  },

  // 2. Authentication & Server Session Validation (Zero simulated fallbacks)
  async login(email: string, password: string): Promise<ApiResult<{ token: string; user: UserProfile }>> {
    const res = await request<{ token: string; user: UserProfile }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (res.ok && res.data?.token && res.data?.user) {
      setAuthToken(res.data.token);
      return res;
    }
    return { ok: false, status: res.status, offline: res.offline, error: res.error || 'Falha na autenticação.' };
  },

  async register(userData: {
    name: string;
    email: string;
    password: string;
    role: UserRole;
    creaCauNumber?: string;
    cnpjNumber?: string;
    phone?: string;
    whatsapp?: string;
    city: string;
    state: string;
    bio?: string;
    profession?: string;
    specialty?: string;
    experienceYears?: number;
    services?: string[];
    styles?: string[];
    projectTypes?: string[];
    investmentRanges?: string[];
    serviceArea?: string;
    availability?: string;
    consentLgpd: boolean;
  }): Promise<ApiResult<{ token: string; user: UserProfile }>> {
    const res = await request<{ token: string; user: UserProfile }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    if (res.ok && res.data?.token && res.data?.user) {
      setAuthToken(res.data.token);
      return res;
    }
    return { ok: false, status: res.status, offline: res.offline, error: res.error || 'Não foi possível concluir o cadastro.' };
  },

  async validateSession(): Promise<ApiResult<UserProfile>> {
    const token = getAuthToken();
    if (!token) return { ok: false, status: 401, error: 'Sem sessão ativa.' };
    return request<UserProfile>('/api/auth/me', { requireAuth: true });
  },

  async updateProfile(profileData: Record<string, any>): Promise<ApiResult<{ success: boolean; user: UserProfile }>> {
    return request('/api/user/profile', {
      method: 'PUT',
      requireAuth: true,
      body: JSON.stringify(profileData),
    });
  },

  async exportMyData(): Promise<ApiResult<Record<string, any>>> {
    return request('/api/user/export', { requireAuth: true });
  },

  async deleteMyAccount(password: string): Promise<ApiResult<{ deleted: boolean; message: string }>> {
    const res = await request<{ deleted: boolean; message: string }>('/api/user/account', {
      method: 'DELETE',
      requireAuth: true,
      body: JSON.stringify({ password }),
    });
    if (res.ok) removeAuthToken();
    return res;
  },

  // 3. Directory & Portfolios
  async getProfessionals(filters?: {
    q?: string;
    city?: string;
    state?: string;
    specialty?: string;
    projectType?: string;
    style?: string;
    investmentRange?: string;
    availability?: string;
    verifiedOnly?: boolean;
    page?: number;
    limit?: number;
  }): Promise<ApiResult<{ items: ProfessionalProfile[]; page: number; limit: number }>> {
    const params = new URLSearchParams();
    if (filters?.q) params.set('q', filters.q);
    if (filters?.city) params.set('city', filters.city);
    if (filters?.state) params.set('state', filters.state);
    if (filters?.specialty) params.set('specialty', filters.specialty);
    if (filters?.projectType) params.set('projectType', filters.projectType);
    if (filters?.style) params.set('style', filters.style);
    if (filters?.investmentRange) params.set('investmentRange', filters.investmentRange);
    if (filters?.availability) params.set('availability', filters.availability);
    if (filters?.verifiedOnly) params.set('verifiedOnly', 'true');
    if (filters?.page) params.set('page', String(filters.page));
    if (filters?.limit) params.set('limit', String(filters.limit));
    return request(`/api/professionals?${params.toString()}`);
  },

  async getProfessionalById(id: string): Promise<ApiResult<ProfessionalProfile>> {
    return request(`/api/professionals/${encodeURIComponent(id)}`);
  },

  async createPortfolioItem(data: {
    title: string;
    description: string;
    context?: string;
    projectType: string;
    city: string;
    state: string;
    year?: string;
    photoCredit?: string;
    mediaUrls: string[];
  }): Promise<ApiResult<PortfolioItem>> {
    return request('/api/portfolio', {
      method: 'POST',
      requireAuth: true,
      body: JSON.stringify(data),
    });
  },

  async deletePortfolioItem(id: string): Promise<ApiResult<{ deleted: boolean }>> {
    return request(`/api/portfolio/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      requireAuth: true,
    });
  },

  async getCompanies(filters?: { q?: string; city?: string }): Promise<ApiResult<{ items: CompanyProfile[] }>> {
    const params = new URLSearchParams();
    if (filters?.q) params.set('q', filters.q);
    if (filters?.city) params.set('city', filters.city);
    return request(`/api/companies?${params.toString()}`);
  },

  async getSuppliers(filters?: { q?: string; category?: string; city?: string }): Promise<ApiResult<{ items: SupplierProfile[] }>> {
    const params = new URLSearchParams();
    if (filters?.q) params.set('q', filters.q);
    if (filters?.category) params.set('category', filters.category);
    if (filters?.city) params.set('city', filters.city);
    return request(`/api/suppliers?${params.toString()}`);
  },

  // 4. Structured Proposal Requests
  async getProposalRequests(): Promise<ApiResult<ProposalRequest[]>> {
    return request('/api/proposal-requests', { requireAuth: true });
  },

  async createProposalRequest(data: {
    architectId: string;
    projectType: string;
    city: string;
    state: string;
    budgetRange?: string;
    timeline?: string;
    currentStage?: string;
    description: string;
    stylePreferences?: string[];
  }): Promise<ApiResult<{ id: string; threadId: string; projectTitle: string; status: string }>> {
    return request('/api/proposal-requests', {
      method: 'POST',
      requireAuth: true,
      body: JSON.stringify(data),
    });
  },

  async updateProposalRequestStatus(
    id: string,
    status: 'em_analise' | 'respondida' | 'recusada' | 'cancelada',
    architectResponse?: string
  ): Promise<ApiResult<{ id: string; status: string }>> {
    return request(`/api/proposal-requests/${encodeURIComponent(id)}/status`, {
      method: 'PATCH',
      requireAuth: true,
      body: JSON.stringify({ status, architectResponse }),
    });
  },

  // 5. Material Quotations (Authenticated)
  async createQuoteRequest(data: {
    requesterPhone?: string;
    requesterWhatsapp?: string;
    supplierId?: string;
    supplierName?: string;
    deliveryAddress: string;
    city: string;
    state: string;
    notes?: string;
    items: Array<{ productName: string; quantity: number; unit: string; notes?: string }>;
  }): Promise<ApiResult<{ id: string; status: string }>> {
    return request('/api/quotes', {
      method: 'POST',
      requireAuth: true,
      body: JSON.stringify(data),
    });
  },

  async getQuoteRequests(page = 1): Promise<ApiResult<{ items: QuoteRequest[]; page: number; limit: number }>> {
    return request(`/api/quotes?page=${page}`, { requireAuth: true });
  },

  // 6. Feed Posts & Projects
  async getPosts(page = 1): Promise<ApiResult<{ items: Post[]; page: number; limit: number }>> {
    return request(`/api/feed/posts?page=${page}`);
  },

  async getPostById(id: string): Promise<ApiResult<Post>> {
    return request(`/api/feed/posts/${encodeURIComponent(id)}`);
  },

  async createPost(postData: {
    category: string;
    title: string;
    content: string;
    mediaUrls: string[];
    location: { city: string; state: string };
    budgetEstimated?: number;
    deadlineDays?: number;
    artRrtCode?: string;
  }): Promise<ApiResult<Post>> {
    return request('/api/feed/posts', {
      method: 'POST',
      requireAuth: true,
      body: JSON.stringify(postData),
    });
  },

  async likePost(postId: string): Promise<ApiResult<{ success: boolean; postId: string; liked: boolean; likesCount: number }>> {
    return request(`/api/feed/posts/${encodeURIComponent(postId)}/like`, {
      method: 'POST',
      requireAuth: true,
    });
  },

  // 7. Opportunities & Proposals
  async getOpportunities(filters?: { q?: string; category?: string; city?: string; page?: number }): Promise<ApiResult<{ items: Opportunity[] }>> {
    const params = new URLSearchParams();
    if (filters?.q) params.set('q', filters.q);
    if (filters?.category) params.set('category', filters.category);
    if (filters?.city) params.set('city', filters.city);
    if (filters?.page) params.set('page', String(filters.page));
    return request(`/api/opportunities?${params.toString()}`);
  },

  async createOpportunity(oppData: Record<string, any>): Promise<ApiResult<{ id: string; title: string; status: string }>> {
    return request('/api/opportunities', {
      method: 'POST',
      requireAuth: true,
      body: JSON.stringify(oppData),
    });
  },

  async submitProposal(oppId: string, proposalData: Record<string, any>): Promise<ApiResult<{ id: string; status: string }>> {
    return request(`/api/opportunities/${encodeURIComponent(oppId)}/proposals`, {
      method: 'POST',
      requireAuth: true,
      body: JSON.stringify(proposalData),
    });
  },

  // 8. Favorites, Reviews & Reports
  async getFavorites(): Promise<ApiResult<FavoriteItem[]>> {
    return request('/api/favorites', { requireAuth: true });
  },

  async toggleFavorite(data: {
    targetType: 'professional' | 'company' | 'supplier' | 'opportunity';
    targetId: string;
    targetTitle: string;
    targetSubtitle?: string;
    targetAvatar?: string;
  }): Promise<ApiResult<{ favorited: boolean; id: string }>> {
    return request('/api/favorites', {
      method: 'POST',
      requireAuth: true,
      body: JSON.stringify(data),
    });
  },

  async getReviews(userId: string): Promise<ApiResult<ReviewItem[]>> {
    return request(`/api/reviews/${encodeURIComponent(userId)}`);
  },

  async createReview(data: {
    targetUserId: string;
    rating: number;
    comment: string;
    contractType?: string;
  }): Promise<ApiResult<{ id: string; rating: number; reviewsCount: number }>> {
    return request('/api/reviews', {
      method: 'POST',
      requireAuth: true,
      body: JSON.stringify(data),
    });
  },

  async submitReport(data: {
    targetType: 'chat' | 'profile' | 'post' | 'proposal';
    targetId: string;
    reason: string;
    details?: string;
  }): Promise<ApiResult<{ id: string; message: string }>> {
    return request('/api/reports', {
      method: 'POST',
      requireAuth: true,
      body: JSON.stringify(data),
    });
  },

  async sendTelemetry(eventName: string, path: string, metadata?: Record<string, any>): Promise<void> {
    try {
      await fetch(`${API_BASE_URL}/api/telemetry/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(getAuthToken() ? { Authorization: `Bearer ${getAuthToken()}` } : {}),
        },
        body: JSON.stringify({ eventName, path, metadata }),
        keepalive: true,
      });
    } catch {
      // Non-blocking telemetry
    }
  },

  // 9. Admin Operations (Server-enforced RBAC)
  async getAdminMetrics(): Promise<ApiResult<AdminMetrics>> {
    return request('/api/admin/metrics', { requireAuth: true });
  },

  async getAdminUsers(): Promise<ApiResult<{ items: any[] }>> {
    return request('/api/admin/users', { requireAuth: true });
  },

  async verifyUser(userId: string, verified = true): Promise<ApiResult<{ success: boolean }>> {
    return request(`/api/admin/users/${encodeURIComponent(userId)}/verify`, {
      method: 'PATCH',
      requireAuth: true,
      body: JSON.stringify({ verified }),
    });
  },

  async getAdminReports(): Promise<ApiResult<ReportItem[]>> {
    return request('/api/admin/reports', { requireAuth: true });
  },

  async resolveReport(reportId: string, status: 'aprovado' | 'removido' | 'resolvido'): Promise<ApiResult<{ success: boolean }>> {
    return request(`/api/admin/reports/${encodeURIComponent(reportId)}`, {
      method: 'PATCH',
      requireAuth: true,
      body: JSON.stringify({ status }),
    });
  },

  // 10. Ads Campaigns
  async getCampaigns(): Promise<ApiResult<AdCampaign[]>> {
    return request('/api/ads/campaigns');
  },

  async createCampaign(campData: Record<string, any>): Promise<ApiResult<AdCampaign>> {
    return request('/api/ads/campaigns', {
      method: 'POST',
      requireAuth: true,
      body: JSON.stringify(campData),
    });
  },

  async toggleCampaign(campaignId: string, status: 'ativa' | 'pausada'): Promise<ApiResult<{ success: boolean }>> {
    return request(`/api/ads/campaigns/${encodeURIComponent(campaignId)}/toggle`, {
      method: 'POST',
      requireAuth: true,
      body: JSON.stringify({ status }),
    });
  },

  async trackAdImpression(campaignId: string): Promise<void> {
    try {
      await fetch(`${API_BASE_URL}/api/ads/track/impression`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaignId }),
      });
    } catch {}
  },

  async trackAdClick(campaignId: string): Promise<void> {
    try {
      await fetch(`${API_BASE_URL}/api/ads/track/click`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaignId }),
      });
    } catch {}
  },

  // 11. Protected Realtime Chat & WebSocket
  async getThreads(): Promise<ApiResult<ChatThread[]>> {
    return request('/api/chat/threads', { requireAuth: true });
  },

  async createOrGetThread(participantId: string, projectTitle?: string, opportunityId?: string): Promise<ApiResult<ChatThread>> {
    return request('/api/chat/threads', {
      method: 'POST',
      requireAuth: true,
      body: JSON.stringify({ participantId, projectTitle, opportunityId }),
    });
  },

  async getMessages(threadId: string, options?: { limit?: number; before?: string }): Promise<ApiResult<{ messages: ChatMessage[]; hasMore: boolean }>> {
    const params = new URLSearchParams();
    if (options?.limit) params.set('limit', String(options.limit));
    if (options?.before) params.set('before', options.before);
    const qs = params.toString() ? `?${params.toString()}` : '';
    return request(`/api/chat/messages/${encodeURIComponent(threadId)}${qs}`, { requireAuth: true });
  },

  async sendMessage(
    threadId: string,
    text: string,
    clientMessageId: string,
    attachmentUrl?: string
  ): Promise<ApiResult<ChatMessage>> {
    return request('/api/chat/messages', {
      method: 'POST',
      requireAuth: true,
      body: JSON.stringify({ threadId, text, clientMessageId, attachmentUrl }),
    });
  },

  async markMessagesAsRead(threadId: string): Promise<ApiResult<{ ok: boolean; updated: number }>> {
    return request(`/api/chat/messages/${encodeURIComponent(threadId)}/read`, {
      method: 'PATCH',
      requireAuth: true,
    });
  },

  // Authenticated, auto-reconnecting WebSocket client
  connectWebSocket(
    onMessage: (payload: any) => void,
    onStatusChange?: (connected: boolean) => void
  ): { close: () => void } | null {
    const token = getAuthToken();
    if (!token) return null;

    let ws: WebSocket | null = null;
    let closedByClient = false;
    let reconnectAttempt = 0;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    let pingTimer: ReturnType<typeof setInterval> | null = null;

    const connect = () => {
      if (closedByClient) return;
      const currentToken = getAuthToken();
      if (!currentToken) return;

      try {
        ws = new WebSocket(getWebSocketUrl(currentToken));

        ws.onopen = () => {
          reconnectAttempt = 0;
          onStatusChange?.(true);
          if (pingTimer) clearInterval(pingTimer);
          pingTimer = setInterval(() => {
            if (ws && ws.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify({ type: 'PING' }));
            }
          }, 25000);
        };

        ws.onmessage = (event) => {
          try {
            const payload = JSON.parse(event.data);
            onMessage(payload);
          } catch {}
        };

        ws.onclose = (ev) => {
          onStatusChange?.(false);
          if (pingTimer) clearInterval(pingTimer);
          if (ev.code === 4001) {
            // Invalid/expired token — do not retry loop
            notifySessionExpired();
            return;
          }
          if (!closedByClient && reconnectAttempt < 5) {
            const delay = Math.min(15000, 1500 * Math.pow(2, reconnectAttempt));
            reconnectAttempt += 1;
            reconnectTimer = setTimeout(connect, delay);
          }
        };

        ws.onerror = () => {
          onStatusChange?.(false);
        };
      } catch {
        onStatusChange?.(false);
      }
    };

    connect();

    return {
      close: () => {
        closedByClient = true;
        if (reconnectTimer) clearTimeout(reconnectTimer);
        if (pingTimer) clearInterval(pingTimer);
        if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) {
          ws.close();
        }
      },
    };
  },
};
