"use client";

import { useState, useEffect } from "react";
import { PlusCircle, Trash2, Save, FolderOpen, X, ChefHat } from "lucide-react";
import toast from "react-hot-toast";

interface Ingredient {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  unitCost: number;
}

interface Recipe {
  id: string;
  name: string;
  salePrice: number;
  extraCosts: number;
  ingredients: Ingredient[];
  savedAt: string;
}

interface RecipeDB {
  id: string;
  name: string;
  sale_price: number;
  extra_costs: number;
  ingredients: string | Ingredient[];
  created_at: string;
}

function uid() {
  return Math.random().toString(36).slice(2);
}

const fieldCls =
  "w-full bg-canvas border border-line text-fg placeholder:text-fg-subtle rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand";

export default function CalculadoraPage() {
  const [productName, setProductName] = useState("");
  const [salePrice, setSalePrice] = useState("");
  const [extraCosts, setExtraCosts] = useState("");
  const [ingredients, setIngredients] = useState<Ingredient[]>([
    { id: uid(), name: "", quantity: 1, unit: "und", unitCost: 0 },
  ]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [showRecipes, setShowRecipes] = useState(false);

  const fetchRecipes = async () => {
    try {
      const res = await fetch("/api/recipes");

      if (!res.ok) {
        throw new Error();
      }

      const data: RecipeDB[] = await res.json();

      const mappedRecipes: Recipe[] = data.map((recipe) => ({
        id: recipe.id,
        name: recipe.name,
        salePrice: Number(recipe.sale_price),
        extraCosts: Number(recipe.extra_costs),
        ingredients:
          typeof recipe.ingredients === "string"
            ? JSON.parse(recipe.ingredients)
            : recipe.ingredients,
        savedAt: recipe.created_at,
      }));

      setRecipes(mappedRecipes);
    } catch (error) {
      toast.error("Error cargando recetas");
    }
  };

  useEffect(() => {
    fetchRecipes();
  }, []);

  const addIngredient = () =>
    setIngredients((prev) => [
      ...prev,
      { id: uid(), name: "", quantity: 1, unit: "und", unitCost: 0 },
    ]);
  const removeIngredient = (id: string) =>
    setIngredients((prev) => prev.filter((i) => i.id !== id));
  const updateIngredient = (
    id: string,
    field: keyof Ingredient,
    value: string | number,
  ) =>
    setIngredients((prev) =>
      prev.map((i) => (i.id === id ? { ...i, [field]: value } : i)),
    );

  const ingredientCost = (i: Ingredient) => i.quantity * i.unitCost;
  const totalIngredientCost = ingredients.reduce(
    (acc, i) => acc + ingredientCost(i),
    0,
  );
  const totalCost = totalIngredientCost + Number(extraCosts || 0);
  const salePriceNum = Number(salePrice || 0);
  const profit = salePriceNum - totalCost;
  const margin = salePriceNum > 0 ? (profit / salePriceNum) * 100 : 0;

  const handleSave = async () => {
    if (!productName.trim()) {
      toast.error("Escribe el nombre del producto");
      return;
    }

    try {
      const response = await fetch("/api/recipes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: productName,
          salePrice: salePriceNum,
          extraCosts: Number(extraCosts || 0),
          ingredients,
        }),
      });

      if (!response.ok) {
        throw new Error();
      }

      await fetchRecipes();

      toast.success(`Receta "${productName}" guardada`);
    } catch {
      toast.error("No se pudo guardar la receta");
    }
  };

  const handleLoad = (recipe: Recipe) => {
    setProductName(recipe.name);
    setSalePrice(String(recipe.salePrice));
    setExtraCosts(String(recipe.extraCosts));
    setIngredients(recipe.ingredients);
    setShowRecipes(false);
    toast("Receta cargada", { icon: "📂" });
  };

  const handleDeleteRecipe = async (id: string) => {
    try {
      await fetch(`/api/recipes/${id}`, {
        method: "DELETE",
      });

      await fetchRecipes();

      toast.success("Receta eliminada");
    } catch {
      toast.error("Error eliminando receta");
    }
  };

  const handleClear = () => {
    setProductName("");
    setSalePrice("");
    setExtraCosts("");
    setIngredients([
      { id: uid(), name: "", quantity: 1, unit: "und", unitCost: 0 },
    ]);
  };

  const fmt = (n: number) =>
    n.toLocaleString("es-CO", { maximumFractionDigits: 0 });

  return (
    <div className="max-w-4xl mx-auto p-4 pb-20 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-brand/10 flex items-center justify-center">
            <ChefHat size={20} className="text-brand" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-fg">Calculadora de costos</h1>
            <p className="text-xs text-fg-subtle">
              Calcula la ganancia por producto
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowRecipes(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface shadow-sm border border-line text-sm text-fg-muted hover:shadow-md transition"
        >
          <FolderOpen size={16} />
          Recetas ({recipes.length})
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* ── Left: inputs ─────────────────────────────── */}
        <div className="space-y-4">
          {/* Product name & prices */}
          <div className="bg-surface border border-line rounded-3xl shadow-sm p-5 space-y-4">
            <h2 className="font-semibold text-fg">Producto</h2>
            <input
              type="text"
              placeholder="Nombre del producto (ej. Hamburguesa)"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              className={fieldCls}
            />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-fg-subtle mb-1 block">
                  Precio de venta ($)
                </label>
                <input
                  type="number"
                  placeholder="0"
                  value={salePrice}
                  onChange={(e) => setSalePrice(e.target.value)}
                  className={fieldCls}
                />
              </div>
              <div>
                <label className="text-xs text-fg-subtle mb-1 block">
                  Otros costos ($)
                </label>
                <input
                  type="number"
                  placeholder="Empaque, gas…"
                  value={extraCosts}
                  onChange={(e) => setExtraCosts(e.target.value)}
                  className={fieldCls}
                />
              </div>
            </div>
          </div>

          {/* Ingredients */}
          <div className="bg-surface border border-line rounded-3xl shadow-sm p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-fg">Ingredientes</h2>
              <button
                onClick={addIngredient}
                className="flex items-center gap-1.5 text-xs text-brand font-semibold bg-brand/10 px-3 py-1.5 rounded-lg hover:bg-brand/20 transition"
              >
                <PlusCircle size={13} /> Agregar
              </button>
            </div>

            <div className="space-y-2">
              {ingredients.map((ing) => (
                <div
                  key={ing.id}
                  className="bg-surface-muted border border-line-muted rounded-2xl p-3 space-y-2"
                >
                  {/* Row 1: name + delete */}
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Nombre del ingrediente"
                      value={ing.name}
                      onChange={(e) =>
                        updateIngredient(ing.id, "name", e.target.value)
                      }
                      className={fieldCls}
                    />
                    <button
                      onClick={() => removeIngredient(ing.id)}
                      className="shrink-0 w-8 h-8 flex items-center justify-center rounded-xl bg-red-50 dark:bg-red-950/40 text-red-400 hover:bg-red-100 dark:hover:bg-red-950/60 transition"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  {/* Row 2: quantity + unit + cost + subtotal */}
                  <div className="grid grid-cols-[80px_90px_1fr_auto] gap-2 items-center">
                    <div>
                      <p className="text-[10px] text-fg-subtle mb-1 pl-1">
                        Cantidad
                      </p>
                      <input
                        type="number"
                        min="0"
                        value={ing.quantity}
                        onChange={(e) =>
                          updateIngredient(
                            ing.id,
                            "quantity",
                            Number(e.target.value),
                          )
                        }
                        className={`${fieldCls} text-center`}
                      />
                    </div>
                    <div>
                      <p className="text-[10px] text-fg-subtle mb-1 pl-1">
                        Unidad
                      </p>
                      <select
                        value={ing.unit}
                        onChange={(e) =>
                          updateIngredient(ing.id, "unit", e.target.value)
                        }
                        className={fieldCls}
                      >
                        <option value="und">und</option>
                        <option value="gr">gr</option>
                        <option value="kg">kg</option>
                        <option value="ml">ml</option>
                        <option value="lt">lt</option>
                        <option value="cda">cda</option>
                        <option value="taza">taza</option>
                      </select>
                    </div>
                    <div>
                      <p className="text-[10px] text-fg-subtle mb-1 pl-1">
                        Costo unitario
                      </p>
                      <input
                        type="number"
                        min="0"
                        placeholder="$0"
                        value={ing.unitCost || ""}
                        onChange={(e) =>
                          updateIngredient(
                            ing.id,
                            "unitCost",
                            Number(e.target.value),
                          )
                        }
                        className={`${fieldCls} text-right`}
                      />
                    </div>
                    <div className="text-right pt-4">
                      <span className="text-sm font-semibold text-fg">
                        ${fmt(ingredientCost(ing))}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-line text-sm">
              <span className="text-fg-muted">Costo ingredientes</span>
              <span className="font-semibold text-fg">
                ${fmt(totalIngredientCost)}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleSave}
              className="flex-1 flex items-center justify-center gap-2 bg-brand hover:bg-brand-hover text-white py-3 rounded-2xl text-sm font-semibold transition"
            >
              <Save size={16} /> Guardar receta
            </button>
            <button
              onClick={handleClear}
              className="px-5 py-3 rounded-2xl bg-surface border border-line text-fg-muted text-sm hover:bg-surface-muted transition"
            >
              Limpiar
            </button>
          </div>
        </div>

        {/* ── Right: results ───────────────────────────── */}
        <div className="space-y-4">
          {/* Cost summary */}
          <div className="bg-surface border border-line rounded-3xl shadow-sm p-5 space-y-4">
            <h2 className="font-semibold text-fg">Resumen de costos</h2>
            <div className="space-y-3">
              {[
                {
                  label: "Costo ingredientes",
                  value: fmt(totalIngredientCost),
                },
                { label: "Otros costos", value: fmt(Number(extraCosts || 0)) },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between text-sm">
                  <span className="text-fg-muted">{label}</span>
                  <span className="font-medium text-fg">${value}</span>
                </div>
              ))}
              <div className="flex justify-between text-sm font-semibold border-t border-line pt-3">
                <span className="text-fg">Costo total</span>
                <span className="text-fg">${fmt(totalCost)}</span>
              </div>
              <div className="flex justify-between text-sm border-t border-line pt-3">
                <span className="text-fg-muted">Precio de venta</span>
                <span className="font-medium text-fg">
                  ${fmt(salePriceNum)}
                </span>
              </div>
            </div>
          </div>

          {/* Profit card — always colored, no semantic tokens needed */}
          <div
            className={`rounded-3xl p-6 text-white ${profit >= 0 ? "bg-gradient-to-br from-green-500 to-green-600" : "bg-gradient-to-br from-red-500 to-red-600"}`}
          >
            <p className="text-sm opacity-80 mb-1">Ganancia por unidad</p>
            <p className="text-4xl font-black">${fmt(profit)}</p>
            <div className="mt-4 flex items-center justify-between">
              <div>
                <p className="text-xs opacity-70">Margen</p>
                <p className="text-2xl font-bold">{margin.toFixed(1)}%</p>
              </div>
              <div className="text-right">
                <p className="text-xs opacity-70">Costo total</p>
                <p className="text-2xl font-bold">${fmt(totalCost)}</p>
              </div>
            </div>
          </div>

          {/* Margin progress */}
          <div className="bg-surface border border-line rounded-3xl shadow-sm p-5">
            <div className="flex justify-between text-xs text-fg-subtle mb-2">
              <span>Margen de ganancia</span>
              <span
                className={
                  margin >= 50
                    ? "text-green-500 font-semibold"
                    : margin >= 30
                      ? "text-yellow-500 font-semibold"
                      : "text-red-500 font-semibold"
                }
              >
                {margin >= 50
                  ? "Excelente 🎉"
                  : margin >= 30
                    ? "Aceptable ⚠️"
                    : "Bajo 🔴"}
              </span>
            </div>
            <div className="w-full bg-surface-muted rounded-full h-3 overflow-hidden">
              <div
                className={`h-3 rounded-full transition-all duration-500 ${margin >= 50 ? "bg-green-500" : margin >= 30 ? "bg-yellow-400" : "bg-red-500"}`}
                style={{ width: `${Math.min(Math.max(margin, 0), 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-fg-subtle mt-1">
              <span>0%</span>
              <span>30%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>

          {/* Per-ingredient breakdown */}
          {ingredients.some((i) => i.name && i.unitCost > 0) && (
            <div className="bg-surface border border-line rounded-3xl shadow-sm p-5">
              <h3 className="font-semibold text-fg mb-3 text-sm">
                Desglose por ingrediente
              </h3>
              <div className="space-y-2">
                {ingredients
                  .filter((i) => i.name && i.unitCost > 0)
                  .sort((a, b) => ingredientCost(b) - ingredientCost(a))
                  .map((ing) => {
                    const cost = ingredientCost(ing);
                    const pct =
                      totalIngredientCost > 0
                        ? (cost / totalIngredientCost) * 100
                        : 0;
                    return (
                      <div key={ing.id}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-fg-muted">{ing.name}</span>
                          <span className="text-fg-subtle">
                            ${fmt(cost)} ({pct.toFixed(0)}%)
                          </span>
                        </div>
                        <div className="w-full bg-surface-muted rounded-full h-1.5">
                          <div
                            className="h-1.5 rounded-full bg-brand"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Saved recipes drawer */}
      {showRecipes && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/50 p-4">
          <div className="bg-surface border border-line rounded-3xl w-full max-w-md max-h-[80vh] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-line">
              <h2 className="font-bold text-fg">Recetas guardadas</h2>
              <button
                onClick={() => setShowRecipes(false)}
                className="p-1.5 rounded-xl hover:bg-surface-muted text-fg-muted transition"
              >
                <X size={18} />
              </button>
            </div>
            <div className="overflow-y-auto flex-1 p-4 space-y-3">
              {recipes.length === 0 && (
                <p className="text-center text-fg-subtle py-10 text-sm">
                  No hay recetas guardadas
                </p>
              )}
              {recipes.map((r) => {
                const cost =
                  r.ingredients.reduce(
                    (a, i) => a + i.quantity * i.unitCost,
                    0,
                  ) + r.extraCosts;
                const p = r.salePrice - cost;
                const m = r.salePrice > 0 ? (p / r.salePrice) * 100 : 0;
                return (
                  <div
                    key={r.id}
                    className="border border-line rounded-2xl p-4 bg-canvas"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="font-semibold text-fg">{r.name}</p>
                        <p className="text-xs text-fg-subtle mt-0.5">
                          Venta: ${fmt(r.salePrice)} · Costo: ${fmt(cost)} ·
                          Ganancia: ${fmt(p)} ({m.toFixed(1)}%)
                        </p>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button
                          onClick={() => handleLoad(r)}
                          className="text-xs bg-brand/10 text-brand px-3 py-1.5 rounded-lg font-medium hover:bg-brand/20 transition"
                        >
                          Cargar
                        </button>
                        <button
                          onClick={() => handleDeleteRecipe(r.id)}
                          className="p-1.5 rounded-lg bg-red-50 dark:bg-red-950/40 text-red-400 hover:bg-red-100 dark:hover:bg-red-950/60 transition"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
