export interface TokenizerModel {
  id: string;
  /** Dropdown'da görünen tam ad */
  label: string;
  /** Karşılaştırma çubuğunda görünen kısa ad */
  short: string;
  /** Hugging Face repo kimliği (AutoTokenizer ile yüklenir) */
  repoId: string;
  group: string;
  /** İndirilecek tokenizer dosyasının yaklaşık boyutu */
  sizeMB: number;
}

export const MAGIBU: TokenizerModel = {
  id: 'magibu',
  label: 'Magibu 3.5 (128k, 40 dilli)',
  short: 'Magibu 3.5',
  repoId: 'alibayram/magibu-3.5-128k-processor',
  group: 'Magibu',
  sizeMB: 14,
};

// Her üreticinin tokenizer'ı halka açık olan EN GÜNCEL modeli listelenir.
// Kapalı modellerde (OpenAI, Grok) resmi/dönüştürülmüş açık tokenizer kullanılır.
// Claude yok: Anthropic, modern Claude tokenizer'ını hiç yayınlamadı.
export const COMPARISON_MODELS: TokenizerModel[] = [
  {
    id: 'gpt-4o',
    label: 'GPT-5 / GPT-4o / GPT-4.1 / o3 (o200k_base)',
    short: 'GPT-5/4o',
    repoId: 'Xenova/gpt-4o',
    group: 'OpenAI',
    sizeMB: 10,
  },
  {
    id: 'gpt-4',
    label: 'GPT-4 / GPT-3.5 Turbo (cl100k_base)',
    short: 'GPT-4',
    repoId: 'Xenova/gpt-4',
    group: 'OpenAI',
    sizeMB: 4,
  },
  {
    id: 'gpt-oss',
    label: 'gpt-oss-20b / 120b (o200k_harmony)',
    short: 'gpt-oss',
    repoId: 'openai/gpt-oss-20b',
    group: 'OpenAI',
    sizeMB: 28,
  },
  {
    id: 'gemma-4',
    label: 'Gemma 4',
    short: 'Gemma 4',
    repoId: 'google/gemma-4-31B-it',
    group: 'Google',
    sizeMB: 32,
  },
  {
    id: 'llama-4',
    label: 'Llama 4 Scout / Maverick',
    short: 'Llama 4',
    repoId: 'unsloth/Llama-4-Scout-17B-16E-Instruct',
    group: 'Meta',
    sizeMB: 28,
  },
  {
    id: 'llama-3',
    label: 'Llama 3.1 / 3.3',
    short: 'Llama 3.3',
    repoId: 'unsloth/Llama-3.3-70B-Instruct',
    group: 'Meta',
    sizeMB: 17,
  },
  {
    id: 'grok-2',
    label: 'Grok 2',
    short: 'Grok 2',
    repoId: 'alvarobartt/grok-2-tokenizer',
    group: 'xAI',
    sizeMB: 18,
  },
  {
    id: 'qwen-3.5',
    label: 'Qwen3.5',
    short: 'Qwen3.5',
    repoId: 'Qwen/Qwen3.5-9B',
    group: 'Alibaba',
    sizeMB: 13,
  },
  {
    id: 'deepseek-v4',
    label: 'DeepSeek-V4 Pro / Flash',
    short: 'DeepSeek-V4',
    repoId: 'deepseek-ai/DeepSeek-V4-Pro',
    group: 'DeepSeek',
    sizeMB: 6,
  },
  {
    id: 'mistral-medium-3.5',
    label: 'Mistral Medium 3.5',
    short: 'Mistral Medium',
    repoId: 'mistralai/Mistral-Medium-3.5-128B',
    group: 'Mistral',
    sizeMB: 17,
  },
  {
    id: 'glm-5.2',
    label: 'GLM-5.2',
    short: 'GLM-5.2',
    repoId: 'zai-org/GLM-5.2',
    group: 'Z.ai',
    sizeMB: 20,
  },
];

export const DEFAULT_MODEL_ID = 'gpt-4o';

/** Dropdown optgroup sırası — listedeki ilk görülme sırası korunur */
export const MODEL_GROUPS = [...new Set(COMPARISON_MODELS.map((m) => m.group))];
