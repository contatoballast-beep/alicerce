import { Post, UserProfile, AdCampaign } from '../types';

export type FeedRankingMode = 'relevance' | 'recent' | 'engagement' | 'nearby';

export interface RankedPost extends Post {
  algorithmScore?: number;
  rankingReason?: string;
}

export function rankFeedPosts(
  posts: Post[],
  currentUser: UserProfile,
  rankingMode: FeedRankingMode = 'relevance',
  activeCampaigns: AdCampaign[] = []
): RankedPost[] {
  const scoredPosts: RankedPost[] = posts.map((post) => {
    let score = 0;
    const reasons: string[] = [];

    if (post.authorVerified) {
      score += 30;
      reasons.push('Profissional verificado');
    }

    const likes = post.likesCount || 0;
    const comments = post.commentsCount || 0;
    const proposals = post.proposalsCount || 0;
    score += Math.log1p(likes * 2 + comments * 4 + proposals * 8) * 6;

    if (currentUser?.city && post.location?.city) {
      if (currentUser.city.toLowerCase() === post.location.city.toLowerCase()) {
        score += 25;
        reasons.push(`Projeto em ${post.location.city}`);
      } else if (
        currentUser.state &&
        post.location.state &&
        currentUser.state.toUpperCase() === post.location.state.toUpperCase()
      ) {
        score += 12;
        reasons.push(`Região ${post.location.state}`);
      }
    }

    return {
      ...post,
      algorithmScore: Math.round(score),
      rankingReason: reasons.slice(0, 2).join(' · ') || undefined,
    };
  });

  let sorted: RankedPost[] = [];
  switch (rankingMode) {
    case 'recent':
      sorted = [...scoredPosts].sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
      break;
    case 'engagement':
      sorted = [...scoredPosts].sort(
        (a, b) => (b.likesCount || 0) + (b.commentsCount || 0) * 2 - ((a.likesCount || 0) + (a.commentsCount || 0) * 2)
      );
      break;
    case 'nearby':
      sorted = [...scoredPosts].sort((a, b) => {
        const aCity = currentUser.city && a.location?.city?.toLowerCase() === currentUser.city.toLowerCase() ? 1 : 0;
        const bCity = currentUser.city && b.location?.city?.toLowerCase() === currentUser.city.toLowerCase() ? 1 : 0;
        return bCity - aCity;
      });
      break;
    case 'relevance':
    default:
      sorted = [...scoredPosts].sort((a, b) => (b.algorithmScore || 0) - (a.algorithmScore || 0));
      break;
  }

  const paidCampaigns = activeCampaigns.filter((c) => c.status === 'ativa');
  if (paidCampaigns.length === 0) return sorted;

  const resultWithAds: RankedPost[] = [];
  let adIndex = 0;

  for (let i = 0; i < sorted.length; i++) {
    resultWithAds.push(sorted[i]);
    if ((i + 1) % 5 === 0 && adIndex < paidCampaigns.length) {
      const camp = paidCampaigns[adIndex];
      resultWithAds.push({
        id: `ad_post_${camp.id}`,
        authorId: camp.userId,
        authorName: camp.title,
        authorAvatar: '',
        authorRole: 'empresa_cnpj',
        authorBadge: 'Conteúdo Patrocinado · Ballast',
        category: 'patrocinado',
        title: camp.title,
        content: `Destaque regional para ${camp.targetRegion}. Objetivo: ${camp.objective}.`,
        mediaUrls: [],
        location: { city: camp.targetRegion, state: '' },
        likesCount: 0,
        commentsCount: 0,
        proposalsCount: 0,
        isSponsored: true,
        createdAt: camp.createdAt,
        rankingReason: `Patrocinado · ${camp.targetRegion}`,
      });
      adIndex += 1;
    }
  }

  return resultWithAds;
}
