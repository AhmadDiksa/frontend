'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Message } from '@/lib/api';

interface Props {
  message: Message;
}

export function ChatMessage({ message }: Props) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'} group`}>
      {/* Avatar */}
      <div
        className={`
          flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
          ${isUser
            ? 'bg-amber-400 text-stone-900'
            : 'bg-stone-800 text-amber-400 border border-stone-700'}
        `}
      >
        {isUser ? 'U' : 'AI'}
      </div>

      {/* Bubble */}
      <div
        className={`
          max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed
          ${isUser
            ? 'bg-amber-400 text-stone-900 rounded-tr-sm'
            : 'bg-stone-800 text-stone-100 border border-stone-700/50 rounded-tl-sm'}
        `}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap">{message.content}</p>
        ) : (
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              code({ className, children, ...props }: any) {
                const isBlock = className?.includes('language-');
                if (isBlock) {
                  return (
                    <pre className="bg-stone-900 border border-stone-700 rounded-lg p-3 my-2 overflow-x-auto text-xs">
                      <code className={className}>{children}</code>
                    </pre>
                  );
                }
                return (
                  <code
                    className="bg-stone-900 text-amber-300 px-1.5 py-0.5 rounded text-xs font-mono"
                    {...props}
                  >
                    {children}
                  </code>
                );
              },
              p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
              ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
              ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
              h1: ({ children }) => <h1 className="text-lg font-bold mb-2 text-amber-400">{children}</h1>,
              h2: ({ children }) => <h2 className="text-base font-bold mb-2 text-amber-300">{children}</h2>,
              h3: ({ children }) => <h3 className="text-sm font-bold mb-1 text-amber-200">{children}</h3>,
              strong: ({ children }) => <strong className="font-semibold text-amber-300">{children}</strong>,
              blockquote: ({ children }) => (
                <blockquote className="border-l-2 border-amber-500/50 pl-3 my-2 text-stone-400 italic">
                  {children}
                </blockquote>
              ),
            }}
          >
            {message.content}
          </ReactMarkdown>
        )}
      </div>
    </div>
  );
}

export function StreamingMessage({ text }: { text: string }) {
  return (
    <div className="flex gap-3">
      <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold bg-stone-800 text-amber-400 border border-stone-700">
        AI
      </div>
      <div className="max-w-[75%] rounded-2xl rounded-tl-sm px-4 py-3 text-sm leading-relaxed bg-stone-800 text-stone-100 border border-stone-700/50">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {text}
        </ReactMarkdown>
        <span className="inline-block w-1.5 h-4 bg-amber-400 ml-0.5 animate-pulse align-middle" />
      </div>
    </div>
  );
}
