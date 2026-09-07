import { UserProfile, Post, Opportunity, Proposal, ConstructionProject, ChatMessage, ChatThread, AdCampaign, ModerationItem } from '../types';
import { INITIAL_USER, MOCK_POSTS, MOCK_OPPORTUNITIES, MOCK_PROJECTS, MOCK_CHAT_THREADS, MOCK_MESSAGES, MOCK_CAMPAIGNS, MOCK_MODERATION } from './mockData';

const STORAGE_KEYS = {
  USER: 'alicerce_user',
  POSTS: 'alicerce_posts',
  OPPORTUNITIES: 'alicerce_opportunities',
  PROJECTS: 'alicerce_projects',
  CAMPAIGNS: 'alicerce_campaigns',
  MESSAGES: 'alicerce_messages',
  MODERATION: 'alicerce_moderation',
};

// Helper for LocalStorage initialization
function getStored<T>(key: string, defaultValue: T): T {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch (err) {
    console.error(`Error reading ${key} from LocalStorage`, err);
    return defaultValue;
  }
}

function setStored<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Error writing ${key} to LocalStorage`, err);
  }
}

export const LocalApiService = {
  // User Profile & Auth
  getUser(): UserProfile {
    return getStored<UserProfile>(STORAGE_KEYS.USER, INITIAL_USER);
  },

  updateUser(updated: Partial<UserProfile>): UserProfile {
    const current = this.getUser();
    const newProfile = { ...current, ...updated };
    setStored(STORAGE_KEYS.USER, newProfile);
    return newProfile;
  },

  switchRole(role: UserProfile['role']): UserProfile {
    const current = this.getUser();
    let creaCau = current.creaCauNumber;
    let cnpj = current.cnpjNumber;
    let name = current.name;

    if (role === 'profissional_crea') {
      name = 'Eng. Roberto Silva';
      creaCau = 'CREA-SP 5069824/D';
    } else if (role === 'profissional_cau') {
      name = 'Arq. Roberto Silva';
      creaCau = 'CAU A88291-0';
    } else if (role === 'empresa_cnpj') {
      name = 'Silva & Associados Engenharia LTDA';
      cnpj = '33.910.402/0001-12';
    } else if (role === 'investidor') {
      name = 'Roberto Silva (Investimentos Imobiliários)';
    }

    return this.updateUser({ role, name, creaCauNumber: creaCau, cnpjNumber: cnpj });
  },

  // Feed Posts
  getPosts(): Post[] {
    const raw = getStored<Post[]>(STORAGE_KEYS.POSTS, []);
    const clean = raw.filter(p => !['post_1', 'post_2', 'post_3'].includes(p.id));
    if (clean.length !== raw.length) {
      setStored(STORAGE_KEYS.POSTS, clean);
    }
    return clean;
  },

  addPost(postData: Omit<Post, 'id' | 'createdAt' | 'likesCount' | 'commentsCount' | 'proposalsCount'>): Post {
    const posts = this.getPosts();
    const user = this.getUser();
    
    // Auto-stamp generation
    const hash = Math.random().toString(36).substring(2) + Date.now().toString(36);
    const newPost: Post = {
      ...postData,
      id: `post_${Date.now()}`,
      likesCount: 0,
      commentsCount: 0,
      proposalsCount: 0,
      createdAt: 'Agora mesmo',
      technicalStamp: {
        stampId: `ALC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
        registrationNumber: user.creaCauNumber || user.cnpjNumber || 'CPF VERIFICADO',
        issueDate: new Date().toLocaleString('pt-BR'),
        hashVerification: hash,
        artRrtCode: user.creaCauNumber ? `ART SP${new Date().getFullYear()}/${Math.floor(100000 + Math.random() * 900000)}` : undefined,
        status: 'valid',
      },
    };

    const updated = [newPost, ...posts];
    setStored(STORAGE_KEYS.POSTS, updated);
    return newPost;
  },

  toggleLikePost(postId: string): Post[] {
    const posts = this.getPosts().map(post => {
      if (post.id === postId) {
        const isLiked = !post.isLiked;
        return {
          ...post,
          isLiked,
          likesCount: isLiked ? post.likesCount + 1 : post.likesCount - 1,
        };
      }
      return post;
    });
    setStored(STORAGE_KEYS.POSTS, posts);
    return posts;
  },

  // Opportunities & Proposals
  getOpportunities(): Opportunity[] {
    return getStored<Opportunity[]>(STORAGE_KEYS.OPPORTUNITIES, MOCK_OPPORTUNITIES);
  },

  addOpportunity(oppData: Omit<Opportunity, 'id' | 'createdAt' | 'proposalsCount' | 'proposals' | 'status'>): Opportunity {
    const opps = this.getOpportunities();
    const newOpp: Opportunity = {
      ...oppData,
      id: `opp_${Date.now()}`,
      status: 'aberto',
      proposalsCount: 0,
      proposals: [],
      createdAt: 'Hoje',
    };
    const updated = [newOpp, ...opps];
    setStored(STORAGE_KEYS.OPPORTUNITIES, updated);
    return newOpp;
  },

  addProposal(oppId: string, proposalData: Omit<Proposal, 'id' | 'opportunityId' | 'createdAt' | 'status'>): Opportunity[] {
    const user = this.getUser();
    const opps = this.getOpportunities().map(opp => {
      if (opp.id === oppId) {
        const newProp: Proposal = {
          ...proposalData,
          id: `prop_${Date.now()}`,
          opportunityId: oppId,
          proposerId: user.id,
          proposerName: user.name,
          proposerRole: user.role,
          proposerAvatar: user.avatar,
          creaCau: user.creaCauNumber,
          status: 'em_negociacao',
          createdAt: 'Agora mesmo',
        };
        return {
          ...opp,
          proposalsCount: opp.proposalsCount + 1,
          proposals: [newProp, ...opp.proposals],
        };
      }
      return opp;
    });
    setStored(STORAGE_KEYS.OPPORTUNITIES, opps);
    return opps;
  },

  // Construction Projects
  getProjects(): ConstructionProject[] {
    return getStored<ConstructionProject[]>(STORAGE_KEYS.PROJECTS, MOCK_PROJECTS);
  },

  // Ads Campaigns
  getCampaigns(): AdCampaign[] {
    return getStored<AdCampaign[]>(STORAGE_KEYS.CAMPAIGNS, MOCK_CAMPAIGNS);
  },

  addCampaign(campData: Omit<AdCampaign, 'id' | 'createdAt' | 'impressionsCount' | 'clicksCount' | 'status'>): AdCampaign {
    const campaigns = this.getCampaigns();
    const user = this.getUser();
    
    // Simulating Pix QR Code & CopyPaste String
    const randomHash = Math.random().toString(36).substring(2, 12).toUpperCase();
    const pixCode = `00020126580014BR.GOV.BCB.PIX0136alicerce-pay@bancopix.com.br520400005303986540${campData.totalBudget.toFixed(2)}5802BR5916ALICERCE ADS SAO PAULO6009SAO PAULO62070503***6304${randomHash}`;

    const newCamp: AdCampaign = {
      ...campData,
      id: `camp_${Date.now()}`,
      userId: user.id,
      impressionsCount: 0,
      clicksCount: 0,
      status: 'ativa',
      pixQrCode: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(pixCode)}`,
      pixCopiaECola: pixCode,
      invoiceNfseUrl: `NFS-e_ALICERCE_${Math.floor(100000 + Math.random() * 900000)}.pdf`,
      createdAt: new Date().toLocaleDateString('pt-BR'),
    };

    const updated = [newCamp, ...campaigns];
    setStored(STORAGE_KEYS.CAMPAIGNS, updated);
    return newCamp;
  },

  // Chat Messages
  getChatThreads(): ChatThread[] {
    return MOCK_CHAT_THREADS;
  },

  getMessages(threadId: string): ChatMessage[] {
    return MOCK_MESSAGES[threadId] || [];
  },

  sendMessage(threadId: string, text: string, attachmentUrl?: string): ChatMessage {
    const user = this.getUser();
    const currentMsgs = this.getMessages(threadId);
    const newMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      senderId: user.id,
      senderName: user.name,
      receiverId: 'usr_camila',
      text,
      attachmentUrl,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: true,
    };
    MOCK_MESSAGES[threadId] = [...currentMsgs, newMsg];
    return newMsg;
  },

  // Moderation
  getModerationQueue(): ModerationItem[] {
    return getStored<ModerationItem[]>(STORAGE_KEYS.MODERATION, MOCK_MODERATION);
  },

  resolveModerationItem(itemId: string, status: 'aprovado' | 'removido'): ModerationItem[] {
    const items = this.getModerationQueue().map(item => item.id === itemId ? { ...item, status } : item);
    setStored(STORAGE_KEYS.MODERATION, items);
    return items;
  },
};
