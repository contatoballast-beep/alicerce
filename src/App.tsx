import React, { useState, useEffect } from 'react';
import { LocalApiService } from './services/api';
import { UserProfile, Post, Opportunity, Proposal, ConstructionProject, AdCampaign, ModerationItem, UserRole } from './types';

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

  const [activeTab, setActiveTab] = useState<string>('feed');
  const [activeThreadId, setActiveThreadId] = useState<string>('thread_1');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

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

  const handleSwitchRole = (role: UserRole) => {
    const updated = LocalApiService.switchRole(role);
    setCurrentUser(updated);
    showToast(`Perfil alterado para: ${role.toUpperCase()}`);
  };

  const handleLikePost = (postId: string) => {
    const updated = LocalApiService.toggleLikePost(postId);
    setPosts(updated);
  };

  const handleAddPost = (postData: any) => {
    const newPost = LocalApiService.addPost(postData);
    setPosts(LocalApiService.getPosts());
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

  const handleSubmitProposal = (oppId: string, proposalData: any) => {
    const updatedOpps = LocalApiService.addProposal(oppId, proposalData);
    setOpportunities(updatedOpps);
    showToast("Proposta técnica e orçamentária enviada com sucesso!");
  };

  const handleCreateCampaign = (campData: any) => {
    const newCamp = LocalApiService.addCampaign(campData);
    setCampaigns(LocalApiService.getCampaigns());
    setSelectedCampaignForCheckout(newCamp);
    setCheckoutModalOpen(true);
    showToast("Campanha criada! Efetue o pagamento Pix para ativar.");
  };

  const handleConfirmPayment = (campaignId: string) => {
    const updated = campaigns.map(c => c.id === campaignId ? { ...c, status: 'ativa' as const } : c);
    setCampaigns(updated);
    showToast("Pagamento Pix recebido! NFS-e emitida e anúncio impulsionado.");
  };

  const handleSendMessage = (threadId: string, text: string, attachmentUrl?: string) => {
    LocalApiService.sendMessage(threadId, text, attachmentUrl);
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
            getMessages={(tId) => LocalApiService.getMessages(tId)}
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
