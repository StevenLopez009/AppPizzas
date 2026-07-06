import Image from "next/image";

interface Props {
  form: any;
  handleChange: (e: any) => void;
  total: number;
  orderType: string;
}

export default function PaymentSection({
  form,
  handleChange,
  total,
  orderType,
}: Props) {
  const cambio =
    form.pago === "efectivo" && form.montoEfectivo
      ? parseInt(form.montoEfectivo) - total
      : 0;

  const requiereComprobante = form.pago === "digital" && orderType !== "mesa";

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
      {requiereComprobante && (
        <div className="pt-2 space-y-5">
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-800 dark:bg-emerald-950/30">
            <p className="text-sm text-fg-subtle mb-2">
              Realiza la transferencia a la siguiente llave:
            </p>

            <div className="flex items-center justify-between gap-3 rounded-xl bg-white dark:bg-neutral-900 border border-line px-4 py-3">
              <span className="font-mono text-lg font-bold tracking-wide text-emerald-600 dark:text-emerald-400">
                @bfhm651232
              </span>

              <button
                type="button"
                onClick={() => navigator.clipboard.writeText("@bfhm651232")}
                className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700 transition"
              >
                Copiar
              </button>
            </div>

            <p className="mt-2 text-xs text-fg-subtle">
              Una vez realices el pago, sube el comprobante para validar tu
              pedido.
            </p>
          </div>

          <label
            htmlFor="comprobante"
            className="flex flex-col items-center justify-center w-full h-40 rounded-xl border-2 border-dashed border-line cursor-pointer transition hover:border-brand hover:bg-brand/5"
          >
            <span className="text-sm font-medium text-fg">
              Selecciona el comprobante de pago
            </span>

            <span className="mt-1 text-xs text-fg-subtle">JPG, PNG o WEBP</span>

            {form.comprobante && (
              <Image
                src={URL.createObjectURL(form.comprobante)}
                alt="Comprobante"
                width={120}
                height={120}
                unoptimized
                className="mt-4 rounded-lg object-contain"
              />
            )}
          </label>

          <input
            id="comprobante"
            type="file"
            name="comprobante"
            accept="image/*"
            onChange={(e) =>
              handleChange({
                target: {
                  name: "comprobante",
                  value: e.target.files?.[0] ?? null,
                },
              })
            }
            className="hidden"
          />
        </div>
      )}
    </div>
  );
}
