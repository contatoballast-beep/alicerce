import { LocalApiService } from './api';
import { Post, Opportunity, AdCampaign, ChatMessage, UserProfile, UserRole } from '../types';

const getApiBaseUrl = (): string => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  // If in browser and not running on localhost:3000/5173, use relative root
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
  // Check Health
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

  // Auth: Login
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

  // Auth: Register
  async register(userData: {
    name: string;
    email: string;
    password: string;
    role: UserRole;
    creaCauNumber?: string;
    cnpjNumber?: string;
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

  // Feed Posts
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
        // Also update local cache
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

  // Opportunities & Proposals
  async getOpportunities(): Promise<Opportunity[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/opportunities`);
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

  // Ads Campaigns
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

  // Chat Messages & WebSocket
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

  // WebSocket connection for real-time live chat
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
          console.error('[WebSocket] Erro ao parsear mensagem:', e);
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
