import React, { useState, useEffect } from 'react';
import { LocalApiService } from './services/api';
import { RealApiClient, removeAuthToken } from './services/realApiClient';
import { 
  UserProfile, 
  Post, 
  Opportunity, 
  ConstructionProject, 
  AdCampaign, 
  ModerationItem, 
  UserRole, 
  ChatMessage,
  ProfessionalProfile,
  CompanyProfile,
  SupplierProfile,
  FavoriteItem
} from './types';

// Layout & Components
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';

// Modals
import { AuthModal } from './modules/auth/AuthModal';
import { LGPDModal } from './modules/auth/LGPDModal';
import { CreatePostModal } from './modules/feed/CreatePostModal';
import { ProposalModal } from './modules/opportunities/ProposalModal';
import { OpportunityDetailModal } from './modules/opportunities/OpportunityDetailModal';
import { CreateOpportunityModal } from './modules/opportunities/CreateOpportunityModal';
import { QuoteModal } from './modules/directory/QuoteModal';
import { ProfileDetailModal } from './modules/directory/ProfileDetailModal';
import { CheckoutModal } from './modules/ads/CheckoutModal';

// Views
import { FeedView } from './modules/feed/FeedView';
import { DirectoryView } from './modules/directory/DirectoryView';
import { OpportunitiesView } from './modules/opportunities/OpportunitiesView';
import { QuotesView } from './modules/quotes/QuotesView';
import { ConstructionTimelineView } from './modules/timeline/ConstructionTimelineView';
import { MessagingView } from './modules/chat/MessagingView';
import { FavoritesView } from './modules/favorites/FavoritesView';
import { AdsCampaignView } from './modules/ads/AdsCampaignView';
import { AdminDashboardView } from './modules/admin/AdminDashboardView';
import { SwaggerSpecView } from './modules/admin/SwaggerSpecView';

export const App: React.FC = () => {
  // Main State
  const [currentUser, setCurrentUser] = useState<UserProfile>(LocalApiService.getUser());
  const [posts, setPosts] = useState<Post[]>(LocalApiService.getPosts());
  const [opportunities, setOpportunities] = useState<Opportunity[]>(LocalApiService.getOpportunities());
  const [projects, setProjects] = useState<ConstructionProject[]>(LocalApiService.getProjects());
  const [campaigns, setCampaigns] = useState<AdCampaign[]>(LocalApiService.getCampaigns());
  const [moderationItems, setModerationItems] = useState<ModerationItem[]>(LocalApiService.getModerationQueue());
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());

  const [chatMessages, setChatMessages] = useState<Record<string, ChatMessage[]>>({
    'thread_1': LocalApiService.getMessages('thread_1'),
    'thread_2': LocalApiService.getMessages('thread_2'),
    'thread_3': LocalApiService.getMessages('thread_3'),
  });

  const [activeTab, setActiveTab] = useState<string>('feed');
  const [activeThreadId, setActiveThreadId] = useState<string>('thread_1');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [serverOnline, setServerOnline] = useState<boolean | null>(null);

  // Modal Control States
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const [lgpdModalOpen, setLgpdModalOpen] = useState(false);
  const [createPostOpen, setCreatePostOpen] = useState(false);
  const [createOpportunityOpen, setCreateOpportunityOpen] = useState(false);
  const [proposalModalOpen, setProposalModalOpen] = useState(false);
  const [selectedOppForProposal, setSelectedOppForProposal] = useState<Opportunity | null>(null);
  const [oppDetailModalOpen, setOppDetailModalOpen] = useState(false);
  const [selectedOppDetail, setSelectedOppDetail] = useState<Opportunity | null>(null);
  
  const [quoteModalOpen, setQuoteModalOpen] = useState(false);
  const [targetForQuote, setTargetForQuote] = useState<any | null>(null);
  
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [selectedProfileDetail, setSelectedProfileDetail] = useState<any | null>(null);

  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [selectedCampaignForCheckout, setSelectedCampaignForCheckout] = useState<AdCampaign | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Sync Backend on Startup
  useEffect(() => {
    const syncBackendData = async () => {
      const health = await RealApiClient.checkHealth();
      setServerOnline(health.ok);

      if (health.ok) {
        console.log('[ALICERCE] Backend conectado com sucesso!', health);
        const [fetchedPosts, fetchedOpps, fetchedCamps, fetchedFavs] = await Promise.all([
          RealApiClient.getPosts(),
          RealApiClient.getOpportunities(),
          RealApiClient.getCampaigns(),
          RealApiClient.getFavorites(currentUser.id),
        ]);
        if (fetchedPosts?.length) setPosts(fetchedPosts);
        if (fetchedOpps?.length) setOpportunities(fetchedOpps);
        if (fetchedCamps?.length) setCampaigns(fetchedCamps);
        if (fetchedFavs?.length) {
          setFavoriteIds(new Set(fetchedFavs.map(f => f.target_id)));
        }
      }
    };

    syncBackendData();

    // Connect WebSocket for Live Real-time Chat
    const ws = RealApiClient.connectWebSocket((payload) => {
      if (payload.type === 'NEW_MESSAGE' && payload.data) {
        const newMsg = payload.data as ChatMessage;
        const targetThread = newMsg.threadId || 'thread_1';
        setChatMessages((prev) => ({
          ...prev,
          [targetThread]: [...(prev[targetThread] || []), newMsg],
        }));
        if (newMsg.senderId !== currentUser.id) {
          showToast(`💬 Nova mensagem de ${newMsg.senderName}`);
        }
      }
    });

    return () => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [currentUser.id]);

  const handleSwitchRole = (role: UserRole) => {
    const updated = LocalApiService.switchRole(role);
    setCurrentUser(updated);
    showToast(`Perfil alterado para: ${role.toUpperCase()}`);
  };

  const handleLikePost = async (postId: string) => {
    const updated = await RealApiClient.likePost(postId);
    setPosts(updated);
  };

  const handleAddPost = async (postData: any) => {
    await RealApiClient.createPost(postData);
    const updatedPosts = await RealApiClient.getPosts();
    setPosts(updatedPosts);
    showToast("Obra publicada com sucesso! Chancela de Carimbo Técnico emitida.");
  };

  const handleOpenProposalModal = (opp?: Opportunity) => {
    const targetOpp = opp || opportunities[0];
    setSelectedOppForProposal(targetOpp);
    setProposalModalOpen(true);
  };

  const handleOpenOppDetail = (opp: Opportunity) => {
    setSelectedOppDetail(opp);
    setOppDetailModalOpen(true);
  };

  const handleSubmitProposal = async (oppId: string, proposalData: any) => {
    await RealApiClient.submitProposal(oppId, proposalData);
    const updatedOpps = await RealApiClient.getOpportunities();
    setOpportunities(updatedOpps);
    showToast("Proposta técnica e orçamentária enviada com sucesso!");
  };

  const handleCreateCampaign = async (campData: any) => {
    const newCamp = await RealApiClient.createCampaign(campData);
    const updatedCamps = await RealApiClient.getCampaigns();
    setCampaigns(updatedCamps);
    setSelectedCampaignForCheckout(newCamp);
    setCheckoutModalOpen(true);
    showToast("Campanha criada! Efetue o pagamento Pix para ativar.");
  };

  const handleConfirmPayment = async (campaignId: string) => {
    await RealApiClient.payCampaign(campaignId);
    const updated = await RealApiClient.getCampaigns();
    setCampaigns(updated);
    showToast("Pagamento Pix recebido! NFS-e emitida e anúncio impulsionado no feed.");
  };

  const handleSendMessage = async (threadId: string, text: string, attachmentUrl?: string) => {
    const newMsg = await RealApiClient.sendMessage(threadId, text, currentUser, attachmentUrl);
    setChatMessages(prev => ({
      ...prev,
      [threadId]: [...(prev[threadId] || []), newMsg]
    }));
    showToast("Mensagem enviada no chat!");
  };

  const handleOpenChat = (authorId: string, authorName: string) => {
    setActiveTab('chat');
    showToast(`Conversa iniciada com ${authorName}`);
  };

  const handleToggleFavorite = async (target: any) => {
    const isFav = favoriteIds.has(target.id);
    await RealApiClient.toggleFavorite({
      userId: currentUser.id,
      targetType: target.profession ? 'professional' : target.cnpj ? 'company' : target.category ? 'supplier' : 'opportunity',
      targetId: target.id,
      targetTitle: target.name || target.title,
      targetSubtitle: target.profession || target.specialty || target.category,
      targetAvatar: target.avatar
    });

    const newFavs = new Set(favoriteIds);
    if (isFav) {
      newFavs.delete(target.id);
      showToast("Item removido dos favoritos.");
    } else {
      newFavs.add(target.id);
      showToast("Item salvo nos favoritos!");
    }
    setFavoriteIds(newFavs);
  };

  const handleResolveModeration = (itemId: string, status: 'aprovado' | 'removido') => {
    const updated = LocalApiService.resolveModerationItem(itemId, status);
    setModerationItems(updated);
    showToast(`Item de moderação marcado como ${status.toUpperCase()}`);
  };

  const handleLogout = () => {
    removeAuthToken();
    const guestUser: UserProfile = {
      id: 'usr_guest',
      name: 'Visitante',
      email: 'visitante@alicerce.com.br',
      role: 'cliente',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      city: 'São Paulo',
      state: 'SP',
      verified: false,
      consentLgpd: true,
      createdAt: new Date().toLocaleDateString('pt-BR'),
    };
    LocalApiService.updateUser(guestUser);
    setCurrentUser(guestUser);
    showToast("Você saiu da sua conta.");
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 999, background: 'var(--bg-card)', border: '2px solid var(--color-primary)', color: '#FFF', padding: '12px 20px', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-glow-blue)', fontFamily: 'var(--font-heading)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span className="pulse-dot"></span>
          {toastMessage}
        </div>
      )}

      {/* Main Navbar */}
      <Navbar 
        currentUser={currentUser}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAuth={(mode) => {
          setAuthModalMode(mode || 'login');
          setAuthModalOpen(true);
        }}
        onOpenLGPD={() => setLgpdModalOpen(true)}
        onSwitchRole={handleSwitchRole}
        onLogout={handleLogout}
        unreadMessagesCount={1}
      />

      {/* Server Connectivity Banner */}
      <div style={{ background: 'var(--paper)', borderBottom: '1px solid var(--steel-line)', padding: '4px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: 'var(--steel)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: serverOnline ? '#10B981' : '#F59E0B' }}></span>
          <span>{serverOnline ? 'Backend API REST & Turso DB: 100% Conectados e Operacionais' : 'Modo Híbrido: Conexão Local Ativa'}</span>
        </div>
        <div className="mono" style={{ fontSize: '10px' }}>
          Realtime WebSocket: {serverOnline ? 'Online (WSS)' : 'Pronto'}
        </div>
      </div>

      {/* Main View Router */}
      <main style={{ flex: 1 }}>
        
        {activeTab === 'feed' && (
          <FeedView 
            posts={posts}
            campaigns={campaigns}
            currentUser={currentUser}
            onLikePost={handleLikePost}
            onOpenCreatePost={() => setCreatePostOpen(true)}
            onOpenProposalModal={() => handleOpenProposalModal()}
            onOpenChat={handleOpenChat}
          />
        )}

        {activeTab === 'directory' && (
          <DirectoryView 
            currentUser={currentUser}
            onRequestQuote={(target) => {
              setTargetForQuote(target);
              setQuoteModalOpen(true);
            }}
            onOpenProfile={(target) => {
              setSelectedProfileDetail(target);
              setProfileModalOpen(true);
            }}
            onToggleFavorite={handleToggleFavorite}
            favoriteIds={favoriteIds}
          />
        )}

        {activeTab === 'opportunities' && (
          <OpportunitiesView 
            opportunities={opportunities}
            currentUser={currentUser}
            onSelectOpportunity={handleOpenOppDetail}
            onOpenSendProposal={handleOpenProposalModal}
            onOpenCreateOpportunity={() => setCreateOpportunityOpen(true)}
          />
        )}

        {activeTab === 'quotes' && (
          <QuotesView 
            currentUser={currentUser}
            onOpenNewQuote={() => {
              setTargetForQuote(null);
              setQuoteModalOpen(true);
            }}
          />
        )}

        {activeTab === 'timeline' && (
          <ConstructionTimelineView 
            projects={projects}
            currentUser={currentUser}
          />
        )}

        {activeTab === 'chat' && (
          <MessagingView 
            threads={LocalApiService.getChatThreads()}
            currentUser={currentUser}
            activeThreadId={activeThreadId}
            onSelectThread={setActiveThreadId}
            getMessages={(tId) => chatMessages[tId] || LocalApiService.getMessages(tId)}
            onSendMessage={handleSendMessage}
          />
        )}

        {activeTab === 'favorites' && (
          <FavoritesView 
            currentUser={currentUser}
            onOpenItem={(fav) => {
              if (fav.target_type === 'opportunity') {
                const found = opportunities.find(o => o.id === fav.target_id);
                if (found) handleOpenOppDetail(found);
              } else {
                setSelectedProfileDetail({ id: fav.target_id, name: fav.target_title, profession: fav.target_subtitle });
                setProfileModalOpen(true);
              }
            }}
          />
        )}

        {activeTab === 'ads' && (
          <AdsCampaignView 
            campaigns={campaigns}
            currentUser={currentUser}
            onCreateCampaign={handleCreateCampaign}
            onOpenCheckout={(camp) => {
              setSelectedCampaignForCheckout(camp);
              setCheckoutModalOpen(true);
            }}
          />
        )}

        {activeTab === 'admin' && (
          <AdminDashboardView 
            moderationItems={moderationItems}
            currentUser={currentUser}
            onResolveItem={handleResolveModeration}
          />
        )}

        {activeTab === 'swagger' && (
          <SwaggerSpecView />
        )}

      </main>

      {/* Footer */}
      <Footer 
        onOpenLGPD={() => setLgpdModalOpen(true)}
        onOpenSwagger={() => setActiveTab('swagger')}
      />

      {/* ==========================================================================
          MODALS
         ========================================================================== */}
      <AuthModal 
        isOpen={authModalOpen}
        initialMode={authModalMode}
        onClose={() => setAuthModalOpen(false)}
        onLoginSuccess={(u) => {
          setCurrentUser(u);
          showToast(`Bem-vindo, ${u.name}! Autenticado com sucesso.`);
        }}
      />

      <LGPDModal 
        isOpen={lgpdModalOpen}
        onClose={() => setLgpdModalOpen(false)}
        currentUser={currentUser}
      />

      <CreatePostModal 
        isOpen={createPostOpen}
        onClose={() => setCreatePostOpen(false)}
        currentUser={currentUser}
        onSubmitPost={handleAddPost}
      />

      <CreateOpportunityModal 
        isOpen={createOpportunityOpen}
        onClose={() => setCreateOpportunityOpen(false)}
        currentUser={currentUser}
        onSubmitSuccess={async () => {
          const opps = await RealApiClient.getOpportunities();
          setOpportunities(opps);
          showToast("Demanda publicada com sucesso no ecossistema ALICERCE!");
        }}
      />

      <ProposalModal 
        isOpen={proposalModalOpen}
        onClose={() => setProposalModalOpen(false)}
        opportunity={selectedOppForProposal}
        currentUser={currentUser}
        onSubmitProposal={handleSubmitProposal}
      />

      <OpportunityDetailModal 
        isOpen={oppDetailModalOpen}
        onClose={() => setOppDetailModalOpen(false)}
        opportunity={selectedOppDetail}
        currentUser={currentUser}
        onOpenSendProposal={() => {
          setOppDetailModalOpen(false);
          handleOpenProposalModal(selectedOppDetail || undefined);
        }}
      />

      <QuoteModal 
        isOpen={quoteModalOpen}
        onClose={() => setQuoteModalOpen(false)}
        targetSupplier={targetForQuote}
        targetProfessional={targetForQuote}
        currentUser={currentUser}
        onSuccess={() => {
          showToast("Solicitação de cotação enviada com sucesso!");
          setActiveTab('quotes');
        }}
      />

      <ProfileDetailModal 
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        profile={selectedProfileDetail}
        currentUser={currentUser}
        onRequestQuote={(prof) => {
          setProfileModalOpen(false);
          setTargetForQuote(prof);
          setQuoteModalOpen(true);
        }}
        onToggleFavorite={handleToggleFavorite}
        isFavorited={selectedProfileDetail ? favoriteIds.has(selectedProfileDetail.id) : false}
      />

      <CheckoutModal 
        isOpen={checkoutModalOpen}
        onClose={() => setCheckoutModalOpen(false)}
        campaign={selectedCampaignForCheckout}
        onConfirmPayment={handleConfirmPayment}
      />

    </div>
  );
};
