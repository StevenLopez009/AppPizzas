import { BARRIOS } from "../utils/barrios";

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
              placeholder="Telefono"
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
              placeholder="Direccion"
              className="w-full p-4 outline-none"
            />

            <select
              value={barrio}
              onChange={(e) => setBarrio(e.target.value)}
              className="w-full p-4 outline-none"
            >
              <option value="">Selecciona tu barrio</option>
              {BARRIOS.map((b) => (
                <option key={b.value} value={b.value}>
                  {b.label} — ${b.domicilio.toLocaleString("es-CO")} domicilio
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
              <option key={i} value={`Mesa ${i + 1}`}>
                Mesa {i + 1}
              </option>
            ))}
          </select>
        )}
      </div>
    </div>
  );
}
