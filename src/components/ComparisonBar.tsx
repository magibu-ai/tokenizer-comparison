import type { BatchTokenizationState } from '../lib/useTokenization';

interface ComparisonBarProps {
  leftLabel: string;
  rightLabel: string;
  leftState: BatchTokenizationState;
  rightState: BatchTokenizationState;
  blocks: readonly ComparisonBlock[];
}

export interface ComparisonBlock {
  id: string;
  label: string;
  text: string;
}

const numberFormat = new Intl.NumberFormat('tr-TR');

export function ComparisonBar({
  leftLabel,
  rightLabel,
  leftState,
  rightState,
  blocks,
}: ComparisonBarProps) {
  const filledBlocks = blocks.filter((block) => block.text.length > 0);

  if (filledBlocks.length === 0) {
    return (
      <div className="compare compare-hint">
        Özet karşılaştırmayı görmek için aşağıdaki bloklardan birine metin yazın.
      </div>
    );
  }
  if (leftState.status === 'error' || rightState.status === 'error') {
    return (
      <div className="compare compare-hint compare-hint-error">
        Tokenizer yüklenemedi. Ayrıntı bölümünden yeniden deneyebilirsiniz.
      </div>
    );
  }
  if (leftState.status !== 'ready' || rightState.status !== 'ready') {
    return (
      <div className="compare compare-hint">
        Tokenizer'lar yükleniyor, özet karşılaştırma birazdan hazır…
      </div>
    );
  }

  const comparisons = filledBlocks.map((block) => ({
    ...block,
    left: leftState.results.get(block.id)?.ids.length ?? 0,
    right: rightState.results.get(block.id)?.ids.length ?? 0,
  }));
  const globalMax = Math.max(...comparisons.flatMap(({ left, right }) => [left, right]));
  if (globalMax === 0) return null;

  return (
    <section className="compare compare-summary" aria-labelledby="comparison-title">
      <div className="compare-heading">
        <div>
          <h2 id="comparison-title">Tüm metinlerin özeti</h2>
          <p>Çubukların tamamı aynı token ölçeğini kullanır.</p>
        </div>
      </div>

      <div className="compare-groups">
        {comparisons.map(({ id, label, left, right }) => {
          const equal = left === right;
          const winner = left < right ? leftLabel : rightLabel;
          const pct = equal
            ? 0
            : Math.round((1 - Math.min(left, right) / Math.max(left, right)) * 100);
          const verdict = equal
            ? `Eşit: ${numberFormat.format(left)} token`
            : `${winner} %${pct} daha az token`;

          return (
            <div className="compare-group" key={id}>
              <div className="compare-group-header">
                <span className="compare-block-label">{label}</span>
                <span className={`compare-group-verdict${equal ? '' : ' is-win'}`}>{verdict}</span>
              </div>
              <div className="compare-bars">
                <CompareRow
                  label={leftLabel}
                  count={left}
                  max={globalMax}
                  win={!equal && left < right}
                />
                <CompareRow
                  label={rightLabel}
                  count={right}
                  max={globalMax}
                  win={!equal && right < left}
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
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
