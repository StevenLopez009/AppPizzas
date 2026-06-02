interface Props {
  value: string;
  onChange: (value: string) => void;
}

export default function ProductObservation({ value, onChange }: Props) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="¿Quieres eliminar algo del pedido?"
      className="w-full mt-2 mb-10 md:mb-0 p-4 rounded-2xl bg-surface-muted border border-line text-fg placeholder:text-fg-subtle text-sm outline-none resize-none focus:ring-2 focus:ring-brand-ring"
    />
  );
}
