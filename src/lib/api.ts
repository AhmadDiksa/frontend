const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface User { id: string; username: string; created_at: number; }
export interface AuthResponse { user: User; token: string; }
export interface Conversation {
  id: string; title: string; message_count: number;
  created_at: number; updated_at: number;
}
export interface Message {
  id: string; conversation_id: string;
  role: 'user' | 'assistant'; content: string; created_at: number;
}
export interface Document {
  id: string; user_id: string; original_name: string;
  chunk_count: number; created_at: number;
}
export interface ToolCallEvent {
  name: string;
  args: Record<string, unknown>;
  result: string;
}

export const tokenStorage = {
  get: () => (typeof window !== 'undefined' ? localStorage.getItem('token') : null),
  set: (t: string) => localStorage.setItem('token', t),
  clear: () => localStorage.removeItem('token'),
};

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = tokenStorage.get();
  const res = await fetch(`${API_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

// ── Auth ───────────────────────────────────────────────────────────
export async function register(username: string, password: string): Promise<AuthResponse> {
  const { data } = await apiFetch<{ data: AuthResponse }>('/api/auth/register', {
    method: 'POST', body: JSON.stringify({ username, password }),
  });
  tokenStorage.set(data.token);
  return data;
}
export async function login(username: string, password: string): Promise<AuthResponse> {
  const { data } = await apiFetch<{ data: AuthResponse }>('/api/auth/login', {
    method: 'POST', body: JSON.stringify({ username, password }),
  });
  tokenStorage.set(data.token);
  return data;
}
export async function getMe(): Promise<User> {
  const { data } = await apiFetch<{ data: User }>('/api/auth/me');
  return data;
}
export function logout() { tokenStorage.clear(); }

// ── Conversations ──────────────────────────────────────────────────
export async function getConversations(): Promise<Conversation[]> {
  const { data } = await apiFetch<{ data: Conversation[] }>('/api/conversations');
  return data;
}
export async function createConversation(): Promise<Conversation> {
  const { data } = await apiFetch<{ data: Conversation }>('/api/conversations', { method: 'POST' });
  return data;
}
export async function deleteConversation(id: string): Promise<void> {
  await apiFetch(`/api/conversations/${id}`, { method: 'DELETE' });
}
export async function getMessages(conversationId: string) {
  return apiFetch<{ data: Message[]; conversation: Conversation }>(
    `/api/conversations/${conversationId}/messages`
  );
}

// ── Mode info ──────────────────────────────────────────────────────
export async function getMode() {
  return apiFetch<{ agent_mode: string; rag_mode: string; is_restaurant_agent: boolean }>('/api/mode');
}

// ── Send message (streaming) ───────────────────────────────────────
export async function* sendMessage(
  conversationId: string,
  content: string,
  provider: string = 'anthropic',
  model: string = 'claude-3-5-sonnet-20241022'
): AsyncGenerator<
  | { type: 'chunk'; text: string }
  | { type: 'done'; message: Message }
  | { type: 'title_update'; title: string }
  | { type: 'user_message'; message: Message }
  | { type: 'rag_used'; chunks: number }
  | { type: 'tool_call'; tool: ToolCallEvent }
  | { type: 'error'; error: string }
> {
  const token = tokenStorage.get();
  const res = await fetch(`${API_URL}/api/conversations/${conversationId}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ content, provider, model }),
  });

  if (!res.ok || !res.body) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `HTTP ${res.status}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';

    let event = '';
    for (const line of lines) {
      if (line.startsWith('event: ')) { event = line.slice(7).trim(); }
      else if (line.startsWith('data: ')) {
        const data = JSON.parse(line.slice(6));
        if (event === 'chunk') yield { type: 'chunk', text: data.text };
        else if (event === 'done') yield { type: 'done', message: data.message };
        else if (event === 'title_update') yield { type: 'title_update', title: data.title };
        else if (event === 'user_message') yield { type: 'user_message', message: data };
        else if (event === 'rag_used') yield { type: 'rag_used', chunks: data.chunks };
        else if (event === 'tool_call') yield { type: 'tool_call', tool: data };
        else if (event === 'error') yield { type: 'error', error: data.error };
        event = '';
      }
    }
  }
}

// ── RAG Documents ──────────────────────────────────────────────────
export async function getDocuments(): Promise<Document[]> {
  const { data } = await apiFetch<{ data: Document[] }>('/api/rag/documents');
  return data;
}
export async function uploadDocument(file: File): Promise<Document> {
  const token = tokenStorage.get();
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch(`${API_URL}/api/rag/documents`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });
  if (!res.ok) { const err = await res.json().catch(() => ({})); throw new Error(err.error || `HTTP ${res.status}`); }
  const { data } = await res.json();
  return data;
}
export async function deleteRagDocument(id: string): Promise<void> {
  await apiFetch(`/api/rag/documents/${id}`, { method: 'DELETE' });
}
