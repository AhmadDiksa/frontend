'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Conversation, getConversations, deleteConversation, getMode } from '@/lib/api';
import { useAuth } from '@/lib/AuthContext';
import { useChat } from '@/hooks/useChat';
import { Sidebar } from '@/components/Sidebar';
import { ChatMessage, StreamingMessage } from '@/components/ChatMessage';
import { ChatInput } from '@/components/ChatInput';
import { RagPanel } from '@/components/RagPanel';
import { ToolCallBubble } from '@/components/ToolCallBubble';
import { ModelSelector, AIProvider } from '@/components/ModelSelector';
import LoginPage from './login/page';
import { Utensils, BookOpen, ClipboardList, CalendarDays, Search, Lightbulb, Code, Globe, PenTool, Zap } from 'lucide-react';

export default function Home() {
  const { user, loading, logout } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConvId, setCurrentConvId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [ragOpen, setRagOpen] = useState(false);
  const [appMode, setAppMode] = useState<{ agent_mode: string; is_restaurant_agent: boolean } | null>(null);
  const [selectedModel, setSelectedModel] = useState<{ id: string; provider: AIProvider }>({
    id: 'claude-3-5-sonnet-20241022', provider: 'anthropic'
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('selectedModel');
    if (saved) {
      try {
        setSelectedModel(JSON.parse(saved));
      } catch (e) {}
    }
  }, []);

  const handleModelSelect = useCallback((id: string, provider: AIProvider) => {
    const newModel = { id, provider };
    setSelectedModel(newModel);
    localStorage.setItem('selectedModel', JSON.stringify(newModel));
  }, []);

  const handleTitleUpdate = useCallback((id: string, title: string) => {
    setConversations(prev => prev.map(c => c.id === id ? { ...c, title } : c));
  }, []);
  const handleConversationCreated = useCallback((conv: Conversation) => {
    setConversations(prev => [conv, ...prev]);
    setCurrentConvId(conv.id);
  }, []);

  const chat = useChat(currentConvId, handleTitleUpdate, handleConversationCreated);

  useEffect(() => {
    if (user) {
      getConversations().then(setConversations).catch(console.error);
      getMode().then(setAppMode).catch(() => {});
    }
  }, [user]);

  useEffect(() => {
    if (currentConvId) chat.loadMessages(currentConvId);
    else chat.clearMessages();
  }, [currentConvId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat.items, chat.streamingText]);

  if (loading) return (
    <div className="min-h-screen bg-stone-950 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-stone-700 border-t-amber-400 rounded-full animate-spin" />
    </div>
  );

  if (!user) return <LoginPage />;

  const handleSelectConv = (id: string) => { setCurrentConvId(id); setSidebarOpen(false); };
  const handleNewChat = () => { setCurrentConvId(null); chat.clearMessages(); setSidebarOpen(false); };
  const handleDeleteConv = async (id: string) => {
    await deleteConversation(id);
    setConversations(prev => prev.filter(c => c.id !== id));
    if (currentConvId === id) handleNewChat();
  };

  const currentConv = conversations.find(c => c.id === currentConvId);
  const isAgent = appMode?.is_restaurant_agent;

  return (
    <div className="flex h-full bg-stone-950 overflow-hidden">
      <Sidebar
        conversations={conversations} currentId={currentConvId}
        onSelect={handleSelectConv} onNew={handleNewChat}
        onDelete={handleDeleteConv} isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="flex items-center gap-3 px-4 py-3 border-b border-stone-800 bg-stone-950">
          <button onClick={() => setSidebarOpen(true)} className="md:hidden p-1.5 hover:bg-stone-800 rounded-lg text-stone-400 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="font-semibold text-stone-200 truncate text-sm">
                {currentConv?.title || (isAgent ? 'Customer Service Restoran' : 'Percakapan Baru')}
              </h1>
              {isAgent && (
                <span className="flex-shrink-0 px-2 py-0.5 bg-amber-400/10 border border-amber-400/20 rounded-full text-xs text-amber-400 font-medium flex items-center gap-1">
                  <Utensils className="w-3 h-3" /> Restaurant Agent
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              {chat.isStreaming && (
                <span className="text-xs text-amber-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse" />
                  {isAgent ? 'Agent sedang bekerja...' : 'AI sedang mengetik...'}
                </span>
              )}
              {chat.ragUsed && !chat.isStreaming && (
                <span className="text-xs text-emerald-400 flex items-center gap-1">
                  <BookOpen className="w-3 h-3" /> RAG aktif
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ModelSelector
              selectedModelId={selectedModel.id}
              onSelect={handleModelSelect}
              isDisabled={chat.isStreaming}
            />
            {/* RAG button — hide in agent mode */}
            {!isAgent && (
              <button onClick={() => setRagOpen(true)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-stone-400 hover:text-amber-400 hover:bg-stone-800 rounded-lg transition-colors">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <span className="hidden sm:inline">Dokumen</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden sm:block text-xs text-stone-600">@{user.username}</span>
            <button
              onClick={() => { logout(); setConversations([]); chat.clearMessages(); }}
              className="p-1.5 hover:bg-stone-800 rounded-lg text-stone-500 hover:text-red-400 transition-colors"
              title="Keluar"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto scrollbar-thin px-4 py-6">
          <div className="max-w-3xl mx-auto space-y-4">
            {chat.items.length === 0 && !chat.isStreaming && (
              <WelcomeScreen
                isAgent={!!isAgent}
                username={user.username}
                onPrompt={(t) => chat.send(t, selectedModel.provider, selectedModel.id)}
                onOpenRag={() => setRagOpen(true)}
              />
            )}

            {chat.items.map(item => (
              <div key={item.id} className="message-appear">
                {item.type === 'message' && item.message && (
                  <ChatMessage message={item.message} />
                )}
                {item.type === 'tool_call' && item.tool && (
                  <ToolCallBubble tool={item.tool} />
                )}
              </div>
            ))}

            {chat.isStreaming && chat.streamingText && (
              <div className="message-appear">
                <StreamingMessage text={chat.streamingText} />
              </div>
            )}

            {chat.error && (
              <div className="flex gap-2 items-start bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-400">
                <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {chat.error}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        <ChatInput 
          onSend={(t) => chat.send(t, selectedModel.provider, selectedModel.id)} 
          isDisabled={chat.isStreaming} 
          isStreaming={chat.isStreaming} 
        />
      </main>

      <RagPanel isOpen={ragOpen} onClose={() => setRagOpen(false)} />
    </div>
  );
}

function WelcomeScreen({ isAgent, username, onPrompt, onOpenRag }: {
  isAgent: boolean; username: string;
  onPrompt: (s: string) => void; onOpenRag: () => void;
}) {
  const agentSuggestions = [
    { icon: <Utensils className="w-4 h-4" />, text: 'Tampilkan menu dan harga' },
    { icon: <ClipboardList className="w-4 h-4" />, text: 'Saya ingin pesan Nasi Goreng dan Es Teh' },
    { icon: <CalendarDays className="w-4 h-4" />, text: 'Saya ingin reservasi untuk 4 orang besok malam' },
    { icon: <Search className="w-4 h-4" />, text: 'Cek status pesanan saya' },
  ];
  const normalSuggestions = [
    { icon: <Lightbulb className="w-4 h-4" />, text: 'Jelaskan cara kerja RAG dalam AI' },
    { icon: <Code className="w-4 h-4" />, text: 'Tulis fungsi quicksort di TypeScript' },
    { icon: <Globe className="w-4 h-4" />, text: 'Apa perbedaan REST vs GraphQL?' },
    { icon: <PenTool className="w-4 h-4" />, text: 'Bantu saya menulis email profesional' },
  ];

  return (
    <div className="text-center py-12">
      <div className="w-14 h-14 bg-amber-400/10 border border-amber-400/20 rounded-2xl flex items-center justify-center mx-auto mb-4 text-amber-500">
        {isAgent ? <Utensils className="w-6 h-6" /> : <Zap className="w-6 h-6" />}
      </div>
      <h2 className="text-xl font-bold text-stone-200 mb-1">
        {isAgent ? 'Selamat datang di Restoran Nusantara!' : `Halo, ${username}!`}
      </h2>
      <p className="text-stone-500 text-sm mb-8">
        {isAgent
          ? 'Saya siap membantu Anda memesan makanan, membuat reservasi, dan lainnya.'
          : 'Mulai chat atau upload dokumen untuk RAG'}
      </p>

      {!isAgent && (
        <button onClick={onOpenRag} className="inline-flex items-center gap-1.5 text-xs text-amber-400/70 hover:text-amber-400 mb-6 transition-colors">
          <BookOpen className="w-3.5 h-3.5" /> Upload dokumen ke Knowledge Base
        </button>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-lg mx-auto">
        {(isAgent ? agentSuggestions : normalSuggestions).map(({ icon, text }) => (
          <button key={text} onClick={() => onPrompt(text)}
            className="flex items-center gap-3 p-3 bg-stone-800/60 hover:bg-stone-800 border border-stone-700/50 hover:border-amber-400/30 rounded-xl text-sm text-stone-400 hover:text-stone-200 text-left transition-all">
            <span>{icon}</span>
            <span className="truncate">{text}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
