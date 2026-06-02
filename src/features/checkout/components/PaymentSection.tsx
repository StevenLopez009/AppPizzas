interface Props {
  form: any;
  handleChange: (e: any) => void;
  total: number;
}

export default function PaymentSection({ form, handleChange, total }: Props) {
  const cambio =
    form.pago === "efectivo" && form.montoEfectivo
      ? parseInt(form.montoEfectivo) - total
      : 0;

  return (
    <div className="px-6 mt-2">
      <div className="bg-surface rounded-3xl shadow-sm border border-line divide-y divide-line">
        <div className="flex items-center justify-between p-4">
          <p className="font-semibold text-fg">Efectivo</p>
          <input
            type="radio"
            name="pago"
            value="efectivo"
            checked={form.pago === "efectivo"}
            onChange={handleChange}
            className="accent-brand"
          />
        </div>

        {form.pago === "efectivo" && (
          <div className="p-4">
            <input
              type="number"
              name="montoEfectivo"
              value={form.montoEfectivo}
              onChange={handleChange}
              placeholder="Monto en efectivo"
              className="w-full border border-line rounded-xl p-3 bg-canvas text-fg placeholder:text-fg-subtle outline-none focus:ring-2 focus:ring-brand-ring"
            />
            {cambio >= 0 && (
              <p className="mt-2 text-sm text-green-600 dark:text-green-400">
                Cambio: ${cambio.toLocaleString("es-CO")}
              </p>
            )}
          </div>
        )}

        <div className="flex items-center justify-between p-4">
          <p className="font-semibold text-fg">Nequi o Tarjeta</p>
          <input
            type="radio"
            name="pago"
            value="digital"
            checked={form.pago === "digital"}
            onChange={handleChange}
            className="accent-brand"
          />
        </div>
      </div>
    </div>
  );
}
