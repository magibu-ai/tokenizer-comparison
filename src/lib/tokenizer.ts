import { AutoTokenizer, env } from '@huggingface/transformers';
import type { PreTrainedTokenizer, ProgressInfo } from '@huggingface/transformers';

// Tarayıcıda yerel model yolu aranmaz; dosyalar HF Hub'dan gelir ve Cache API'de saklanır.
env.allowLocalModels = false;
env.useBrowserCache = true;

export interface TokenizationResult {
  ids: number[];
  pieces: string[];
}

export const EMPTY_RESULT: TokenizationResult = { ids: [], pieces: [] };

type ProgressFn = (pct: number) => void;

const tokenizerCache = new Map<string, Promise<PreTrainedTokenizer>>();
const progressListeners = new Map<string, Set<ProgressFn>>();

export function getTokenizer(
  repoId: string,
  onProgress?: ProgressFn,
): Promise<PreTrainedTokenizer> {
  if (onProgress) {
    let listeners = progressListeners.get(repoId);
    if (!listeners) {
      listeners = new Set();
      progressListeners.set(repoId, listeners);
    }
    listeners.add(onProgress);
  }

  let promise = tokenizerCache.get(repoId);
  if (!promise) {
    promise = AutoTokenizer.from_pretrained(repoId, {
      progress_callback: (info: ProgressInfo) => {
        // Yüzde için küçük config dosyaları değil, asıl sözlük dosyası esas alınır.
        if (info.status === 'progress' && info.total > 1_000_000) {
          for (const listener of progressListeners.get(repoId) ?? []) {
            listener(Math.round(info.progress));
          }
        }
      },
    });
    tokenizerCache.set(repoId, promise);
    // Başarısız yükleme önbellekte kalmasın ki "Tekrar dene" gerçekten yeniden denesin.
    promise.catch(() => tokenizerCache.delete(repoId));
  }

  if (onProgress) {
    const cleanup = () => progressListeners.get(repoId)?.delete(onProgress);
    promise.then(cleanup, cleanup);
  }
  return promise;
}

interface WasmTokenizerInternals {
  _tokenizer?: { id_to_token?: (id: number) => string | undefined };
}

export function tokenize(tokenizer: PreTrainedTokenizer, text: string): TokenizationResult {
  if (!text) return EMPTY_RESULT;
  const ids = tokenizer.encode(text, { add_special_tokens: false });
  const inner = (tokenizer as unknown as WasmTokenizerInternals)._tokenizer;
  const pieces = ids.map((id, i) => {
    const piece = tokenizer.decode([id], {
      skip_special_tokens: false,
      clean_up_tokenization_spaces: false,
    });
    // Bazı SentencePiece decoder'ları tek token decode'unda kelime başı
    // boşluğunu (▁) düşürüyor; raw token üzerinden geri ekliyoruz.
    // İlk token hariç: SPM metin başına yapay bir ▁ ekler, o gerçek boşluk değildir.
    if (i > 0 && !piece.startsWith(' ') && inner?.id_to_token?.(id)?.startsWith('▁')) {
      return ' ' + piece;
    }
    return piece;
  });
  return { ids, pieces };
}
