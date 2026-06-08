interface Option {
  label: string;
  value: string;
}

const models: Option[] = [
  { label: "Gemini 3.5 Flash", value: "gemini-3.5-flash" },
  { label: "Gemma 4 26B", value: "gemma-4-26b-a4b-it" },
];

export function ToggleGroup({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="toggle-group">
      {models.map((model, i) => (
        <button
          key={model.value}
          className={`toggle-item ${value === model.value ? "active" : ""}`}
          onClick={() => onChange(model.value)}
          style={{
            borderRight:
              i < models.length - 1 ? "0.5px solid var(--border)" : "none",
          }}
        >
          {model.label}
        </button>
      ))}
    </div>
  );
}
