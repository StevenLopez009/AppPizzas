import "server-only";
import { db, parseJSON, query, queryOne, type DbValue } from "@/lib/db";
import { uuid } from "@/lib/uuid";
import { addPointsToUser } from "./userPoints";
import type { RowDataPacket } from "mysql2";

export type OrderType = "domicilio" | "mesa" | "recoger";

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  price: number;
  quantity: number;
  size: string | null;
  extra: string | null;
  observations: string | null;
  additionals: Array<{ name: string; price: number }>;
  ingredients: string[];
}

export interface Order {
  id: string;
  user_id: string | null;
  order_number: number;
  created_at: string;
  order_type: OrderType;
  table_label: string | null;
  status: string;
  customer_name: string | null;
  customer_phone: string | null;
  customer_address: string | null;
  table_number: string | null;
  payment_method: string | null;
  cash_amount: number | null;
  subtotal: number;
  neighborhood: string | null;
  delivery_fee: number;
  total: number;
  discount_percentage: number;
  lat: number | null;
  lng: number | null;
  order_items: OrderItem[];
}

interface OrderRow extends RowDataPacket {
  id: string;
  user_id: string | null;
  order_number: number;
  created_at: Date;
  order_type: OrderType;
  table_label: string | null;
  status: string;
  customer_name: string | null;
  customer_phone: string | null;
  customer_address: string | null;
  table_number: string | null;
  payment_method: string | null;
  cash_amount: string | null;
  subtotal: string;
  neighborhood: string | null;
  delivery_fee: string;
  total: string;
  discount_percentage: string;
  lat: string | null;
  lng: string | null;
  ingredients: unknown;
}

interface OrderItemRow extends RowDataPacket {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  price: string;
  quantity: number;
  size: string | null;
  extra: string | null;
  observations: string | null;
  additionals: unknown;
  ingredients: unknown;
}

const num = (v: unknown): number =>
  v == null ? 0 : typeof v === "number" ? v : Number(v) || 0;

/** DECIMAL NOT NULL: nunca pasar undefined/NaN al driver — rompe el INSERT en MySQL strict. */
function finiteMoney(v: unknown, fallback = 0): number {
  if (v == null || v === "") return fallback;
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function nullableMoney(v: unknown): number | null {
  if (v == null || v === "") return null;
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : null;
}

function nullableTableNumber(v: unknown): string | null {
  if (v === null || v === undefined || v === "") return null;

  const value = String(v).trim();

  return value.length > 0 ? value : null;
}

function finiteQty(v: unknown): number {
  const n = finiteMoney(v, 1);
  return Math.max(1, Math.round(n));
}

function nullableCoord(v: unknown): number | null {
  if (v == null || v === "") return null;
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : null;
}

function toOrder(row: OrderRow, items: OrderItemRow[]): Order {
  return {
    id: row.id,
    user_id: row.user_id,
    order_number: row.order_number,
    created_at:
      row.created_at instanceof Date
        ? row.created_at.toISOString()
        : String(row.created_at),
    order_type: row.order_type,
    table_label: row.table_label,
    status: row.status,
    customer_name: row.customer_name,
    customer_phone: row.customer_phone,
    customer_address: row.customer_address,
    table_number: row.table_number,
    payment_method: row.payment_method,
    cash_amount: row.cash_amount == null ? null : num(row.cash_amount),
    subtotal: num(row.subtotal),
    neighborhood: row.neighborhood,
    delivery_fee: num(row.delivery_fee),
    total: num(row.total),
    discount_percentage: num(row.discount_percentage),
    lat: row.lat == null ? null : num(row.lat),
    lng: row.lng == null ? null : num(row.lng),
    order_items: items
      .filter((i) => i.order_id === row.id)
      .map((i) => ({
        id: i.id,
        order_id: i.order_id,
        product_id: i.product_id,
        product_name: i.product_name,
        price: num(i.price),
        quantity: i.quantity,
        size: i.size,
        extra: i.extra,
        observations: i.observations,
        additionals: parseJSON<Array<{ name: string; price: number }>>(
          i.additionals,
          [],
        ),
        ingredients: parseJSON<string[]>(i.ingredients, []),
      })),
  };
}

export async function listOrders(): Promise<Order[]> {
  const orderRows = await query<OrderRow>(
    "SELECT * FROM orders ORDER BY created_at DESC",
  );
  if (orderRows.length === 0) return [];
  const ids = orderRows.map((o) => o.id);
  const placeholders = ids.map(() => "?").join(",");
  const itemRows = await query<OrderItemRow>(
    `SELECT * FROM order_items WHERE order_id IN (${placeholders}) ORDER BY id`,
    ids,
  );
  return orderRows.map((r) => toOrder(r, itemRows));
}

export async function getOrder(id: string): Promise<Order | null> {
  const row = await queryOne<OrderRow>(
    "SELECT * FROM orders WHERE id = ? LIMIT 1",
    [id],
  );
  if (!row) return null;
  const items = await query<OrderItemRow>(
    "SELECT * FROM order_items WHERE order_id = ? ORDER BY id",
    [id],
  );
  return toOrder(row, items);
}

export interface NewOrderInput {
  user_id?: string | null;
  order_type: OrderType;
  status?: string;
  customer_name?: string | null;
  customer_phone?: string | null;
  customer_address?: string | null;
  table_label?: string | null;
  payment_method?: string | null;
  cash_amount?: number | null;
  subtotal: number;
  neighborhood?: string | null;
  delivery_fee?: number;
  total: number;
  discount_percentage?: number;
  lat?: number | null;
  lng?: number | null;
}

export interface NewOrderItemInput {
  product_id?: string | null;
  product_name: string;
  price: number;
  quantity: number;
  size?: string | null;
  extra?: string | null;
  observations?: string | null;
  additionals?: Array<{ name: string; price: number }>;
  ingredients?: string[];
}

export async function createOrderWithItems(
  order: NewOrderInput,
  items: NewOrderItemInput[],
): Promise<Order> {
  const id = uuid();
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    await conn.execute(
      `INSERT INTO orders (id, user_id, order_type, status, customer_name, customer_phone,
        customer_address, table_number, payment_method, cash_amount, subtotal,
        neighborhood, delivery_fee, total, discount_percentage, lat, lng)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        order.user_id ?? null,
        order.order_type,
        order.status ?? "recibido",
        order.customer_name ?? null,
        order.customer_phone ?? null,
        order.customer_address ?? null,
        nullableTableNumber(order.table_label),
        order.payment_method ?? null,
        nullableMoney(order.cash_amount),
        finiteMoney(order.subtotal, 0),
        order.neighborhood ?? null,
        finiteMoney(order.delivery_fee ?? 0, 0),
        finiteMoney(order.total, 0),
        finiteMoney(order.discount_percentage ?? 0, 0),
        nullableCoord(order.lat),
        nullableCoord(order.lng),
      ],
    );

    for (const item of items) {
      await conn.execute(
        `INSERT INTO order_items (id, order_id, product_id, product_name, price,
          quantity, size, extra, observations, additionals, ingredients)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          uuid(),
          id,
          item.product_id ?? null,
          item.product_name,
          finiteMoney(item.price, 0),
          finiteQty(item.quantity),
          item.size ?? null,
          item.extra ?? null,
          item.observations ?? null,
          JSON.stringify(item.additionals ?? []),
          JSON.stringify(item.ingredients ?? []),
        ],
      );
    }

    if (order.order_type === "mesa" && order.table_label) {
      await conn.execute(
        `
    UPDATE restaurant_zones
    SET occupied = 1
    WHERE label = ?
    `,
        [String(order.table_label)],
      );
    }

    await conn.commit();
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }

  const created = await getOrder(id);
  if (!created) throw new Error("No se pudo crear el pedido");

  // Agregar puntos al usuario (1 punto por cada 100 COP)
  if (created.user_id) {
    const points = Math.floor(created.total / 100);
    if (points > 0) {
      try {
        await addPointsToUser(created.user_id, points, created.id);
      } catch (err) {
        console.error("Error adding points to user:", err);
        // No fallar la orden si hay error con puntos
      }
    }
  }

  return created;
}

export async function updateOrder(
  id: string,
  patch: Partial<{
    status: string;
    discount_percentage: number;
    total: number;
    payment_method: string;
  }>,
): Promise<Order | null> {
  const previousOrder = await getOrder(id);

  if (!previousOrder) {
    return null;
  }

  const fields: string[] = [];
  const values: DbValue[] = [];

  if (patch.status !== undefined) {
    fields.push("status = ?");
    values.push(patch.status);
  }

  if (patch.discount_percentage !== undefined) {
    fields.push("discount_percentage = ?");
    values.push(patch.discount_percentage);
  }

  if (patch.total !== undefined) {
    fields.push("total = ?");
    values.push(patch.total);
  }

  if (patch.payment_method !== undefined) {
    fields.push("payment_method = ?");
    values.push(patch.payment_method);
  }

  if (fields.length === 0) return previousOrder;

  values.push(id);

  await db.execute(
    `UPDATE orders SET ${fields.join(", ")} WHERE id = ?`,
    values,
  );

  const updatedOrder = await getOrder(id);

  if (!updatedOrder) {
    return null;
  }

  if (
    previousOrder.order_type === "domicilio" &&
    previousOrder.status !== "enviado" &&
    updatedOrder.status === "enviado"
  ) {
    console.log("Enviar WhatsApp a:", updatedOrder.customer_phone);
  }

  return updatedOrder;
}

export async function deleteOrder(id: string): Promise<void> {
  await db.execute("DELETE FROM orders WHERE id = ?", [id]);
}

export async function deleteOrderItem(orderId: string, itemId: string) {
  await db.execute(
    `
    DELETE FROM order_items
    WHERE id = ? AND order_id = ?
    `,
    [itemId, orderId],
  );

  const sumRow = await queryOne<RowDataPacket & { total: string | number }>(
    `
    SELECT COALESCE(SUM(price * quantity), 0) AS total
    FROM order_items
    WHERE order_id = ?
    `,
    [orderId],
  );

  const order = await getOrder(orderId);
  const subtotal = num(sumRow?.total);
  const newTotal = subtotal + (order?.delivery_fee ?? 0);

  await db.execute("UPDATE orders SET subtotal = ?, total = ? WHERE id = ?", [
    subtotal,
    newTotal,
    orderId,
  ]);
}

export async function addOrderItem(
  orderId: string,
  item: NewOrderItemInput,
): Promise<OrderItem> {
  const itemId = uuid();
  await db.execute(
    `INSERT INTO order_items (id, order_id, product_id, product_name, price,
      quantity, size, extra, observations, additionals, ingredients)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      itemId,
      orderId,
      item.product_id ?? null,
      item.product_name,
      item.price,
      item.quantity,
      item.size ?? null,
      item.extra ?? null,
      item.observations ?? null,
      JSON.stringify(item.additionals ?? []),
      JSON.stringify(item.ingredients ?? []),
    ],
  );

  const sumRow = await queryOne<RowDataPacket & { total: string | number }>(
    "SELECT COALESCE(SUM(price * quantity), 0) AS total FROM order_items WHERE order_id = ?",
    [orderId],
  );

  const order = await getOrder(orderId);
  const subtotal = num(sumRow?.total);
  const newTotal = subtotal + (order?.delivery_fee ?? 0);

  await db.execute("UPDATE orders SET subtotal = ?, total = ? WHERE id = ?", [
    subtotal,
    newTotal,
    orderId,
  ]);

  const row = await queryOne<OrderItemRow>(
    "SELECT * FROM order_items WHERE id = ? LIMIT 1",
    [itemId],
  );
  if (!row) throw new Error("No se pudo agregar el item");

  return {
    id: row.id,
    order_id: row.order_id,
    product_id: row.product_id,
    product_name: row.product_name,
    price: num(row.price),
    quantity: row.quantity,
    size: row.size,
    extra: row.extra,
    observations: row.observations,
    additionals: parseJSON<Array<{ name: string; price: number }>>(
      row.additionals,
      [],
    ),
    ingredients: parseJSON<string[]>(row.ingredients, []),
  };
}
