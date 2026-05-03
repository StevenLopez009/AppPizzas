"use client";

import { useEffect, useState } from "react";
import { Pencil, Trash2, Plus, Check, X, GripVertical } from "lucide-react";
import toast from "react-hot-toast";
import { api } from "@/lib/api";

function confirmToast(message: string): Promise<boolean> {
  return new Promise((resolve) => {
    toast((t) => (
      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium text-fg">{message}</p>
        <div className="flex gap-2 justify-end">
          <button
            onClick={() => { toast.dismiss(t.id); resolve(false); }}
            className="px-3 py-1.5 rounded-lg text-xs bg-surface-muted text-fg-muted hover:bg-line transition"
          >
            Cancelar
          </button>
          <button
            onClick={() => { toast.dismiss(t.id); resolve(true); }}
            className="px-3 py-1.5 rounded-lg text-xs bg-red-500 text-white hover:bg-red-600 transition"
          >
            Eliminar
          </button>
        </div>
      </div>
    ), { duration: Infinity, icon: "🗑️" });
  });
}

interface Category { id: string; name: string; sort_order: number }
interface Barrio { id: string; name: string; delivery_fee: number; sort_order: number }

const inputCls = "rounded-xl border border-line bg-canvas text-fg placeholder:text-fg-subtle px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-ring";
const rowCls = "flex items-center gap-3 bg-surface border border-line rounded-2xl px-4 py-3 shadow-sm";
const iconBtnCls = "p-1.5 rounded-lg transition";

export default function CategoriesAdminPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  const [barrios, setBarrios] = useState<Barrio[]>([]);
  const [barrioLoading, setBarrioLoading] = useState(true);
  const [newBarrioName, setNewBarrioName] = useState("");
  const [newBarrioFee, setNewBarrioFee] = useState("");
  const [addingBarrio, setAddingBarrio] = useState(false);
  const [editingBarrioId, setEditingBarrioId] = useState<string | null>(null);
  const [editingBarrio, setEditingBarrio] = useState<{ name: string; delivery_fee: string }>({ name: "", delivery_fee: "" });

  useEffect(() => { load(); loadBarrios(); }, []);

  async function load() {
    try {
      const { categories } = await api.get<{ categories: Category[] }>("/api/categories");
      setCategories(categories);
    } catch { toast.error("Error cargando categorías"); }
    finally { setLoading(false); }
  }

  async function loadBarrios() {
    try {
      const { barrios } = await api.get<{ barrios: Barrio[] }>("/api/barrios");
      setBarrios(barrios);
    } catch { toast.error("Error cargando barrios"); }
    finally { setBarrioLoading(false); }
  }

  async function handleAdd() {
    if (!newName.trim()) return;
    setAdding(true);
    try {
      const nextOrder = categories.length > 0 ? Math.max(...categories.map((c) => c.sort_order)) + 1 : 1;
      const { category } = await api.post<{ category: Category }>("/api/categories", { name: newName.trim(), sort_order: nextOrder });
      setCategories((prev) => [...prev, category]);
      setNewName("");
      toast.success("Categoría creada");
    } catch (e: any) { toast.error(e?.message ?? "Error al crear"); }
    finally { setAdding(false); }
  }

  async function handleSaveEdit(cat: Category) {
    if (!editingName.trim()) return;
    try {
      const { category } = await api.put<{ category: Category }>(`/api/categories/${cat.id}`, { name: editingName.trim() });
      setCategories((prev) => prev.map((c) => (c.id === cat.id ? category : c)));
      setEditingId(null);
      toast.success("Categoría actualizada");
    } catch (e: any) { toast.error(e?.message ?? "Error al actualizar"); }
  }

  async function handleDelete(cat: Category) {
    if (!await confirmToast(`¿Eliminar la categoría "${cat.name}"?`)) return;
    try {
      await api.delete(`/api/categories/${cat.id}`);
      setCategories((prev) => prev.filter((c) => c.id !== cat.id));
      toast.success("Categoría eliminada");
    } catch { toast.error("Error al eliminar"); }
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

  async function handleAddBarrio() {
    if (!newBarrioName.trim() || !newBarrioFee) return;
    setAddingBarrio(true);
    try {
      const nextOrder = barrios.length > 0 ? Math.max(...barrios.map((b) => b.sort_order)) + 1 : 1;
      const { barrio } = await api.post<{ barrio: Barrio }>("/api/barrios", { name: newBarrioName.trim(), delivery_fee: Number(newBarrioFee), sort_order: nextOrder });
      setBarrios((prev) => [...prev, barrio]);
      setNewBarrioName(""); setNewBarrioFee("");
      toast.success("Barrio creado");
    } catch (e: any) { toast.error(e?.message ?? "Error al crear"); }
    finally { setAddingBarrio(false); }
  }

  async function handleSaveBarrio(b: Barrio) {
    if (!editingBarrio.name.trim()) return;
    try {
      const { barrio } = await api.put<{ barrio: Barrio }>(`/api/barrios/${b.id}`, { name: editingBarrio.name.trim(), delivery_fee: Number(editingBarrio.delivery_fee) });
      setBarrios((prev) => prev.map((x) => (x.id === b.id ? barrio : x)));
      setEditingBarrioId(null);
      toast.success("Barrio actualizado");
    } catch (e: any) { toast.error(e?.message ?? "Error al actualizar"); }
  }

  async function handleDeleteBarrio(b: Barrio) {
    if (!await confirmToast(`¿Eliminar el barrio "${b.name}"?`)) return;
    try {
      await api.delete(`/api/barrios/${b.id}`);
      setBarrios((prev) => prev.filter((x) => x.id !== b.id));
      toast.success("Barrio eliminado");
    } catch { toast.error("Error al eliminar"); }
  }

  return (
    <div className="max-w-xl p-4 md:p-0 space-y-10">

      {/* ── Categorías ─────────────────────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-bold text-fg mb-1">Categorías</h1>
        <p className="text-sm text-fg-muted mb-6">
          Gestiona las categorías de productos. El orden aquí se refleja en el menú del cliente.
        </p>

        <div className="flex gap-2 mb-6">
          <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            placeholder="Nueva categoría…" className={`flex-1 ${inputCls}`} />
          <button onClick={handleAdd} disabled={adding || !newName.trim()}
            className="flex items-center gap-1.5 bg-brand hover:bg-brand-hover text-white px-4 py-2 rounded-xl text-sm font-semibold disabled:opacity-50 transition">
            <Plus size={15} />{adding ? "Guardando…" : "Agregar"}
          </button>
        </div>

        {loading ? (
          <p className="text-fg-subtle text-sm">Cargando…</p>
        ) : categories.length === 0 ? (
          <p className="text-fg-subtle text-sm">No hay categorías. Crea la primera.</p>
        ) : (
          <ul className="space-y-2">
            {categories.map((cat, idx) => (
              <li key={cat.id} className={rowCls}>
                <div className="flex flex-col gap-0.5">
                  <button onClick={() => moveOrder(cat, "up")} disabled={idx === 0}
                    className={`${iconBtnCls} text-fg-subtle hover:text-fg disabled:opacity-20`} aria-label="Subir">
                    <GripVertical size={14} className="rotate-90 scale-x-[-1]" />
                  </button>
                  <button onClick={() => moveOrder(cat, "down")} disabled={idx === categories.length - 1}
                    className={`${iconBtnCls} text-fg-subtle hover:text-fg disabled:opacity-20`} aria-label="Bajar">
                    <GripVertical size={14} className="rotate-90" />
                  </button>
                </div>

                {editingId === cat.id ? (
                  <input autoFocus value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") handleSaveEdit(cat); if (e.key === "Escape") setEditingId(null); }}
                    className={`flex-1 ${inputCls} py-1`} />
                ) : (
                  <span className="flex-1 text-sm font-medium text-fg">{cat.name}</span>
                )}

                <div className="flex items-center gap-1">
                  {editingId === cat.id ? (
                    <>
                      <button onClick={() => handleSaveEdit(cat)} className={`${iconBtnCls} text-green-500 hover:bg-green-50 dark:hover:bg-green-950/40`}><Check size={15} /></button>
                      <button onClick={() => setEditingId(null)} className={`${iconBtnCls} text-fg-subtle hover:bg-surface-muted`}><X size={15} /></button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => { setEditingId(cat.id); setEditingName(cat.name); }}
                        className={`${iconBtnCls} text-fg-subtle hover:text-brand hover:bg-brand/10`}><Pencil size={15} /></button>
                      <button onClick={() => handleDelete(cat)}
                        className={`${iconBtnCls} text-fg-subtle hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40`}><Trash2 size={15} /></button>
                    </>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* ── Barrios / Domicilios ────────────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-bold text-fg mb-1">Domicilios</h1>
        <p className="text-sm text-fg-muted mb-6">
          Gestiona los barrios y el costo de domicilio para cada uno.
        </p>

        <div className="flex gap-2 mb-6">
          <input type="text" value={newBarrioName} onChange={(e) => setNewBarrioName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddBarrio()}
            placeholder="Nombre del barrio…" className={`flex-1 ${inputCls}`} />
          <input type="number" value={newBarrioFee} onChange={(e) => setNewBarrioFee(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddBarrio()}
            placeholder="$ domicilio" className={`w-32 ${inputCls}`} />
          <button onClick={handleAddBarrio} disabled={addingBarrio || !newBarrioName.trim() || !newBarrioFee}
            className="flex items-center gap-1.5 bg-brand hover:bg-brand-hover text-white px-4 py-2 rounded-xl text-sm font-semibold disabled:opacity-50 transition">
            <Plus size={15} />{addingBarrio ? "Guardando…" : "Agregar"}
          </button>
        </div>

        {barrioLoading ? (
          <p className="text-fg-subtle text-sm">Cargando…</p>
        ) : barrios.length === 0 ? (
          <p className="text-fg-subtle text-sm">No hay barrios. Crea el primero.</p>
        ) : (
          <ul className="space-y-2">
            {barrios.map((b) => (
              <li key={b.id} className={rowCls}>
                {editingBarrioId === b.id ? (
                  <>
                    <input autoFocus value={editingBarrio.name}
                      onChange={(e) => setEditingBarrio((p) => ({ ...p, name: e.target.value }))}
                      onKeyDown={(e) => { if (e.key === "Enter") handleSaveBarrio(b); if (e.key === "Escape") setEditingBarrioId(null); }}
                      className={`flex-1 ${inputCls} py-1`} />
                    <input type="number" value={editingBarrio.delivery_fee}
                      onChange={(e) => setEditingBarrio((p) => ({ ...p, delivery_fee: e.target.value }))}
                      onKeyDown={(e) => { if (e.key === "Enter") handleSaveBarrio(b); }}
                      className={`w-28 ${inputCls} py-1 text-right`} />
                  </>
                ) : (
                  <>
                    <span className="flex-1 text-sm font-medium text-fg">{b.name}</span>
                    <span className="text-sm font-semibold text-brand">${b.delivery_fee.toLocaleString("es-CO")}</span>
                  </>
                )}

                <div className="flex items-center gap-1">
                  {editingBarrioId === b.id ? (
                    <>
                      <button onClick={() => handleSaveBarrio(b)} className={`${iconBtnCls} text-green-500 hover:bg-green-50 dark:hover:bg-green-950/40`}><Check size={15} /></button>
                      <button onClick={() => setEditingBarrioId(null)} className={`${iconBtnCls} text-fg-subtle hover:bg-surface-muted`}><X size={15} /></button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => { setEditingBarrioId(b.id); setEditingBarrio({ name: b.name, delivery_fee: String(b.delivery_fee) }); }}
                        className={`${iconBtnCls} text-fg-subtle hover:text-brand hover:bg-brand/10`}><Pencil size={15} /></button>
                      <button onClick={() => handleDeleteBarrio(b)}
                        className={`${iconBtnCls} text-fg-subtle hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40`}><Trash2 size={15} /></button>
                    </>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
