"use client";

import { useEffect, useState } from "react";
import { Pencil, Trash2, PlusCircle, XCircle, Save } from "lucide-react";
import toast from "react-hot-toast";
import { api } from "@/lib/api";

interface Border {
  id: string;
  name: string;
  active: boolean;
}

const inputCls =
  "w-full border border-line bg-canvas text-fg placeholder:text-fg-subtle p-3 rounded-xl outline-none focus:ring-2 focus:ring-brand-ring transition";

export default function BordersForm() {
  const [borders, setBorders] = useState<Border[]>([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    id: "",
    name: "",
    active: true,
  });

  const [editing, setEditing] = useState(false);

  async function refresh() {
    try {
      const { borders } = await api.get<{ borders: Border[] }>("/api/borders");
      setBorders(borders);
    } catch (e) {
      console.error(e);
      toast.error("Error cargando bordes");
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setForm({
      id: "",
      name: "",
      active: true,
    });

    setEditing(false);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setLoading(true);

    try {
      if (editing) {
        await api.put(`/api/borders/${encodeURIComponent(form.id)}`, {
          name: form.name,
          active: form.active,
        });

        toast.success("Borde actualizado");
      } else {
        await api.post("/api/borders", {
          name: form.name,
          active: true,
        });

        toast.success("Borde creado");
      }

      resetForm();
      await refresh();
    } catch (err) {
      console.error(err);
      toast.error("Error guardando borde");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (border: Border) => {
    setEditing(true);

    setForm({
      id: border.id,
      name: border.name,
      active: border.active,
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Seguro que deseas eliminar este borde?")) return;

    try {
      await api.delete(`/api/borders/${encodeURIComponent(id)}`);

      toast.success("Borde eliminado");

      await refresh();
    } catch (err) {
      console.error(err);
      toast.error("Error eliminando borde");
    }
  };

  return (
    <>
      <div className="max-w-6xl mx-auto mt-5 mb-8">
        <h1 className="text-4xl font-bold text-fg">Bordes de Pizza</h1>

        <p className="text-fg-muted mt-2">
          Crea, edita y administra los bordes disponibles para las pizzas.
        </p>
      </div>
      <div className="max-w-6xl mx-auto mt-10 grid lg:grid-cols-2 gap-8">
        {/* FORMULARIO */}
        <form
          onSubmit={handleSubmit}
          className="bg-surface border border-line rounded-3xl shadow-xl p-8 space-y-5 h-fit"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-fg">
              {editing ? "Editar Borde" : "Crear Borde"}
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
            placeholder="Nombre del borde"
            value={form.name}
            onChange={handleChange}
            required
            className={inputCls}
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand hover:bg-brand-hover text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition active:scale-95 disabled:opacity-50"
          >
            {editing ? <Save size={20} /> : <PlusCircle size={20} />}

            {loading
              ? "Guardando..."
              : editing
                ? "Actualizar borde"
                : "Crear borde"}
          </button>
        </form>

        {/* LISTADO */}
        <div className="bg-surface border border-line rounded-3xl shadow-xl p-6 mb-20">
          <h2 className="text-2xl font-bold text-fg mb-6">Bordes</h2>

          <div className="space-y-4 max-h-[700px] overflow-y-auto pr-2">
            {borders.map((border) => (
              <div
                key={border.id}
                className="border border-line rounded-2xl p-4 flex items-center justify-between hover:shadow-md transition bg-canvas"
              >
                <div>
                  <h3 className="font-semibold text-fg">{border.name}</h3>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleEdit(border)}
                    className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-950/60 transition"
                  >
                    <Pencil size={18} />
                  </button>

                  <button
                    onClick={() => handleDelete(border.id)}
                    className="p-2 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/60 transition"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}

            {borders.length === 0 && (
              <p className="text-center text-fg-subtle py-10">
                No hay bordes creados
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
