"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { UserPointsCard } from "@/features/user/components/UserPointsCard";
import { LogOut } from "lucide-react";
import toast from "react-hot-toast";

interface User {
  id: string;
  email: string;
  name: string | null;
}

export default function MiPerfilPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUser() {
      try {
        const response = await api.get<{ user: User | null }>("/api/auth/me");

        if (response?.user) {
          setUser(response.user);
          setError(null);
        } else {
          setError("Usuario no autenticado");
          setTimeout(() => router.push("/profile"), 1500);
        }
      } catch (err) {
        console.error("Error fetching user:", err);
        setError("Error al cargar el perfil");
        setTimeout(() => router.push("/profile"), 1500);
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, [router]);

  async function handleLogout() {
    try {
      await api.post("/api/auth/logout", {});
      router.push("/profile");
      toast.success("Sesión cerrada");
    } catch (err) {
      toast.error("Error al cerrar sesión");
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-canvas p-4">
        <div className="max-w-2xl mx-auto animate-pulse">
          <div className="h-8 bg-surface rounded w-32 mb-4" />
          <div className="h-32 bg-surface rounded" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-canvas p-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-2xl p-6">
            <p className="text-red-700 dark:text-red-400 font-semibold">{error}</p>
            <p className="text-red-600 dark:text-red-400 text-sm mt-2">
              Redirigiendo a login...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-canvas p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-fg">Mi Perfil</h1>
          <p className="text-fg-muted">Visualiza tu información y puntos acumulados</p>
        </div>

        {/* Información del usuario */}
        <div className="bg-surface rounded-2xl border border-line p-6 space-y-4">
          <div>
            <label className="text-sm text-fg-muted block mb-1">Email</label>
            <p className="text-lg text-fg font-medium">{user.email}</p>
          </div>

          {user.name && (
            <div>
              <label className="text-sm text-fg-muted block mb-1">Nombre</label>
              <p className="text-lg text-fg font-medium">{user.name}</p>
            </div>
          )}
        </div>

        {/* Puntos */}
        <UserPointsCard />

        {/* Botón de logout */}
        <button
          onClick={handleLogout}
          className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 rounded-2xl border border-red-500/20 p-4 flex items-center justify-center gap-2 font-semibold transition-colors"
        >
          <LogOut size={20} />
          Cerrar Sesión
        </button>
      </div>
    </div>
  );
}
