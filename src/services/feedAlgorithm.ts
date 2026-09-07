import { Post, UserProfile, AdCampaign } from '../types';

export type FeedRankingMode = 'relevance' | 'recent' | 'engagement' | 'nearby';

export interface RankedPost extends Post {
  algorithmScore?: number;
  rankingReason?: string;
}

/**
 * ALICERCE Technical Relevance Ranking Engine
 * Formula: Score = S_stamp + S_engagement + S_freshness + S_geo + S_affinity + S_ad_boost
 */
export function rankFeedPosts(
  posts: Post[],
  currentUser: UserProfile,
  rankingMode: FeedRankingMode = 'relevance',
  activeCampaigns: AdCampaign[] = []
): RankedPost[] {
  // 1. Calculate Score for Organic Posts
  const scoredPosts: RankedPost[] = posts.map(post => {
    let score = 0;
    const reasons: string[] = [];

    // Factor 1: Technical Stamp (ART / RRT / CREA / CAU / CNPJ)
    if (post.technicalStamp && post.technicalStamp.status === 'valid') {
      if (post.technicalStamp.artRrtCode) {
        score += 35;
        reasons.push('ART/RRT Registrada');
      } else if (post.technicalStamp.registrationNumber?.includes('CREA')) {
        score += 25;
        reasons.push('CREA Verificado');
      } else if (post.technicalStamp.registrationNumber?.includes('CAU')) {
        score += 25;
        reasons.push('CAU Verificado');
      } else if (post.technicalStamp.registrationNumber?.includes('CNPJ')) {
        score += 20;
        reasons.push('CNPJ Verificado');
      }
    }

    // Factor 2: Engagement (Likes, Comments, Proposals)
    const likes = post.likesCount || 0;
    const comments = post.commentsCount || 0;
    const proposals = post.proposalsCount || 0;
    const engagementScore = Math.log1p(likes * 2 + comments * 4 + proposals * 8) * 6;
    score += engagementScore;
    if (likes > 50 || proposals > 5) {
      reasons.push('Alta Interação');
    }

    // Factor 3: Geographic Proximity
    if (currentUser?.city && post.location?.city) {
      if (currentUser.city.toLowerCase() === post.location.city.toLowerCase()) {
        score += 30;
        reasons.push(`Obra em ${post.location.city}`);
      } else if (currentUser.state && post.location.state && currentUser.state.toUpperCase() === post.location.state.toUpperCase()) {
        score += 15;
        reasons.push(`Região de ${post.location.state}`);
      }
    }

    // Factor 4: Role & Discipline Affinity
    if (currentUser?.role) {
      const userRole = currentUser.role;
      const category = post.category || '';
      if ((userRole.includes('crea') || userRole.includes('engenheiro')) && (category.includes('obra') || category.includes('estrutural'))) {
        score += 20;
        reasons.push('Afinidade com Engenharia');
      } else if ((userRole.includes('cau') || userRole.includes('arquiteto')) && (category.includes('portfolio') || category.includes('projeto'))) {
        score += 20;
        reasons.push('Afinidade com Arquitetura');
      } else if ((userRole.includes('empresa') || userRole.includes('construtora')) && category.includes('oportunidade')) {
        score += 20;
        reasons.push('Oportunidade Comercial');
      }
    }

    return {
      ...post,
      algorithmScore: Math.round(score),
      rankingReason: reasons.slice(0, 2).join(' • ') || 'Recomendado para Você'
    };
  });

  // 2. Sort according to mode
  let sorted: RankedPost[] = [];
  switch (rankingMode) {
    case 'recent':
      sorted = [...scoredPosts].reverse();
      break;
    case 'engagement':
      sorted = [...scoredPosts].sort((a, b) => ((b.likesCount || 0) + (b.commentsCount || 0) * 2) - ((a.likesCount || 0) + (a.commentsCount || 0) * 2));
      break;
    case 'nearby':
      sorted = [...scoredPosts].sort((a, b) => {
        const aMatchesCity = currentUser.city && a.location?.city?.toLowerCase() === currentUser.city.toLowerCase() ? 1 : 0;
        const bMatchesCity = currentUser.city && b.location?.city?.toLowerCase() === currentUser.city.toLowerCase() ? 1 : 0;
        return bMatchesCity - aMatchesCity;
      });
      break;
    case 'relevance':
    default:
      sorted = [...scoredPosts].sort((a, b) => (b.algorithmScore || 0) - (a.algorithmScore || 0));
      break;
  }

  // 3. Organic Injection of Active ALICERCE Ads Campaigns (every 4-5 items)
  const paidCampaigns = activeCampaigns.filter(c => c.status === 'ativa');
  if (paidCampaigns.length === 0) return sorted;

  const resultWithAds: RankedPost[] = [];
  let adIndex = 0;

  for (let i = 0; i < sorted.length; i++) {
    resultWithAds.push(sorted[i]);

    // Inject sponsored post every 4th post
    if ((i + 1) % 4 === 0 && adIndex < paidCampaigns.length) {
      const camp = paidCampaigns[adIndex % paidCampaigns.length];
      const adPost: RankedPost = {
        id: `ad_post_${camp.id}`,
        authorId: camp.userId,
        authorName: camp.title,
        authorAvatar: 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b7?w=150&auto=format&fit=crop&q=80',
        authorRole: 'fornecedor',
        authorBadge: 'Anunciante Verificado • ALICERCE Ads',
        category: 'patrocinado',
        title: `[PATROCINADO] ${camp.title}`,
        content: `Campanha ativa direcionada para ${camp.targetRegion}. Objetivo: ${camp.objective}. Clique no botão abaixo para entrar em contato ou solicitar cotação direta.`,
        mediaUrls: [
          'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&auto=format&fit=crop&q=80'
        ],
        location: { city: camp.targetRegion.split(' ')[0] || 'São Paulo', state: 'SP' },
        likesCount: Math.floor(25 + Math.random() * 40),
        commentsCount: Math.floor(5 + Math.random() * 12),
        proposalsCount: 0,
        isSponsored: true,
        createdAt: 'Agora mesmo',
        algorithmScore: 999,
        rankingReason: `⚡ Patrocinado • ALICERCE Ads (${camp.targetRegion})`
      };
      resultWithAds.push(adPost);
      adIndex++;
    }
  }

  return resultWithAds;
}
