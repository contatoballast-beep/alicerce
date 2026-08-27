import { LocalApiService } from './api';
import { Post, Opportunity, AdCampaign, ChatMessage } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export const RealApiClient = {
  async getPosts(): Promise<Post[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/feed/posts`);
      if (res.ok) {
        const data = await res.json();
        return data;
      }
    } catch (err) {
      console.warn('[API Client] Servidor offline ou em ambiente local. Usando fallback LocalApiService:', err);
    }
    return LocalApiService.getPosts();
  },

  async createPost(postData: any): Promise<any> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/feed/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn('[API Client] Fallback para LocalApiService ao criar post:', err);
    }
    return LocalApiService.addPost(postData);
  },

  async getOpportunities(): Promise<Opportunity[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/opportunities`);
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn('[API Client] Fallback para LocalApiService ao buscar oportunidades:', err);
    }
    return LocalApiService.getOpportunities();
  },

  async submitProposal(oppId: string, proposalData: any): Promise<any> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/opportunities/${oppId}/proposals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(proposalData),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn('[API Client] Fallback para LocalApiService ao enviar proposta:', err);
    }
    return LocalApiService.addProposal(oppId, proposalData);
  },

  async getCampaigns(): Promise<AdCampaign[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/ads/campaigns`);
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn('[API Client] Fallback para LocalApiService ao buscar campanhas:', err);
    }
    return LocalApiService.getCampaigns();
  },

  async createCampaign(campData: any): Promise<any> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/ads/campaigns`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(campData),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn('[API Client] Fallback para LocalApiService ao criar campanha:', err);
    }
    return LocalApiService.addCampaign(campData);
  }
};
