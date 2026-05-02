interface Props {
  value: string;
  onChange: (value: string) => void;
}

export default function SearchBar({ value, onChange }: Props) {
  return (
    <div className="relative mt-5">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Buscar tus platos favoritos..."
        className="
          w-full
          py-3
          px-4
          rounded-2xl
          border
          border-gray-200
          bg-white
          shadow-sm
          text-sm
          focus:outline-none
          focus:ring-2
          focus:ring-brand-ring
        "
      />
    </div>
  );
}
