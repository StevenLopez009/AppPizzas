import "server-only";
import { db, parseJSON, query, queryOne, type DbValue } from "@/lib/db";
import { uuid } from "@/lib/uuid";
import type { RowDataPacket } from "mysql2";

export interface PriceRow {
  label: string;
  price: number;
}

export interface ProductRow extends RowDataPacket {
  id: string;
  name: string;
  description: string | null;
  prices: unknown;
  image_url: string | null;
  category: string | null;
  created_at: Date;
}

export interface Product {
  id: string;
  name: string;
  description: string | null;
  prices: PriceRow[];
  image_url: string | null;
  category: string | null;
  created_at: string;
}

function toProduct(row: ProductRow): Product {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    prices: parseJSON<PriceRow[]>(row.prices, []),
    image_url: row.image_url,
    category: row.category,
    created_at:
      row.created_at instanceof Date
        ? row.created_at.toISOString()
        : String(row.created_at),
  };
}

export async function listProducts(): Promise<Product[]> {
  const rows = await query<ProductRow>(
    "SELECT * FROM products ORDER BY created_at DESC",
  );
  return rows.map(toProduct);
}

export async function getProduct(id: string): Promise<Product | null> {
  const row = await queryOne<ProductRow>(
    "SELECT * FROM products WHERE id = ? LIMIT 1",
    [id],
  );
  return row ? toProduct(row) : null;
}

export interface NewProduct {
  name: string;
  description?: string | null;
  prices: PriceRow[];
  image_url?: string | null;
  category?: string | null;
}

export async function createProduct(input: NewProduct): Promise<Product> {
  const id = uuid();
  await db.execute(
    `INSERT INTO products (id, name, description, prices, image_url, category)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      id,
      input.name,
      input.description ?? null,
      JSON.stringify(input.prices ?? []),
      input.image_url ?? null,
      input.category ?? null,
    ],
  );
  const created = await getProduct(id);
  if (!created) throw new Error("No se pudo crear el producto");
  return created;
}

export async function updateProduct(
  id: string,
  patch: Partial<NewProduct>,
): Promise<Product | null> {
  const fields: string[] = [];
  const values: DbValue[] = [];
  if (patch.name !== undefined) {
    fields.push("name = ?");
    values.push(patch.name);
  }
  if (patch.description !== undefined) {
    fields.push("description = ?");
    values.push(patch.description);
  }
  if (patch.prices !== undefined) {
    fields.push("prices = ?");
    values.push(JSON.stringify(patch.prices));
  }
  if (patch.image_url !== undefined) {
    fields.push("image_url = ?");
    values.push(patch.image_url);
  }
  if (patch.category !== undefined) {
    fields.push("category = ?");
    values.push(patch.category);
  }
  if (fields.length === 0) return getProduct(id);
  values.push(id);
  await db.execute(`UPDATE products SET ${fields.join(", ")} WHERE id = ?`, values);
  return getProduct(id);
}

export async function deleteProduct(id: string): Promise<void> {
  await db.execute("DELETE FROM products WHERE id = ?", [id]);
}
