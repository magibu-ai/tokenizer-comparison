import { useCallback, useEffect, useMemo, useState } from 'react';
import type { PreTrainedTokenizer } from '@huggingface/transformers';
import { EMPTY_RESULT, getTokenizer, tokenize } from './tokenizer';
import type { TokenizationResult } from './tokenizer';

export interface TokenizationState {
  status: 'loading' | 'ready' | 'error';
  /** İndirme yüzdesi (0-100); önbellekten gelirse null kalabilir */
  progress: number | null;
  error: string | null;
  result: TokenizationResult;
  retry: () => void;
}

export function useTokenization(repoId: string, text: string): TokenizationState {
  const [attempt, setAttempt] = useState(0);
  const [tokenizer, setTokenizer] = useState<PreTrainedTokenizer | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    setTokenizer(null);
    setError(null);
    setProgress(null);
    getTokenizer(repoId, (pct) => {
      if (!cancelled) setProgress(pct);
    })
      .then((tok) => {
        // Tokenizer nesneleri çağrılabilir (callable); doğrudan verilirse React
        // onu updater fonksiyonu sanıp çalıştırır. Bu yüzden updater içine sarıyoruz.
        if (!cancelled) setTokenizer(() => tok);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : String(err));
      });
    return () => {
      cancelled = true;
    };
  }, [repoId, attempt]);

  const result = useMemo(
    () => (tokenizer ? tokenize(tokenizer, text) : EMPTY_RESULT),
    [tokenizer, text],
  );

  const retry = useCallback(() => setAttempt((a) => a + 1), []);

  return {
    status: error ? 'error' : tokenizer ? 'ready' : 'loading',
    progress,
    error,
    result,
    retry,
  };
}
