'use client';

import { useState, useCallback } from 'react';
import { Message, Conversation, ToolCallEvent, sendMessage, getMessages, createConversation } from '@/lib/api';

export interface ChatItem {
  type: 'message' | 'tool_call';
  message?: Message;
  tool?: ToolCallEvent;
  id: string;
}

export interface ChatState {
  items: ChatItem[];
  isStreaming: boolean;
  streamingText: string;
  ragUsed: boolean;
  error: string | null;
}

export function useChat(
  currentConversationId: string | null,
  onTitleUpdate: (id: string, title: string) => void,
  onConversationCreated: (conv: Conversation) => void
) {
  const [state, setState] = useState<ChatState>({
    items: [], isStreaming: false, streamingText: '', ragUsed: false, error: null,
  });

  const loadMessages = useCallback(async (conversationId: string) => {
    try {
      const { data: messages } = await getMessages(conversationId);
      const items: ChatItem[] = messages.map(m => ({
        type: 'message', message: m, id: m.id,
      }));
      setState(s => ({ ...s, items, error: null }));
    } catch (err) {
      setState(s => ({ ...s, error: (err as Error).message }));
    }
  }, []);

  const send = useCallback(async (content: string, provider: string = 'anthropic', model: string = 'claude-3-5-sonnet-20241022') => {
    if (!content.trim() || state.isStreaming) return;

    let convId = currentConversationId;
    if (!convId) {
      const conv = await createConversation();
      onConversationCreated(conv);
      convId = conv.id;
    }

    setState(s => ({ ...s, isStreaming: true, streamingText: '', ragUsed: false, error: null }));

    try {
      const stream = sendMessage(convId, content, provider, model);

      for await (const event of stream) {
        if (event.type === 'user_message') {
          setState(s => {
            if (s.items.some(i => i.id === event.message.id)) return s;
            return {
              ...s,
              items: [...s.items, { type: 'message', message: event.message, id: event.message.id }],
            };
          });
        } else if (event.type === 'rag_used') {
          setState(s => ({ ...s, ragUsed: true }));
        } else if (event.type === 'tool_call') {
          setState(s => ({
            ...s,
            items: [...s.items, {
              type: 'tool_call',
              tool: event.tool,
              id: `tool-${Date.now()}-${Math.random()}`,
            }],
          }));
        } else if (event.type === 'chunk') {
          setState(s => ({ ...s, streamingText: s.streamingText + event.text }));
        } else if (event.type === 'done') {
          setState(s => {
            if (s.items.some(i => i.id === event.message.id)) {
              return { ...s, streamingText: '', isStreaming: false };
            }
            return {
              ...s,
              items: [...s.items, { type: 'message', message: event.message, id: event.message.id }],
              streamingText: '',
              isStreaming: false,
            };
          });
        } else if (event.type === 'title_update') {
          onTitleUpdate(convId!, event.title);
        } else if (event.type === 'error') {
          throw new Error(event.error);
        }
      }
    } catch (err) {
      setState(s => ({ ...s, isStreaming: false, streamingText: '', error: (err as Error).message }));
    }
  }, [currentConversationId, state.isStreaming, onTitleUpdate, onConversationCreated]);

  const clearMessages = useCallback(() => {
    setState({ items: [], isStreaming: false, streamingText: '', ragUsed: false, error: null });
  }, []);

  // Convenience: just the messages for backwards compat
  const messages = state.items.filter(i => i.type === 'message').map(i => i.message!);

  return { ...state, messages, send, loadMessages, clearMessages };
}
