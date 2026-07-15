import { useCallback, useEffect, useMemo, useState } from 'react';
import type { PreTrainedTokenizer } from '@huggingface/transformers';
import { EMPTY_RESULT, getTokenizer, tokenize } from './tokenizer';
import type { TokenizationResult } from './tokenizer';

export interface TokenizationInput {
  id: string;
  text: string;
}

interface TokenizerLoadState {
  status: 'loading' | 'ready' | 'error';
  /** İndirme yüzdesi (0-100); önbellekten gelirse null kalabilir */
  progress: number | null;
  error: string | null;
  retry: () => void;
}

export interface TokenizationState extends TokenizerLoadState {
  result: TokenizationResult;
}

export interface BatchTokenizationState extends TokenizerLoadState {
  results: ReadonlyMap<string, TokenizationResult>;
}

interface LoadedTokenizer {
  repoId: string;
  tokenizer: PreTrainedTokenizer;
}

interface LoadError {
  repoId: string;
  message: string;
}

interface LoadProgress {
  repoId: string;
  value: number;
}

export function useBatchTokenization(
  repoId: string,
  inputs: readonly TokenizationInput[],
): BatchTokenizationState {
  const [attempt, setAttempt] = useState(0);
  const [loaded, setLoaded] = useState<LoadedTokenizer | null>(null);
  const [loadError, setLoadError] = useState<LoadError | null>(null);
  const [loadProgress, setLoadProgress] = useState<LoadProgress | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoaded(null);
    setLoadError(null);
    setLoadProgress(null);
    getTokenizer(repoId, (pct) => {
      if (!cancelled) setLoadProgress({ repoId, value: pct });
    })
      .then((tok) => {
        // Tokenizer nesneleri çağrılabilir (callable); doğrudan verilirse React
        // onu updater fonksiyonu sanıp çalıştırır. Bu yüzden updater içine sarıyoruz.
        if (!cancelled) setLoaded({ repoId, tokenizer: tok });
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setLoadError({ repoId, message: err instanceof Error ? err.message : String(err) });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [repoId, attempt]);

  const tokenizer = loaded?.repoId === repoId ? loaded.tokenizer : null;
  const error = loadError?.repoId === repoId ? loadError.message : null;
  const progress = loadProgress?.repoId === repoId ? loadProgress.value : null;

  const results = useMemo(() => {
    const nextResults = new Map<string, TokenizationResult>();
    if (!tokenizer) return nextResults;

    for (const input of inputs) {
      nextResults.set(input.id, tokenize(tokenizer, input.text));
    }
    return nextResults;
  }, [tokenizer, inputs]);

  const retry = useCallback(() => setAttempt((a) => a + 1), []);

  return {
    status: error ? 'error' : tokenizer ? 'ready' : 'loading',
    progress,
    error,
    results,
    retry,
  };
}

export function getBlockTokenizationState(
  batch: BatchTokenizationState,
  blockId: string,
): TokenizationState {
  return {
    status: batch.status,
    progress: batch.progress,
    error: batch.error,
    retry: batch.retry,
    result: batch.results.get(blockId) ?? EMPTY_RESULT,
  };
}
