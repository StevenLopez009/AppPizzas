"use client";

import { useEffect, useState } from "react";
import { Pencil, Trash2, PlusCircle, XCircle, Save } from "lucide-react";
import toast from "react-hot-toast";
import { api } from "@/lib/api";

interface Additional {
  id: string;
  name: string;
  price: number;
  category: string | null;
  active: boolean;
}

export default function AdditionalsForm() {
  const [additionals, setAdditionals] = useState<Additional[]>([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    id: "",
    name: "",
    price: "",
    category: "",
    active: true,
  });

  const [editing, setEditing] = useState(false);

  async function refresh() {
    try {
      const { additionals } = await api.get<{ additionals: Additional[] }>(
        "/api/additionals",
      );
      setAdditionals(additionals);
    } catch (e) {
      console.error(e);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setForm({ id: "", name: "", price: "", category: "", active: true });
    setEditing(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editing) {
        await api.put(`/api/additionals/${encodeURIComponent(form.id)}`, {
          name: form.name,
          price: Number(form.price),
          category: form.category,
          active: form.active,
        });
        toast.success("Adicional actualizado");
      } else {
        await api.post("/api/additionals", {
          name: form.name,
          price: Number(form.price),
          category: form.category,
          active: true,
        });
        toast.success("Adicional creado");
      }
      resetForm();
      await refresh();
    } catch (e) {
      console.error(e);
      toast.error("Error guardando adicional");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (additional: Additional) => {
    setEditing(true);
    setForm({
      id: additional.id,
      name: additional.name,
      price: String(additional.price),
      category: additional.category ?? "",
      active: additional.active,
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Seguro que quieres eliminar este adicional?")) return;
    try {
      await api.delete(`/api/additionals/${encodeURIComponent(id)}`);
      toast.success("Adicional eliminado");
      await refresh();
    } catch (e) {
      console.error(e);
      toast.error("Error eliminando adicional");
    }
  };

  return (
    <div className="max-w-6xl mx-auto mt-10 grid lg:grid-cols-2 gap-8">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-3xl shadow-xl p-8 space-y-5 h-fit"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800">
            {editing ? "Editar Adicional" : "Crear Adicional"}
          </h2>

          {editing && (
            <button
              type="button"
              onClick={resetForm}
              className="text-red-500 hover:text-red-600"
            >
              <XCircle size={28} />
            </button>
          )}
        </div>

        <input
          type="text"
          name="name"
          placeholder="Nombre del adicional"
          value={form.name}
          onChange={handleChange}
          required
          className="w-full border border-gray-200 p-3 rounded-xl outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400"
        />

        <input
          type="number"
          name="price"
          placeholder="Precio"
          value={form.price}
          onChange={handleChange}
          required
          className="w-full border border-gray-200 p-3 rounded-xl outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400"
        />

        <select
          name="category"
          value={form.category}
          onChange={handleChange}
          required
          className="w-full border border-gray-200 p-3 rounded-xl outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400"
        >
          <option value="">Selecciona categoría</option>
          <option value="pizza">Pizza</option>
          <option value="lasagna">Lasagna</option>
          <option value="Com. Rapidas">Comidas rápidas</option>
        </select>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition active:scale-95"
        >
          {editing ? <Save size={20} /> : <PlusCircle size={20} />}

          {loading
            ? "Guardando..."
            : editing
              ? "Actualizar adicional"
              : "Crear adicional"}
        </button>
      </form>

      <div className="bg-white rounded-3xl shadow-xl p-6 mb-20">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Adicionales</h2>

        <div className="space-y-4 max-h-[700px] overflow-y-auto pr-2">
          {additionals.map((additional) => (
            <div
              key={additional.id}
              className="border border-gray-100 rounded-2xl p-4 flex items-center justify-between hover:shadow-md transition"
            >
              <div>
                <h3 className="font-semibold text-gray-800">
                  {additional.name}
                </h3>

                <p className="text-sm text-gray-500">{additional.category}</p>

                <p className="text-orange-500 font-bold mt-1">
                  ${Number(additional.price).toLocaleString("es-CO")}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleEdit(additional)}
                  className="p-2 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition"
                >
                  <Pencil size={18} />
                </button>

                <button
                  onClick={() => handleDelete(additional.id)}
                  className="p-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}

          {additionals.length === 0 && (
            <p className="text-center text-gray-400 py-10">
              No hay adicionales creados
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
