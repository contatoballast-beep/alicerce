import React, { useState, useEffect, useRef } from 'react';
import { ChatThread, ChatMessage, UserProfile } from '../../types';
import { RealApiClient } from '../../services/realApiClient';
import {
  Send,
  Paperclip,
  Search,
  MessageSquare,
  ShieldCheck,
  X,
  Compass,
  ArrowLeft,
  Check,
  CheckCheck,
  Clock,
  AlertCircle,
  RefreshCw,
  Flag,
  FileText,
  Wifi,
  WifiOff,
} from 'lucide-react';

interface MessagingViewProps {
  threads: ChatThread[];
  currentUser: UserProfile;
  activeThreadId: string | null;
  wsConnected: boolean;
  onSelectThread: (threadId: string) => void;
  messagesByThread: Record<string, ChatMessage[]>;
  hasMoreByThread: Record<string, boolean>;
  loadingMessages: boolean;
  onLoadOlderMessages: (threadId: string) => void;
  onSendMessage: (threadId: string, text: string, attachmentUrl?: string, retryClientMsgId?: string) => Promise<void>;
  onNavigateToDirectory: () => void;
  onRequestProposalFromChat?: (participantId: string, participantName: string) => void;
  onNotify: (msg: string) => void;
}

export const MessagingView: React.FC<MessagingViewProps> = ({
  threads,
  currentUser,
  activeThreadId,
  wsConnected,
  onSelectThread,
  messagesByThread,
  hasMoreByThread,
  loadingMessages,
  onLoadOlderMessages,
  onSendMessage,
  onNavigateToDirectory,
  onRequestProposalFromChat,
  onNotify,
}) => {
  const [inputText, setInputText] = useState('');
  const [searchFilter, setSearchFilter] = useState('');
  const [attachmentOpen, setAttachmentOpen] = useState(false);
  const [attachmentInput, setAttachmentInput] = useState('');
  const [attachmentError, setAttachmentError] = useState<string | null>(null);
  const [sendingLock, setSendingLock] = useState(false);

  // Mobile view switcher (list vs active room)
  const [mobileShowRoom, setMobileShowRoom] = useState(Boolean(activeThreadId));

  // Report modal state
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState('Spam ou abordagem indesejada');
  const [reportDetails, setReportDetails] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const filteredThreads = threads.filter(
    (t) =>
      t.participantName.toLowerCase().includes(searchFilter.toLowerCase()) ||
      t.participantRole.toLowerCase().includes(searchFilter.toLowerCase()) ||
      (t.projectTitle && t.projectTitle.toLowerCase().includes(searchFilter.toLowerCase()))
  );

  const effectiveThreadId = activeThreadId || (threads.length > 0 ? threads[0].id : null);
  const activeThread = threads.find((t) => t.id === effectiveThreadId) || null;
  const currentMessages = effectiveThreadId ? messagesByThread[effectiveThreadId] || [] : [];
  const hasMore = effectiveThreadId ? Boolean(hasMoreByThread[effectiveThreadId]) : false;

  useEffect(() => {
    if (activeThreadId) setMobileShowRoom(true);
  }, [activeThreadId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentMessages.length, effectiveThreadId]);

  const validateAttachment = (url: string): string | null => {
    if (!url.trim()) return null;
    try {
      const parsed = new URL(url.trim());
      if (parsed.protocol !== 'https:') return 'Use um link HTTPS seguro para anexos.';
      const clean = parsed.pathname.toLowerCase();
      const allowed = ['.pdf', '.png', '.jpg', '.jpeg', '.webp', '.dwg', '.zip'];
      if (!allowed.some((ext) => clean.endsWith(ext))) {
        return 'Formato permitido: PDF, JPG, PNG, WEBP, DWG ou ZIP.';
      }
      return null;
    } catch {
      return 'URL de anexo inválida.';
    }
  };

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (sendingLock || !effectiveThreadId) return;

    const trimmedText = inputText.trim();
    const trimmedAttach = attachmentInput.trim();
    if (!trimmedText && !trimmedAttach) return;

    if (trimmedAttach) {
      const err = validateAttachment(trimmedAttach);
      if (err) {
        setAttachmentError(err);
        return;
      }
    }

    setAttachmentError(null);
    setSendingLock(true);
    setInputText('');
    setAttachmentInput('');
    setAttachmentOpen(false);

    try {
      await onSendMessage(effectiveThreadId, trimmedText || 'Documento anexado', trimmedAttach || undefined);
    } finally {
      setSendingLock(false);
    }
  };

  const handleReportThread = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeThread) return;
    const res = await RealApiClient.submitReport({
      targetType: 'chat',
      targetId: activeThread.id,
      reason: reportReason,
      details: reportDetails.trim(),
    });
    if (res.ok) {
      setReportOpen(false);
      setReportDetails('');
      onNotify('Denúncia registrada. Nossa equipe analisará a conversa.');
    } else {
      onNotify(res.error || 'Erro ao registrar denúncia.');
    }
  };

  const renderStatusIcon = (m: ChatMessage) => {
    if (m.senderId !== currentUser.id) return null;
    if (m.status === 'sending') {
      return (
        <span title="Enviando" style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
          <Clock size={11} /> Enviando
        </span>
      );
    }
    if (m.status === 'failed') {
      return (
        <button
          type="button"
          onClick={() => effectiveThreadId && onSendMessage(effectiveThreadId, m.text, m.attachmentUrl, m.clientMessageId)}
          style={{
            background: 'rgba(255,255,255,0.2)',
            border: 'none',
            borderRadius: '4px',
            color: '#FFFFFF',
            fontSize: '10.5px',
            padding: '2px 6px',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          <AlertCircle size={11} /> Falha · Reenviar
        </button>
      );
    }
    if (m.read || m.status === 'read') {
      return (
        <span title="Leitura confirmada" style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
          <CheckCheck size={12} /> Lida
        </span>
      );
    }
    return (
      <span title="Enviada ao servidor" style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
        <Check size={12} /> Enviada
      </span>
    );
  };

  return (
    <div className="ballast-container" style={{ paddingTop: '20px', paddingBottom: '28px' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          marginBottom: '16px',
        }}
      >
        <div>
          <div className="meta-label" style={{ color: 'var(--azul-lastro)', marginBottom: '4px' }}>
            CAIXA DE ENTRADA PRIVADA
          </div>
          <h1 style={{ fontSize: 'clamp(22px, 3vw, 30px)', margin: 0 }}>Mensagens</h1>
        </div>

        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            borderRadius: '999px',
            fontSize: '12px',
            fontWeight: 600,
            background: wsConnected ? 'var(--color-success-light)' : 'var(--color-warn-light)',
            color: wsConnected ? 'var(--color-success)' : 'var(--color-warn)',
            border: '1px solid var(--border-color)',
          }}
        >
          {wsConnected ? <Wifi size={13} /> : <WifiOff size={13} />}
          <span>{wsConnected ? 'Tempo real conectado' : 'Reconectando em tempo real...'}</span>
        </div>
      </div>

      {/* Main Chat Container */}
      <div
        className="card"
        style={{
          display: 'grid',
          gridTemplateColumns: threads.length > 0 ? 'minmax(260px, 310px) 1fr' : '1fr',
          height: 'min(74dvh, 680px)',
          minHeight: '460px',
          overflow: 'hidden',
        }}
      >
        {/* Left Pane: Inbox Threads */}
        {threads.length > 0 && (
          <aside
            aria-label="Lista de conversas"
            className={mobileShowRoom ? 'desktop-nav' : ''}
            style={{
              borderRight: '1px solid var(--border-color)',
              background: 'var(--bg-subtle)',
              display: 'flex',
              flexDirection: 'column',
              minHeight: 0,
            }}
          >
            <div style={{ padding: '12px', borderBottom: '1px solid var(--border-color)', background: 'var(--branco)' }}>
              <div style={{ position: 'relative' }}>
                <Search size={14} color="#546168" style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="search"
                  aria-label="Buscar conversas"
                  placeholder="Buscar por nome ou projeto..."
                  style={{ paddingLeft: '32px', fontSize: '13px' }}
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                />
              </div>
            </div>

            <div style={{ flex: 1, overflowY: 'auto' }}>
              {filteredThreads.map((t) => {
                const isSelected = t.id === effectiveThreadId;
                const initials = t.participantName
                  .split(' ')
                  .filter(Boolean)
                  .slice(0, 2)
                  .map((s) => s[0]?.toUpperCase())
                  .join('');

                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      onSelectThread(t.id);
                      setMobileShowRoom(true);
                    }}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '14px',
                      border: 'none',
                      borderBottom: '1px solid var(--border-color)',
                      borderLeft: isSelected ? '4px solid var(--azul-lastro)' : '4px solid transparent',
                      background: isSelected ? 'var(--branco)' : 'transparent',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '10px',
                    }}
                  >
                    {t.participantAvatar ? (
                      <img
                        src={t.participantAvatar}
                        alt=""
                        style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
                      />
                    ) : (
                      <span
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          background: 'var(--azul-lastro)',
                          color: '#FFFFFF',
                          fontSize: '13px',
                          fontWeight: 700,
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        {initials}
                      </span>
                    )}

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--grafite)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {t.participantName}
                        </span>
                        <span className="mono" style={{ fontSize: '10.5px', color: 'var(--steel)', flexShrink: 0 }}>
                          {t.lastMessageTime}
                        </span>
                      </div>

                      {t.projectTitle && (
                        <div style={{ fontSize: '11px', color: 'var(--azul-lastro)', fontWeight: 600, marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          Projeto: {t.projectTitle}
                        </div>
                      )}

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                        <span style={{ fontSize: '12px', color: 'var(--steel)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {t.lastMessage || 'Conversa iniciada'}
                        </span>
                        {t.unreadCount > 0 && (
                          <span
                            style={{
                              background: 'var(--azul-lastro)',
                              color: '#FFFFFF',
                              borderRadius: '999px',
                              padding: '1px 7px',
                              fontSize: '10.5px',
                              fontWeight: 700,
                              flexShrink: 0,
                            }}
                          >
                            {t.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}

              {filteredThreads.length === 0 && (
                <div style={{ padding: '28px 16px', textAlign: 'center', color: 'var(--steel)', fontSize: '13px' }}>
                  Nenhuma conversa encontrada.
                </div>
              )}
            </div>
          </aside>
        )}

        {/* Right Pane: Active Room */}
        {activeThread ? (
          <section
            aria-label={`Conversa com ${activeThread.participantName}`}
            style={{
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
              minHeight: 0,
              background: 'var(--branco)',
            }}
          >
            {/* Room Header */}
            <div
              style={{
                padding: '12px 16px',
                borderBottom: '1px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '10px',
                flexWrap: 'wrap',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                <button
                  type="button"
                  className="btn ghost mobile-nav-toggle"
                  onClick={() => setMobileShowRoom(false)}
                  style={{ padding: '6px 8px', minHeight: '34px' }}
                  aria-label="Voltar para a lista de conversas"
                >
                  <ArrowLeft size={16} />
                </button>
                <div style={{ minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <strong style={{ fontSize: '14.5px', color: 'var(--grafite)' }}>{activeThread.participantName}</strong>
                    {activeThread.participantVerified && (
                      <span className="badge verified" style={{ fontSize: '10.5px' }}>
                        <ShieldCheck size={11} /> Verificado
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--steel)' }}>
                    {activeThread.projectTitle ? `Projeto vinculado: ${activeThread.projectTitle}` : activeThread.participantRole}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '6px' }}>
                {onRequestProposalFromChat && (
                  <button
                    type="button"
                    onClick={() => onRequestProposalFromChat(activeThread.participantId, activeThread.participantName)}
                    className="btn ghost"
                    style={{ minHeight: '34px', padding: '6px 10px', fontSize: '12px' }}
                  >
                    <FileText size={13} /> Solicitar proposta
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setReportOpen((o) => !o)}
                  className="btn ghost"
                  style={{ minHeight: '34px', padding: '6px 10px', fontSize: '12px', color: 'var(--steel)' }}
                  title="Denunciar abuso ou spam"
                  aria-label="Denunciar conversa"
                >
                  <Flag size={13} />
                </button>
              </div>
            </div>

            {/* Inline Report Drawer */}
            {reportOpen && (
              <form
                onSubmit={handleReportThread}
                style={{
                  padding: '12px 16px',
                  background: 'var(--color-danger-light)',
                  borderBottom: '1px solid #FECDCA',
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '8px',
                  alignItems: 'center',
                }}
              >
                <select
                  aria-label="Motivo da denúncia"
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  style={{ flex: '1 1 180px', fontSize: '12.5px', padding: '7px 10px' }}
                >
                  <option value="Spam ou abordagem indesejada">Spam ou abordagem indesejada</option>
                  <option value="Comportamento abusivo">Comportamento abusivo</option>
                  <option value="Tentativa de fraude">Tentativa de fraude</option>
                </select>
                <input
                  type="text"
                  aria-label="Detalhes da denúncia"
                  placeholder="Detalhes (opcional)"
                  value={reportDetails}
                  onChange={(e) => setReportDetails(e.target.value)}
                  style={{ flex: '1.5 1 200px', fontSize: '12.5px', padding: '7px 10px' }}
                />
                <button type="submit" className="btn danger" style={{ minHeight: '34px', fontSize: '12px', padding: '6px 12px' }}>
                  Denunciar
                </button>
                <button type="button" onClick={() => setReportOpen(false)} className="btn ghost" style={{ minHeight: '34px', padding: '6px 8px' }}>
                  <X size={14} />
                </button>
              </form>
            )}

            {/* Messages Stream */}
            <div
              style={{
                flex: 1,
                minHeight: 0,
                padding: '18px 16px',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                background: 'var(--bg-subtle)',
              }}
            >
              {hasMore && (
                <div style={{ textAlign: 'center', marginBottom: '6px' }}>
                  <button
                    type="button"
                    onClick={() => onLoadOlderMessages(activeThread.id)}
                    disabled={loadingMessages}
                    className="btn ghost"
                    style={{ minHeight: '32px', fontSize: '12px', padding: '5px 12px' }}
                  >
                    <RefreshCw size={12} className={loadingMessages ? 'animate-spin' : ''} /> Carregar mensagens anteriores
                  </button>
                </div>
              )}

              {currentMessages.length === 0 && !loadingMessages && (
                <div style={{ margin: 'auto', textAlign: 'center', padding: '24px', color: 'var(--steel)' }}>
                  <MessageSquare size={32} style={{ opacity: 0.35, marginBottom: '8px' }} />
                  <div style={{ fontSize: '14.5px', fontWeight: 600, color: 'var(--grafite)' }}>Início da conversa</div>
                  <div style={{ fontSize: '13px', marginTop: '4px' }}>
                    Conversa privada entre você e {activeThread.participantName}.
                  </div>
                </div>
              )}

              {currentMessages.map((m) => {
                const isMe = m.senderId === currentUser.id;
                return (
                  <div
                    key={m.id || m.clientMessageId}
                    style={{
                      display: 'flex',
                      justifyContent: isMe ? 'flex-end' : 'flex-start',
                    }}
                  >
                    <div
                      style={{
                        maxWidth: 'min(78%, 520px)',
                        background: isMe ? 'var(--azul-lastro)' : 'var(--branco)',
                        color: isMe ? '#FFFFFF' : 'var(--grafite)',
                        border: isMe ? 'none' : '1px solid var(--border-color)',
                        borderRadius: isMe ? '12px 12px 4px 12px' : '12px 12px 12px 4px',
                        padding: '10px 14px',
                        fontSize: '13.5px',
                        lineHeight: 1.55,
                        boxShadow: 'var(--shadow-xs)',
                      }}
                    >
                      <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{m.text}</div>

                      {m.attachmentUrl && (
                        <a
                          href={m.attachmentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            marginTop: '8px',
                            fontSize: '12px',
                            padding: '6px 10px',
                            background: isMe ? 'rgba(255,255,255,0.16)' : 'var(--bg-subtle)',
                            borderRadius: 'var(--radius-xs)',
                            color: isMe ? '#FFFFFF' : 'var(--azul-lastro)',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            textDecoration: 'underline',
                            maxWidth: '100%',
                            wordBreak: 'break-all',
                          }}
                        >
                          <Paperclip size={12} /> Anexo seguro
                        </a>
                      )}

                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'flex-end',
                          alignItems: 'center',
                          gap: '8px',
                          fontSize: '10.5px',
                          opacity: isMe ? 0.85 : 0.7,
                          marginTop: '5px',
                        }}
                      >
                        <span className="mono">{m.timestamp}</span>
                        {renderStatusIcon(m)}
                      </div>
                    </div>
                  </div>
                );
              })}

              <div ref={messagesEndRef} />
            </div>

            {/* Attachment Drawer */}
            {attachmentOpen && (
              <div style={{ padding: '10px 14px', background: 'var(--bg-subtle)', borderTop: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="url"
                    aria-label="URL segura do anexo"
                    placeholder="Link HTTPS para documento (.pdf, .jpg, .png, .webp, .dwg, .zip)"
                    value={attachmentInput}
                    onChange={(e) => {
                      setAttachmentInput(e.target.value);
                      setAttachmentError(null);
                    }}
                    style={{ fontSize: '12.5px', flex: 1 }}
                  />
                  <button type="button" onClick={() => { setAttachmentOpen(false); setAttachmentError(null); }} className="btn ghost" style={{ minHeight: '36px', padding: '6px 10px' }}>
                    <X size={14} />
                  </button>
                </div>
                {attachmentError && (
                  <div role="alert" style={{ fontSize: '12px', color: 'var(--color-danger)', marginTop: '6px' }}>
                    {attachmentError}
                  </div>
                )}
              </div>
            )}

            {/* Sticky Message Input Bar (Keyboard-friendly on mobile) */}
            <form
              onSubmit={handleSend}
              style={{
                padding: '10px 12px',
                borderTop: '1px solid var(--border-color)',
                background: 'var(--branco)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <button
                type="button"
                onClick={() => setAttachmentOpen((o) => !o)}
                className="btn ghost"
                style={{ padding: '8px 10px', minHeight: '40px' }}
                aria-label="Anexar link de documento seguro"
                title="Anexar documento"
              >
                <Paperclip size={16} />
              </button>

              <input
                type="text"
                aria-label="Escrever mensagem"
                placeholder={`Mensagem para ${activeThread.participantName}...`}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                style={{ flex: 1, minWidth: 0 }}
              />

              <button
                type="submit"
                className="btn primary"
                disabled={sendingLock || (!inputText.trim() && !attachmentInput.trim())}
                style={{ padding: '8px 16px', minHeight: '40px' }}
              >
                <Send size={14} />
                <span className="desktop-label">Enviar</span>
              </button>
            </form>
          </section>
        ) : (
          <div style={{ padding: '56px 24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <MessageSquare size={34} color="#2F5872" style={{ marginBottom: '12px' }} />
            <h2 style={{ fontSize: '22px', marginBottom: '8px' }}>Sua caixa de entrada está vazia</h2>
            <p style={{ fontSize: '14px', color: 'var(--steel)', maxWidth: '420px', marginBottom: '20px' }}>
              Explore o catálogo de arquitetos e envie uma solicitação de proposta ou inicie uma conversa diretamente pelo perfil.
            </p>
            <button type="button" onClick={onNavigateToDirectory} className="btn primary">
              <Compass size={15} /> Encontrar arquitetos
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
