interface TextInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  onReset: () => void;
  isDefault: boolean;
  resetLabel: string;
}

export function TextInput({
  id,
  label,
  value,
  onChange,
  onReset,
  isDefault,
  resetLabel,
}: TextInputProps) {
  return (
    <div className="text-input">
      <div className="text-input-top">
        <label htmlFor={id}>{label}</label>
        {!isDefault && (
          <button type="button" className="link-button" onClick={onReset}>
            {resetLabel}
          </button>
        )}
      </div>
      <textarea
        id={id}
        value={value}
        rows={6}
        spellCheck={false}
        placeholder="Token maliyetini görmek istediğiniz metni buraya yazın…"
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
