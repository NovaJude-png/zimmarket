'use client';

import { useState, useEffect, useRef, use } from 'react';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import { formatDate } from '@/lib/utils';

export default function ConversationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [messages, setMessages] = useState<Record<string, unknown>[]>([]);
  const [conversation, setConversation] = useState<Record<string, unknown> | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [currentUser, setCurrentUser] = useState<Record<string, unknown> | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => setCurrentUser(d.user));
  }, []);

  useEffect(() => {
    fetch(`/api/messages/${id}`)
      .then(r => r.json())
      .then(data => {
        setConversation(data.conversation);
        setMessages(data.messages || []);
        setLoading(false);
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
      })
      .catch(() => setLoading(false));
  }, [id]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;
    setSending(true);

    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientId: (conversation?.otherUser as Record<string, unknown>)?.id,
          listingId: (conversation?.listing as Record<string, unknown>)?.id,
          message: newMessage,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setMessages(prev => [...prev, data.message]);
        setNewMessage('');
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);

        // If the conversation was newly created, redirect to the new URL
        if (data.conversationId && data.conversationId !== id) {
          window.history.replaceState(null, '', `/messages/${data.conversationId}`);
        }
      }
    } catch (err) {
      console.error(err);
    }
    setSending(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="flex items-center justify-center h-[60vh]">
          <div className="animate-spin h-8 w-8 border-4 border-[#1B4D3E] border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container-app py-20 text-center">
          <h2 className="text-xl font-bold mb-4">Conversation not found</h2>
          <Link href="/messages" className="btn-primary">Back to Messages</Link>
        </div>
      </div>
    );
  }

  const otherUser = conversation.otherUser as Record<string, unknown>;
  const otherProfile = otherUser?.profile as Record<string, unknown> | null;
  const listing = conversation.listing as Record<string, unknown> | null;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Chat header */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200">
        <div className="container-app flex items-center gap-3 py-3">
          <Link href="/messages" className="p-1">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          {otherProfile?.avatarUrl ? (
            <img src={otherProfile.avatarUrl as string} alt="" className="w-10 h-10 rounded-full object-cover" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-[#1B4D3E] flex items-center justify-center">
              <span className="text-white font-bold text-sm">
                {((otherProfile?.displayName as string) || '?')[0].toUpperCase()}
              </span>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm truncate">{(otherProfile?.displayName as string) || 'User'}</p>
            {listing && (
              <p className="text-xs text-gray-500 truncate">Re: {listing.title as string}</p>
            )}
          </div>
        </div>
      </div>

      {/* Listing context */}
      {listing && (
        <Link href={`/listing/${listing.id}`} className="bg-gray-50 border-b border-gray-100 p-3 flex items-center gap-3">
          <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{listing.title as string}</p>
            {(listing.price as number) > 0 && (
              <p className="text-sm text-[#1B4D3E] font-bold">${(listing.price as number).toLocaleString()}</p>
            )}
          </div>
          <span className={`badge text-xs ${(listing.status as string) === 'ACTIVE' ? 'badge-success' : 'badge-warning'}`}>
            {listing.status as string}
          </span>
        </Link>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <div className="text-center py-10 text-gray-400 text-sm">
            Start the conversation! Send a message below.
          </div>
        )}
        {messages.map((msg: Record<string, unknown>) => {
          const isSent = msg.senderId === currentUser?.id;
          return (
            <div key={msg.id as string} className={`flex ${isSent ? 'justify-end' : 'justify-start'}`}>
              <div className={`msg-bubble ${isSent ? 'sent' : 'received'}`}>
                <p>{msg.content as string}</p>
                <p className={`text-[10px] mt-1 ${isSent ? 'text-white/60' : 'text-gray-400'}`}>
                  {formatDate(msg.createdAt as string)}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="sticky bottom-0 bg-white border-t border-gray-200 p-3 safe-bottom">
        <form onSubmit={handleSend} className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="input-field flex-1 !py-2.5"
            maxLength={2000}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="btn-primary !px-4 !py-2.5"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}