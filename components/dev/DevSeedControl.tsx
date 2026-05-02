"use client";

import { useState } from "react";
import { Sprout } from "lucide-react";
import toast from "react-hot-toast";

export default function DevSeedControl() {
  const [loading, setLoading] = useState(false);

  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  const runSeed = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/dev/seed", { method: "POST" });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        toast.error(data.error ?? "Error al sembrar datos");
        return;
      }
      toast.success(
        `Listo: ${data.productsCount} productos, ${data.ordersCount} pedidos`,
      );
    } catch {
      toast.error("No se pudo conectar con /api/dev/seed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mb-4 rounded-lg border border-amber-600/50 bg-amber-950/40 px-3 py-2 text-sm text-amber-100">
      <div className="flex flex-wrap items-center gap-2">
        <Sprout className="h-4 w-4 shrink-0 text-amber-400" aria-hidden />
        <span className="font-medium text-amber-200/95">Solo dev</span>
        <button
          type="button"
          onClick={runSeed}
          disabled={loading}
          className="rounded-md bg-amber-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-amber-500 disabled:opacity-50"
        >
          {loading ? "Sembrando…" : "Sembrar productos y pedidos de prueba"}
        </button>
      </div>
    </div>
  );
}
