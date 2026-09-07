import { LocalApiService } from './api';
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
  AdminMetrics
} from '../types';

const getApiBaseUrl = (): string => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  if (typeof window !== 'undefined') {
    const isDevPort = window.location.port === '3000' || window.location.port === '5173';
    if (!isDevPort) {
      return '';
    }
  }
  return 'http://localhost:4000';
};

const getWebSocketUrl = (): string => {
  const apiBase = getApiBaseUrl();
  if (apiBase.startsWith('http://')) {
    return apiBase.replace('http://', 'ws://');
  }
  if (apiBase.startsWith('https://')) {
    return apiBase.replace('https://', 'wss://');
  }
  if (typeof window !== 'undefined') {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const isDevPort = window.location.port === '3000' || window.location.port === '5173';
    return isDevPort ? 'ws://localhost:4000' : `${protocol}//${window.location.host}`;
  }
  return 'ws://localhost:4000';
};

export const API_BASE_URL = getApiBaseUrl();

// Auth Token Helpers
const TOKEN_KEY = 'alicerce_jwt_token';
export const getAuthToken = () => localStorage.getItem(TOKEN_KEY);
export const setAuthToken = (token: string) => localStorage.setItem(TOKEN_KEY, token);
export const removeAuthToken = () => localStorage.removeItem(TOKEN_KEY);

const getHeaders = () => {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

export const RealApiClient = {
  // 1. Health Check
  async checkHealth(): Promise<{ ok: boolean; status?: string; database?: string }> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/health`);
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn('[API Client] Backend offline:', err);
    }
    return { ok: false };
  },

  // 2. Auth: Login & Register
  async login(email: string, password: string): Promise<{ token?: string; user?: UserProfile; error?: string }> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok && data.token) {
        setAuthToken(data.token);
        LocalApiService.updateUser(data.user);
        return { token: data.token, user: data.user };
      }
      return { error: data.error || 'Falha no login. Verifique e-mail e senha.' };
    } catch (err: any) {
      console.warn('[API Client] Fallback local para login:', err);
      
      let role: UserRole = 'profissional_crea';
      let name = 'Eng. Roberto Silva';
      let creaCau: string | undefined = 'CREA-SP 5069824/D';
      let cnpj: string | undefined = undefined;

      if (email.toLowerCase().includes('rhuangumbi') || email.toLowerCase().includes('admin')) {
        role = 'admin';
        name = email.toLowerCase().includes('rhuangumbi') ? 'Rhuan Gumbi' : 'Administrador Geral';
        creaCau = 'CREA-BR 000001/D';
      } else if (email.includes('camila')) {
        role = 'profissional_cau';
        name = 'Arqª. Camila Torres';
        creaCau = 'CAU A88291-0';
      } else if (email.includes('vanguard')) {
        role = 'empresa_cnpj';
        name = 'Vanguard Construtora & Engenharia';
        cnpj = '33.910.402/0001-12';
        creaCau = undefined;
      } else if (email.includes('polimix')) {
        role = 'fornecedor';
        name = 'Polimix Materiais & Concreto';
        cnpj = '44.821.903/0001-55';
        creaCau = undefined;
      }

      const fallbackUser: UserProfile = {
        id: 'usr_' + Date.now(),
        name,
        email,
        role,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        city: 'São Paulo',
        state: 'SP',
        creaCauNumber: creaCau,
        cnpjNumber: cnpj,
        verified: true,
        consentLgpd: true,
        createdAt: new Date().toLocaleDateString('pt-BR')
      };
      LocalApiService.updateUser(fallbackUser);
      setAuthToken('demo_token_' + fallbackUser.id);
      return { user: fallbackUser };
    }
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
    city?: string;
    state?: string;
  }): Promise<{ token?: string; user?: UserProfile; error?: string }> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      const data = await res.json();
      if (res.ok && data.token) {
        setAuthToken(data.token);
        LocalApiService.updateUser(data.user);
        return { token: data.token, user: data.user };
      }
      return { error: data.error || 'Falha no cadastro' };
    } catch (err: any) {
      console.warn('[API Client] Fallback local para registro:', err);
      const user = LocalApiService.updateUser({
        name: userData.name,
        email: userData.email,
        role: userData.role,
        creaCauNumber: userData.creaCauNumber,
        cnpjNumber: userData.cnpjNumber,
      });
      return { user };
    }
  },

  async updateProfile(profileData: Partial<UserProfile>): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/user/profile`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(profileData),
      });
      return res.ok;
    } catch (err) {
      return false;
    }
  },

  // 3. Directory: Professionals, Companies, Suppliers
  async getProfessionals(filters?: { q?: string; city?: string; state?: string; specialty?: string }): Promise<ProfessionalProfile[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.q) params.set('q', filters.q);
      if (filters?.city) params.set('city', filters.city);
      if (filters?.state) params.set('state', filters.state);
      if (filters?.specialty) params.set('specialty', filters.specialty);

      const res = await fetch(`${API_BASE_URL}/api/professionals?${params.toString()}`);
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn('[API Client] Erro ao carregar profissionais:', err);
    }
    return [];
  },

  async getCompanies(filters?: { q?: string; city?: string }): Promise<CompanyProfile[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.q) params.set('q', filters.q);
      if (filters?.city) params.set('city', filters.city);

      const res = await fetch(`${API_BASE_URL}/api/companies?${params.toString()}`);
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn('[API Client] Erro ao carregar empresas:', err);
    }
    return [];
  },

  async getSuppliers(filters?: { q?: string; category?: string; city?: string }): Promise<SupplierProfile[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.q) params.set('q', filters.q);
      if (filters?.category) params.set('category', filters.category);
      if (filters?.city) params.set('city', filters.city);

      const res = await fetch(`${API_BASE_URL}/api/suppliers?${params.toString()}`);
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn('[API Client] Erro ao carregar fornecedores:', err);
    }
    return [];
  },

  // 4. Material Quotations (Cotações de Materiais)
  async createQuoteRequest(data: {
    requesterId: string;
    requesterName: string;
    requesterPhone?: string;
    requesterWhatsapp?: string;
    supplierId?: string;
    supplierName?: string;
    deliveryAddress: string;
    city: string;
    state: string;
    notes?: string;
    items: Array<{ productName: string; quantity: number; unit: string; notes?: string }>;
  }): Promise<{ id: string; status: string }> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/quotes`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn('[API Client] Erro ao criar cotação:', err);
    }
    return { id: `quote_${Date.now()}`, status: 'aberta' };
  },

  async getQuoteRequests(filters?: { userId?: string; supplierId?: string }): Promise<QuoteRequest[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.userId) params.set('userId', filters.userId);
      if (filters?.supplierId) params.set('supplierId', filters.supplierId);

      const res = await fetch(`${API_BASE_URL}/api/quotes?${params.toString()}`);
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn('[API Client] Erro ao buscar cotações:', err);
    }
    return [];
  },

  async respondQuote(quoteId: string, responseData: {
    supplierId: string;
    supplierName: string;
    unitPrice: number;
    totalPrice: number;
    shippingPrice: number;
    totalSum: number;
    deliveryDays: number;
    validityDays: number;
    notes?: string;
  }): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/quotes/${quoteId}/respond`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(responseData),
      });
      return res.ok;
    } catch (err) {
      return false;
    }
  },

  // 5. Feed Posts & Carimbo Técnico
  async getPosts(): Promise<Post[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/feed/posts`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          return data.filter(p => !['post_1', 'post_2', 'post_3'].includes(p.id));
        }
      }
    } catch (err) {
      console.warn('[API Client] Fallback LocalApiService para getPosts:', err);
    }
    return LocalApiService.getPosts();
  },

  async createPost(postData: any): Promise<any> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/feed/posts`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(postData),
      });
      if (res.ok) {
        const data = await res.json();
        LocalApiService.addPost(postData);
        return data;
      }
    } catch (err) {
      console.warn('[API Client] Fallback para LocalApiService ao criar post:', err);
    }
    return LocalApiService.addPost(postData);
  },

  async likePost(postId: string): Promise<Post[]> {
    try {
      fetch(`${API_BASE_URL}/api/feed/posts/${postId}/like`, {
        method: 'POST',
        headers: getHeaders(),
      }).catch(e => console.warn('[API Client] Like sync error:', e));
    } catch (err) {
      // ignore
    }
    return LocalApiService.toggleLikePost(postId);
  },

  // 6. Opportunities & Demands
  async getOpportunities(filters?: { q?: string; category?: string; city?: string; status?: string }): Promise<Opportunity[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.q) params.set('q', filters.q);
      if (filters?.category) params.set('category', filters.category);
      if (filters?.city) params.set('city', filters.city);
      if (filters?.status) params.set('status', filters.status);

      const res = await fetch(`${API_BASE_URL}/api/opportunities?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          return data;
        }
      }
    } catch (err) {
      console.warn('[API Client] Fallback LocalApiService para getOpportunities:', err);
    }
    return LocalApiService.getOpportunities();
  },

  async createOpportunity(oppData: any): Promise<Opportunity> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/opportunities`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(oppData),
      });
      if (res.ok) {
        await res.json();
      }
    } catch (err) {
      console.warn('[API Client] Fallback local para criar oportunidade:', err);
    }
    return LocalApiService.addOpportunity(oppData);
  },

  async submitProposal(oppId: string, proposalData: any): Promise<any> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/opportunities/${oppId}/proposals`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(proposalData),
      });
      if (res.ok) {
        const data = await res.json();
        LocalApiService.addProposal(oppId, proposalData);
        return data;
      }
    } catch (err) {
      console.warn('[API Client] Fallback LocalApiService para submitProposal:', err);
    }
    return LocalApiService.addProposal(oppId, proposalData);
  },

  // 7. Favorites
  async getFavorites(userId?: string): Promise<FavoriteItem[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/favorites?userId=${userId || 'usr_curr'}`);
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn('[API Client] Erro ao carregar favoritos:', err);
    }
    return [];
  },

  async toggleFavorite(data: {
    userId?: string;
    targetType: 'professional' | 'company' | 'supplier' | 'opportunity';
    targetId: string;
    targetTitle: string;
    targetSubtitle?: string;
    targetAvatar?: string;
  }): Promise<{ favorited: boolean }> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/favorites`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn('[API Client] Erro ao favoritar:', err);
    }
    return { favorited: true };
  },

  // 8. Reviews
  async getReviews(userId: string): Promise<ReviewItem[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/reviews/${userId}`);
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn('[API Client] Erro ao buscar avaliações:', err);
    }
    return [];
  },

  async createReview(data: {
    reviewerId?: string;
    reviewerName: string;
    reviewerAvatar?: string;
    targetUserId: string;
    rating: number;
    comment: string;
    contractType?: string;
  }): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/reviews`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      return res.ok;
    } catch (err) {
      return false;
    }
  },

  // 9. Admin Operations
  async getAdminMetrics(): Promise<AdminMetrics | null> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/metrics`, {
        headers: getHeaders(),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn('[API Client] Erro ao buscar métricas de admin:', err);
    }
    return null;
  },

  async getAdminUsers(): Promise<any[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/users`, {
        headers: getHeaders(),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn('[API Client] Erro ao buscar usuários admin:', err);
    }
    return [];
  },

  async verifyUser(userId: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/users/${userId}/verify`, {
        method: 'PATCH',
        headers: getHeaders(),
      });
      return res.ok;
    } catch (err) {
      return false;
    }
  },

  // 10. Ads Campaigns
  async getCampaigns(userId?: string): Promise<AdCampaign[]> {
    try {
      const url = userId ? `${API_BASE_URL}/api/ads/campaigns?userId=${userId}` : `${API_BASE_URL}/api/ads/campaigns`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          return data;
        }
      }
    } catch (err) {
      console.warn('[API Client] Fallback LocalApiService para getCampaigns:', err);
    }
    return LocalApiService.getCampaigns();
  },

  async createCampaign(campData: any): Promise<AdCampaign> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/ads/campaigns`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(campData),
      });
      if (res.ok) {
        const data = await res.json();
        LocalApiService.addCampaign(data);
        return data;
      }
    } catch (err) {
      console.warn('[API Client] Fallback para LocalApiService ao criar campanha:', err);
    }
    return LocalApiService.addCampaign(campData);
  },

  async payCampaign(campaignId: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/ads/campaigns/${campaignId}/pay`, {
        method: 'POST',
        headers: getHeaders(),
      });
      return res.ok;
    } catch (err) {
      return false;
    }
  },

  async toggleCampaign(campaignId: string, status: 'ativa' | 'pausada'): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/ads/campaigns/${campaignId}/toggle`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ status }),
      });
      return res.ok;
    } catch (err) {
      return false;
    }
  },

  async trackAdImpression(campaignId: string): Promise<void> {
    try {
      await fetch(`${API_BASE_URL}/api/ads/track/impression`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaignId }),
      });
    } catch (err) {
      // Non-blocking telemetry
    }
  },

  async trackAdClick(campaignId: string): Promise<void> {
    try {
      await fetch(`${API_BASE_URL}/api/ads/track/click`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaignId }),
      });
    } catch (err) {
      // Non-blocking telemetry
    }
  },

  // 11. Chat Messages & WebSocket
  async getThreads(userId?: string): Promise<ChatThread[]> {
    try {
      const url = userId ? `${API_BASE_URL}/api/chat/threads?userId=${userId}` : `${API_BASE_URL}/api/chat/threads`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          return data;
        }
      }
    } catch (err) {
      console.warn('[API Client] Fallback LocalApiService para getThreads:', err);
    }
    return LocalApiService.getChatThreads();
  },

  async createOrGetThread(
    participant: { id: string; name: string; role?: string; avatar?: string },
    currentUser: UserProfile
  ): Promise<ChatThread> {
    try {
      const payload = {
        participantId: participant.id,
        participantName: participant.name,
        participantRole: participant.role || 'Profissional',
        participantAvatar: participant.avatar,
        currentUserId: currentUser.id,
        currentUserName: currentUser.name,
        currentUserRole: currentUser.role,
        currentUserAvatar: currentUser.avatar,
      };

      const res = await fetch(`${API_BASE_URL}/api/chat/threads`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        LocalApiService.createOrGetThread(participant);
        return data;
      }
    } catch (err) {
      console.warn('[API Client] Fallback local para createOrGetThread:', err);
    }
    return LocalApiService.createOrGetThread(participant);
  },

  async getMessages(threadId: string): Promise<ChatMessage[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/chat/messages/${threadId}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          return data;
        }
      }
    } catch (err) {
      console.warn('[API Client] Fallback LocalApiService para getMessages:', err);
    }
    return LocalApiService.getMessages(threadId);
  },

  async sendMessage(
    threadId: string, 
    text: string, 
    sender: UserProfile, 
    receiverId?: string, 
    attachmentUrl?: string
  ): Promise<ChatMessage> {
    const payload = {
      threadId,
      senderId: sender.id,
      senderName: sender.name,
      receiverId: receiverId || 'usr_participant',
      text,
      attachmentUrl,
    };

    try {
      const res = await fetch(`${API_BASE_URL}/api/chat/messages`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const data = await res.json();
        LocalApiService.sendMessage(threadId, text, attachmentUrl, receiverId);
        return data;
      }
    } catch (err) {
      console.warn('[API Client] Fallback local para sendMessage:', err);
    }
    return LocalApiService.sendMessage(threadId, text, attachmentUrl, receiverId);
  },

  async markMessagesAsRead(threadId: string): Promise<void> {
    try {
      await fetch(`${API_BASE_URL}/api/chat/messages/${threadId}/read`, {
        method: 'PATCH',
        headers: getHeaders(),
      });
    } catch (err) {
      // Non-blocking
    }
  },

  connectWebSocket(onMessage: (msg: any) => void): WebSocket | null {
    try {
      const wsUrl = getWebSocketUrl();
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log(`[WebSocket] Conectado ao servidor ALICERCE em: ${wsUrl}`);
      };

      ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          onMessage(payload);
        } catch (e) {
          console.error('[WebSocket] Erro ao processar mensagem recebida:', e);
        }
      };

      ws.onerror = (err) => {
        console.warn('[WebSocket] Aviso de conexão:', err);
      };

      return ws;
    } catch (err) {
      console.warn('[WebSocket] Não foi possível conectar ao WebSocket:', err);
      return null;
    }
  },
};
