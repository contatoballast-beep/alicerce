export interface RouteState {
  tab: string;
  paramId?: string;
}

const ROUTE_META: Record<string, { title: string; path: string }> = {
  landing: { title: 'Ballast Architecture — Conectando projetos a arquitetos compatíveis', path: '/' },
  directory: { title: 'Encontrar Arquitetos | Ballast Architecture', path: '/arquitetos' },
  architect: { title: 'Perfil do Arquiteto | Ballast Architecture', path: '/arquiteto' },
  feed: { title: 'Explorar Projetos e Portfólios | Ballast Architecture', path: '/projetos' },
  project: { title: 'Projeto | Ballast Architecture', path: '/projeto' },
  briefing: { title: 'Briefing e Compatibilidade | Ballast Architecture', path: '/briefing' },
  opportunities: { title: 'Demandas de Projeto | Ballast Architecture', path: '/demandas' },
  chat: { title: 'Mensagens | Ballast Architecture', path: '/chat' },
  favorites: { title: 'Salvos e Comparação | Ballast Architecture', path: '/salvos' },
  checklist: { title: 'Checklist de Obra | Ballast Architecture', path: '/obra' },
  timeline: { title: 'Diário de Obra | Ballast Architecture', path: '/diario' },
  quotes: { title: 'Cotações | Ballast Architecture', path: '/cotacoes' },
  ads: { title: 'Anúncios | Ballast Architecture', path: '/anuncios' },
  admin: { title: 'Administração | Ballast Architecture', path: '/admin' },
  swagger: { title: 'Documentação da API | Ballast Architecture', path: '/api-docs' },
};

export function parseLocation(pathname: string): RouteState {
  const clean = pathname.replace(/\/+$/, '') || '/';
  if (clean === '/' || clean === '/inicio') return { tab: 'landing' };
  if (clean === '/arquitetos') return { tab: 'directory' };
  if (clean.startsWith('/arquiteto/')) {
    return { tab: 'architect', paramId: decodeURIComponent(clean.slice('/arquiteto/'.length)) };
  }
  if (clean === '/projetos') return { tab: 'feed' };
  if (clean.startsWith('/projeto/')) {
    return { tab: 'project', paramId: decodeURIComponent(clean.slice('/projeto/'.length)) };
  }
  if (clean === '/briefing') return { tab: 'briefing' };
  if (clean === '/demandas') return { tab: 'opportunities' };
  if (clean === '/chat') return { tab: 'chat' };
  if (clean === '/salvos') return { tab: 'favorites' };
  if (clean === '/obra') return { tab: 'checklist' };
  if (clean === '/diario') return { tab: 'timeline' };
  if (clean === '/cotacoes') return { tab: 'quotes' };
  if (clean === '/anuncios') return { tab: 'ads' };
  if (clean === '/admin') return { tab: 'admin' };
  if (clean === '/api-docs') return { tab: 'swagger' };
  return { tab: 'landing' };
}

export function buildPath(tab: string, paramId?: string): string {
  if (tab === 'architect' && paramId) return `/arquiteto/${encodeURIComponent(paramId)}`;
  if (tab === 'project' && paramId) return `/projeto/${encodeURIComponent(paramId)}`;
  return ROUTE_META[tab]?.path || '/';
}

export function updateDocumentMeta(tab: string, customTitle?: string, paramId?: string) {
  if (typeof document === 'undefined') return;
  const meta = ROUTE_META[tab] || ROUTE_META.landing;
  document.title = customTitle ? `${customTitle} | Ballast Architecture` : meta.title;

  const canonicalPath = buildPath(tab, paramId);
  const canonicalUrl = `https://ballastarch.com${canonicalPath === '/' ? '/' : canonicalPath}`;
  let link = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!link) {
    link = document.createElement('link');
    link.rel = 'canonical';
    document.head.appendChild(link);
  }
  link.href = canonicalUrl;
}
