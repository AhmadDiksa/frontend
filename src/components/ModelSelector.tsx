export type AIProvider = 'anthropic' | 'openrouter' | 'gemini';

export interface ModelOption {
  id: string;
  name: string;
  provider: AIProvider;
}

export const MODELS: ModelOption[] = [
  { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet', provider: 'anthropic' },
  { id: 'claude-3-5-haiku-20241022', name: 'Claude 3.5 Haiku', provider: 'anthropic' },
  { id: 'meta-llama/llama-3.3-70b-instruct', name: 'Llama 3.3 70B', provider: 'openrouter' },
  { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', provider: 'gemini' },
  { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', provider: 'gemini' },
  { id: 'gemini-flash-lite-latest', name: 'Gemini Flash-Lite Latest', provider: 'gemini' },
  { id: 'gemini-2.0-pro-exp-02-05', name: 'Gemini 2.0 Pro Exp', provider: 'gemini' },
];

interface Props {
  selectedModelId: string;
  onSelect: (modelId: string, provider: AIProvider) => void;
  isDisabled?: boolean;
}

export function ModelSelector({ selectedModelId, onSelect, isDisabled }: Props) {
  const selected = MODELS.find(m => m.id === selectedModelId) || MODELS[0];

  return (
    <div className="relative inline-block text-left">
      <select
        value={selectedModelId}
        onChange={(e) => {
          const modelId = e.target.value;
          const provider = MODELS.find(m => m.id === modelId)?.provider || 'anthropic';
          onSelect(modelId, provider);
        }}
        disabled={isDisabled}
        className="appearance-none bg-stone-900 border border-stone-800 text-stone-300 text-xs rounded-lg px-3 py-1.5 pr-8 hover:border-stone-700 focus:outline-none focus:ring-1 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
      >
        <optgroup label="Anthropic">
          {MODELS.filter(m => m.provider === 'anthropic').map(m => (
            <option key={m.id} value={m.id}>{m.name}</option>
          ))}
        </optgroup>
        <optgroup label="OpenRouter">
          {MODELS.filter(m => m.provider === 'openrouter').map(m => (
            <option key={m.id} value={m.id}>{m.name}</option>
          ))}
        </optgroup>
        <optgroup label="Google Gemini">
          {MODELS.filter(m => m.provider === 'gemini').map(m => (
            <option key={m.id} value={m.id}>{m.name}</option>
          ))}
        </optgroup>
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-stone-500">
        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
}
