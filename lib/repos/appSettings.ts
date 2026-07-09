import "server-only";

import type { RowDataPacket } from "mysql2";
import { db, queryOne } from "@/lib/db";

interface AppSettingsRow extends RowDataPacket {
  theme_primary: string;
  business_name: string;
  store_open: number;
  payment_key: string;
}

let schemaEnsured = false;

async function ensureAppSettingsTable(): Promise<void> {
  if (schemaEnsured) return;

  await db.execute(`
    CREATE TABLE IF NOT EXISTS app_settings (
      id             TINYINT UNSIGNED NOT NULL PRIMARY KEY DEFAULT 1,
      theme_primary  VARCHAR(7)       NOT NULL DEFAULT '#F97316',
      business_name  VARCHAR(120)     NOT NULL DEFAULT 'Pizzas La Carreta',
      store_open     TINYINT(1)       NOT NULL DEFAULT 1,
      updated_at     TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      CONSTRAINT chk_app_settings_singleton CHECK (id = 1)
    ) ENGINE=InnoDB
  `);

  await db.execute(
    `INSERT IGNORE INTO app_settings (id, theme_primary, business_name, store_open)
     VALUES (1, '#F97316', 'Pizzas La Carreta', 1)`,
  );

  // business_name
  const [colsName] = await db.execute<RowDataPacket[]>(
    `SELECT COUNT(*) AS cnt
     FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE()
     AND TABLE_NAME = 'app_settings'
     AND COLUMN_NAME = 'business_name'`,
  );

  if (colsName[0]?.cnt === 0) {
    await db.execute(`
      ALTER TABLE app_settings
      ADD COLUMN business_name VARCHAR(120) NOT NULL DEFAULT 'Pizzas La Carreta'
    `);
  }

  // store_open
  const [colsStore] = await db.execute<RowDataPacket[]>(
    `SELECT COUNT(*) AS cnt
     FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE()
     AND TABLE_NAME = 'app_settings'
     AND COLUMN_NAME = 'store_open'`,
  );

  // payment_key
  const [colsPayment] = await db.execute<RowDataPacket[]>(
    `SELECT COUNT(*) AS cnt
   FROM INFORMATION_SCHEMA.COLUMNS
   WHERE TABLE_SCHEMA = DATABASE()
   AND TABLE_NAME = 'app_settings'
   AND COLUMN_NAME = 'payment_key'`,
  );

  if (colsPayment[0]?.cnt === 0) {
    await db.execute(`
    ALTER TABLE app_settings
    ADD COLUMN payment_key VARCHAR(120) NOT NULL DEFAULT ''
  `);
  }

  if (colsStore[0]?.cnt === 0) {
    await db.execute(`
      ALTER TABLE app_settings
      ADD COLUMN store_open TINYINT(1) NOT NULL DEFAULT 1
    `);
  }

  schemaEnsured = true;
}

function normalizeHex(value: string): string | null {
  const v = value.trim();
  const h = v.startsWith("#") ? v.slice(1) : v;
  if (h.length !== 6 || !/^[0-9a-fA-F]+$/.test(h)) return null;
  return `#${h.toUpperCase()}`;
}

export async function getSettings() {
  await ensureAppSettingsTable();

  const row = await queryOne<AppSettingsRow>(
    `SELECT
  theme_primary,
  business_name,
  store_open,
  payment_key
     FROM app_settings
     WHERE id = 1
     LIMIT 1`,
  );

  return {
    themePrimary: row?.theme_primary ?? "#F97316",
    businessName: row?.business_name ?? "Pizzas La Carreta",
    paymentKey: row?.payment_key ?? "",
    storeOpen: Boolean(row?.store_open ?? 1),
  };
}

export async function getThemePrimary(): Promise<string> {
  const settings = await getSettings();
  return settings.themePrimary ?? "#F97316";
}

export async function setSettings(patch: {
  themePrimary?: string;
  businessName?: string;
  paymentKey?: string;
  storeOpen?: boolean;
}): Promise<{
  themePrimary: string;
  businessName: string;
  paymentKey: string;
  storeOpen: boolean;
}> {
  await ensureAppSettingsTable();

  const current = await getSettings();
  const hex = patch.themePrimary ? normalizeHex(patch.themePrimary) : null;
  if (patch.themePrimary !== undefined && !hex) {
    throw Object.assign(new Error("color inválido"), { status: 400 });
  }
  const newHex = hex ?? current.themePrimary;
  const newName = patch.businessName?.trim() || current.businessName;
  const newPaymentKey =
    patch.paymentKey !== undefined
      ? patch.paymentKey.trim()
      : current.paymentKey;
  const newStoreOpen =
    patch.storeOpen !== undefined ? patch.storeOpen : current.storeOpen;

  await db.execute(
    `INSERT INTO app_settings (
  id,
  theme_primary,
  business_name,
  payment_key,
  store_open
)
VALUES (1, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       theme_primary = VALUES(theme_primary),
       business_name = VALUES(business_name),
       payment_key = VALUES(payment_key),
       store_open = VALUES(store_open)`,
    [newHex, newName, newPaymentKey, newStoreOpen ? 1 : 0],
  );
  return {
    themePrimary: newHex,
    businessName: newName,
    paymentKey: newPaymentKey,
    storeOpen: newStoreOpen,
  };
}

export async function setThemePrimary(raw: string): Promise<string> {
  const result = await setSettings({ themePrimary: raw });
  return result.themePrimary;
}
