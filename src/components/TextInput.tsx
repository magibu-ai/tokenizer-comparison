interface TextInputProps {
  value: string;
  onChange: (value: string) => void;
  onReset: () => void;
  isDefault: boolean;
}

export function TextInput({ value, onChange, onReset, isDefault }: TextInputProps) {
  return (
    <div className="text-input">
      <div className="text-input-top">
        <label htmlFor="input-text">Metin</label>
        {!isDefault && (
          <button type="button" className="link-button" onClick={onReset}>
            Örnek metne dön
          </button>
        )}
      </div>
      <textarea
        id="input-text"
        value={value}
        rows={6}
        spellCheck={false}
        placeholder="Token maliyetini görmek istediğiniz metni buraya yazın…"
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
