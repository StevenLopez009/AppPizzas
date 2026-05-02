import "server-only";
import { db, query, queryOne } from "@/lib/db";
import { uuid } from "@/lib/uuid";
import type { RowDataPacket } from "mysql2";

export interface Category {
  id: string;
  name: string;
  sort_order: number;
}

interface CategoryRow extends RowDataPacket {
  id: string;
  name: string;
  sort_order: number;
}

export async function listCategories(): Promise<Category[]> {
  const rows = await query<CategoryRow>(
    "SELECT id, name, sort_order FROM categories ORDER BY sort_order ASC, name ASC",
  );
  return rows.map((r) => ({ id: r.id, name: r.name, sort_order: r.sort_order }));
}

export async function createCategory(name: string, sort_order = 0): Promise<Category> {
  const id = uuid();
  await db.execute(
    "INSERT INTO categories (id, name, sort_order) VALUES (?, ?, ?)",
    [id, name.trim(), sort_order],
  );
  return { id, name: name.trim(), sort_order };
}

export async function updateCategory(
  id: string,
  patch: { name?: string; sort_order?: number },
): Promise<Category | null> {
  const fields: string[] = [];
  const values: (string | number)[] = [];
  if (patch.name !== undefined) { fields.push("name = ?"); values.push(patch.name.trim()); }
  if (patch.sort_order !== undefined) { fields.push("sort_order = ?"); values.push(patch.sort_order); }
  if (fields.length === 0) return getCategoryById(id);
  values.push(id);
  await db.execute(`UPDATE categories SET ${fields.join(", ")} WHERE id = ?`, values);
  return getCategoryById(id);
}

export async function deleteCategory(id: string): Promise<void> {
  await db.execute("DELETE FROM categories WHERE id = ?", [id]);
}

async function getCategoryById(id: string): Promise<Category | null> {
  const row = await queryOne<CategoryRow>(
    "SELECT id, name, sort_order FROM categories WHERE id = ? LIMIT 1",
    [id],
  );
  if (!row) return null;
  return { id: row.id, name: row.name, sort_order: row.sort_order };
}
