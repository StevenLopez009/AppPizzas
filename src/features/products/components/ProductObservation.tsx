interface Props {
  value: string;
  onChange: (value: string) => void;
}

export default function ProductObservation({ value, onChange }: Props) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Quieres eliminar algo del pedido?"
      className="
        w-full
        mt-2
        mb-10
        md:mb-0
        p-4
        rounded-2xl
        bg-gray-50
        border
        border-gray-200
        text-sm
        outline-none
        resize-none
      "
    />
  );
}
