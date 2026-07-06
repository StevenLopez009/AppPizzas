"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import toast from "react-hot-toast";
import { Trash2, RefreshCw, BrushCleaning } from "lucide-react";

interface UserWithPoints {
  id: string;
  email: string;
  name: string | null;
  phone: number;
  points: number;
  created_at: string;
}

export function UsersPointsTable() {
  const [users, setUsers] = useState<UserWithPoints[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    try {
      setLoading(true);
      const { users: data } = await api.get<{ users: UserWithPoints[] }>(
        "/api/admin/users-points",
      );
      setUsers(data);
    } catch (err) {
      toast.error("Error al cargar usuarios");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdatePoints(userId: string, newPoints: number) {
    try {
      setUpdating(userId);
      await api.patch(`/api/admin/users/${userId}/points`, {
        points: newPoints,
        reason: "admin_redemption",
      });
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, points: newPoints } : u)),
      );
      toast.success("Puntos actualizados");
      setEditingId(null);
    } catch (err) {
      toast.error("Error al actualizar puntos");
      console.error(err);
    } finally {
      setUpdating(null);
    }
  }

  async function handleClear(userId: string) {
    if (!confirm("¿Estás seguro de que deseas eliminar todos los puntos?")) {
      return;
    }
    await handleUpdatePoints(userId, 0);
  }

  async function handleDeleteUser(userId: string) {
    const confirmed = confirm(
      "¿Estás seguro de eliminar este usuario? Esta acción no se puede deshacer.",
    );

    if (!confirmed) return;

    try {
      setUpdating(userId);

      await api.delete(`/api/admin/users/${userId}`);

      setUsers((prev) => prev.filter((u) => u.id !== userId));

      toast.success("Usuario eliminado");
    } catch (err) {
      console.error(err);
      toast.error("Error eliminando usuario");
    } finally {
      setUpdating(null);
    }
  }

  if (loading) {
    return (
      <div className="bg-surface rounded-2xl border border-line p-6">
        <p className="text-fg-muted">Cargando usuarios...</p>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-2xl border border-line overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-surface-muted border-b border-line">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-fg">
                Nombre
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-fg">
                Telefono
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-fg">
                Email
              </th>
              <th className="px-6 py-3 text-right text-sm font-semibold text-fg">
                Puntos
              </th>
              <th className="px-6 py-3 text-center text-sm font-semibold text-fg">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-surface-muted/50">
                <td className="px-6 py-4 text-sm text-fg">
                  {user.name || "-"}
                </td>
                <td className="px-6 py-4 text-sm text-fg">{user.phone}</td>
                <td className="px-6 py-4 text-sm text-fg">{user.email}</td>
                <td className="px-6 py-4 text-right">
                  {editingId === user.id ? (
                    <div className="flex gap-2 justify-end">
                      <input
                        type="number"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="w-20 px-2 py-1 border border-line rounded bg-canvas text-fg"
                        min="0"
                      />
                      <button
                        onClick={() =>
                          handleUpdatePoints(user.id, parseInt(editValue) || 0)
                        }
                        disabled={updating === user.id}
                        className="px-2 py-1 bg-brand text-white rounded text-xs hover:bg-brand/90 disabled:opacity-50"
                      >
                        {updating === user.id ? "..." : "OK"}
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-2 py-1 bg-surface-muted text-fg rounded text-xs hover:bg-surface-muted/80"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <span
                      className="font-semibold text-brand cursor-pointer hover:underline"
                      onClick={() => {
                        setEditingId(user.id);
                        setEditValue(String(user.points));
                      }}
                    >
                      {user.points}
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="flex gap-2 justify-center">
                    <button
                      onClick={() => handleClear(user.id)}
                      disabled={updating === user.id || user.points === 0}
                      className="p-2 hover:bg-red-500/20 rounded text-red-600 dark:text-red-400 disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Eliminar todos los puntos"
                    >
                      <BrushCleaning size={18} />
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      disabled={updating === user.id}
                      className="p-2 hover:bg-red-500/20 rounded text-red-600 disabled:opacity-50"
                      title="Eliminar usuario"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {users.length === 0 && (
        <div className="p-6 text-center text-fg-muted">
          No hay usuarios registrados
        </div>
      )}

      <button
        onClick={fetchUsers}
        className="w-full px-4 py-3 border-t border-line text-sm text-fg-muted hover:bg-surface-muted/50 flex items-center justify-center gap-2"
      >
        <RefreshCw size={16} />
        Recargar
      </button>
    </div>
  );
}
