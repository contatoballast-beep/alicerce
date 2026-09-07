import React, { useState, useEffect, useRef } from 'react';
import { ChatThread, ChatMessage, UserProfile } from '../../types';
import { 
  Send, 
  Paperclip, 
  Search, 
  MessageSquare, 
  ShieldCheck, 
  Building2, 
  User, 
  FileText, 
  HardHat, 
  Calendar, 
  DollarSign, 
  X,
  Compass
} from 'lucide-react';

interface MessagingViewProps {
  threads: ChatThread[];
  currentUser: UserProfile;
  activeThreadId: string | null;
  onSelectThread: (threadId: string) => void;
  getMessages: (threadId: string) => ChatMessage[];
  onSendMessage: (threadId: string, text: string, attachmentUrl?: string) => void;
  onNavigateToDirectory?: () => void;
}

export const MessagingView: React.FC<MessagingViewProps> = ({
  threads,
  currentUser,
  activeThreadId,
  onSelectThread,
  getMessages,
  onSendMessage,
  onNavigateToDirectory,
}) => {
  const [inputText, setInputText] = useState('');
  const [searchFilter, setSearchFilter] = useState('');
  const [attachmentOpen, setAttachmentOpen] = useState(false);
  const [attachmentInput, setAttachmentInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Determine current active thread
  const filteredThreads = threads.filter(t => 
    t.participantName.toLowerCase().includes(searchFilter.toLowerCase()) ||
    t.participantRole.toLowerCase().includes(searchFilter.toLowerCase())
  );

  const effectiveThreadId = activeThreadId || (threads.length > 0 ? threads[0].id : null);
  const activeThread = threads.find(t => t.id === effectiveThreadId) || threads[0] || null;
  const currentMessages = effectiveThreadId ? getMessages(effectiveThreadId) : [];

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentMessages.length, effectiveThreadId]);

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() && !attachmentInput.trim()) return;
    if (!effectiveThreadId) return;

    onSendMessage(
      effectiveThreadId, 
      inputText.trim() || (attachmentInput ? `Anexo: ${attachmentInput}` : ''),
      attachmentInput.trim() || undefined
    );

    setInputText('');
    setAttachmentInput('');
    setAttachmentOpen(false);
  };

  const handleQuickAction = (actionText: string) => {
    if (!effectiveThreadId) return;
    onSendMessage(effectiveThreadId, actionText);
  };

  return (
    <div style={{ maxWidth: '1080px', margin: '0 auto', padding: '20px 16px' }}>
      
      {/* View Header */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        marginBottom: '16px',
        background: 'var(--bg-card)',
        padding: '16px 20px',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div>
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--primary-color)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '2px' }}>
            CANAL DIRETO & NEGOCIAÇÕES TÉCNICAS
          </div>
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-heading)', margin: 0, letterSpacing: '-0.02em' }}>
            Mensagens em Tempo Real
          </h2>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(16, 185, 129, 0.08)', padding: '6px 12px', borderRadius: 'var(--radius-full)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
          <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#10B981', boxShadow: '0 0 6px #10B981' }}></span>
          <span style={{ fontSize: '11.5px', fontWeight: 600, color: '#059669' }}>
            WebSocket Ativo
          </span>
        </div>
      </div>

      {/* Main Chat Container */}
      <div className="card" style={{ 
        display: 'grid', 
        gridTemplateColumns: threads.length > 0 ? '320px 1fr' : '1fr', 
        minHeight: '620px', 
        height: '74vh', 
        overflow: 'hidden', 
        padding: 0,
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-card)'
      }}>
        
        {/* Left Pane: Threads / Conversations */}
        {threads.length > 0 && (
          <div style={{ borderRight: '1px solid var(--border-color)', background: 'var(--bg-subtle)', display: 'flex', flexDirection: 'column' }}>
            
            {/* Search filter */}
            <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-card)' }}>
              <div style={{ position: 'relative' }}>
                <Search size={14} style={{ position: 'absolute', left: '12px', top: '11px', color: 'var(--text-muted)' }} />
                <input 
                  type="text" 
                  placeholder="Buscar conversa ou colega..." 
                  style={{ paddingLeft: '34px', fontSize: '12.5px', background: 'var(--bg-subtle)' }}
                  value={searchFilter}
                  onChange={e => setSearchFilter(e.target.value)}
                />
              </div>
            </div>

            {/* Threads List */}
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {filteredThreads.map(t => {
                const isSelected = t.id === effectiveThreadId;
                return (
                  <div
                    key={t.id}
                    onClick={() => onSelectThread(t.id)}
                    style={{
                      padding: '14px 16px',
                      borderBottom: '1px solid var(--border-color)',
                      background: isSelected ? 'var(--bg-card)' : 'transparent',
                      borderLeft: isSelected ? '4px solid var(--primary-color)' : '4px solid transparent',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ position: 'relative' }}>
                        <img 
                          src={t.participantAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'} 
                          alt={t.participantName}
                          style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--border-color)' }}
                        />
                        <span style={{ position: 'absolute', bottom: '1px', right: '1px', width: '10px', height: '10px', borderRadius: '50%', background: '#10B981', border: '2px solid #FFF' }}></span>
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '2px' }}>
                          <span style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--text-heading)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {t.participantName}
                          </span>
                          <span style={{ fontSize: '10.5px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                            {t.lastMessageTime || ''}
                          </span>
                        </div>

                        <div style={{ fontSize: '11px', color: 'var(--primary-color)', fontWeight: 600 }}>
                          {t.participantRole}
                        </div>

                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: '3px' }}>
                          {t.lastMessage || 'Conversa iniciada'}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {filteredThreads.length === 0 && (
                <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px' }}>
                  Nenhuma conversa encontrada para "{searchFilter}".
                </div>
              )}
            </div>

          </div>
        )}

        {/* Right Pane: Active Chat Room */}
        {activeThread ? (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg-card)' }}>
            
            {/* Active Chat Header */}
            <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-card)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <img 
                  src={activeThread.participantAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'} 
                  alt={activeThread.participantName}
                  style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--border-color)' }}
                />
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '14.5px', fontWeight: 700, color: 'var(--text-heading)' }}>
                      {activeThread.participantName}
                    </span>
                    <span style={{ 
                      fontSize: '10.5px', 
                      fontWeight: 600, 
                      padding: '2px 8px', 
                      borderRadius: 'var(--radius-full)', 
                      background: 'rgba(16, 185, 129, 0.1)', 
                      color: '#059669',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <ShieldCheck size={11} /> Verificado
                    </span>
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {activeThread.participantRole} • Canal Criptografado & Direto
                  </div>
                </div>
              </div>

              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--primary-color)', background: 'var(--primary-bg)', padding: '4px 10px', borderRadius: 'var(--radius-full)', border: '1px solid rgba(37, 99, 235, 0.15)' }}>
                CHAT TÉCNICO
              </div>
            </div>

            {/* Quick Action Chips */}
            <div style={{ padding: '8px 16px', background: 'var(--bg-subtle)', borderBottom: '1px solid var(--border-color)', display: 'flex', gap: '8px', overflowX: 'auto' }}>
              <button 
                onClick={() => handleQuickAction('Olá! Gostaria de solicitar a emissão de ART/RRT para os serviços técnicos acordados.')}
                className="btn ghost" 
                style={{ fontSize: '11px', padding: '4px 10px', whiteSpace: 'nowrap', background: 'var(--bg-card)' }}
              >
                <FileText size={12} color="var(--primary-color)" /> Solicitar ART / RRT
              </button>
              <button 
                onClick={() => handleQuickAction('Poderia me enviar o projeto executivo e memorial descritivo em PDF para análise?')}
                className="btn ghost" 
                style={{ fontSize: '11px', padding: '4px 10px', whiteSpace: 'nowrap', background: 'var(--bg-card)' }}
              >
                <Building2 size={12} color="var(--primary-color)" /> Solicitar Memorial Técnico
              </button>
              <button 
                onClick={() => handleQuickAction('Gostaria de agendar uma visita técnica no local da obra esta semana. Quais dias você tem disponibilidade?')}
                className="btn ghost" 
                style={{ fontSize: '11px', padding: '4px 10px', whiteSpace: 'nowrap', background: 'var(--bg-card)' }}
              >
                <Calendar size={12} color="var(--primary-color)" /> Agendar Visita na Obra
              </button>
              <button 
                onClick={() => handleQuickAction('Pode me enviar uma proposta formal e estimativa orçamentária detalhada com prazos?')}
                className="btn ghost" 
                style={{ fontSize: '11px', padding: '4px 10px', whiteSpace: 'nowrap', background: 'var(--bg-card)' }}
              >
                <DollarSign size={12} color="var(--accent-color)" /> Solicitar Orçamento
              </button>
            </div>

            {/* Messages History */}
            <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px', background: '#F8FAFC' }}>
              
              {currentMessages.length === 0 && (
                <div style={{ margin: 'auto', textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                  <MessageSquare size={36} style={{ opacity: 0.3, marginBottom: '8px' }} />
                  <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-heading)' }}>Início da Conversa</div>
                  <div style={{ fontSize: '12px', marginTop: '4px' }}>
                    Envie uma mensagem para alinhar detalhes técnicos ou solicitar propostas de {activeThread.participantName}.
                  </div>
                </div>
              )}

              {currentMessages.map(m => {
                const isMe = m.senderId === currentUser.id;
                return (
                  <div 
                    key={m.id} 
                    style={{ 
                      display: 'flex', 
                      justifyContent: isMe ? 'flex-end' : 'flex-start',
                      alignItems: 'flex-end',
                      gap: '8px'
                    }}
                  >
                    {!isMe && (
                      <img 
                        src={activeThread.participantAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'} 
                        alt="Avatar"
                        style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }}
                      />
                    )}

                    <div 
                      style={{ 
                        maxWidth: '70%', 
                        background: isMe ? 'var(--primary-color)' : 'var(--bg-card)', 
                        color: isMe ? '#FFFFFF' : 'var(--text-heading)', 
                        border: isMe ? 'none' : '1px solid var(--border-color)', 
                        borderRadius: isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px', 
                        padding: '12px 16px', 
                        fontSize: '13.5px',
                        lineHeight: '1.5',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
                      }}
                    >
                      <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                        {m.text}
                      </div>

                      {m.attachmentUrl && (
                        <div 
                          style={{ 
                            marginTop: '10px', 
                            fontSize: '11.5px', 
                            padding: '8px 12px', 
                            background: isMe ? 'rgba(255,255,255,0.2)' : 'var(--bg-subtle)', 
                            borderRadius: 'var(--radius-sm)',
                            border: isMe ? '1px solid rgba(255,255,255,0.3)' : '1px solid var(--border-color)',
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '8px' 
                          }}
                        >
                          <Paperclip size={13} />
                          <span style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {m.attachmentUrl}
                          </span>
                        </div>
                      )}

                      <div 
                        style={{ 
                          textAlign: 'right', 
                          fontSize: '10px', 
                          opacity: isMe ? 0.8 : 0.6, 
                          marginTop: '4px',
                          fontFamily: 'var(--font-mono)'
                        }}
                      >
                        {m.timestamp}
                      </div>
                    </div>
                  </div>
                );
              })}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Attachment Input Overlay */}
            {attachmentOpen && (
              <div style={{ padding: '10px 16px', background: 'var(--bg-subtle)', borderTop: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Paperclip size={15} color="var(--primary-color)" />
                <input 
                  type="text" 
                  placeholder="Cole a URL ou nome do documento (ex: ART-SP2026-998124.pdf ou Projeto_Executivo.dwg)..."
                  style={{ fontSize: '12px', flex: 1, background: '#FFFFFF' }}
                  value={attachmentInput}
                  onChange={e => setAttachmentInput(e.target.value)}
                />
                <button 
                  type="button" 
                  onClick={() => setAttachmentOpen(false)}
                  className="btn ghost" 
                  style={{ padding: '6px 10px' }}
                >
                  <X size={14} />
                </button>
              </div>
            )}

            {/* Input Bar */}
            <form onSubmit={handleSend} style={{ padding: '14px 18px', borderTop: '1px solid var(--border-color)', background: 'var(--bg-card)', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button 
                type="button" 
                onClick={() => setAttachmentOpen(!attachmentOpen)}
                className="btn ghost" 
                style={{ padding: '10px 12px', color: attachmentOpen || attachmentInput ? 'var(--primary-color)' : 'var(--text-muted)' }}
                title="Anexar ART, Projeto ou Memorial"
              >
                <Paperclip size={16} />
              </button>

              <input 
                type="text" 
                placeholder={`Escreva uma mensagem para ${activeThread.participantName}...`} 
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                style={{ fontSize: '13px', padding: '10px 14px' }}
              />

              <button 
                type="submit" 
                className="btn primary" 
                style={{ padding: '10px 18px', fontSize: '13px', gap: '6px' }}
                disabled={!inputText.trim() && !attachmentInput.trim()}
              >
                <span>Enviar</span>
                <Send size={13} />
              </button>
            </form>

          </div>
        ) : (
          /* Empty State when 0 threads exist */
          <div style={{ padding: '64px 24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-card)' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--primary-bg)', color: 'var(--primary-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <MessageSquare size={30} />
            </div>

            <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-heading)', marginBottom: '6px', letterSpacing: '-0.02em' }}>
              Nenhuma conversa ativa no momento
            </h3>

            <p style={{ fontSize: '13px', color: 'var(--text-muted)', maxWidth: '440px', lineHeight: '1.5', marginBottom: '24px' }}>
              Inicie uma conversa direta com engenheiros, arquitetos, construtoras e fornecedores de materiais clicando em <strong>"Conversar"</strong> no Feed ou no Diretório Profissional.
            </p>

            {onNavigateToDirectory && (
              <button onClick={onNavigateToDirectory} className="btn primary" style={{ fontSize: '13px', padding: '10px 22px', gap: '8px' }}>
                <Compass size={16} /> Explorar Diretório de Profissionais
              </button>
            )}
          </div>
        )}

      </div>

    </div>
  );
};
