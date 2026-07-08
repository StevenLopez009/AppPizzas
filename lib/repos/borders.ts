import { query } from "@/lib/db";

export interface Border {
  id: string;
  name: string;
}

export async function listBorders(): Promise<Border[]> {
  const rows = await query(
    `SELECT id, name
     FROM borders
     WHERE active = 1
     ORDER BY name`,
  );

  return rows as Border[];
}
