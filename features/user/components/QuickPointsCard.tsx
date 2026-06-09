"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Gift, ArrowRight, AlertCircle } from "lucide-react";
import Link from "next/link";

export function QuickPointsCard() {
  const [points, setPoints] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPoints = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Primero verificar si está autenticado
        const userRes = await api
          .get<{ user: { id: string } | null }>("/api/auth/me")
          .catch(() => ({ user: null }));

        const userId = userRes?.user?.id;

        if (!userId) {
          setIsAuthenticated(false);
          setPoints(null);
          setIsLoading(false);
          return;
        }

        setIsAuthenticated(true);

        // Si está autenticado, obtener puntos
        const pointsRes = await api
          .get<{ points: number }>("/api/user-points")
          .catch((err) => {
            console.error("Error fetching points:", err);
            return null;
          });

        setPoints(pointsRes?.points ?? 0);
      } catch (err) {
        console.error("Error in QuickPointsCard:", err);
        setError("Error al cargar puntos");
        setPoints(0);
      } finally {
        setIsLoading(false);
      }
    };

    loadPoints();
  }, []);

  // No mostrar si el usuario no está autenticado
  if (!isLoading && !isAuthenticated) {
    return null;
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="bg-gradient-to-br from-brand/10 to-brand/5 rounded-2xl border border-brand/20 p-6 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="h-4 bg-surface-muted rounded w-32 mb-3" />
            <div className="h-8 bg-surface-muted rounded w-24" />
          </div>
          <div className="h-6 w-6 bg-surface-muted rounded-full" />
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <Link href="/dashboard/mi-perfil">
        <div className="bg-gradient-to-br from-red-50 to-red-50/50 dark:from-red-950/20 dark:to-red-950/10 rounded-2xl border border-red-200 dark:border-red-800 p-6 hover:border-red-300 dark:hover:border-red-700 transition-all cursor-pointer">
          <div className="flex items-center gap-3">
            <AlertCircle size={20} className="text-red-600 dark:text-red-400" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-700 dark:text-red-300">
                Error al cargar puntos
              </p>
              <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                Toca para reintentar
              </p>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // Success state
  return (
    <Link href="/dashboard/mi-perfil">
      <div className="bg-gradient-to-br from-brand/10 to-brand/5 rounded-2xl border border-brand/20 p-6 hover:border-brand/40 hover:shadow-lg transition-all cursor-pointer">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-fg-muted flex items-center gap-2 mb-2">
              <Gift size={16} className="text-brand" />
              Tus Puntos
            </p>
            <p className="text-3xl font-bold text-brand">{points ?? 0}</p>
            <p className="text-xs text-fg-muted mt-3">
              Haz clic para ver detalles →
            </p>
          </div>
          <ArrowRight size={24} className="text-brand/40" />
        </div>
      </div>
    </Link>
  );
}
