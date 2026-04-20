'use client';

import { useState, useRef, KeyboardEvent } from 'react';

interface Props {
  onSend: (message: string) => void;
  isDisabled?: boolean;
  isStreaming?: boolean;
}

export function ChatInput({ onSend, isDisabled, isStreaming }: Props) {
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    const trimmed = value.trim();
    if (!trimmed || isDisabled) return;
    onSend(trimmed);
    setValue('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = () => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = 'auto';
      el.style.height = Math.min(el.scrollHeight, 160) + 'px';
    }
  };

  return (
    <div className="border-t border-stone-800 bg-stone-950 p-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-end gap-3 bg-stone-800 border border-stone-700 rounded-2xl px-4 py-3 focus-within:border-amber-400/50 focus-within:ring-1 focus-within:ring-amber-400/20 transition-all">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={e => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onInput={handleInput}
            placeholder="Tulis pesan... (Enter untuk kirim, Shift+Enter untuk baris baru)"
            disabled={isDisabled}
            rows={1}
            className="flex-1 bg-transparent text-stone-100 placeholder-stone-600 text-sm resize-none outline-none leading-relaxed max-h-40 disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={!value.trim() || isDisabled}
            className={`
              flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-all
              ${value.trim() && !isDisabled
                ? 'bg-amber-400 text-stone-900 hover:bg-amber-300 active:scale-95'
                : 'bg-stone-700 text-stone-600 cursor-not-allowed'}
            `}
          >
            {isStreaming ? (
              <div className="w-3.5 h-3.5 border-2 border-stone-900 border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            )}
          </button>
        </div>
        <p className="text-xs text-stone-700 text-center mt-2">
          AI dapat membuat kesalahan. Selalu verifikasi informasi penting.
        </p>
      </div>
    </div>
  );
}
