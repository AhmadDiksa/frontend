'use client';

import { Conversation } from '@/lib/api';
import { MessageSquare } from 'lucide-react';

interface Props {
  conversations: Conversation[];
  currentId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ conversations, currentId, onSelect, onNew, onDelete, isOpen, onClose }: Props) {
  const formatDate = (ts: number) => {
    const d = new Date(ts * 1000);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    if (diff < 86400000) return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    if (diff < 604800000) return d.toLocaleDateString('id-ID', { weekday: 'short' });
    return d.toLocaleDateString('id-ID', { month: 'short', day: 'numeric' });
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-20 md:hidden backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed md:relative inset-y-0 left-0 z-30 md:z-auto
          flex flex-col w-72 bg-stone-950 border-r border-stone-800
          transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-stone-800">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-amber-400 rounded flex items-center justify-center">
              <span className="text-stone-900 text-xs font-black">AI</span>
            </div>
            <span className="font-bold text-stone-100 tracking-tight">NexChat</span>
          </div>
          <button onClick={onNew} className="p-1.5 hover:bg-stone-800 rounded-lg transition-colors text-stone-400 hover:text-amber-400" title="New Chat">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>

        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto py-2 scrollbar-thin">
          {conversations.length === 0 ? (
            <div className="text-center py-12 text-stone-600 text-sm px-4">
              <MessageSquare className="w-8 h-8 mb-2 mx-auto" />
              <p>Belum ada percakapan</p>
              <p className="text-xs mt-1">Mulai chat baru!</p>
            </div>
          ) : (
            conversations.map(conv => (
              <div
                key={conv.id}
                className={`
                  group flex items-center gap-2 px-3 py-2.5 mx-2 rounded-lg cursor-pointer
                  transition-colors duration-150
                  ${currentId === conv.id
                    ? 'bg-amber-400/10 border border-amber-400/20'
                    : 'hover:bg-stone-800/80'}
                `}
                onClick={() => onSelect(conv.id)}
              >
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate ${currentId === conv.id ? 'text-amber-300' : 'text-stone-300'}`}>
                    {conv.title}
                  </p>
                  <p className="text-xs text-stone-600 mt-0.5 flex items-center gap-1.5">
                    <span>{conv.message_count} pesan</span>
                    <span>·</span>
                    <span>{formatDate(conv.updated_at)}</span>
                  </p>
                </div>
                <button
                  onClick={e => { e.stopPropagation(); onDelete(conv.id); }}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 hover:text-red-400 text-stone-600 rounded transition-all"
                  title="Hapus"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-800">
          <p className="text-xs text-stone-700 text-center">Powered by Claude API</p>
        </div>
      </aside>
    </>
  );
}
