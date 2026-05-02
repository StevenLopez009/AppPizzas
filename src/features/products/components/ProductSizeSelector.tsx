interface Props {
  prices: any[];
  selectedSize: any;
  onSelect: (size: any) => void;
}

export default function ProductSizeSelector({
  prices,
  selectedSize,
  onSelect,
}: Props) {
  if (!prices || prices.length <= 1) return null;

  return (
    <div className="mb-5">
      <h3 className="font-bold text-gray-800 mb-3">Seleccione un tamaño</h3>

      <div className="flex gap-3 overflow-x-auto pb-2 md:flex-wrap">
        {prices.map((size) => (
          <button
            key={size.label}
            onClick={() => onSelect(size)}
            className={`px-6 py-3 rounded-2xl font-semibold transition
              ${
                selectedSize?.label === size.label
                  ? "bg-brand text-white"
                  : "bg-gray-100 text-gray-700"
              }
            `}
          >
            {size.label}
          </button>
        ))}
      </div>
    </div>
  );
}
