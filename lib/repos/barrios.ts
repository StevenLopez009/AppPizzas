import "server-only";
import { db, query, queryOne } from "@/lib/db";
import { uuid } from "@/lib/uuid";
import type { RowDataPacket } from "mysql2";

export interface Barrio {
  id: string;
  name: string;
  delivery_fee: number;
  sort_order: number;
}

interface BarrioRow extends RowDataPacket {
  id: string;
  name: string;
  delivery_fee: number;
  sort_order: number;
}

let ensured = false;
async function ensureTable() {
  if (ensured) return;
  await db.execute(`
    CREATE TABLE IF NOT EXISTS barrios (
      id           CHAR(36)     NOT NULL PRIMARY KEY,
      name         VARCHAR(100) NOT NULL,
      delivery_fee INT UNSIGNED NOT NULL DEFAULT 0,
      sort_order   INT          NOT NULL DEFAULT 0,
      created_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);
  // Seed defaults if empty
  const [rows] = await db.execute("SELECT COUNT(*) as cnt FROM barrios") as any;
  if (rows[0].cnt === 0) {
    const defaults = [
      { name: "Prosperidad", fee: 4000 },
      { name: "Parques",     fee: 6000 },
      { name: "Ópalo",       fee: 5000 },
      { name: "Sosiego",     fee: 3000 },
      { name: "Otro barrio", fee: 6000 },
    ];
    for (let i = 0; i < defaults.length; i++) {
      await db.execute(
        "INSERT INTO barrios (id, name, delivery_fee, sort_order) VALUES (?, ?, ?, ?)",
        [uuid(), defaults[i].name, defaults[i].fee, i + 1],
      );
    }
  }
  ensured = true;
}

export async function listBarrios(): Promise<Barrio[]> {
  await ensureTable();
  const rows = await query<BarrioRow>(
    "SELECT id, name, delivery_fee, sort_order FROM barrios ORDER BY sort_order ASC, name ASC",
  );
  return rows.map((r) => ({ id: r.id, name: r.name, delivery_fee: r.delivery_fee, sort_order: r.sort_order }));
}

export async function createBarrio(name: string, delivery_fee: number, sort_order = 0): Promise<Barrio> {
  await ensureTable();
  const id = uuid();
  await db.execute(
    "INSERT INTO barrios (id, name, delivery_fee, sort_order) VALUES (?, ?, ?, ?)",
    [id, name.trim(), delivery_fee, sort_order],
  );
  return { id, name: name.trim(), delivery_fee, sort_order };
}

export async function updateBarrio(id: string, patch: { name?: string; delivery_fee?: number; sort_order?: number }): Promise<Barrio | null> {
  await ensureTable();
  const fields: string[] = [];
  const values: (string | number)[] = [];
  if (patch.name !== undefined)         { fields.push("name = ?");         values.push(patch.name.trim()); }
  if (patch.delivery_fee !== undefined) { fields.push("delivery_fee = ?"); values.push(patch.delivery_fee); }
  if (patch.sort_order !== undefined)   { fields.push("sort_order = ?");   values.push(patch.sort_order); }
  if (fields.length === 0) return getBarrioById(id);
  values.push(id);
  await db.execute(`UPDATE barrios SET ${fields.join(", ")} WHERE id = ?`, values);
  return getBarrioById(id);
}

export async function deleteBarrio(id: string): Promise<void> {
  await ensureTable();
  await db.execute("DELETE FROM barrios WHERE id = ?", [id]);
}

async function getBarrioById(id: string): Promise<Barrio | null> {
  const row = await queryOne<BarrioRow>(
    "SELECT id, name, delivery_fee, sort_order FROM barrios WHERE id = ? LIMIT 1",
    [id],
  );
  if (!row) return null;
  return { id: row.id, name: row.name, delivery_fee: row.delivery_fee, sort_order: row.sort_order };
}
