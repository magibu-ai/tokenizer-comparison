import { useEffect, useMemo, useState } from 'react';
import { ComparisonBar } from './components/ComparisonBar';
import type { ComparisonBlock } from './components/ComparisonBar';
import { TextBlockSection } from './components/TextBlockSection';
import { COMPARISON_MODELS, DEFAULT_MODEL_ID, MAGIBU, MODEL_GROUPS } from './lib/models';
import {
  getBlockTokenizationState,
  useBatchTokenization,
} from './lib/useTokenization';
import type { TokenizationInput } from './lib/useTokenization';

const TURKISH_TEXT = `Türkçe, eklemeli bir dil olduğu için tek bir sözcük koskoca bir cümleye dönüşebilir: "Çekoslovakyalılaştıramadıklarımızdan mısınız?" Yapay zekâ modelleri metni işlerken önce token adı verilen parçalara böler; ücretlendirme ve bağlam penceresi de bu parça sayısına göre hesaplanır. Aynı paragraf, seçtiğiniz modele göre bambaşka sayılara dönüşür. Bu metni silin, yerine dilediğiniz dilde kendi metninizi yazın; hangi tokenizer'ın onu daha verimli kodladığını anında görürsünüz.`;

const ENGLISH_TEXT = `English often expresses the same idea with many short, separate words. Language models split every sentence into pieces called tokens before processing it; API pricing and context limits are calculated from those pieces. The very same paragraph can produce surprisingly different counts depending on the selected tokenizer. Edit this text or replace it with your own English example to see which tokenizer encodes it more efficiently.`;

interface TextBlock {
  id: string;
  text: string;
  sampleText: string | null;
  subtitle: string | null;
}

const INITIAL_BLOCKS: readonly TextBlock[] = [
  {
    id: 'turkish-sample',
    text: TURKISH_TEXT,
    sampleText: TURKISH_TEXT,
    subtitle: 'Türkçe örnek',
  },
  {
    id: 'english-sample',
    text: ENGLISH_TEXT,
    sampleText: ENGLISH_TEXT,
    subtitle: 'İngilizce örnek',
  },
];

function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);
  return debounced;
}

export default function App() {
  const [blocks, setBlocks] = useState<TextBlock[]>(() =>
    INITIAL_BLOCKS.map((block) => ({ ...block })),
  );
  const [modelId, setModelId] = useState(DEFAULT_MODEL_ID);
  const [mode, setMode] = useState<'text' | 'ids'>('text');

  const tokenizationInputs = useMemo<TokenizationInput[]>(
    () => blocks.map(({ id, text }) => ({ id, text })),
    [blocks],
  );
  const debouncedInputs = useDebouncedValue(tokenizationInputs, 200);
  const debouncedTextById = useMemo(
    () => new Map(debouncedInputs.map(({ id, text }) => [id, text])),
    [debouncedInputs],
  );

  const model = COMPARISON_MODELS.find((item) => item.id === modelId) ?? COMPARISON_MODELS[0];
  const magibuState = useBatchTokenization(MAGIBU.repoId, debouncedInputs);
  const otherState = useBatchTokenization(model.repoId, debouncedInputs);

  const comparisonBlocks = useMemo<ComparisonBlock[]>(
    () =>
      blocks.map((block, index) => ({
        id: block.id,
        label: `Metin ${index + 1}${block.subtitle ? ` · ${block.subtitle}` : ''}`,
        text: debouncedTextById.get(block.id) ?? '',
      })),
    [blocks, debouncedTextById],
  );

  const updateBlock = (id: string, text: string) => {
    setBlocks((current) => current.map((block) => (block.id === id ? { ...block, text } : block)));
  };

  const resetBlock = (id: string) => {
    setBlocks((current) =>
      current.map((block) =>
        block.id === id ? { ...block, text: block.sampleText ?? '' } : block,
      ),
    );
  };

  const removeBlock = (id: string) => {
    setBlocks((current) =>
      current.length > 1 ? current.filter((block) => block.id !== id) : current,
    );
  };

  const addBlock = () => {
    setBlocks((current) => [
      ...current,
      { id: crypto.randomUUID(), text: '', sampleText: null, subtitle: null },
    ]);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Tokenizer Karşılaştırma</h1>
        <p>
          Farklı metinler farklı modellerde kaç token tutuyor? 40 dili destekleyen{' '}
          <a
            href="https://huggingface.co/alibayram/magibu-3.5-128k-processor"
            target="_blank"
            rel="noreferrer"
          >
            Magibu 3.5
          </a>{' '}
          sabit referanstır. Tek bir karşılaştırma modeli seçin, Türkçe ve İngilizce örnekleri
          birlikte inceleyin veya istediğiniz kadar yeni metin bloğu ekleyin.
        </p>
      </header>

      <section className="global-toolbar" aria-label="Karşılaştırma ayarları">
        <div className="model-control">
          <label htmlFor="comparison-model">Ortak karşılaştırma modeli</label>
          <select
            id="comparison-model"
            className="model-select"
            value={modelId}
            onChange={(event) => setModelId(event.target.value)}
          >
            {MODEL_GROUPS.map((group) => (
              <optgroup key={group} label={group}>
                {COMPARISON_MODELS.filter((item) => item.group === group).map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        <div className="mode-control">
          <span>Token gösterimi</span>
          <div className="mode-toggle" role="group" aria-label="Token gösterimi">
            <button
              type="button"
              className={mode === 'text' ? 'active' : ''}
              onClick={() => setMode('text')}
            >
              Metin
            </button>
            <button
              type="button"
              className={mode === 'ids' ? 'active' : ''}
              onClick={() => setMode('ids')}
            >
              Token ID
            </button>
          </div>
        </div>
      </section>

      <ComparisonBar
        leftLabel={MAGIBU.short}
        rightLabel={model.short}
        leftState={magibuState}
        rightState={otherState}
        blocks={comparisonBlocks}
      />

      <main className="text-blocks">
        {blocks.map((block, index) => {
          const debouncedText = debouncedTextById.get(block.id) ?? '';
          return (
            <TextBlockSection
              key={block.id}
              id={block.id}
              label={`Metin ${index + 1}`}
              subtitle={block.subtitle}
              value={block.text}
              resetValue={block.sampleText ?? ''}
              onChange={(text) => updateBlock(block.id, text)}
              onReset={() => resetBlock(block.id)}
              onRemove={() => removeBlock(block.id)}
              canRemove={blocks.length > 1}
              leftModel={MAGIBU}
              rightModel={model}
              leftState={getBlockTokenizationState(magibuState, block.id)}
              rightState={getBlockTokenizationState(otherState, block.id)}
              charCount={[...debouncedText].length}
              mode={mode}
            />
          );
        })}

        <button type="button" className="add-block-button" onClick={addBlock}>
          + Yeni metin bloğu ekle
        </button>
      </main>

      <footer className="app-footer">
        Tokenizer'lar 🤗 Transformers.js ile tamamen tarayıcınızda çalışır; metinleriniz hiçbir
        sunucuya gönderilmez. Her tokenizer ilk seçildiğinde sözlük dosyası Hugging Face'ten
        indirilir ve önbelleğe alınır. Sayımlar <code>add_special_tokens=false</code> ile yapılır.
      </footer>
    </div>
  );
}
