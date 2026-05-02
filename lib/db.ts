import "server-only";
import mysql, { type Pool, type RowDataPacket } from "mysql2/promise";

declare global {
  // eslint-disable-next-line no-var
  var __apppizzas_mysql_pool__: Pool | undefined;
}

function buildPool(): Pool {
  return mysql.createPool({
    host: process.env.DATABASE_HOST || "localhost",
    port: Number(process.env.DATABASE_PORT || 3306),
    user: process.env.DATABASE_USER || "app",
    password: process.env.DATABASE_PASSWORD || "app_password",
    database: process.env.DATABASE_NAME || "apppizzas",
    waitForConnections: true,
    connectionLimit: 10,
    namedPlaceholders: false,
    decimalNumbers: true,
    dateStrings: false,
    timezone: "Z",
  });
}

export const db: Pool =
  global.__apppizzas_mysql_pool__ ?? (global.__apppizzas_mysql_pool__ = buildPool());

export type DbValue = string | number | bigint | boolean | Date | Buffer | null;

export async function query<T extends RowDataPacket = RowDataPacket>(
  sql: string,
  params: DbValue[] = [],
): Promise<T[]> {
  const [rows] = await db.execute<T[]>(sql, params);
  return rows;
}

export async function queryOne<T extends RowDataPacket = RowDataPacket>(
  sql: string,
  params: DbValue[] = [],
): Promise<T | null> {
  const rows = await query<T>(sql, params);
  return rows[0] ?? null;
}

/**
 * MySQL JSON columns return strings via mysql2 unless `JSON.parse` se aplica.
 * Helper para parsear de forma defensiva.
 */
export function parseJSON<T = unknown>(value: unknown, fallback: T): T {
  if (value == null) return fallback;
  if (typeof value !== "string") return value as T;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}
