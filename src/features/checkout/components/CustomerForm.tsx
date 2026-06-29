import { useEffect, useState } from "react";
import { api } from "@/lib/api";

interface DbBarrio {
  id: string;
  name: string;
  delivery_fee: number;
}

interface Props {
  form: any;
  barrio: string;
  mesa: string;
  orderType: string;
  setBarrio: (value: string) => void;
  setMesa: (value: string) => void;
  handleChange: (e: any) => void;
}

export default function CustomerForm({
  form,
  barrio,
  mesa,
  orderType,
  setBarrio,
  setMesa,
  handleChange,
}: Props) {
  const [barrios, setBarrios] = useState<DbBarrio[]>([]);
  const [zones, setZones] = useState<any[]>([]);

  useEffect(() => {
    api
      .get<{ barrios: DbBarrio[] }>("/api/barrios")
      .then(({ barrios }) => setBarrios(barrios))
      .catch(() => {});
  }, []);

  useEffect(() => {
    api
      .get<{ zones: any[] }>("/api/map/zones")
      .then(({ zones }) => {
        setZones(
          zones
            .filter((z) => !z.occupied)
            .sort((a, b) => {
              const typeOrder: Record<string, number> = {
                mesa: 1,
                vip: 2,
                barra: 3,
              };

              const typeCompare =
                (typeOrder[a.type] || 99) - (typeOrder[b.type] || 99);
              if (typeCompare !== 0) return typeCompare;
              const numA = parseInt(a.label.match(/\d+/)?.[0] || "0", 10);
              const numB = parseInt(b.label.match(/\d+/)?.[0] || "0", 10);
              return numA - numB;
            }),
        );
      })
      .catch(console.error);
  }, []);

  const inputCls =
    "w-full p-4 outline-none bg-transparent text-fg placeholder:text-fg-subtle";

  const selectCls = `
  w-full p-4 outline-none
  bg-transparent text-fg
  border-0
  appearance-none
  cursor-pointer
  transition
  focus:bg-surface-muted
`;

  const dividerCls = "divide-y divide-line";

  return (
    <div className="px-6 mt-4">
      <div
        className={`bg-surface rounded-3xl shadow-sm border border-line ${dividerCls}`}
      >
        {orderType !== "mesa" && (
          <>
            <input
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              placeholder="Nombre"
              className={inputCls}
            />
            <input
              name="telefono"
              value={form.telefono}
              onChange={handleChange}
              placeholder="Teléfono"
              className={inputCls}
            />
          </>
        )}

        {orderType === "domicilio" && (
          <>
            <input
              name="direccion"
              value={form.direccion}
              onChange={handleChange}
              placeholder="Dirección"
              className={inputCls}
            />
            <select
              value={barrio}
              onChange={(e) => setBarrio(e.target.value)}
              className={selectCls}
            >
              <option value="">Selecciona tu barrio</option>
              {barrios.map((b) => (
                <option key={b.id} value={b.name}>
                  {b.name} — ${b.delivery_fee.toLocaleString("es-CO")} domicilio
                </option>
              ))}
            </select>
          </>
        )}

        {orderType === "mesa" && (
          <>
            <div>
              <select
                value={mesa}
                onChange={(e) => setMesa(e.target.value)}
                className={selectCls}
              >
                <option value="">Selecciona Mesa ⬇</option>
                {zones.map((zone) => (
                  <option key={zone.id} value={zone.label}>
                    {zone.label}
                  </option>
                ))}
              </select>
            </div>

            <input
              name="telefono"
              value={form.telefono}
              onChange={handleChange}
              placeholder="Teléfono"
              className={inputCls}
            />
          </>
        )}
      </div>
    </div>
  );
}
