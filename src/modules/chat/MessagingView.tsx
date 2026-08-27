import React, { useState } from 'react';
import { ChatThread, ChatMessage, UserProfile } from '../../types';
import { Send, Paperclip } from 'lucide-react';

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
  const currentMessages = getMessages(activeThreadId);
  const activeThread = threads.find(t => t.id === activeThreadId) || threads[0];

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    onSendMessage(activeThreadId, inputText);
    setInputText('');
  };

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto', padding: '20px 16px' }}>
      
      <div className="card" style={{ minHeight: '520px', display: 'flex', flexDirection: 'column' }}>
        
        {/* Header */}
        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--steel-line)', background: 'var(--paper)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div className="wordmark">
            <span className="mark"></span>
            <span style={{ fontSize: '15px' }}>Mensagens</span>
          </div>
          {activeThread && (
            <div className="mono" style={{ fontSize: '10px', color: 'var(--steel)' }}>
              Com: {activeThread.participantName}
            </div>
          )}
        </div>

        {/* Thread selector tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--steel-line)', overflowX: 'auto' }}>
          {threads.map(t => (
            <div 
              key={t.id}
              onClick={() => onSelectThread(t.id)}
              style={{ padding: '8px 12px', borderRight: '1px solid var(--steel-line)', background: t.id === activeThreadId ? 'var(--white)' : 'var(--paper)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <div className="avatar" style={{ width: '22px', height: '22px', fontSize: '9px' }}>
                {t.participantName.substring(0, 2).toUpperCase()}
              </div>
              <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--ink)' }}>{t.participantName.split(' ')[0]}</span>
            </div>
          ))}
        </div>

        {/* Message body */}
        <div style={{ flex: 1, padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', background: 'var(--paper)' }}>
          {currentMessages.map(m => {
            const isMe = m.senderId === currentUser.id;
            return (
              <div key={m.id} style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
                <div style={{ maxWidth: '80%', background: isMe ? 'var(--accent)' : 'var(--white)', color: isMe ? '#FFF' : 'var(--ink)', border: '1px solid var(--steel-line)', borderRadius: '3px', padding: '8px 12px', fontSize: '12px' }}>
                  <div>{m.text}</div>
                  {m.attachmentUrl && (
                    <div style={{ marginTop: '4px', fontSize: '10px', opacity: 0.9, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Paperclip size={11} /> {m.attachmentUrl}
                    </div>
                  )}
                  <div className="mono" style={{ textAlign: 'right', fontSize: '9px', opacity: 0.7, marginTop: '3px' }}>
                    {m.timestamp}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Input */}
        <form onSubmit={handleSend} style={{ padding: '12px', borderTop: '1px solid var(--steel-line)', background: 'var(--white)', display: 'flex', gap: '8px' }}>
          <input 
            type="text" 
            className="input-field" 
            placeholder="Escreva sua mensagem..." 
            value={inputText}
            onChange={e => setInputText(e.target.value)}
          />
          <button type="submit" className="btn primary" style={{ padding: '8px 14px', fontSize: '11px' }}>
            <Send size={12} />
          </button>
        </form>

      </div>

    </div>
  );
};
