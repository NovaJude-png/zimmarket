'use client';
import { useState, useEffect, useRef } from 'react';
import Header from '@/components/layout/Header';

interface Conversation {
  id: string;
  otherUser: { id: string; profile?: { displayName?: string; avatarUrl?: string } };
  lastMessage?: { content?: string };
  unreadCount?: number;
}

interface Message {
  id: string;
  content: string;
  senderId: string;
  createdAt: string;
  isMine?: boolean;
}

export default function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selected, setSelected] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [currentUserId, setCurrentUserId] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => {
      if (!d.user) { window.location.href = '/login'; return; }
      setCurrentUserId(d.user.id);
      fetch('/api/messages').then(r => r.json()).then(md => {
        setConversations(md.conversations || []);
        setLoading(false);
      });
    });
  }, []);

  const loadMessages = async (convId: string) => {
    const conv = conversations.find(c => c.id === convId) || null;
    setSelected(conv);
    const res = await fetch(`/api/messages?conversationId=${convId}`);
    const data = await res.json();
    const msgs = (data.messages || []).map((m: Message) => ({
      ...m,
      isMine: m.senderId === currentUserId,
    }));
    setMessages(msgs);
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selected) return;
    const content = newMessage;
    setNewMessage('');
    const res = await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ conversationId: selected.id, content }),
    });
    if (res.ok) {
      const data = await res.json();
      setMessages(prev => [...prev, { ...data.message, isMine: true }]);
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    }
  };

  const getOtherUserName = (conv: Conversation) => {
    return conv.otherUser?.profile?.displayName || 'User';
  };

  const getLastMessageText = (conv: Conversation) => {
    if (conv.lastMessage?.content) return conv.lastMessage.content;
    if (typeof conv.lastMessage === 'string') return conv.lastMessage;
    return 'No messages yet';
  };

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <Header />
      <div className="container-app py-4">
        <div className="card overflow-hidden" style={{ height: 'calc(100vh - 120px)' }}>
          <div className="flex h-full">
            {/* Conversations List */}
            <div className={`w-full md:w-80 border-r border-[#E4E6EB] flex flex-col ${selected ? 'hidden md:flex' : 'flex'}`}>
              <div className="p-3 border-b border-[#E4E6EB]">
                <h2 className="text-lg font-bold text-[#050505]">Messages</h2>
              </div>
              <div className="flex-1 overflow-y-auto">
                {loading ? (
                  <div className="p-3 space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="skeleton h-14 rounded-lg" />)}</div>
                ) : conversations.length > 0 ? (
                  conversations.map(conv => (
                    <button key={conv.id} onClick={() => loadMessages(conv.id)}
                      className={`w-full flex items-center gap-3 p-3 hover:bg-[#F0F2F5] transition-colors text-left ${selected?.id === conv.id ? 'bg-[#E7F3FF]' : ''}`}>
                      <div className="w-10 h-10 rounded-full bg-[#E4E6EB] flex items-center justify-center flex-shrink-0">
                        <span className="font-bold text-[#050505] text-sm">{getOtherUserName(conv)[0]?.toUpperCase() || '?'}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-[#050505] text-sm truncate">{getOtherUserName(conv)}</p>
                        <p className="text-xs text-[#65676B] truncate">{getLastMessageText(conv)}</p>
                      </div>
                      {conv.unreadCount ? <div className="w-2 h-2 rounded-full" style={{ background: 'var(--blue)' }} /> : null}
                    </button>
                  ))
                ) : (
                  <div className="p-6 text-center">
                    <p className="text-[#65676B] text-sm">No conversations yet.</p>
                    <p className="text-xs text-[#8A8D91] mt-1">Start one by messaging a seller.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Chat */}
            <div className={`flex-1 flex flex-col ${selected ? 'flex' : 'hidden md:flex'}`}>
              {selected ? (
                <>
                  <div className="p-3 border-b border-[#E4E6EB] flex items-center gap-3">
                    <button onClick={() => setSelected(null)} className="md:hidden">
                      <svg className="w-5 h-5 text-[#65676B]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5m7 7l-7-7 7-7" /></svg>
                    </button>
                    <div className="w-8 h-8 rounded-full bg-[#E4E6EB] flex items-center justify-center">
                      <span className="font-bold text-[#050505] text-xs">{getOtherUserName(selected)[0]?.toUpperCase()}</span>
                    </div>
                    <p className="font-semibold text-[#050505]">{getOtherUserName(selected)}</p>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {messages.map((msg) => (
                      <div key={msg.id} className={`flex ${msg.isMine ? 'justify-end' : 'justify-start'}`}>
                        <div className={msg.isMine ? 'message-sent' : 'message-received'}>
                          {msg.content}
                        </div>
                      </div>
                    ))}
                    {messages.length === 0 && (
                      <div className="text-center py-8">
                        <p className="text-[#8A8D91] text-sm">No messages yet. Say hello!</p>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                  <div className="p-3 border-t border-[#E4E6EB] flex gap-2">
                    <input value={newMessage} onChange={e => setNewMessage(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                      placeholder="Type a message..." className="input-field flex-1 !rounded-full !text-sm" />
                    <button onClick={sendMessage} disabled={!newMessage.trim()} className="w-10 h-10 rounded-full flex items-center justify-center disabled:opacity-40" style={{ background: 'var(--blue)' }}>
                      <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <svg className="w-12 h-12 mx-auto text-[#CED0D4] mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" /></svg>
                    <p className="text-[#65676B] font-medium">Select a conversation</p>
                    <p className="text-[#8A8D91] text-sm mt-1">Choose from your existing chats or start a new one</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}