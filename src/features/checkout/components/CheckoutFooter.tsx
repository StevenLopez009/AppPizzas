interface Props {
  total: number;
  subtotal: number;
  domicilio: number;
  onSubmit: () => void;
}

export default function CheckoutFooter({ total, subtotal, domicilio, onSubmit }: Props) {
  return (
    <div className="sticky bottom-0 w-full bg-white border-t border-gray-200 p-4 md:p-5 shadow-lg md:shadow-md z-10">
      <div className="flex flex-col gap-3">
        {/* Desglose */}
        <div className="space-y-1">
          <div className="flex justify-between text-sm text-gray-500">
            <span>Subtotal</span>
            <span>${Number(subtotal).toLocaleString("es-CO")}</span>
          </div>
          {domicilio > 0 && (
            <div className="flex justify-between text-sm text-gray-500">
              <span>Domicilio</span>
              <span>${Number(domicilio).toLocaleString("es-CO")}</span>
            </div>
          )}
          <div className="flex justify-between items-baseline pt-1 border-t border-gray-100">
            <span className="text-gray-700 font-medium">Total</span>
            <span className="text-xl md:text-2xl font-bold text-brand-text">
              ${Number(total).toLocaleString("es-CO")}
            </span>
          </div>
        </div>

        {/* Botón */}
        <button
          onClick={onSubmit}
          className="
            w-full
            bg-brand-hover hover:bg-brand-active
            active:bg-brand-active
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
