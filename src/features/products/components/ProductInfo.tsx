interface Props {
  product: any;
}

export default function ProductInfo({ product }: Props) {
  return (
    <>
      <div className="flex justify-between items-start mb-1">
        <span className="text-orange-500 font-medium text-sm">
          {product.category || "General"}
        </span>

        <div className="flex items-center gap-1">
          <span>⭐</span>
          <span className="font-bold text-sm">4.9</span>
        </div>
      </div>

      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-800">{product.name}</h1>
      </div>

      <div className="mb-5">
        <p className="text-gray-500 text-sm leading-relaxed">
          {product.description}
        </p>
      </div>
    </>
  );
}
