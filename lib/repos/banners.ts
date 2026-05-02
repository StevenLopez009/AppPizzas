import "server-only";
import { db, query, queryOne } from "@/lib/db";
import { uuid } from "@/lib/uuid";
import type { RowDataPacket } from "mysql2";

export interface Banner {
  id: string;
  image_url: string;
  created_at: string;
}

interface BannerRow extends RowDataPacket {
  id: string;
  image_url: string;
  created_at: Date;
}

const toBanner = (r: BannerRow): Banner => ({
  id: r.id,
  image_url: r.image_url,
  created_at:
    r.created_at instanceof Date ? r.created_at.toISOString() : String(r.created_at),
});

export async function listBanners(): Promise<Banner[]> {
  const rows = await query<BannerRow>(
    "SELECT * FROM banners ORDER BY created_at DESC",
  );
  return rows.map(toBanner);
}

export async function createBanner(image_url: string): Promise<Banner> {
  const id = uuid();
  await db.execute("INSERT INTO banners (id, image_url) VALUES (?, ?)", [
    id,
    image_url,
  ]);
  const row = await queryOne<BannerRow>("SELECT * FROM banners WHERE id = ?", [id]);
  if (!row) throw new Error("No se pudo crear el banner");
  return toBanner(row);
}

export async function deleteBanner(id: string): Promise<void> {
  await db.execute("DELETE FROM banners WHERE id = ?", [id]);
}
