"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Gift, ArrowRight } from "lucide-react";
import Link from "next/link";

export function QuickPointsCard() {
  const [points, setPoints] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any | null>(null);

  useEffect(() => {
    Promise.all([
      api.get("/api/auth/me").catch(() => null),
      api.get<{ points: number }>("/api/user-points").catch(() => null),
    ]).then(([userData, pointsData]) => {
      setUser(userData);
      setPoints(pointsData?.points ?? null);
      setLoading(false);
    });
  }, []);

  // No mostrar si el usuario no está autenticado
  if (!loading && !user?.user_id) {
    return null;
  }

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-brand/10 to-brand/5 rounded-2xl border border-brand/20 p-6 animate-pulse">
        <div className="h-8 bg-surface-muted rounded w-24" />
      </div>
    );
  }

  return (
    <Link href="/dashboard/mi-perfil">
      <div className="bg-gradient-to-br from-brand/10 to-brand/5 rounded-2xl border border-brand/20 p-6 hover:border-brand/40 hover:shadow-lg transition-all cursor-pointer">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-fg-muted flex items-center gap-2 mb-1">
              <Gift size={16} className="text-brand" />
              Tus Puntos
            </p>
            <p className="text-3xl font-bold text-brand">{points ?? 0}</p>
            <p className="text-xs text-fg-muted mt-2">
              Haz clic para ver detalles
            </p>
          </div>
          <ArrowRight size={24} className="text-brand/40" />
        </div>
      </div>
    </Link>
  );
}
