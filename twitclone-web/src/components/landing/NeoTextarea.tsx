interface NeoTextareaProps {
  label: string;
  name: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  required?: boolean;
  rows?: number;
}

export function NeoTextarea({
  label,
  name,
  placeholder,
  value,
  onChange,
  required = false,
  rows = 6,
}: NeoTextareaProps) {
  return (
    <div className="space-y-2">
      <label className="text-xl font-black uppercase tracking-tight block">
        {label}
      </label>
      <textarea
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        rows={rows}
        className="w-full bg-white border-4 border-black p-4 text-lg font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] focus:-translate-y-0.5 focus:translate-x-0.5 transition-all outline-none resize-none"
      />
    </div>
  );
}
