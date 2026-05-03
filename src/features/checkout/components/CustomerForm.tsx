import { useEffect, useState } from "react";
import { api } from "@/lib/api";

interface DbBarrio { id: string; name: string; delivery_fee: number }

interface Props {
  form: any;
  barrio: string;
  mesa: string;
  orderType: string;
  setBarrio: (value: string) => void;
  setMesa: (value: string) => void;
  handleChange: (e: any) => void;
}

export default function CustomerForm({ form, barrio, mesa, orderType, setBarrio, setMesa, handleChange }: Props) {
  const [barrios, setBarrios] = useState<DbBarrio[]>([]);

  useEffect(() => {
    api.get<{ barrios: DbBarrio[] }>("/api/barrios")
      .then(({ barrios }) => setBarrios(barrios))
      .catch(() => {});
  }, []);

  return (
    <div className="px-6 mt-4">
      <div className="bg-white rounded-3xl shadow-sm divide-y">
        {orderType !== "mesa" && (
          <>
            <input
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              placeholder="Nombre"
              className="w-full p-4 outline-none"
            />
            <input
              name="telefono"
              value={form.telefono}
              onChange={handleChange}
              placeholder="Teléfono"
              className="w-full p-4 outline-none"
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
              className="w-full p-4 outline-none"
            />
            <select
              value={barrio}
              onChange={(e) => setBarrio(e.target.value)}
              className="w-full p-4 outline-none"
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
          <select
            value={mesa}
            onChange={(e) => setMesa(e.target.value)}
            className="w-full p-4 outline-none"
          >
            <option value="">Selecciona Mesa</option>
            {[...Array(7)].map((_, i) => (
              <option key={i} value={`Mesa ${i + 1}`}>Mesa {i + 1}</option>
            ))}
          </select>
        )}
      </div>
    </div>
  );
}
