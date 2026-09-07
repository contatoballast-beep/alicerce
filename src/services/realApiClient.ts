import { LocalApiService } from './api';
import { 
  Post, 
  Opportunity, 
  AdCampaign, 
  ChatMessage, 
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
      return { error: data.error || 'Falha no login' };
    } catch (err: any) {
      console.warn('[API Client] Fallback local para login:', err);
      const user = LocalApiService.getUser();
      return { user };
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
        if (Array.isArray(data) && data.length > 0) {
          return data;
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
  async getCampaigns(): Promise<AdCampaign[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/ads/campaigns`);
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
        const localCamp = LocalApiService.addCampaign(campData);
        return { ...localCamp, ...data };
      }
    } catch (err) {
      console.warn('[API Client] Fallback para LocalApiService ao criar campanha:', err);
    }
    return LocalApiService.addCampaign(campData);
  },

  // 11. Chat Messages & WebSocket
  async getMessages(threadId: string): Promise<ChatMessage[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/messages/${threadId}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          return data;
        }
      }
    } catch (err) {
      console.warn('[API Client] Fallback LocalApiService para getMessages:', err);
    }
    return LocalApiService.getMessages(threadId);
  },

  async sendMessage(threadId: string, text: string, sender: UserProfile, attachmentUrl?: string): Promise<ChatMessage> {
    const payload = {
      threadId,
      senderId: sender.id,
      senderName: sender.name,
      receiverId: 'usr_camila',
      text,
      attachmentUrl,
    };

    try {
      const res = await fetch(`${API_BASE_URL}/api/messages`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const data = await res.json();
        LocalApiService.sendMessage(threadId, text, attachmentUrl);
        return data;
      }
    } catch (err) {
      console.warn('[API Client] Fallback local para sendMessage:', err);
    }
    return LocalApiService.sendMessage(threadId, text, attachmentUrl);
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
