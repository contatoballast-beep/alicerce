import React, { useState, useEffect, useCallback, Suspense, lazy } from 'react';
import { GUEST_USER, LocalPreferencesService } from './services/api';
import { RealApiClient, getAuthToken, removeAuthToken } from './services/realApiClient';
import { initPerformanceAndErrorMonitoring, trackEvent } from './services/telemetry';
import { parseLocation, buildPath, updateDocumentMeta } from './utils/router';
import {
  UserProfile,
  Post,
  Opportunity,
  ConstructionProject,
  AdCampaign,
  ChatMessage,
  ChatThread,
  ProfessionalProfile,
  ClientBriefing,
} from './types';

// Core eager layout & primary visitor views (minimal initial bundle)
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { LandingPage } from './modules/landing/LandingPage';
import { DirectoryView } from './modules/directory/DirectoryView';

// Lazy-loaded secondary views & modals (P1 Performance #4)
const ArchitectProfileView = lazy(() =>
  import('./modules/directory/ArchitectProfileView').then((m) => ({ default: m.ArchitectProfileView }))
);
const BriefingView = lazy(() =>
  import('./modules/briefing/BriefingView').then((m) => ({ default: m.BriefingView }))
);
const FeedView = lazy(() => import('./modules/feed/FeedView').then((m) => ({ default: m.FeedView })));
const OpportunitiesView = lazy(() =>
  import('./modules/opportunities/OpportunitiesView').then((m) => ({ default: m.OpportunitiesView }))
);
const QuotesView = lazy(() => import('./modules/quotes/QuotesView').then((m) => ({ default: m.QuotesView })));
const ConstructionTimelineView = lazy(() =>
  import('./modules/timeline/ConstructionTimelineView').then((m) => ({ default: m.ConstructionTimelineView }))
);
const ConstructionChecklistView = lazy(() =>
  import('./modules/checklist/ConstructionChecklistView').then((m) => ({ default: m.ConstructionChecklistView }))
);
const MessagingView = lazy(() =>
  import('./modules/chat/MessagingView').then((m) => ({ default: m.MessagingView }))
);
const FavoritesView = lazy(() =>
  import('./modules/favorites/FavoritesView').then((m) => ({ default: m.FavoritesView }))
);
const AdsCampaignView = lazy(() =>
  import('./modules/ads/AdsCampaignView').then((m) => ({ default: m.AdsCampaignView }))
);
const AdminDashboardView = lazy(() =>
  import('./modules/admin/AdminDashboardView').then((m) => ({ default: m.AdminDashboardView }))
);
const SwaggerSpecView = lazy(() =>
  import('./modules/admin/SwaggerSpecView').then((m) => ({ default: m.SwaggerSpecView }))
);

// Lazy-loaded modals
const AuthModal = lazy(() => import('./modules/auth/AuthModal').then((m) => ({ default: m.AuthModal })));
const LGPDModal = lazy(() => import('./modules/auth/LGPDModal').then((m) => ({ default: m.LGPDModal })));
const ProfileEditorModal = lazy(() =>
  import('./modules/directory/ProfileEditorModal').then((m) => ({ default: m.ProfileEditorModal }))
);
const CompareModal = lazy(() =>
  import('./modules/directory/CompareModal').then((m) => ({ default: m.CompareModal }))
);
const ProposalRequestModal = lazy(() =>
  import('./modules/directory/ProposalRequestModal').then((m) => ({ default: m.ProposalRequestModal }))
);
const CreatePostModal = lazy(() =>
  import('./modules/feed/CreatePostModal').then((m) => ({ default: m.CreatePostModal }))
);
const CreateOpportunityModal = lazy(() =>
  import('./modules/opportunities/CreateOpportunityModal').then((m) => ({ default: m.CreateOpportunityModal }))
);
const ProposalModal = lazy(() =>
  import('./modules/opportunities/ProposalModal').then((m) => ({ default: m.ProposalModal }))
);
const OpportunityDetailModal = lazy(() =>
  import('./modules/opportunities/OpportunityDetailModal').then((m) => ({ default: m.OpportunityDetailModal }))
);
const QuoteModal = lazy(() => import('./modules/directory/QuoteModal').then((m) => ({ default: m.QuoteModal })));
const CheckoutModal = lazy(() =>
  import('./modules/ads/CheckoutModal').then((m) => ({ default: m.CheckoutModal }))
);

const ViewFallback: React.FC = () => (
  <div className="ballast-container" style={{ paddingTop: '56px', paddingBottom: '56px', textAlign: 'center', color: 'var(--steel)', fontSize: '14px' }}>
    Carregando...
  </div>
);

export const App: React.FC = () => {
  // Routing state synchronized with browser History API
  const initialRoute = typeof window !== 'undefined' ? parseLocation(window.location.pathname) : { tab: 'landing' };
  const [activeTab, setActiveTab] = useState<string>(initialRoute.tab);
  const [routeParamId, setRouteParamId] = useState<string | undefined>(initialRoute.paramId);

  // Authenticated User State (strictly validated with server — never blindly trusted from localStorage)
  const [currentUser, setCurrentUser] = useState<UserProfile>(GUEST_USER);
  const [sessionChecked, setSessionChecked] = useState<boolean>(false);

  // Domain Data & Explicit Service Error States
  const [posts, setPosts] = useState<Post[]>([]);
  const [postsLoading, setPostsLoading] = useState<boolean>(false);
  const [postsError, setPostsError] = useState<string | null>(null);

  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [oppsLoading, setOppsLoading] = useState<boolean>(false);
  const [oppsError, setOppsError] = useState<string | null>(null);

  const [campaigns, setCampaigns] = useState<AdCampaign[]>([]);
  const [timelineProjects] = useState<ConstructionProject[]>(() => LocalPreferencesService.getTimelineProjects());

  // Client Briefing & Comparison Shortlist
  const [briefing, setBriefing] = useState<ClientBriefing | null>(() => LocalPreferencesService.getBriefing());
  const [compareList, setCompareList] = useState<ProfessionalProfile[]>(() => LocalPreferencesService.getCompareList());
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [selectedArchitectCache, setSelectedArchitectCache] = useState<ProfessionalProfile | null>(null);

  // Realtime Private Chat State
  const [chatThreads, setChatThreads] = useState<ChatThread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [messagesByThread, setMessagesByThread] = useState<Record<string, ChatMessage[]>>({});
  const [hasMoreByThread, setHasMoreByThread] = useState<Record<string, boolean>>({});
  const [loadingMessages, setLoadingMessages] = useState<boolean>(false);
  const [wsConnected, setWsConnected] = useState<boolean>(false);

  // UI Feedback & Modals
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const [authPresetRole, setAuthPresetRole] = useState<'cliente' | 'profissional_cau' | undefined>(undefined);
  const [lgpdModalOpen, setLgpdModalOpen] = useState(false);
  const [profileEditorOpen, setProfileEditorOpen] = useState(false);
  const [compareModalOpen, setCompareModalOpen] = useState(false);
  const [proposalReqTarget, setProposalReqTarget] = useState<ProfessionalProfile | null>(null);

  const [createPostOpen, setCreatePostOpen] = useState(false);
  const [createOpportunityOpen, setCreateOpportunityOpen] = useState(false);
  const [proposalModalOpen, setProposalModalOpen] = useState(false);
  const [selectedOppForProposal, setSelectedOppForProposal] = useState<Opportunity | null>(null);
  const [oppDetailModalOpen, setOppDetailModalOpen] = useState(false);
  const [selectedOppDetail, setSelectedOppDetail] = useState<Opportunity | null>(null);
  const [quoteModalOpen, setQuoteModalOpen] = useState(false);
  const [checkoutCampaign, setCheckoutCampaign] = useState<AdCampaign | null>(null);

  const isGuest = !currentUser || currentUser.id === 'usr_guest';

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3800);
  }, []);

  // Navigation with real shareable URLs & browser history
  const navigate = useCallback((tab: string, paramId?: string, customTitle?: string) => {
    setActiveTab(tab);
    setRouteParamId(paramId);
    const nextPath = buildPath(tab, paramId);
    if (typeof window !== 'undefined' && window.location.pathname !== nextPath) {
      window.history.pushState({ tab, paramId }, '', nextPath);
    }
    updateDocumentMeta(tab, customTitle, paramId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    updateDocumentMeta(activeTab, undefined, routeParamId);
    const onPopState = () => {
      const parsed = parseLocation(window.location.pathname);
      setActiveTab(parsed.tab);
      setRouteParamId(parsed.paramId);
      updateDocumentMeta(parsed.tab, undefined, parsed.paramId);
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [activeTab, routeParamId]);

  // Clear all private user state cleanly on logout / expiration / user switch
  const resetPrivateState = useCallback(() => {
    setCurrentUser(GUEST_USER);
    setFavoriteIds(new Set());
    setChatThreads([]);
    setActiveThreadId(null);
    setMessagesByThread({});
    setHasMoreByThread({});
    setWsConnected(false);
  }, []);

  // Startup: purge legacy localStorage caches, init telemetry, validate JWT on server
  useEffect(() => {
    LocalPreferencesService.clearLegacyCaches();
    initPerformanceAndErrorMonitoring();

    const validate = async () => {
      const token = getAuthToken();
      if (!token) {
        setSessionChecked(true);
        return;
      }
      const res = await RealApiClient.validateSession();
      if (res.ok && res.data) {
        setCurrentUser(res.data);
      } else if (res.status === 401 || res.status === 403) {
        removeAuthToken();
        resetPrivateState();
        showToast('Sua sessão expirou. Entre novamente para continuar.');
      }
      setSessionChecked(true);
    };

    void validate();

    const onExpired = () => {
      resetPrivateState();
      showToast('Sessão encerrada ou expirada. Faça login novamente.');
    };
    window.addEventListener('ballast:session-expired', onExpired);
    return () => window.removeEventListener('ballast:session-expired', onExpired);
  }, [resetPrivateState, showToast]);

  // Data loaders (triggered on demand by active route — never fake fallback)
  const loadPosts = useCallback(async () => {
    setPostsLoading(true);
    setPostsError(null);
    const [postsRes, campsRes] = await Promise.all([RealApiClient.getPosts(), RealApiClient.getCampaigns()]);
    if (postsRes.ok && postsRes.data) {
      setPosts(postsRes.data.items || []);
    } else {
      setPostsError(postsRes.error || 'Serviço temporariamente indisponível.');
    }
    if (campsRes.ok && campsRes.data) {
      setCampaigns(campsRes.data);
    }
    setPostsLoading(false);
  }, []);

  const loadOpportunities = useCallback(async () => {
    setOppsLoading(true);
    setOppsError(null);
    const res = await RealApiClient.getOpportunities();
    if (res.ok && res.data) {
      setOpportunities(res.data.items || []);
    } else {
      setOppsError(res.error || 'Serviço temporariamente indisponível.');
    }
    setOppsLoading(false);
  }, []);

  useEffect(() => {
    if (activeTab === 'feed' || activeTab === 'project') {
      void loadPosts();
    } else if (activeTab === 'opportunities') {
      void loadOpportunities();
    } else if (activeTab === 'ads') {
      void RealApiClient.getCampaigns().then((res) => {
        if (res.ok && res.data) setCampaigns(res.data);
      });
    }
  }, [activeTab, loadPosts, loadOpportunities]);

  // Authenticated user sync: favorites, chat threads & isolated WebSocket
  useEffect(() => {
    if (isGuest) return;

    const loadUserPrivateData = async () => {
      const [favRes, threadsRes] = await Promise.all([
        RealApiClient.getFavorites(),
        RealApiClient.getThreads(),
      ]);
      if (favRes.ok && favRes.data) {
        setFavoriteIds(new Set(favRes.data.map((f) => f.target_id)));
      }
      if (threadsRes.ok && threadsRes.data) {
        setChatThreads(threadsRes.data);
      }
    };
    void loadUserPrivateData();

    const wsHandle = RealApiClient.connectWebSocket(
      (payload) => {
        if (payload?.type === 'NEW_MESSAGE' && payload.data) {
          const incoming = payload.data as ChatMessage;
          const tid = incoming.threadId;
          if (!tid) return;

          setMessagesByThread((prev) => {
            const list = prev[tid] || [];
            const existsIdx = list.findIndex(
              (m) => m.id === incoming.id || (incoming.clientMessageId && m.clientMessageId === incoming.clientMessageId)
            );
            if (existsIdx >= 0) {
              const updated = [...list];
              updated[existsIdx] = { ...incoming, status: incoming.read ? 'read' : 'sent' };
              return { ...prev, [tid]: updated };
            }
            return { ...prev, [tid]: [...list, { ...incoming, status: incoming.read ? 'read' : 'sent' }] };
          });

          setChatThreads((prev) => {
            const found = prev.some((t) => t.id === tid);
            if (!found) {
              void RealApiClient.getThreads().then((r) => {
                if (r.ok && r.data) setChatThreads(r.data);
              });
              return prev;
            }
            return prev.map((t) =>
              t.id === tid
                ? {
                    ...t,
                    lastMessage: incoming.text,
                    lastMessageTime: incoming.timestamp,
                    unreadCount:
                      incoming.senderId !== currentUser.id && activeThreadId !== tid
                        ? (t.unreadCount || 0) + 1
                        : t.unreadCount,
                  }
                : t
            );
          });

          if (incoming.senderId !== currentUser.id) {
            trackEvent('contact_received', { threadId: tid });
            if (activeTab === 'chat' && activeThreadId === tid) {
              void RealApiClient.markMessagesAsRead(tid);
            } else {
              showToast(`Nova mensagem de ${incoming.senderName}`);
            }
          }
        } else if (payload?.type === 'MESSAGES_READ' && payload.data?.threadId) {
          const { threadId, readerId } = payload.data;
          if (readerId !== currentUser.id) {
            setMessagesByThread((prev) => ({
              ...prev,
              [threadId]: (prev[threadId] || []).map((m) =>
                m.senderId === currentUser.id ? { ...m, read: true, status: 'read' } : m
              ),
            }));
          }
        }
      },
      (connected) => setWsConnected(connected)
    );

    return () => {
      wsHandle?.close();
    };
  }, [currentUser.id, isGuest, activeTab, activeThreadId, showToast]);

  // Load messages for selected thread & confirm read receipt
  const loadThreadMessages = useCallback(
    async (threadId: string, before?: string) => {
      setLoadingMessages(true);
      const res = await RealApiClient.getMessages(threadId, { limit: 30, before });
      setLoadingMessages(false);
      if (res.ok && res.data) {
        setHasMoreByThread((prev) => ({ ...prev, [threadId]: res.data!.hasMore }));
        setMessagesByThread((prev) => {
          if (before) {
            const existing = prev[threadId] || [];
            const existingIds = new Set(existing.map((m) => m.id));
            const older = res.data!.messages.filter((m) => !existingIds.has(m.id));
            return { ...prev, [threadId]: [...older, ...existing] };
          }
          return { ...prev, [threadId]: res.data!.messages };
        });

        if (!before) {
          const readRes = await RealApiClient.markMessagesAsRead(threadId);
          if (readRes.ok) {
            setChatThreads((prev) => prev.map((t) => (t.id === threadId ? { ...t, unreadCount: 0 } : t)));
          }
        }
      }
    },
    []
  );

  const handleSelectThread = useCallback(
    (threadId: string) => {
      setActiveThreadId(threadId);
      void loadThreadMessages(threadId);
    },
    [loadThreadMessages]
  );

  useEffect(() => {
    if (activeTab === 'chat' && !isGuest && activeThreadId) {
      void loadThreadMessages(activeThreadId);
    }
  }, [activeTab, isGuest, activeThreadId, loadThreadMessages]);

  const handleSendMessage = async (
    threadId: string,
    text: string,
    attachmentUrl?: string,
    retryClientMsgId?: string
  ) => {
    const clientMsgId = retryClientMsgId || `cmsg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const nowTime = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const optimistic: ChatMessage = {
      id: clientMsgId,
      threadId,
      clientMessageId: clientMsgId,
      senderId: currentUser.id,
      senderName: currentUser.name,
      receiverId: '',
      text,
      attachmentUrl,
      timestamp: nowTime,
      read: false,
      status: 'sending',
    };

    setMessagesByThread((prev) => {
      const list = prev[threadId] || [];
      const existingIdx = list.findIndex((m) => m.clientMessageId === clientMsgId);
      if (existingIdx >= 0) {
        const next = [...list];
        next[existingIdx] = { ...next[existingIdx], status: 'sending' };
        return { ...prev, [threadId]: next };
      }
      return { ...prev, [threadId]: [...list, optimistic] };
    });

    const res = await RealApiClient.sendMessage(threadId, text, clientMsgId, attachmentUrl);
    if (res.ok && res.data) {
      const confirmed = res.data;
      setMessagesByThread((prev) => {
        const list = prev[threadId] || [];
        const deduped = list.filter((m) => m.id !== confirmed.id || m.clientMessageId === clientMsgId);
        const idx = deduped.findIndex((m) => m.clientMessageId === clientMsgId || m.id === confirmed.id);
        const finalMsg: ChatMessage = { ...confirmed, status: confirmed.read ? 'read' : 'sent' };
        if (idx >= 0) {
          const next = [...deduped];
          next[idx] = finalMsg;
          return { ...prev, [threadId]: next };
        }
        return { ...prev, [threadId]: [...deduped, finalMsg] };
      });
      setChatThreads((prev) =>
        prev.map((t) =>
          t.id === threadId ? { ...t, lastMessage: confirmed.text, lastMessageTime: confirmed.timestamp } : t
        )
      );
      trackEvent('contact_sent', { threadId });
    } else {
      setMessagesByThread((prev) => ({
        ...prev,
        [threadId]: (prev[threadId] || []).map((m) =>
          m.clientMessageId === clientMsgId ? { ...m, status: 'failed' } : m
        ),
      }));
      showToast(res.error || 'Falha ao enviar mensagem. Você pode reenviar.');
    }
  };

  // Action Helpers
  const requireAuth = useCallback((mode: 'login' | 'register' = 'login', preset?: 'cliente' | 'profissional_cau') => {
    setAuthModalMode(mode);
    setAuthPresetRole(preset);
    setAuthModalOpen(true);
  }, []);

  const handleOpenArchitectPage = (prof: ProfessionalProfile) => {
    setSelectedArchitectCache(prof);
    navigate('architect', prof.id, prof.name);
  };

  const handleToggleFavorite = async (prof: ProfessionalProfile) => {
    if (isGuest) {
      showToast('Entre na sua conta para salvar arquitetos nos favoritos.');
      requireAuth('login');
      return;
    }
    const res = await RealApiClient.toggleFavorite({
      targetType: 'professional',
      targetId: prof.id,
      targetTitle: prof.name,
      targetSubtitle: prof.specialty || prof.profession,
      targetAvatar: prof.avatar,
    });
    if (res.ok && res.data) {
      setFavoriteIds((prev) => {
        const next = new Set(prev);
        if (res.data!.favorited) next.add(prof.id);
        else next.delete(prof.id);
        return next;
      });
      showToast(res.data.favorited ? `${prof.name} salvo nos favoritos.` : `${prof.name} removido dos favoritos.`);
    } else {
      showToast(res.error || 'Não foi possível atualizar os favoritos.');
    }
  };

  const handleToggleCompare = (prof: ProfessionalProfile) => {
    setCompareList((prev) => {
      const exists = prev.some((p) => p.id === prof.id);
      let next: ProfessionalProfile[];
      if (exists) {
        next = prev.filter((p) => p.id !== prof.id);
      } else {
        if (prev.length >= 3) {
          showToast('Você pode comparar no máximo 3 arquitetos por vez.');
          return prev;
        }
        next = [...prev, prof];
      }
      LocalPreferencesService.saveCompareList(next);
      return next;
    });
  };

  const handleStartChat = async (participantId: string, participantName: string, projectTitle?: string) => {
    if (isGuest) {
      showToast('Faça login para iniciar uma conversa privada.');
      requireAuth('login');
      return;
    }
    const res = await RealApiClient.createOrGetThread(participantId, projectTitle);
    if (res.ok && res.data) {
      const thread = res.data;
      const listRes = await RealApiClient.getThreads();
      if (listRes.ok && listRes.data) setChatThreads(listRes.data);
      setActiveThreadId(thread.id);
      navigate('chat');
      await loadThreadMessages(thread.id);
      showToast(`Conversa aberta com ${participantName}.`);
    } else {
      showToast(res.error || 'Não foi possível iniciar a conversa.');
    }
  };

  const handleRequestProposal = (prof: ProfessionalProfile) => {
    if (isGuest) {
      showToast('Entre na sua conta para enviar uma solicitação de proposta.');
      requireAuth('login');
      return;
    }
    setProposalReqTarget(prof);
  };

  const handleAddPost = async (postData: any): Promise<{ ok: boolean; error?: string }> => {
    const res = await RealApiClient.createPost(postData);
    if (res.ok) {
      await loadPosts();
      showToast('Projeto publicado com confirmação do servidor.');
      return { ok: true };
    }
    return { ok: false, error: res.error || 'Erro ao publicar projeto.' };
  };

  const handleLikePost = async (postId: string) => {
    if (isGuest) {
      showToast('Entre na sua conta para curtir projetos.');
      requireAuth('login');
      return;
    }
    const res = await RealApiClient.likePost(postId);
    if (res.ok && res.data) {
      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, isLiked: res.data!.liked, likesCount: res.data!.likesCount } : p))
      );
    }
  };

  const handleSubmitProposal = async (oppId: string, proposalData: any): Promise<{ ok: boolean; error?: string }> => {
    const res = await RealApiClient.submitProposal(oppId, proposalData);
    if (res.ok) {
      await loadOpportunities();
      showToast('Proposta enviada e registrada no servidor.');
      return { ok: true };
    }
    return { ok: false, error: res.error || 'Erro ao enviar proposta.' };
  };

  const handleCreateCampaign = async (campData: any) => {
    const res = await RealApiClient.createCampaign(campData);
    if (res.ok && res.data) {
      const listRes = await RealApiClient.getCampaigns();
      if (listRes.ok && listRes.data) setCampaigns(listRes.data);
      setCheckoutCampaign(res.data);
      showToast('Rascunho de campanha salvo. Aguardando integração de pagamento.');
    } else {
      showToast(res.error || 'Não foi possível salvar a campanha.');
    }
  };

  const handleLogout = () => {
    removeAuthToken();
    resetPrivateState();
    navigate('landing');
    showToast('Você saiu da sua conta com segurança.');
  };

  const unreadMessagesCount = chatThreads.reduce((sum, t) => sum + (t.unreadCount || 0), 0);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--marfim)' }}>
      {/* Live Toast Notification */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            zIndex: 999,
            background: 'var(--grafite)',
            color: '#FFFFFF',
            padding: '12px 18px',
            borderRadius: 'var(--radius-sm)',
            boxShadow: 'var(--shadow-lg)',
            fontSize: '13.5px',
            fontWeight: 500,
            maxWidth: 'min(90vw, 420px)',
            animation: 'fadeIn 0.2s ease-out',
          }}
        >
          {toastMessage}
        </div>
      )}

      {/* Main Header Navbar (consistent across all routes, including Landing) */}
      <Navbar
        currentUser={currentUser}
        activeTab={activeTab}
        onNavigate={(tab) => navigate(tab)}
        onOpenAuth={(mode, preset) => requireAuth(mode || 'login', preset)}
        onOpenLGPD={() => setLgpdModalOpen(true)}
        onOpenProfileEditor={() => setProfileEditorOpen(true)}
        onOpenCompare={() => setCompareModalOpen(true)}
        onLogout={handleLogout}
        unreadMessagesCount={unreadMessagesCount}
        compareCount={compareList.length}
      />

      {/* Main Route Outlet */}
      <main style={{ flex: 1 }}>
        {activeTab === 'landing' && (
          <LandingPage
            onExploreCatalog={() => navigate('directory')}
            onExploreProjects={() => navigate('feed')}
            onOpenBriefing={() => navigate('briefing')}
            onOpenAuth={(mode, preset) => requireAuth(mode, preset)}
          />
        )}

        {activeTab === 'directory' && (
          <DirectoryView
            currentUser={currentUser}
            briefing={briefing}
            onOpenArchitectPage={handleOpenArchitectPage}
            onRequestProposal={handleRequestProposal}
            onToggleFavorite={handleToggleFavorite}
            favoriteIds={favoriteIds}
            compareList={compareList}
            onToggleCompare={handleToggleCompare}
            onOpenCompare={() => setCompareModalOpen(true)}
            onOpenBriefing={() => navigate('briefing')}
            onArchitectSignup={() => requireAuth('register', 'profissional_cau')}
          />
        )}

        <Suspense fallback={<ViewFallback />}>
          {activeTab === 'architect' && routeParamId && (
            <ArchitectProfileView
              architectId={routeParamId}
              initialProfile={selectedArchitectCache?.id === routeParamId ? selectedArchitectCache : null}
              currentUser={currentUser}
              briefing={briefing}
              isFavorited={favoriteIds.has(routeParamId)}
              isCompared={compareList.some((p) => p.id === routeParamId)}
              onBack={() => navigate('directory')}
              onToggleFavorite={handleToggleFavorite}
              onToggleCompare={handleToggleCompare}
              onStartChat={(prof) => void handleStartChat(prof.id, prof.name)}
              onRequestProposal={handleRequestProposal}
              onRequireAuth={() => requireAuth('login')}
              onNotify={showToast}
            />
          )}

          {activeTab === 'briefing' && (
            <BriefingView
              initialBriefing={briefing}
              onSaveBriefing={(b) => {
                setBriefing(b);
                LocalPreferencesService.saveBriefing(b);
                showToast('Briefing salvo. Exibindo arquitetos compatíveis.');
                navigate('directory');
              }}
              onClearBriefing={() => {
                setBriefing(null);
                LocalPreferencesService.clearBriefing();
                showToast('Briefing removido.');
              }}
            />
          )}

          {(activeTab === 'feed' || activeTab === 'project') && (
            <FeedView
              posts={activeTab === 'project' && routeParamId ? posts.filter((p) => p.id === routeParamId) : posts}
              campaigns={campaigns}
              currentUser={currentUser}
              loading={postsLoading}
              serviceError={postsError}
              onRetry={() => void loadPosts()}
              onLikePost={(id) => void handleLikePost(id)}
              onOpenCreatePost={() => {
                if (isGuest) {
                  showToast('Faça login para publicar um projeto.');
                  requireAuth('login');
                } else {
                  setCreatePostOpen(true);
                }
              }}
              onOpenChat={(authorId, authorName, projectTitle) => void handleStartChat(authorId, authorName, projectTitle)}
              onOpenAuthorProfile={(authorId) => navigate('architect', authorId)}
              onShareProject={(post) => {
                const url = `${window.location.origin}/projeto/${encodeURIComponent(post.id)}`;
                navigator.clipboard?.writeText(url);
                showToast('Link do projeto copiado.');
              }}
            />
          )}

          {activeTab === 'opportunities' && (
            <OpportunitiesView
              opportunities={opportunities}
              currentUser={currentUser}
              loading={oppsLoading}
              serviceError={oppsError}
              onRetry={() => void loadOpportunities()}
              onSelectOpportunity={(opp) => {
                setSelectedOppDetail(opp);
                setOppDetailModalOpen(true);
              }}
              onOpenSendProposal={(opp) => {
                if (isGuest) {
                  showToast('Faça login para enviar uma proposta.');
                  requireAuth('login');
                  return;
                }
                setSelectedOppForProposal(opp);
                setProposalModalOpen(true);
              }}
              onOpenCreateOpportunity={() => {
                if (isGuest) {
                  showToast('Faça login para publicar uma demanda.');
                  requireAuth('login');
                  return;
                }
                setCreateOpportunityOpen(true);
              }}
            />
          )}

          {activeTab === 'chat' && (
            isGuest ? (
              <div className="ballast-container" style={{ paddingTop: '56px', textAlign: 'center' }}>
                <div className="card" style={{ maxWidth: '480px', margin: '0 auto', padding: '36px 24px' }}>
                  <h2 style={{ fontSize: '24px', marginBottom: '10px' }}>Mensagens privadas</h2>
                  <p style={{ fontSize: '14px', color: 'var(--steel)', marginBottom: '20px' }}>
                    As conversas são protegidas e acessíveis exclusivamente aos participantes autenticados.
                  </p>
                  <button type="button" onClick={() => requireAuth('login')} className="btn primary">
                    Entrar na minha conta
                  </button>
                </div>
              </div>
            ) : (
              <MessagingView
                threads={chatThreads}
                currentUser={currentUser}
                activeThreadId={activeThreadId}
                wsConnected={wsConnected}
                onSelectThread={handleSelectThread}
                messagesByThread={messagesByThread}
                hasMoreByThread={hasMoreByThread}
                loadingMessages={loadingMessages}
                onLoadOlderMessages={(tid) => {
                  const first = (messagesByThread[tid] || [])[0];
                  if (first?.createdAt) void loadThreadMessages(tid, first.createdAt);
                }}
                onSendMessage={handleSendMessage}
                onNavigateToDirectory={() => navigate('directory')}
                onRequestProposalFromChat={(pid, pname) => {
                  setProposalReqTarget({
                    id: pid,
                    name: pname,
                    avatar: '',
                    profession: 'Arquiteto',
                    specialty: 'Arquitetura',
                    experienceYears: 0,
                    services: [],
                    styles: [],
                    projectTypes: [],
                    investmentRanges: [],
                    serviceArea: '',
                    city: '',
                    state: '',
                    rating: 0,
                    reviewsCount: 0,
                    availability: 'disponivel',
                    isVerified: false,
                    verificationStatus: 'unverified',
                  });
                }}
                onNotify={showToast}
              />
            )
          )}

          {activeTab === 'favorites' && (
            <FavoritesView
              currentUser={currentUser}
              compareList={compareList}
              onOpenCompare={() => setCompareModalOpen(true)}
              onRemoveCompare={handleToggleCompare}
              onOpenArchitectById={(id) => navigate('architect', id)}
              onExploreCatalog={() => navigate('directory')}
              onRequireAuth={() => requireAuth('login')}
            />
          )}

          {activeTab === 'quotes' && (
            <QuotesView
              currentUser={currentUser}
              onOpenNewQuote={() => setQuoteModalOpen(true)}
              onRequireAuth={() => requireAuth('login')}
            />
          )}

          {activeTab === 'timeline' && (
            <ConstructionTimelineView projects={timelineProjects} currentUser={currentUser} />
          )}

          {activeTab === 'checklist' && (
            !isGuest ? (
              <ConstructionChecklistView />
            ) : sessionChecked ? (
              <div className="ballast-container" style={{ paddingTop: '56px', textAlign: 'center' }}>
                <div className="card" style={{ maxWidth: '480px', margin: '0 auto', padding: '36px 24px' }}>
                  <h2 style={{ fontSize: '24px', marginBottom: '10px' }}>Checklist de Obra</h2>
                  <p style={{ fontSize: '14px', color: 'var(--steel)', marginBottom: '20px' }}>
                    Entre na sua conta para acompanhar o checklist visual da sua obra.
                  </p>
                  <button type="button" onClick={() => requireAuth('login')} className="btn primary">
                    Entrar na minha conta
                  </button>
                </div>
              </div>
            ) : (
              <ViewFallback />
            )
          )}

          {activeTab === 'ads' && (
            <AdsCampaignView
              campaigns={campaigns}
              currentUser={currentUser}
              onCreateCampaign={handleCreateCampaign}
              onOpenCheckout={(c) => setCheckoutCampaign(c)}
            />
          )}

          {activeTab === 'admin' && (
            !isGuest && currentUser.role === 'admin' ? (
              <AdminDashboardView currentUser={currentUser} />
            ) : (
              <div className="ballast-container" style={{ paddingTop: '56px', textAlign: 'center' }}>
                <div className="card" style={{ maxWidth: '480px', margin: '0 auto', padding: '36px 24px' }}>
                  <h2 style={{ fontSize: '24px', marginBottom: '8px' }}>Acesso restrito</h2>
                  <p style={{ fontSize: '14px', color: 'var(--steel)' }}>
                    Esta área é exclusiva para administradores autenticados pelo servidor.
                  </p>
                </div>
              </div>
            )
          )}

          {activeTab === 'swagger' && <SwaggerSpecView />}
        </Suspense>
      </main>

      <Footer
        onOpenLGPD={() => setLgpdModalOpen(true)}
        onOpenSwagger={() => navigate('swagger')}
        onNavigate={(tab) => navigate(tab)}
      />

      {/* Lazy Modals */}
      <Suspense fallback={null}>
        {authModalOpen && (
          <AuthModal
            isOpen={authModalOpen}
            initialMode={authModalMode}
            presetRole={authPresetRole}
            onClose={() => setAuthModalOpen(false)}
            onLoginSuccess={(u) => {
              resetPrivateState();
              setCurrentUser(u);
              showToast(`Bem-vindo, ${u.name}.`);
              if (activeTab === 'landing') {
                navigate('directory');
              }
            }}
          />
        )}

        {lgpdModalOpen && (
          <LGPDModal
            isOpen={lgpdModalOpen}
            onClose={() => setLgpdModalOpen(false)}
            currentUser={currentUser}
            onAccountDeleted={() => {
              resetPrivateState();
              navigate('landing');
              showToast('Sua conta e dados pessoais foram excluídos permanentemente.');
            }}
          />
        )}

        {profileEditorOpen && !isGuest && (
          <ProfileEditorModal
            isOpen={profileEditorOpen}
            onClose={() => setProfileEditorOpen(false)}
            currentUser={currentUser}
            onProfileUpdated={(u) => setCurrentUser(u)}
            onPortfolioPublished={() => {
              showToast('Projeto adicionado ao seu portfólio.');
            }}
          />
        )}

        {compareModalOpen && (
          <CompareModal
            isOpen={compareModalOpen}
            onClose={() => setCompareModalOpen(false)}
            items={compareList}
            onRemove={handleToggleCompare}
            onOpenProfile={handleOpenArchitectPage}
            onRequestProposal={handleRequestProposal}
          />
        )}

        {proposalReqTarget && (
          <ProposalRequestModal
            isOpen={Boolean(proposalReqTarget)}
            onClose={() => setProposalReqTarget(null)}
            architect={proposalReqTarget}
            currentUser={currentUser}
            briefing={briefing}
            onSuccess={async (threadId) => {
              const listRes = await RealApiClient.getThreads();
              if (listRes.ok && listRes.data) setChatThreads(listRes.data);
              setActiveThreadId(threadId);
              navigate('chat');
              await loadThreadMessages(threadId);
              showToast('Solicitação de proposta enviada e vinculada ao chat.');
            }}
          />
        )}

        {createPostOpen && (
          <CreatePostModal
            isOpen={createPostOpen}
            onClose={() => setCreatePostOpen(false)}
            currentUser={currentUser}
            onSubmitPost={handleAddPost}
          />
        )}

        {createOpportunityOpen && (
          <CreateOpportunityModal
            isOpen={createOpportunityOpen}
            onClose={() => setCreateOpportunityOpen(false)}
            currentUser={currentUser}
            onSubmitSuccess={async () => {
              await loadOpportunities();
              showToast('Demanda publicada com confirmação do servidor.');
            }}
          />
        )}

        {proposalModalOpen && (
          <ProposalModal
            isOpen={proposalModalOpen}
            onClose={() => setProposalModalOpen(false)}
            opportunity={selectedOppForProposal}
            currentUser={currentUser}
            onSubmitProposal={handleSubmitProposal}
          />
        )}

        {oppDetailModalOpen && (
          <OpportunityDetailModal
            isOpen={oppDetailModalOpen}
            onClose={() => setOppDetailModalOpen(false)}
            opportunity={selectedOppDetail}
            currentUser={currentUser}
            onOpenSendProposal={() => {
              setOppDetailModalOpen(false);
              if (isGuest) {
                requireAuth('login');
                return;
              }
              setSelectedOppForProposal(selectedOppDetail);
              setProposalModalOpen(true);
            }}
          />
        )}

        {quoteModalOpen && (
          <QuoteModal
            isOpen={quoteModalOpen}
            onClose={() => setQuoteModalOpen(false)}
            currentUser={currentUser}
            onSuccess={() => {
              showToast('Solicitação de cotação registrada.');
              navigate('quotes');
            }}
          />
        )}

        {checkoutCampaign && (
          <CheckoutModal
            isOpen={Boolean(checkoutCampaign)}
            onClose={() => setCheckoutCampaign(null)}
            campaign={checkoutCampaign}
          />
        )}
      </Suspense>
    </div>
  );
};
