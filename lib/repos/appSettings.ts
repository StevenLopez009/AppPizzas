import "server-only";

import type { RowDataPacket } from "mysql2";
import { db, queryOne } from "@/lib/db";
import { DEFAULT_THEME_PRIMARY } from "@/lib/theme/brandCssVars";

const DEFAULT_BUSINESS_NAME = "Pizzas La Carreta";

interface AppSettingsRow extends RowDataPacket {
  theme_primary: string;
  business_name: string;
}

let schemaEnsured = false;

async function ensureAppSettingsTable(): Promise<void> {
  if (schemaEnsured) return;
  await db.execute(`
    CREATE TABLE IF NOT EXISTS app_settings (
      id             TINYINT UNSIGNED NOT NULL PRIMARY KEY DEFAULT 1,
      theme_primary  VARCHAR(7)       NOT NULL DEFAULT '#F97316',
      business_name  VARCHAR(120)     NOT NULL DEFAULT 'Pizzas La Carreta',
      updated_at     TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      CONSTRAINT chk_app_settings_singleton CHECK (id = 1)
    ) ENGINE=InnoDB
  `);
  await db.execute(
    `INSERT IGNORE INTO app_settings (id, theme_primary, business_name)
     VALUES (1, '#F97316', 'Pizzas La Carreta')`,
  );
  // Add column if it doesn't exist yet (MySQL 8 has no ADD COLUMN IF NOT EXISTS)
  const [cols] = await db.execute<import("mysql2").RowDataPacket[]>(
    `SELECT COUNT(*) AS cnt FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'app_settings' AND COLUMN_NAME = 'business_name'`,
  );
  if ((cols as import("mysql2").RowDataPacket[])[0]?.cnt === 0) {
    await db.execute(
      `ALTER TABLE app_settings ADD COLUMN business_name VARCHAR(120) NOT NULL DEFAULT 'Pizzas La Carreta'`,
    );
  }
  schemaEnsured = true;
}

function normalizeHex(value: string): string | null {
  const v = value.trim();
  const h = v.startsWith("#") ? v.slice(1) : v;
  if (h.length !== 6 || !/^[0-9a-fA-F]+$/.test(h)) return null;
  return `#${h.toUpperCase()}`;
}

export async function getSettings(): Promise<{ themePrimary: string; businessName: string }> {
  try {
    await ensureAppSettingsTable();
    const row = await queryOne<AppSettingsRow>(
      "SELECT theme_primary, business_name FROM app_settings WHERE id = 1 LIMIT 1",
    );
    const hex = row?.theme_primary;
    const name = row?.business_name;
    return {
      themePrimary: (hex && normalizeHex(hex)) || normalizeHex(DEFAULT_THEME_PRIMARY)!,
      businessName: (name && name.trim()) || DEFAULT_BUSINESS_NAME,
    };
  } catch {
    return {
      themePrimary: normalizeHex(DEFAULT_THEME_PRIMARY)!,
      businessName: DEFAULT_BUSINESS_NAME,
    };
  }
}

export async function getThemePrimary(): Promise<string> {
  return (await getSettings()).themePrimary;
}

export async function setSettings(patch: {
  themePrimary?: string;
  businessName?: string;
}): Promise<{ themePrimary: string; businessName: string }> {
  await ensureAppSettingsTable();

  const current = await getSettings();
  const hex = patch.themePrimary ? normalizeHex(patch.themePrimary) : null;
  if (patch.themePrimary !== undefined && !hex) {
    throw Object.assign(new Error("color inválido"), { status: 400 });
  }
  const newHex = hex ?? current.themePrimary;
  const newName = (patch.businessName?.trim()) || current.businessName;

  await db.execute(
    `INSERT INTO app_settings (id, theme_primary, business_name) VALUES (1, ?, ?)
     ON DUPLICATE KEY UPDATE theme_primary = VALUES(theme_primary), business_name = VALUES(business_name)`,
    [newHex, newName],
  );
  return { themePrimary: newHex, businessName: newName };
}

export async function setThemePrimary(raw: string): Promise<string> {
  const result = await setSettings({ themePrimary: raw });
  return result.themePrimary;
}
