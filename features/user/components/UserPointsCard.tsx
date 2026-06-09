"use client";

import { useUserPoints } from "../hooks/useUserPoints";
import { Gift, TrendingUp } from "lucide-react";

export function UserPointsCard() {
  const { data, loading, error } = useUserPoints();

  if (loading) {
    return (
      <div className="bg-surface rounded-2xl border border-line p-6 animate-pulse">
        <div className="h-8 bg-surface-muted rounded w-32 mb-2" />
        <div className="h-12 bg-surface-muted rounded w-24" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-surface rounded-2xl border border-line p-6">
        <p className="text-fg-muted">{error || "No se pudo cargar los puntos"}</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-brand/10 to-brand/5 rounded-2xl border border-brand/20 p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm text-fg-muted flex items-center gap-2 mb-2">
            <Gift size={16} />
            Tus Puntos
          </p>
          <p className="text-4xl font-bold text-brand">{data.points}</p>
        </div>
        <div className="text-brand/40">
          <TrendingUp size={32} />
        </div>
      </div>

      <p className="text-xs text-fg-muted">
        Acumulas 1 punto por cada $100 de compra
      </p>

      {/* Historial reciente */}
      {data.history.length > 0 && (
        <div className="mt-6 pt-6 border-t border-brand/10">
          <p className="text-sm font-semibold text-fg mb-4">Historial reciente</p>
          <div className="space-y-3">
            {data.history.slice(0, 5).map((entry) => (
              <div key={entry.id} className="flex justify-between items-start text-sm">
                <div>
                  <p className="text-fg">
                    {entry.reason === "purchase" ? "Compra" : "Canje"}
                  </p>
                  <p className="text-xs text-fg-muted">
                    {new Date(entry.created_at).toLocaleDateString("es-CO")}
                  </p>
                </div>
                <p
                  className={`font-semibold ${
                    entry.amount > 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {entry.amount > 0 ? "+" : ""}{entry.amount} pts
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
