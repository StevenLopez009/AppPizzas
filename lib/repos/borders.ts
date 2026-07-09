import "server-only";
import { db, query, queryOne, type DbValue } from "@/lib/db";
import { uuid } from "@/lib/uuid";
import type { RowDataPacket } from "mysql2";

export interface Border {
  id: string;
  name: string;
  active: boolean;
  created_at: string;
}

interface BorderRow extends RowDataPacket {
  id: string;
  name: string;
  active: number;
  created_at: Date;
}

const toBorder = (r: BorderRow): Border => ({
  id: r.id,
  name: r.name,
  active: r.active === 1,
  created_at:
    r.created_at instanceof Date
      ? r.created_at.toISOString()
      : String(r.created_at),
});

export async function listBorders(opts?: {
  onlyActive?: boolean;
}): Promise<Border[]> {
  const where = opts?.onlyActive ? "WHERE active = 1" : "";

  const rows = await query<BorderRow>(
    `
      SELECT *
      FROM borders
      ${where}
      ORDER BY created_at DESC
    `,
  );

  return rows.map(toBorder);
}

export async function createBorder(input: {
  name: string;
  active?: boolean;
}): Promise<Border> {
  const id = uuid();

  await db.execute("INSERT INTO borders (id, name, active) VALUES (?, ?, ?)", [
    id,
    input.name,
    input.active === false ? 0 : 1,
  ]);

  const row = await queryOne<BorderRow>("SELECT * FROM borders WHERE id = ?", [
    id,
  ]);

  if (!row) throw new Error("No se pudo crear el borde");

  return toBorder(row);
}

export async function updateBorder(
  id: string,
  patch: Partial<{
    name: string;
    active: boolean;
  }>,
): Promise<Border | null> {
  const fields: string[] = [];
  const values: DbValue[] = [];

  if (patch.name !== undefined) {
    fields.push("name = ?");
    values.push(patch.name);
  }

  if (patch.active !== undefined) {
    fields.push("active = ?");
    values.push(patch.active ? 1 : 0);
  }

  if (fields.length === 0) {
    const row = await queryOne<BorderRow>(
      "SELECT * FROM borders WHERE id = ?",
      [id],
    );

    return row ? toBorder(row) : null;
  }

  values.push(id);

  await db.execute(
    `UPDATE borders SET ${fields.join(", ")} WHERE id = ?`,
    values,
  );

  const row = await queryOne<BorderRow>("SELECT * FROM borders WHERE id = ?", [
    id,
  ]);

  return row ? toBorder(row) : null;
}

export async function deleteBorder(id: string): Promise<void> {
  await db.execute("DELETE FROM borders WHERE id = ?", [id]);
}
