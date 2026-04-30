"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";

interface Order {
  total: number;
  created_at: string;
  payment_method: string;
  order_type: string;
  order_items: {
    product_name: string;
    quantity: number;
  }[];
}

interface Props {
  orders: Order[];
}

export default function SalesStats({ orders }: Props) {
  // =========================
  // VENTAS POR DÍA
  // =========================

  const salesByDayMap: Record<string, number> = {};

  orders.forEach((order) => {
    const day = new Date(order.created_at).toLocaleDateString("es-CO");

    salesByDayMap[day] = (salesByDayMap[day] || 0) + Number(order.total);
  });

  const salesByDay = Object.entries(salesByDayMap).map(([day, total]) => ({
    day,
    total,
  }));

  // =========================
  // MÉTODOS DE PAGO
  // =========================

  const paymentMap: Record<string, number> = {};

  orders.forEach((order) => {
    paymentMap[order.payment_method] =
      (paymentMap[order.payment_method] || 0) + 1;
  });

  // =========================
  // PRODUCTOS MÁS VENDIDOS
  // =========================

  const productsMap: Record<string, number> = {};

  orders.forEach((order) => {
    order.order_items.forEach((item) => {
      productsMap[item.product_name] =
        (productsMap[item.product_name] || 0) + item.quantity;
    });
  });

  const topProducts = Object.entries(productsMap)
    .map(([name, quantity]) => ({
      name,
      quantity,
    }))
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

  // =========================
  // TICKET PROMEDIO
  // =========================

  const averageTicket =
    orders.reduce((acc, o) => acc + o.total, 0) / orders.length;

  return (
    <div className="space-y-4">
      {/* HEADER */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-800">Estadísticas</h2>

        <p className="text-sm text-gray-400 mt-1">Resumen de ventas</p>
      </div>

      {/* CARDS */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <p className="text-xs text-gray-400">Ventas</p>

          <h2 className="text-lg font-bold text-gray-800 mt-1">
            $
            {orders
              .reduce((acc, o) => acc + o.total, 0)
              .toLocaleString("es-CO")}
          </h2>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <p className="text-xs text-gray-400">Pedidos</p>

          <h2 className="text-lg font-bold text-gray-800 mt-1">
            {orders.length}
          </h2>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <p className="text-xs text-gray-400">Ticket Prom.</p>

          <h2 className="text-lg font-bold text-gray-800 mt-1">
            ${Math.round(averageTicket).toLocaleString("es-CO")}
          </h2>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <p className="text-xs text-gray-400">Productos</p>

          <h2 className="text-lg font-bold text-gray-800 mt-1">
            {topProducts.reduce((acc, p) => acc + p.quantity, 0)}
          </h2>
        </div>
      </div>

      {/* VENTAS */}
      <div className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100">
        <h3 className="font-semibold text-gray-800 mb-4">Ventas por día</h3>

        <div className="h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={salesByDay}>
              <CartesianGrid strokeDasharray="3 3" />

              <XAxis dataKey="day" tick={{ fontSize: 10 }} />

              <YAxis tick={{ fontSize: 10 }} />

              <Tooltip />

              <Line
                type="monotone"
                dataKey="total"
                stroke="#f97316"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* TOP PRODUCTOS */}
      <div className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100">
        <h3 className="font-semibold text-gray-800 mb-4">Top productos</h3>

        <div className="h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topProducts}>
              <CartesianGrid strokeDasharray="3 3" />

              <XAxis dataKey="name" tick={{ fontSize: 10 }} />

              <YAxis tick={{ fontSize: 10 }} />

              <Tooltip />

              <Bar dataKey="quantity" fill="#fb923c" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
