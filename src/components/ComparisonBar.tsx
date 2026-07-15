import type { TokenizationState } from '../lib/useTokenization';

interface ComparisonBarProps {
  leftLabel: string;
  rightLabel: string;
  leftState: TokenizationState;
  rightState: TokenizationState;
  hasText: boolean;
}

const numberFormat = new Intl.NumberFormat('tr-TR');

export function ComparisonBar({
  leftLabel,
  rightLabel,
  leftState,
  rightState,
  hasText,
}: ComparisonBarProps) {
  if (!hasText) {
    return <div className="compare compare-hint">Karşılaştırmak için yukarıya bir metin yazın.</div>;
  }
  if (leftState.status === 'error' || rightState.status === 'error') {
    return null;
  }
  if (leftState.status !== 'ready' || rightState.status !== 'ready') {
    return (
      <div className="compare compare-hint">Tokenizer'lar yükleniyor, karşılaştırma birazdan hazır…</div>
    );
  }

  const left = leftState.result.ids.length;
  const right = rightState.result.ids.length;
  const max = Math.max(left, right);
  if (max === 0) return null;

  const equal = left === right;
  let verdict: string;
  if (equal) {
    verdict = `İki tokenizer da aynı sayıda token üretti (${numberFormat.format(left)}).`;
  } else {
    const winner = left < right ? leftLabel : rightLabel;
    const pct = Math.round((1 - Math.min(left, right) / max) * 100);
    verdict = `${winner} bu metni %${pct} daha az tokenle kodluyor.`;
  }

  return (
    <div className="compare">
      <div className="compare-bars">
        <CompareRow label={leftLabel} count={left} max={max} win={!equal && left < right} />
        <CompareRow label={rightLabel} count={right} max={max} win={!equal && right < left} />
      </div>
      <div className={`compare-verdict${equal ? '' : ' compare-verdict-win'}`}>{verdict}</div>
    </div>
  );
}

interface CompareRowProps {
  label: string;
  count: number;
  max: number;
  win: boolean;
}

function CompareRow({ label, count, max, win }: CompareRowProps) {
  return (
    <div className="compare-row">
      <span className="compare-label" title={label}>
        {label}
      </span>
      <div className="compare-track">
        <div
          className={`compare-fill${win ? ' compare-fill-win' : ''}`}
          style={{ width: `${(count / max) * 100}%` }}
        />
      </div>
      <span className="compare-count">{numberFormat.format(count)}</span>
    </div>
  );
}
