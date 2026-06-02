import "server-only";
import { db, query } from "@/lib/db";
import { uuid } from "@/lib/uuid";
import type { RowDataPacket } from "mysql2";

const DEV_PREFIX = "[DEV] ";
const DEV_MESA_TABLE = 42;

/** [Lorem Picsum](https://picsum.photos/) — IDs fijos para dev. */
const PICSUM = (id: number, w = 400, h = 400) =>
  `https://picsum.photos/id/${id}/${w}/${h}.webp`;

type OrderType = "domicilio" | "mesa" | "recoger";

const ORDER_FLOW: Record<OrderType, string[]> = {
  domicilio: ["recibido", "cocinando", "enviado", "entregado"],
  mesa: ["recibido", "cocinando", "entregado"],
  recoger: ["recibido", "cocinando", "listo_para_recoger"],
};

export async function clearDevSeed() {
  // 1. pedidos creados por el seed (FK con CASCADE borra los items)
  await db.execute(
    `DELETE FROM orders
     WHERE customer_name LIKE ?
        OR neighborhood LIKE ?
        OR (order_type = 'mesa' AND table_number = ?)
        OR customer_phone LIKE ?`,
    [`${DEV_PREFIX}%`, "%[DEV]%", DEV_MESA_TABLE, `${DEV_PREFIX}%`],
  );

  // 2. productos del seed
  await db.execute("DELETE FROM products WHERE name LIKE ?", [`${DEV_PREFIX}%`]);
}

interface ProductSeed {
  id: string;
  name: string;
  description: string;
  category: string;
  image_url: string;
  prices: Array<{ label: string; price: number }>;
}

function pickPrice(prices: ProductSeed["prices"], size: string) {
  const row = prices.find((p) => p.label === size) ?? prices[0];
  return row?.price ?? 0;
}

export async function insertDevSeed() {
  await clearDevSeed();

  const productSeeds: ProductSeed[] = [
    {
      id: uuid(),
      name: `${DEV_PREFIX}Pizza Margarita`,
      description: "Seed dev — mozzarella, tomate, albahaca.",
      category: "Pizza Sal",
      image_url: PICSUM(292),
      prices: [
        { label: "Personal", price: 18000 },
        { label: "Mediana", price: 32000 },
      ],
    },
    {
      id: uuid(),
      name: `${DEV_PREFIX}Pizza Pepperoni`,
      description: "Seed dev — pepperoni y queso.",
      category: "Pizza Sal",
      image_url: PICSUM(429),
      prices: [
        { label: "Personal", price: 20000 },
        { label: "Mediana", price: 35000 },
      ],
    },
    {
      id: uuid(),
      name: `${DEV_PREFIX}Gaseosa 400ml`,
      description: "Seed dev — bebida fría.",
      category: "Bebidas",
      image_url: PICSUM(225),
      prices: [{ label: "", price: 3500 }],
    },
    {
      id: uuid(),
      name: `${DEV_PREFIX}Hamburguesa clásica`,
      description: "Seed dev — carne, queso, vegetales.",
      category: "Com. Rapidas",
      image_url: PICSUM(431),
      prices: [
        { label: "Sencillo", price: 15000 },
        { label: "Doble", price: 22000 },
      ],
    },
    {
      id: uuid(),
      name: `${DEV_PREFIX}Lasaña bolognesa`,
      description: "Seed dev — pasta horneada.",
      category: "Lasaña Spaguetti",
      image_url: PICSUM(488),
      prices: [{ label: "", price: 24000 }],
    },
    {
      id: uuid(),
      name: `${DEV_PREFIX}Panzerotti jamón y queso`,
      description: "Seed dev — empanada italiana.",
      category: "Panzerotti",
      image_url: PICSUM(493),
      prices: [{ label: "", price: 12000 }],
    },
  ];

  for (const p of productSeeds) {
    await db.execute(
      `INSERT INTO products (id, name, description, prices, image_url, category)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [p.id, p.name, p.description, JSON.stringify(p.prices), p.image_url, p.category],
    );
  }

  const byName = Object.fromEntries(productSeeds.map((p) => [p.name, p]));
  const pizza1 = byName[`${DEV_PREFIX}Pizza Margarita`];
  const pizza2 = byName[`${DEV_PREFIX}Pizza Pepperoni`];
  const bebida = byName[`${DEV_PREFIX}Gaseosa 400ml`];
  const burger = byName[`${DEV_PREFIX}Hamburguesa clásica`];

  type SeedOrder = {
    order_type: OrderType;
    status: string;
    customer_name: string | null;
    customer_phone: string | null;
    customer_address: string | null;
    neighborhood: string | null;
    table_number: number | null;
    lat: number | null;
    lng: number | null;
    payment_method: string;
    cash_amount: number | null;
    subtotal: number;
    delivery_fee: number;
    total: number;
    discount_percentage: number;
    items: Array<{
      product_id: string;
      product_name: string;
      price: number;
      quantity: number;
      size: string;
      extra: string | null;
      observations: string | null;
      additionals: Array<{ name: string; price: number }>;
    }>;
  };

  const seedOrders: SeedOrder[] = [];

  for (const status of ORDER_FLOW.domicilio) {
    const subtotal =
      pickPrice(pizza1.prices, "Personal") + pickPrice(bebida.prices, "");
    const delivery_fee = 3000;
    seedOrders.push({
      order_type: "domicilio",
      status,
      customer_name: `${DEV_PREFIX}Cliente Domicilio`,
      customer_phone: "3001112233",
      customer_address: "Calle 123 #45-67 [DEV]",
      neighborhood: "[DEV] Chapinero",
      table_number: null,
      lat: 4.65,
      lng: -74.06,
      payment_method: "efectivo",
      cash_amount: subtotal + delivery_fee,
      subtotal,
      delivery_fee,
      total: subtotal + delivery_fee,
      discount_percentage: 0,
      items: [
        {
          product_id: pizza1.id,
          product_name: "Pizza Margarita",
          price: pickPrice(pizza1.prices, "Personal"),
          quantity: 1,
          size: "Personal",
          extra: null,
          observations: "Seed domicilio",
          additionals: [],
        },
        {
          product_id: bebida.id,
          product_name: "Gaseosa 400ml",
          price: pickPrice(bebida.prices, ""),
          quantity: 1,
          size: "",
          extra: null,
          observations: null,
          additionals: [],
        },
      ],
    });
  }

  for (const status of ORDER_FLOW.mesa) {
    const subtotal = pickPrice(pizza2.prices, "Mediana");
    seedOrders.push({
      order_type: "mesa",
      status,
      customer_name: null,
      customer_phone: null,
      customer_address: null,
      neighborhood: null,
      table_number: DEV_MESA_TABLE,
      lat: null,
      lng: null,
      payment_method: "transferencia",
      cash_amount: null,
      subtotal,
      delivery_fee: 0,
      total: subtotal,
      discount_percentage: 0,
      items: [
        {
          product_id: pizza2.id,
          product_name: "Pizza Pepperoni",
          price: subtotal,
          quantity: 1,
          size: "Mediana",
          extra: "Borde queso",
          observations: null,
          additionals: [{ name: "Queso extra", price: 3000 }],
        },
      ],
    });
  }

  for (const status of ORDER_FLOW.recoger) {
    const subtotal = pickPrice(burger.prices, "Sencillo") * 2;
    seedOrders.push({
      order_type: "recoger",
      status,
      customer_name: `${DEV_PREFIX}Cliente Recoge`,
      customer_phone: "3004445566",
      customer_address: null,
      neighborhood: null,
      table_number: null,
      lat: null,
      lng: null,
      payment_method: "efectivo",
      cash_amount: subtotal,
      subtotal,
      delivery_fee: 0,
      total: subtotal,
      discount_percentage: status === "listo_para_recoger" ? 10 : 0,
      items: [
        {
          product_id: burger.id,
          product_name: "Hamburguesa clásica",
          price: pickPrice(burger.prices, "Sencillo"),
          quantity: 2,
          size: "Sencillo",
          extra: null,
          observations: "Sin cebolla",
          additionals: [],
        },
      ],
    });
  }

  for (const o of seedOrders) {
    const orderId = uuid();
    await db.execute(
      `INSERT INTO orders (id, order_type, status, customer_name, customer_phone,
        customer_address, table_number, payment_method, cash_amount, subtotal,
        neighborhood, delivery_fee, total, discount_percentage, lat, lng)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        orderId,
        o.order_type,
        o.status,
        o.customer_name,
        o.customer_phone,
        o.customer_address,
        o.table_number,
        o.payment_method,
        o.cash_amount,
        o.subtotal,
        o.neighborhood,
        o.delivery_fee,
        o.total,
        o.discount_percentage,
        o.lat,
        o.lng,
      ],
    );

    for (const it of o.items) {
      await db.execute(
        `INSERT INTO order_items (id, order_id, product_id, product_name, price,
          quantity, size, extra, observations, additionals)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          uuid(),
          orderId,
          it.product_id,
          it.product_name,
          it.price,
          it.quantity,
          it.size,
          it.extra,
          it.observations,
          JSON.stringify(it.additionals),
        ],
      );
    }
  }

  const counts = await query<RowDataPacket & { c: number }>(
    "SELECT COUNT(*) AS c FROM products WHERE name LIKE ?",
    [`${DEV_PREFIX}%`],
  );

  return {
    productsCount: Number(counts[0]?.c ?? productSeeds.length),
    ordersCount: seedOrders.length,
  };
}
