import "server-only";
import { db, query, queryOne, type DbValue } from "@/lib/db";
import { uuid } from "@/lib/uuid";
import type { RowDataPacket } from "mysql2";

export interface Additional {
  id: string;
  name: string;
  price: number;
  category: string | null;
  active: boolean;
  created_at: string;
}

interface AdditionalRow extends RowDataPacket {
  id: string;
  name: string;
  price: string;
  category: string | null;
  active: number;
  created_at: Date;
}

const toAdditional = (r: AdditionalRow): Additional => ({
  id: r.id,
  name: r.name,
  price: Number(r.price),
  category: r.category,
  active: r.active === 1,
  created_at:
    r.created_at instanceof Date ? r.created_at.toISOString() : String(r.created_at),
});

export async function listAdditionals(opts?: {
  category?: string;
  onlyActive?: boolean;
}): Promise<Additional[]> {
  const wheres: string[] = [];
  const params: DbValue[] = [];
  if (opts?.category) {
    wheres.push("category = ?");
    params.push(opts.category);
  }
  if (opts?.onlyActive) {
    wheres.push("active = 1");
  }
  const where = wheres.length ? `WHERE ${wheres.join(" AND ")}` : "";
  const rows = await query<AdditionalRow>(
    `SELECT * FROM additionals ${where} ORDER BY created_at DESC`,
    params,
  );
  return rows.map(toAdditional);
}

export async function createAdditional(input: {
  name: string;
  price: number;
  category: string | null;
  active?: boolean;
}): Promise<Additional> {
  const id = uuid();
  await db.execute(
    "INSERT INTO additionals (id, name, price, category, active) VALUES (?, ?, ?, ?, ?)",
    [id, input.name, input.price, input.category, input.active === false ? 0 : 1],
  );
  const row = await queryOne<AdditionalRow>(
    "SELECT * FROM additionals WHERE id = ?",
    [id],
  );
  if (!row) throw new Error("No se pudo crear el adicional");
  return toAdditional(row);
}

export async function updateAdditional(
  id: string,
  patch: Partial<{ name: string; price: number; category: string | null; active: boolean }>,
): Promise<Additional | null> {
  const fields: string[] = [];
  const values: DbValue[] = [];
  if (patch.name !== undefined) {
    fields.push("name = ?");
    values.push(patch.name);
  }
  if (patch.price !== undefined) {
    fields.push("price = ?");
    values.push(patch.price);
  }
  if (patch.category !== undefined) {
    fields.push("category = ?");
    values.push(patch.category);
  }
  if (patch.active !== undefined) {
    fields.push("active = ?");
    values.push(patch.active ? 1 : 0);
  }
  if (fields.length === 0) {
    const row = await queryOne<AdditionalRow>(
      "SELECT * FROM additionals WHERE id = ?",
      [id],
    );
    return row ? toAdditional(row) : null;
  }
  values.push(id);
  await db.execute(
    `UPDATE additionals SET ${fields.join(", ")} WHERE id = ?`,
    values,
  );
  const row = await queryOne<AdditionalRow>(
    "SELECT * FROM additionals WHERE id = ?",
    [id],
  );
  return row ? toAdditional(row) : null;
}

export async function deleteAdditional(id: string): Promise<void> {
  await db.execute("DELETE FROM additionals WHERE id = ?", [id]);
}
