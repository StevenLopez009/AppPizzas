"use client";

import { useEffect, useState } from "react";
import { Pencil, Trash2, Plus, Check, X, GripVertical } from "lucide-react";
import toast from "react-hot-toast";
import { api } from "@/lib/api";

interface Category {
  id: string;
  name: string;
  sort_order: number;
}

export default function CategoriesAdminPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const { categories } = await api.get<{ categories: Category[] }>("/api/categories");
      setCategories(categories);
    } catch {
      toast.error("Error cargando categorías");
    } finally {
      setLoading(false);
    }
  }

  async function handleAdd() {
    if (!newName.trim()) return;
    setAdding(true);
    try {
      const nextOrder = categories.length > 0
        ? Math.max(...categories.map((c) => c.sort_order)) + 1
        : 1;
      const { category } = await api.post<{ category: Category }>("/api/categories", {
        name: newName.trim(),
        sort_order: nextOrder,
      });
      setCategories((prev) => [...prev, category]);
      setNewName("");
      toast.success("Categoría creada");
    } catch (e: any) {
      toast.error(e?.message ?? "Error al crear");
    } finally {
      setAdding(false);
    }
  }

  async function handleSaveEdit(cat: Category) {
    if (!editingName.trim()) return;
    try {
      const { category } = await api.put<{ category: Category }>(
        `/api/categories/${cat.id}`,
        { name: editingName.trim() },
      );
      setCategories((prev) => prev.map((c) => (c.id === cat.id ? category : c)));
      setEditingId(null);
      toast.success("Categoría actualizada");
    } catch (e: any) {
      toast.error(e?.message ?? "Error al actualizar");
    }
  }

  async function handleDelete(cat: Category) {
    if (!confirm(`¿Eliminar la categoría "${cat.name}"?`)) return;
    try {
      await api.delete(`/api/categories/${cat.id}`);
      setCategories((prev) => prev.filter((c) => c.id !== cat.id));
      toast.success("Categoría eliminada");
    } catch {
      toast.error("Error al eliminar");
    }
  }

  async function moveOrder(cat: Category, direction: "up" | "down") {
    const idx = categories.indexOf(cat);
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= categories.length) return;

    const other = categories[swapIdx];
    const newList = [...categories];
    newList[idx] = { ...cat, sort_order: other.sort_order };
    newList[swapIdx] = { ...other, sort_order: cat.sort_order };
    newList.sort((a, b) => a.sort_order - b.sort_order);
    setCategories(newList);

    await Promise.all([
      api.put(`/api/categories/${cat.id}`, { sort_order: other.sort_order }),
      api.put(`/api/categories/${other.id}`, { sort_order: cat.sort_order }),
    ]).catch(() => { toast.error("Error al reordenar"); load(); });
  }

  return (
    <div className="max-w-xl p-4 md:p-0">
      <h1 className="text-2xl font-bold text-gray-800 mb-1">Categorías</h1>
      <p className="text-sm text-gray-400 mb-6">
        Gestiona las categorías de productos. El orden aquí se refleja en el menú del cliente.
      </p>

      {/* Add form */}
      <div className="flex gap-2 mb-6">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          placeholder="Nueva categoría…"
          className="flex-1 rounded-xl border border-gray-200 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-ring"
        />
        <button
          onClick={handleAdd}
          disabled={adding || !newName.trim()}
          className="flex items-center gap-1.5 bg-brand hover:bg-brand-hover text-white px-4 py-2 rounded-xl text-sm font-semibold disabled:opacity-50 transition"
        >
          <Plus size={15} />
          {adding ? "Guardando…" : "Agregar"}
        </button>
      </div>

      {/* List */}
      {loading ? (
        <p className="text-gray-400 text-sm">Cargando…</p>
      ) : categories.length === 0 ? (
        <p className="text-gray-400 text-sm">No hay categorías. Crea la primera.</p>
      ) : (
        <ul className="space-y-2">
          {categories.map((cat, idx) => (
            <li
              key={cat.id}
              className="flex items-center gap-3 bg-white border border-gray-100 rounded-2xl px-4 py-3 shadow-sm"
            >
              {/* Reorder handles */}
              <div className="flex flex-col gap-0.5">
                <button
                  onClick={() => moveOrder(cat, "up")}
                  disabled={idx === 0}
                  className="text-gray-300 hover:text-gray-500 disabled:opacity-20 transition"
                  aria-label="Subir"
                >
                  <GripVertical size={14} className="rotate-90 scale-x-[-1]" />
                </button>
                <button
                  onClick={() => moveOrder(cat, "down")}
                  disabled={idx === categories.length - 1}
                  className="text-gray-300 hover:text-gray-500 disabled:opacity-20 transition"
                  aria-label="Bajar"
                >
                  <GripVertical size={14} className="rotate-90" />
                </button>
              </div>

              {/* Name / edit input */}
              {editingId === cat.id ? (
                <input
                  autoFocus
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSaveEdit(cat);
                    if (e.key === "Escape") setEditingId(null);
                  }}
                  className="flex-1 rounded-lg border border-brand-ring px-3 py-1 text-sm outline-none focus:ring-2 focus:ring-brand-ring"
                />
              ) : (
                <span className="flex-1 text-sm font-medium text-gray-700">
                  {cat.name}
                </span>
              )}

              {/* Action buttons */}
              <div className="flex items-center gap-1">
                {editingId === cat.id ? (
                  <>
                    <button
                      onClick={() => handleSaveEdit(cat)}
                      className="p-1.5 rounded-lg text-green-600 hover:bg-green-50 transition"
                    >
                      <Check size={15} />
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition"
                    >
                      <X size={15} />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => { setEditingId(cat.id); setEditingName(cat.name); }}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-brand hover:bg-brand/10 transition"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      onClick={() => handleDelete(cat)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition"
                    >
                      <Trash2 size={15} />
                    </button>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
