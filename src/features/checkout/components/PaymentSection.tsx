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
      <div className="bg-white rounded-3xl shadow-sm">
        <div className="flex items-center justify-between p-4 border-b">
          <p className="font-semibold">Efectivo</p>

          <input
            type="radio"
            name="pago"
            value="efectivo"
            checked={form.pago === "efectivo"}
            onChange={handleChange}
          />
        </div>

        {form.pago === "efectivo" && (
          <div className="p-4 border-b">
            <input
              type="number"
              name="montoEfectivo"
              value={form.montoEfectivo}
              onChange={handleChange}
              placeholder="Monto en efectivo"
              className="w-full border rounded-xl p-3"
            />

            {cambio >= 0 && (
              <p className="mt-2 text-sm text-green-600">
                Cambio: ${cambio.toLocaleString("es-CO")}
              </p>
            )}
          </div>
        )}

        <div className="flex items-center justify-between p-4">
          <p className="font-semibold">Nequi o Tarjeta</p>

          <input
            type="radio"
            name="pago"
            value="digital"
            checked={form.pago === "digital"}
            onChange={handleChange}
          />
        </div>
      </div>
    </div>
  );
}
