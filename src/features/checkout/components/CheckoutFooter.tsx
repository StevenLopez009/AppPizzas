interface Props {
  total: number;
  subtotal: number;
  domicilio: number;
  loading: boolean;
  onSubmit: () => void;
}

export default function CheckoutFooter({
  total,
  subtotal,
  domicilio,
  loading,
  onSubmit,
}: Props) {
  return (
    <div className="sticky bottom-0 w-full bg-surface border-t border-line p-4 md:p-5 shadow-lg z-10">
      <div className="flex flex-col gap-3">
        <div className="space-y-1">
          <div className="flex justify-between text-sm text-fg-muted">
            <span>Subtotal</span>
            <span>${Number(subtotal).toLocaleString("es-CO")}</span>
          </div>
          {domicilio > 0 && (
            <div className="flex justify-between text-sm text-fg-muted">
              <span>Domicilio</span>
              <span>${Number(domicilio).toLocaleString("es-CO")}</span>
            </div>
          )}
          <div className="flex justify-between items-baseline pt-1 border-t border-line">
            <span className="text-fg font-medium">Total</span>
            <span className="text-xl md:text-2xl font-bold text-brand-text">
              ${Number(total).toLocaleString("es-CO")}
            </span>
          </div>
        </div>

        <button
          onClick={onSubmit}
          disabled={loading}
          className={`w-full py-3 md:py-3.5 rounded-xl md:rounded-2xl font-bold text-base transition-all duration-200 shadow-sm
    ${
      loading
        ? "bg-gray-400 cursor-not-allowed"
        : "bg-brand hover:bg-brand-hover active:bg-brand-active text-white cursor-pointer"
    }`}
        >
          {loading ? "Enviando..." : "Confirmar pedido"}
        </button>
      </div>
    </div>
  );
}
