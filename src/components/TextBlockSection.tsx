import { TextInput } from './TextInput';
import { TokenizerPanel } from './TokenizerPanel';
import type { TokenizerModel } from '../lib/models';
import type { TokenizationState } from '../lib/useTokenization';

interface TextBlockSectionProps {
  id: string;
  label: string;
  subtitle: string | null;
  value: string;
  resetValue: string;
  onChange: (value: string) => void;
  onReset: () => void;
  onRemove: () => void;
  canRemove: boolean;
  leftModel: TokenizerModel;
  rightModel: TokenizerModel;
  leftState: TokenizationState;
  rightState: TokenizationState;
  charCount: number;
  mode: 'text' | 'ids';
}

export function TextBlockSection({
  id,
  label,
  subtitle,
  value,
  resetValue,
  onChange,
  onReset,
  onRemove,
  canRemove,
  leftModel,
  rightModel,
  leftState,
  rightState,
  charCount,
  mode,
}: TextBlockSectionProps) {
  const titleId = `block-title-${id}`;

  return (
    <section className="text-block" aria-labelledby={titleId}>
      <div className="text-block-header">
        <div>
          <h2 id={titleId}>{label}</h2>
          {subtitle && <p>{subtitle}</p>}
        </div>
        {canRemove && (
          <button
            type="button"
            className="remove-block-button"
            onClick={onRemove}
            aria-label={`${label} bloğunu sil`}
          >
            Bloğu sil
          </button>
        )}
      </div>

      <TextInput
        id={`input-${id}`}
        label="Metin içeriği"
        value={value}
        onChange={onChange}
        onReset={onReset}
        isDefault={value === resetValue}
        resetLabel={resetValue ? 'Örnek metne dön' : 'Metni temizle'}
      />

      <div className="panels">
        <TokenizerPanel
          header={
            <div className="panel-title">
              <span className="panel-name">{leftModel.label}</span>
              <span className="panel-sub">Sabit referans tokenizer</span>
            </div>
          }
          state={leftState}
          charCount={charCount}
          mode={mode}
          sizeMB={leftModel.sizeMB}
        />
        <TokenizerPanel
          header={
            <div className="panel-title">
              <span className="panel-name">{rightModel.label}</span>
              <span className="panel-sub">Ortak karşılaştırma tokenizer'ı</span>
            </div>
          }
          state={rightState}
          charCount={charCount}
          mode={mode}
          sizeMB={rightModel.sizeMB}
        />
      </div>
    </section>
  );
}
