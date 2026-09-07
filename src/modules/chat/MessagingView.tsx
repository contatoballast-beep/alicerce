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
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '16px' }}>
      
      {/* View Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
        <div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--line)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            CANAL DIRETO & NEGOCIAÇÕES TÉCNICAS
          </div>
          <h2 style={{ fontSize: '19px', fontWeight: 700, color: 'var(--ink)' }}>
            Mensagens e Chat em Tempo Real
          </h2>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#10B981' }}></span>
          <span className="mono" style={{ fontSize: '10px', color: 'var(--steel)' }}>
            WebSocket Conectado
          </span>
        </div>
      </div>

      {/* Main Chat Container */}
      <div className="card" style={{ display: 'grid', gridTemplateColumns: threads.length > 0 ? '300px 1fr' : '1fr', minHeight: '560px', maxHeight: '72vh', overflow: 'hidden', padding: 0 }}>
        
        {/* Left Pane: Threads / Conversations */}
        {threads.length > 0 && (
          <div style={{ borderRight: '1px solid var(--steel-line)', background: 'var(--paper)', display: 'flex', flexDirection: 'column' }}>
            
            {/* Search filter */}
            <div style={{ padding: '12px', borderBottom: '1px solid var(--steel-line)' }}>
              <div style={{ position: 'relative' }}>
                <Search size={13} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--steel)' }} />
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="Buscar conversa..." 
                  style={{ paddingLeft: '28px', fontSize: '11px' }}
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
                      padding: '12px 14px',
                      borderBottom: '1px solid var(--steel-line)',
                      background: isSelected ? 'var(--white)' : 'transparent',
                      borderLeft: isSelected ? '4px solid var(--line)' : '4px solid transparent',
                      cursor: 'pointer',
                      transition: 'background 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ position: 'relative' }}>
                        <img 
                          src={t.participantAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'} 
                          alt={t.participantName}
                          style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--steel-line)' }}
                        />
                        <span style={{ position: 'absolute', bottom: '0', right: '0', width: '9px', height: '9px', borderRadius: '50%', background: '#10B981', border: '1.5px solid #FFF' }}></span>
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                          <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {t.participantName}
                          </span>
                          <span className="mono" style={{ fontSize: '9px', color: 'var(--steel)' }}>
                            {t.lastMessageTime || ''}
                          </span>
                        </div>

                        <div style={{ fontSize: '10px', color: 'var(--line)', fontWeight: 600, marginTop: '1px' }}>
                          {t.participantRole}
                        </div>

                        <div style={{ fontSize: '11px', color: 'var(--steel)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: '2px' }}>
                          {t.lastMessage || 'Conversa iniciada'}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {filteredThreads.length === 0 && (
                <div style={{ padding: '24px 16px', textAlign: 'center', color: 'var(--steel)', fontSize: '11.5px' }}>
                  Nenhuma conversa encontrada para "{searchFilter}".
                </div>
              )}
            </div>

          </div>
        )}

        {/* Right Pane: Active Chat Room */}
        {activeThread ? (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--white)' }}>
            
            {/* Active Chat Header */}
            <div style={{ padding: '12px 18px', borderBottom: '1px solid var(--steel-line)', background: 'var(--paper)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <img 
                  src={activeThread.participantAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'} 
                  alt={activeThread.participantName}
                  style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--steel-line)' }}
                />
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--ink)' }}>
                      {activeThread.participantName}
                    </span>
                    <span className="badge verified" style={{ fontSize: '9px', padding: '1px 5px' }}>
                      <ShieldCheck size={10} /> Verificado
                    </span>
                  </div>
                  <div style={{ fontSize: '10.5px', color: 'var(--steel)' }}>
                    {activeThread.participantRole} • Canal Criptografado & Direto
                  </div>
                </div>
              </div>

              <div className="mono" style={{ fontSize: '10px', color: 'var(--line)', background: 'var(--white)', padding: '4px 8px', border: '1px solid var(--steel-line)', borderRadius: '3px' }}>
                ALICERCE CHAT
              </div>
            </div>

            {/* Quick Action Chips */}
            <div style={{ padding: '6px 14px', background: 'var(--paper)', borderBottom: '1px solid var(--steel-line)', display: 'flex', gap: '6px', overflowX: 'auto' }}>
              <button 
                onClick={() => handleQuickAction('Olá! Gostaria de solicitar a emissão de ART/RRT para os serviços técnicos acordados.')}
                className="btn ghost" 
                style={{ fontSize: '10px', padding: '3px 8px', whiteSpace: 'nowrap', background: 'var(--white)', borderColor: 'var(--steel-line)' }}
              >
                <FileText size={11} color="var(--line)" /> Solicitar ART / RRT
              </button>
              <button 
                onClick={() => handleQuickAction('Poderia me enviar o projeto executivo e memorial descritivo em PDF para análise?')}
                className="btn ghost" 
                style={{ fontSize: '10px', padding: '3px 8px', whiteSpace: 'nowrap', background: 'var(--white)', borderColor: 'var(--steel-line)' }}
              >
                <Building2 size={11} color="var(--line)" /> Solicitar Projeto / Memorial
              </button>
              <button 
                onClick={() => handleQuickAction('Gostaria de agendar uma visita técnica no local da obra esta semana. Quais dias você tem disponibilidade?')}
                className="btn ghost" 
                style={{ fontSize: '10px', padding: '3px 8px', whiteSpace: 'nowrap', background: 'var(--white)', borderColor: 'var(--steel-line)' }}
              >
                <Calendar size={11} color="var(--line)" /> Agendar Visita Técnica
              </button>
              <button 
                onClick={() => handleQuickAction('Pode me enviar uma proposta formal e estimativa orçamentária detalhada com prazos?')}
                className="btn ghost" 
                style={{ fontSize: '10px', padding: '3px 8px', whiteSpace: 'nowrap', background: 'var(--white)', borderColor: 'var(--steel-line)' }}
              >
                <DollarSign size={11} color="var(--line)" /> Solicitar Orçamento
              </button>
            </div>

            {/* Messages History */}
            <div style={{ flex: 1, padding: '16px 20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', background: 'var(--paper-light, #F8FAFC)' }}>
              
              {currentMessages.length === 0 && (
                <div style={{ margin: 'auto', textAlign: 'center', padding: '30px', color: 'var(--steel)' }}>
                  <MessageSquare size={32} style={{ opacity: 0.4, marginBottom: '8px' }} />
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink)' }}>Início da Conversa</div>
                  <div style={{ fontSize: '11px', marginTop: '4px' }}>
                    Envie uma mensagem para iniciar as tratativas e negociações com {activeThread.participantName}.
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
                        style={{ width: '26px', height: '26px', borderRadius: '50%', objectFit: 'cover' }}
                      />
                    )}

                    <div 
                      style={{ 
                        maxWidth: '72%', 
                        background: isMe ? 'var(--line)' : 'var(--white)', 
                        color: isMe ? '#FFFFFF' : 'var(--ink)', 
                        border: isMe ? 'none' : '1px solid var(--steel-line)', 
                        borderRadius: isMe ? '12px 12px 2px 12px' : '12px 12px 12px 2px', 
                        padding: '10px 14px', 
                        fontSize: '12px',
                        lineHeight: '1.45',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                      }}
                    >
                      <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                        {m.text}
                      </div>

                      {m.attachmentUrl && (
                        <div 
                          style={{ 
                            marginTop: '8px', 
                            fontSize: '10.5px', 
                            padding: '6px 10px', 
                            background: isMe ? 'rgba(255,255,255,0.18)' : 'var(--paper)', 
                            borderRadius: '4px',
                            border: isMe ? '1px solid rgba(255,255,255,0.3)' : '1px solid var(--steel-line)',
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '6px' 
                          }}
                        >
                          <Paperclip size={12} />
                          <span style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {m.attachmentUrl}
                          </span>
                        </div>
                      )}

                      <div 
                        className="mono" 
                        style={{ 
                          textAlign: 'right', 
                          fontSize: '9px', 
                          opacity: isMe ? 0.8 : 0.6, 
                          marginTop: '4px' 
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
              <div style={{ padding: '8px 14px', background: 'var(--paper)', borderTop: '1px solid var(--steel-line)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Paperclip size={13} color="var(--line)" />
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="Cole a URL ou nome do documento (ex: ART-SP2026-998124.pdf ou Projeto_Executivo.dwg)..."
                  style={{ fontSize: '11px', flex: 1 }}
                  value={attachmentInput}
                  onChange={e => setAttachmentInput(e.target.value)}
                />
                <button 
                  type="button" 
                  onClick={() => setAttachmentOpen(false)}
                  className="btn ghost" 
                  style={{ padding: '4px 8px' }}
                >
                  <X size={12} />
                </button>
              </div>
            )}

            {/* Input Bar */}
            <form onSubmit={handleSend} style={{ padding: '12px 16px', borderTop: '1px solid var(--steel-line)', background: 'var(--white)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button 
                type="button" 
                onClick={() => setAttachmentOpen(!attachmentOpen)}
                className="btn ghost" 
                style={{ padding: '8px 10px', color: attachmentOpen || attachmentInput ? 'var(--line)' : 'var(--steel)' }}
                title="Anexar ART, Projeto ou Memorial"
              >
                <Paperclip size={15} />
              </button>

              <input 
                type="text" 
                className="input-field" 
                placeholder={`Escreva uma mensagem para ${activeThread.participantName}...`} 
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                style={{ fontSize: '12px' }}
              />

              <button 
                type="submit" 
                className="btn primary" 
                style={{ padding: '8px 16px', fontSize: '11.5px', gap: '6px' }}
                disabled={!inputText.trim() && !attachmentInput.trim()}
              >
                <span>Enviar</span>
                <Send size={12} />
              </button>
            </form>

          </div>
        ) : (
          /* Empty State when 0 threads exist */
          <div style={{ padding: '60px 24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--white)' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--paper)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', border: '1px solid var(--steel-line)' }}>
              <MessageSquare size={28} color="var(--line)" />
            </div>

            <h3 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--ink)', marginBottom: '6px' }}>
              Nenhuma conversa ativa no momento
            </h3>

            <p style={{ fontSize: '12px', color: 'var(--steel)', maxWidth: '440px', lineHeight: '1.5', marginBottom: '20px' }}>
              Inicie uma conversa direta com engenheiros, arquitetos, construtoras e fornecedores de materiais clicando em <strong>"Conversar"</strong> no Feed ou no Diretório Profissional.
            </p>

            {onNavigateToDirectory && (
              <button onClick={onNavigateToDirectory} className="btn primary" style={{ fontSize: '12px', padding: '10px 20px', gap: '8px' }}>
                <Compass size={14} /> Explorar Diretório de Profissionais
              </button>
            )}
          </div>
        )}

      </div>

    </div>
  );
};
