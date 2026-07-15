import { useEffect, useMemo, useState } from 'react';
import { ComparisonBar } from './components/ComparisonBar';
import { TextInput } from './components/TextInput';
import { TokenizerPanel } from './components/TokenizerPanel';
import { COMPARISON_MODELS, DEFAULT_MODEL_ID, MAGIBU, MODEL_GROUPS } from './lib/models';
import { useTokenization } from './lib/useTokenization';

const DEFAULT_TEXT = `Türkçe, eklemeli bir dil olduğu için tek bir sözcük koskoca bir cümleye dönüşebilir: "Çekoslovakyalılaştıramadıklarımızdan mısınız?" Yapay zekâ modelleri metni işlerken önce token adı verilen parçalara böler; ücretlendirme ve bağlam penceresi de bu parça sayısına göre hesaplanır. Aynı paragraf, seçtiğiniz modele göre bambaşka sayılara dönüşür. Bu metni silin, yerine dilediğiniz dilde kendi metninizi yazın; hangi tokenizer'ın onu daha verimli kodladığını anında görürsünüz.`;

function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);
  return debounced;
}

export default function App() {
  const [text, setText] = useState(DEFAULT_TEXT);
  const [modelId, setModelId] = useState(DEFAULT_MODEL_ID);
  const [mode, setMode] = useState<'text' | 'ids'>('text');

  const debouncedText = useDebouncedValue(text, 200);
  const model = COMPARISON_MODELS.find((m) => m.id === modelId) ?? COMPARISON_MODELS[0];

  const magibuState = useTokenization(MAGIBU.repoId, debouncedText);
  const otherState = useTokenization(model.repoId, debouncedText);

  const charCount = useMemo(() => [...debouncedText].length, [debouncedText]);

  return (
    <div className="app">
      <header className="app-header">
        <h1>Tokenizer Karşılaştırma</h1>
        <p>
          Aynı metin farklı modellerde kaç token tutuyor? Daha az token; daha düşük maliyet, daha
          hızlı yanıt ve daha geniş bağlam demek. 40 dili destekleyen{' '}
          <a
            href="https://huggingface.co/alibayram/magibu-3.5-128k-processor"
            target="_blank"
            rel="noreferrer"
          >
            Magibu 3.5
          </a>{' '}
          solda sabit; sağdaki listeden karşılaştırmak istediğiniz modeli seçin. Metni istediğiniz
          dilde deneyebilirsiniz.
        </p>
      </header>

      <TextInput
        value={text}
        onChange={setText}
        onReset={() => setText(DEFAULT_TEXT)}
        isDefault={text === DEFAULT_TEXT}
      />

      <ComparisonBar
        leftLabel={MAGIBU.short}
        rightLabel={model.short}
        leftState={magibuState}
        rightState={otherState}
        hasText={debouncedText.length > 0}
      />

      <div className="panels-toolbar">
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

      <main className="panels">
        <TokenizerPanel
          header={
            <div className="panel-title">
              <span className="panel-name">{MAGIBU.label}</span>
              <span className="panel-sub">Sabit referans tokenizer</span>
            </div>
          }
          state={magibuState}
          charCount={charCount}
          mode={mode}
          sizeMB={MAGIBU.sizeMB}
        />
        <TokenizerPanel
          header={
            <select
              className="model-select"
              value={modelId}
              onChange={(e) => setModelId(e.target.value)}
              aria-label="Karşılaştırılacak tokenizer"
            >
              {MODEL_GROUPS.map((group) => (
                <optgroup key={group} label={group}>
                  {COMPARISON_MODELS.filter((m) => m.group === group).map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.label}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          }
          state={otherState}
          charCount={charCount}
          mode={mode}
          sizeMB={model.sizeMB}
        />
      </main>

      <footer className="app-footer">
        Tokenizer'lar 🤗 Transformers.js ile tamamen tarayıcınızda çalışır; metniniz hiçbir sunucuya
        gönderilmez. Her tokenizer ilk seçildiğinde sözlük dosyası (3–33 MB) Hugging Face'ten
        indirilir ve önbelleğe alınır. Sayımlar <code>add_special_tokens=false</code> ile yapılır.
      </footer>
    </div>
  );
}
