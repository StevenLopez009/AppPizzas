"use client";

import { useEffect, useState } from "react";
import { Pencil, Trash2, PlusCircle, XCircle, Save } from "lucide-react";
import toast from "react-hot-toast";
import { api } from "@/lib/api";

interface Additional {
  id: string;
  name: string;
  price: number;
  category_id: string | null; // 👈 Cambiado
  category_name?: string;
  active: boolean;
}

const inputCls =
  "w-full border border-line bg-canvas text-fg placeholder:text-fg-subtle p-3 rounded-xl outline-none focus:ring-2 focus:ring-brand-ring transition";

export default function AdditionalsForm() {
  const [additionals, setAdditionals] = useState<Additional[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>(
    [],
  );
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    id: "",
    name: "",
    price: "",
    category_id: "",
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
    api
      .get<{ categories: { id: string; name: string }[] }>("/api/categories")
      .then(({ categories }) => setCategories(categories))
      .catch(() => {});
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setForm({ id: "", name: "", price: "", category_id: "", active: true });
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
          category_id: form.category_id,
          active: form.active,
        });
        toast.success("Adicional actualizado");
      } else {
        await api.post("/api/additionals", {
          name: form.name,
          price: Number(form.price),
          category_id: form.category_id,
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
      category_id: additional.category_id ?? "",
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
        className="bg-surface border border-line rounded-3xl shadow-xl p-8 space-y-5 h-fit"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-fg">
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
          className={inputCls}
        />
        <input
          type="number"
          name="price"
          placeholder="Precio"
          value={form.price}
          onChange={handleChange}
          required
          className={inputCls}
        />

        <select
          name="category_id"
          value={form.category_id}
          onChange={handleChange}
          required
          className={inputCls}
        >
          <option value="">Selecciona categoría</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-brand hover:bg-brand-hover text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition active:scale-95"
        >
          {editing ? <Save size={20} /> : <PlusCircle size={20} />}
          {loading
            ? "Guardando..."
            : editing
              ? "Actualizar adicional"
              : "Crear adicional"}
        </button>
      </form>

      <div className="bg-surface border border-line rounded-3xl shadow-xl p-6 mb-20">
        <h2 className="text-2xl font-bold text-fg mb-6">Adicionales</h2>

        <div className="space-y-4 max-h-[700px] overflow-y-auto pr-2">
          {additionals.map((additional) => (
            <div
              key={additional.id}
              className="border border-line rounded-2xl p-4 flex items-center justify-between hover:shadow-md transition bg-canvas"
            >
              <div>
                <h3 className="font-semibold text-fg">{additional.name}</h3>
                <p className="text-sm text-fg-muted">
                  {categories.find((c) => c.id === additional.category_id)
                    ?.name || "Sin categoría"}
                </p>
                <p className="text-brand font-bold mt-1">
                  ${Number(additional.price).toLocaleString("es-CO")}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleEdit(additional)}
                  className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-950/60 transition"
                >
                  <Pencil size={18} />
                </button>
                <button
                  onClick={() => handleDelete(additional.id)}
                  className="p-2 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/60 transition"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}

          {additionals.length === 0 && (
            <p className="text-center text-fg-subtle py-10">
              No hay adicionales creados
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
