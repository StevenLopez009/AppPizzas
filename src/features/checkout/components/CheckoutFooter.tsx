interface Props {
  total: number;
  onSubmit: () => void;
}

export default function CheckoutFooter({ total, onSubmit }: Props) {
  return (
    <div
      className="
        sticky bottom-0
        w-full
        bg-white
        border-t border-gray-200
        p-4 md:p-5
        shadow-lg md:shadow-md
        z-10
      "
    >
      <div className="flex flex-col gap-3">
        {/* Total */}
        <div className="flex justify-between items-baseline">
          <span className="text-gray-700 text-sm md:text-base font-medium">
            Total
          </span>
          <span className="text-xl md:text-2xl font-bold text-orange-600">
            ${Number(total).toLocaleString("es-CO")}
          </span>
        </div>

        {/* Botón */}
        <button
          onClick={onSubmit}
          className="
            w-full
            bg-orange-600 hover:bg-orange-700
            active:bg-orange-800
            text-white 
            py-3 md:py-3.5
            rounded-xl md:rounded-2xl
            font-bold text-base
            transition-all duration-200
            shadow-sm hover:shadow-md
            cursor-pointer
          "
        >
          Confirmar pedido
        </button>
      </div>
    </div>
  );
}
