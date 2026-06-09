import "server-only";
import { db, query, queryOne } from "@/lib/db";
import { uuid } from "@/lib/uuid";
import type { RowDataPacket } from "mysql2";

export interface UserPoints {
  user_id: string;
  points: number;
}

export interface PointsHistoryEntry {
  id: string;
  user_id: string;
  amount: number;
  reason: string;
  order_id: string | null;
  created_at: string;
}

/** Obtener puntos actuales del usuario */
export async function getUserPoints(userId: string): Promise<number> {
  const row = await queryOne<RowDataPacket & { points: number }>(
    "SELECT points FROM users WHERE id = ?",
    [userId],
  );
  return row?.points ?? 0;
}

/** Obtener todos los usuarios con sus puntos (para admin) */
export async function getAllUsersWithPoints(): Promise<(RowDataPacket & { id: string; email: string; name: string | null; points: number; created_at: Date })[]> {
  const rows = await query(
    "SELECT id, email, name, points, created_at FROM users ORDER BY points DESC, created_at DESC",
  );
  return rows;
}

/** Agregar puntos al usuario (compra) */
export async function addPointsToUser(
  userId: string,
  points: number,
  orderId?: string,
): Promise<void> {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // Actualizar puntos del usuario
    await conn.execute(
      "UPDATE users SET points = points + ? WHERE id = ?",
      [points, userId],
    );

    // Registrar en historial
    await conn.execute(
      "INSERT INTO user_points_history (id, user_id, amount, reason, order_id) VALUES (?, ?, ?, ?, ?)",
      [uuid(), userId, points, "purchase", orderId || null],
    );

    await conn.commit();
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
}

/** Restar puntos al usuario (canje) */
export async function deductPointsFromUser(
  userId: string,
  points: number,
  reason: string = "redemption",
): Promise<void> {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // Verificar que el usuario tiene suficientes puntos
    const row = await conn.query<RowDataPacket & { points: number }>(
      "SELECT points FROM users WHERE id = ? FOR UPDATE",
      [userId],
    );
    const userPoints = row?.[0]?.points ?? 0;
    if (userPoints < points) {
      throw new Error("No hay suficientes puntos para canjear");
    }

    // Restar puntos del usuario
    await conn.execute(
      "UPDATE users SET points = points - ? WHERE id = ?",
      [points, userId],
    );

    // Registrar en historial (como negativo)
    await conn.execute(
      "INSERT INTO user_points_history (id, user_id, amount, reason) VALUES (?, ?, ?, ?)",
      [uuid(), userId, -points, reason],
    );

    await conn.commit();
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
}

/** Obtener historial de puntos del usuario */
export async function getUserPointsHistory(userId: string): Promise<PointsHistoryEntry[]> {
  const rows = await query<RowDataPacket & PointsHistoryEntry>(
    `SELECT id, user_id, amount, reason, order_id, created_at
     FROM user_points_history
     WHERE user_id = ?
     ORDER BY created_at DESC
     LIMIT 100`,
    [userId],
  );
  return rows.map((row) => ({
    id: row.id,
    user_id: row.user_id,
    amount: row.amount,
    reason: row.reason,
    order_id: row.order_id,
    created_at:
      row.created_at instanceof Date
        ? row.created_at.toISOString()
        : String(row.created_at),
  }));
}

/** Actualizar puntos del usuario (uso admin directo) */
export async function updateUserPoints(
  userId: string,
  newPoints: number,
  reason: string = "admin_adjustment",
): Promise<void> {
  const currentPoints = await getUserPoints(userId);
  const difference = newPoints - currentPoints;

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    await conn.execute("UPDATE users SET points = ? WHERE id = ?", [newPoints, userId]);

    await conn.execute(
      "INSERT INTO user_points_history (id, user_id, amount, reason) VALUES (?, ?, ?, ?)",
      [uuid(), userId, difference, reason],
    );

    await conn.commit();
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
}
