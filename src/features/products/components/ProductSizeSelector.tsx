interface Price {
  size: string;
  price: number;
}

interface Props {
  prices: Price[];
  selectedSize: Price;
  onSelect: (size: Price) => void;
}

export default function ProductSizeSelector({
  prices,
  selectedSize,
  onSelect,
}: Props) {
  if (!prices || prices.length <= 1) return null;

  return (
    <div className="mb-5">
      <h3 className="font-bold text-fg mb-3">Seleccione un tamaño</h3>

      <div className="flex gap-3 overflow-x-auto pb-2 md:flex-wrap">
        {prices.map((item) => (
          <button
            key={item.size}
            onClick={() => onSelect(item)}
            className={`px-6 py-3 rounded-2xl font-semibold transition
              ${
                selectedSize?.size === item.size
                  ? "bg-brand text-white"
                  : "bg-surface-muted text-fg hover:bg-line"
              }`}
          >
            <div className="flex flex-col items-center">
              <span>{item.size}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
