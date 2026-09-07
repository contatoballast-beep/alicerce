import React, { useState, useEffect } from 'react';
import { LocalApiService } from './services/api';
import { RealApiClient } from './services/realApiClient';
import { UserProfile, Post, Opportunity, Proposal, ConstructionProject, AdCampaign, ModerationItem, UserRole, ChatMessage } from './types';

// Layout & Components
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';

// Modals
import { AuthModal } from './modules/auth/AuthModal';
import { LGPDModal } from './modules/auth/LGPDModal';
import { CreatePostModal } from './modules/feed/CreatePostModal';
import { ProposalModal } from './modules/opportunities/ProposalModal';
import { OpportunityDetailModal } from './modules/opportunities/OpportunityDetailModal';
import { CheckoutModal } from './modules/ads/CheckoutModal';

// Views
import { FeedView } from './modules/feed/FeedView';
import { OpportunitiesView } from './modules/opportunities/OpportunitiesView';
import { ConstructionTimelineView } from './modules/timeline/ConstructionTimelineView';
import { MessagingView } from './modules/chat/MessagingView';
import { AdsCampaignView } from './modules/ads/AdsCampaignView';
import { AdminDashboardView } from './modules/admin/AdminDashboardView';
import { SwaggerSpecView } from './modules/admin/SwaggerSpecView';

export const App: React.FC = () => {
  // State
  const [currentUser, setCurrentUser] = useState<UserProfile>(LocalApiService.getUser());
  const [posts, setPosts] = useState<Post[]>(LocalApiService.getPosts());
  const [opportunities, setOpportunities] = useState<Opportunity[]>(LocalApiService.getOpportunities());
  const [projects, setProjects] = useState<ConstructionProject[]>(LocalApiService.getProjects());
  const [campaigns, setCampaigns] = useState<AdCampaign[]>(LocalApiService.getCampaigns());
  const [moderationItems, setModerationItems] = useState<ModerationItem[]>(LocalApiService.getModerationQueue());
  const [chatMessages, setChatMessages] = useState<Record<string, ChatMessage[]>>({
    'thread_1': LocalApiService.getMessages('thread_1'),
    'thread_2': LocalApiService.getMessages('thread_2'),
    'thread_3': LocalApiService.getMessages('thread_3'),
  });

  const [activeTab, setActiveTab] = useState<string>('feed');
  const [activeThreadId, setActiveThreadId] = useState<string>('thread_1');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [serverOnline, setServerOnline] = useState<boolean | null>(null);

  // Modal States
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [lgpdModalOpen, setLgpdModalOpen] = useState(false);
  const [createPostOpen, setCreatePostOpen] = useState(false);
  const [proposalModalOpen, setProposalModalOpen] = useState(false);
  const [selectedOppForProposal, setSelectedOppForProposal] = useState<Opportunity | null>(null);
  const [oppDetailModalOpen, setOppDetailModalOpen] = useState(false);
  const [selectedOppDetail, setSelectedOppDetail] = useState<Opportunity | null>(null);
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [selectedCampaignForCheckout, setSelectedCampaignForCheckout] = useState<AdCampaign | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Synchronize with real backend on load and WebSocket
  useEffect(() => {
    // 1. Health check & Initial fetch
    const syncBackendData = async () => {
      const health = await RealApiClient.checkHealth();
      setServerOnline(health.ok);

      if (health.ok) {
        console.log('[ALICERCE] Backend conectado com sucesso!', health);
        const [fetchedPosts, fetchedOpps, fetchedCamps] = await Promise.all([
          RealApiClient.getPosts(),
          RealApiClient.getOpportunities(),
          RealApiClient.getCampaigns(),
        ]);
        if (fetchedPosts?.length) setPosts(fetchedPosts);
        if (fetchedOpps?.length) setOpportunities(fetchedOpps);
        if (fetchedCamps?.length) setCampaigns(fetchedCamps);
      }
    };

    syncBackendData();

    // 2. Connect to WebSocket for Real-time messaging
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
  }, []);

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

  const handleConfirmPayment = (campaignId: string) => {
    const updated = campaigns.map(c => c.id === campaignId ? { ...c, status: 'ativa' as const } : c);
    setCampaigns(updated);
    showToast("Pagamento Pix recebido! NFS-e emitida e anúncio impulsionado.");
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

  const handleResolveModeration = (itemId: string, status: 'aprovado' | 'removido') => {
    const updated = LocalApiService.resolveModerationItem(itemId, status);
    setModerationItems(updated);
    showToast(`Item de moderação marcado como ${status.toUpperCase()}`);
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
        onOpenAuth={() => setAuthModalOpen(true)}
        onOpenLGPD={() => setLgpdModalOpen(true)}
        onSwitchRole={handleSwitchRole}
        unreadMessagesCount={1}
      />

      {/* Server Connectivity Banner */}
      <div style={{ background: 'var(--paper)', borderBottom: '1px solid var(--steel-line)', padding: '4px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: 'var(--steel)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: serverOnline ? '#10B981' : '#F59E0B' }}></span>
          <span>{serverOnline ? 'Backend API & Turso DB: Conectados' : 'Modo Híbrido: Local + Fallback Resiliente Ativo'}</span>
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
            currentUser={currentUser}
            onLikePost={handleLikePost}
            onOpenCreatePost={() => setCreatePostOpen(true)}
            onOpenProposalModal={() => handleOpenProposalModal()}
            onOpenChat={handleOpenChat}
          />
        )}

        {activeTab === 'opportunities' && (
          <OpportunitiesView 
            opportunities={opportunities}
            currentUser={currentUser}
            onSelectOpportunity={handleOpenOppDetail}
            onOpenSendProposal={handleOpenProposalModal}
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

      {/* Modals */}
      <AuthModal 
        isOpen={authModalOpen}
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

      <CheckoutModal 
        isOpen={checkoutModalOpen}
        onClose={() => setCheckoutModalOpen(false)}
        campaign={selectedCampaignForCheckout}
        onConfirmPayment={handleConfirmPayment}
      />

    </div>
  );
};
