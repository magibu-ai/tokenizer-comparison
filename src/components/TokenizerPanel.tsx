import type { ReactNode } from 'react';
import type { TokenizationState } from '../lib/useTokenization';
import { TokenView } from './TokenView';

interface TokenizerPanelProps {
  header: ReactNode;
  state: TokenizationState;
  charCount: number;
  mode: 'text' | 'ids';
  sizeMB: number;
}

const numberFormat = new Intl.NumberFormat('tr-TR');
const ratioFormat = new Intl.NumberFormat('tr-TR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function TokenizerPanel({ header, state, charCount, mode, sizeMB }: TokenizerPanelProps) {
  const tokenCount = state.result.ids.length;
  const ready = state.status === 'ready';

  return (
    <section className="panel">
      <div className="panel-header">{header}</div>

      <div className="panel-stats">
        <div className="stat">
          <span className="stat-value">{ready ? numberFormat.format(tokenCount) : '—'}</span>
          <span className="stat-label">token</span>
        </div>
        <div className="stat">
          <span className="stat-value">{numberFormat.format(charCount)}</span>
          <span className="stat-label">karakter</span>
        </div>
        <div className="stat">
          <span className="stat-value">
            {ready && tokenCount > 0 ? ratioFormat.format(charCount / tokenCount) : '—'}
          </span>
          <span className="stat-label">karakter / token</span>
        </div>
      </div>

      <div className="panel-body">
        {state.status === 'loading' && (
          <div className="panel-message">
            <div className="spinner" aria-hidden="true" />
            <p>
              Tokenizer indiriliyor (~{sizeMB} MB)…
              {state.progress !== null ? ` %${state.progress}` : ''}
            </p>
            <p className="panel-message-sub">İlk yüklemeden sonra tarayıcı önbelleğinde tutulur.</p>
          </div>
        )}
        {state.status === 'error' && (
          <div className="panel-message panel-error">
            <p>Tokenizer yüklenemedi.</p>
            <p className="panel-message-sub">{state.error}</p>
            <button type="button" onClick={state.retry}>
              Tekrar dene
            </button>
          </div>
        )}
        {ready && <TokenView ids={state.result.ids} pieces={state.result.pieces} mode={mode} />}
      </div>
    </section>
  );
}
