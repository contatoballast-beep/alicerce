import React, { useState } from 'react';
import { ChatThread, ChatMessage, UserProfile } from '../../types';
import { Send, Paperclip, CheckCheck, User, MessageSquare, Image, ShieldCheck } from 'lucide-react';

interface MessagingViewProps {
  threads: ChatThread[];
  currentUser: UserProfile;
  activeThreadId: string;
  onSelectThread: (threadId: string) => void;
  getMessages: (threadId: string) => ChatMessage[];
  onSendMessage: (threadId: string, text: string, attachmentUrl?: string) => void;
}

export const MessagingView: React.FC<MessagingViewProps> = ({
  threads,
  currentUser,
  activeThreadId,
  onSelectThread,
  getMessages,
  onSendMessage,
}) => {
  const [inputText, setInputText] = useState('');
  const [attachment, setAttachment] = useState('');
  const currentMessages = getMessages(activeThreadId);
  const activeThread = threads.find(t => t.id === activeThreadId) || threads[0];

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() && !attachment) return;

    onSendMessage(activeThreadId, inputText, attachment || undefined);
    setInputText('');
    setAttachment('');
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '24px 16px' }}>
      <div className="glass-card" style={{ display: 'grid', gridTemplateColumns: '320px 1fr', minHeight: '600px', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
        
        {/* Left Column: Threads list */}
        <div style={{ borderRight: '1px solid var(--border-color)', background: 'rgba(15, 23, 42, 0.8)' }}>
          <div style={{ padding: '16px', borderBottom: '1px solid var(--border-color)', fontWeight: 700, fontSize: '1rem', color: '#FFF', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MessageSquare size={18} color="var(--color-primary)" /> Central de Mensagens
          </div>

          <div style={{ overflowY: 'auto', maxHeight: '530px' }}>
            {threads.map(t => (
              <div 
                key={t.id} 
                onClick={() => onSelectThread(t.id)}
                style={{ padding: '14px', borderBottom: '1px solid var(--border-color)', cursor: 'pointer', background: t.id === activeThreadId ? 'var(--color-primary-light)' : 'transparent', transition: 'background 0.2s' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <img src={t.participantAvatar} alt={t.participantName} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong style={{ fontSize: '0.88rem', color: '#FFF' }}>{t.participantName}</strong>
                      <span className="mono" style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{t.lastMessageTime}</span>
                    </div>
                    <span className="mono" style={{ fontSize: '0.7rem', color: 'var(--color-primary)', display: 'block' }}>{t.participantRole}</span>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                      {t.lastMessage}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Chat Box */}
        {activeThread ? (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            
            {/* Header */}
            <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-card)', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <img src={activeThread.participantAvatar} alt={activeThread.participantName} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
              <div>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#FFF' }}>{activeThread.participantName}</h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span className="pulse-dot"></span>
                  <span className="mono" style={{ fontSize: '0.72rem', color: 'var(--color-primary)' }}>{activeThread.participantRole}</span>
                </div>
              </div>
            </div>

            {/* Messages body */}
            <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', background: 'var(--bg-darker)' }}>
              {currentMessages.map(m => {
                const isMe = m.senderId === currentUser.id;
                return (
                  <div key={m.id} style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
                    <div style={{ maxWidth: '70%', background: isMe ? 'var(--color-primary)' : 'var(--bg-card)', color: isMe ? '#FFF' : 'var(--text-main)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '10px 14px', position: 'relative' }}>
                      <div style={{ fontSize: '0.88rem', lineHeight: 1.5 }}>{m.text}</div>
                      {m.attachmentUrl && (
                        <div style={{ marginTop: '6px', paddingTop: '6px', borderTop: '1px dashed rgba(255,255,255,0.2)', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Paperclip size={14} /> <span>Anexo: {m.attachmentUrl}</span>
                        </div>
                      )}
                      <div style={{ textAlign: 'right', fontSize: '0.68rem', opacity: 0.8, marginTop: '4px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }}>
                        <span>{m.timestamp}</span>
                        <CheckCheck size={14} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Input Form */}
            <form onSubmit={handleSend} style={{ padding: '16px', borderTop: '1px solid var(--border-color)', background: 'var(--bg-card)', display: 'flex', gap: '10px', alignItems: 'center' }}>
              <input 
                type="text" 
                className="input-field" 
                placeholder="Escreva sua mensagem ou termos da negociação..." 
                value={inputText}
                onChange={e => setInputText(e.target.value)}
              />
              <button type="submit" className="btn-primary" style={{ flexShrink: 0 }}>
                <Send size={18} /> Enviar
              </button>
            </form>

          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
            Selecione uma conversa ao lado para iniciar o chat.
          </div>
        )}

      </div>
    </div>
  );
};
