"use client";

import { useTheme } from "@/context/ThemeContext";
import { useState } from "react";

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
  discount_percentage: number;
  created_at: string;
  payment_method: string;
  order_type: string;
  order_items: {
    product_name: string;
    quantity: number;
  }[];
}

const finalTotal = (o: Order) =>
  o.total - (o.total * (o.discount_percentage || 0)) / 100;

interface Props {
  orders: Order[];
}

export default function SalesStats({ orders }: Props) {
  const [open, setOpen] = useState(true);
  const { theme, brand: brandColor } = useTheme();
  const isDark = theme === "dark";

  // =========================
  // COLORES DINÁMICOS
  // =========================
  const chartGrid = isDark ? "#27272a" : "#e5e7eb";
  const chartText = isDark ? "#a1a1aa" : "#6b7280";
  const tooltipBg = isDark ? "#18181b" : "#ffffff";
  const tooltipBorder = isDark ? "#27272a" : "#e5e7eb";
  const tooltipText = isDark ? "#f4f4f5" : "#111827";

  // =========================
  // VENTAS POR DÍA
  // =========================
  const salesByDayMap: Record<string, number> = {};

  orders.forEach((order) => {
    const day = new Date(order.created_at).toLocaleDateString("es-CO");
    salesByDayMap[day] = (salesByDayMap[day] || 0) + finalTotal(order);
  });

  const salesByDay = Object.entries(salesByDayMap).map(([day, total]) => ({
    day,
    total,
  }));

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
    .map(([name, quantity]) => ({ name, quantity }))
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

  // =========================
  // TICKET PROMEDIO
  // =========================
  const averageTicket =
    orders.length > 0
      ? orders.reduce((acc, o) => acc + finalTotal(o), 0) / orders.length
      : 0;

  return (
    <div className="space-y-4 transition-colors duration-300">
      {/* HEADER */}
      <div className="bg-surface border border-line rounded-3xl p-5 shadow-sm transition-colors duration-300 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-fg">Estadísticas</h2>
          <p className="text-sm text-fg-muted mt-1">Resumen de ventas</p>
        </div>

        <button
          onClick={() => setOpen((prev) => !prev)}
          className="px-3 py-1 rounded-xl border border-line bg-canvas text-fg text-sm font-medium hover:opacity-80 transition"
        >
          {open ? "Ocultar" : "Mostrar"}
        </button>
      </div>
      {open && (
        <>
          {" "}
          {/* CARDS */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-surface border border-line rounded-2xl p-4 shadow-sm transition-colors duration-300">
              <p className="text-xs text-fg-muted">Ventas</p>
              <h2 className="text-lg font-bold text-fg mt-1">
                $
                {orders
                  .reduce((acc, o) => acc + finalTotal(o), 0)
                  .toLocaleString("es-CO")}
              </h2>
            </div>

            <div className="bg-surface border border-line rounded-2xl p-4 shadow-sm transition-colors duration-300">
              <p className="text-xs text-fg-muted">Pedidos</p>
              <h2 className="text-lg font-bold text-fg mt-1">
                {orders.length}
              </h2>
            </div>

            <div className="bg-surface border border-line rounded-2xl p-4 shadow-sm transition-colors duration-300">
              <p className="text-xs text-fg-muted">Ticket Prom.</p>
              <h2 className="text-lg font-bold text-fg mt-1">
                ${Math.round(averageTicket).toLocaleString("es-CO")}
              </h2>
            </div>

            <div className="bg-surface border border-line rounded-2xl p-4 shadow-sm transition-colors duration-300">
              <p className="text-xs text-fg-muted">Productos</p>
              <h2 className="text-lg font-bold text-fg mt-1">
                {topProducts.reduce((acc, p) => acc + p.quantity, 0)}
              </h2>
            </div>
          </div>
          {/* VENTAS POR DÍA */}
          <div className="bg-surface border border-line rounded-3xl p-4 shadow-sm transition-colors duration-300">
            <h3 className="font-semibold text-fg mb-4">Ventas por día</h3>
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={salesByDay}>
                  <CartesianGrid stroke={chartGrid} strokeDasharray="3 3" />
                  <XAxis
                    dataKey="day"
                    tick={{ fontSize: 10, fill: chartText }}
                  />
                  <YAxis tick={{ fontSize: 10, fill: chartText }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: tooltipBg,
                      border: `1px solid ${tooltipBorder}`,
                      borderRadius: "14px",
                      color: tooltipText,
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="total"
                    stroke={brandColor}
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          {/* TOP PRODUCTOS */}
          <div className="bg-surface border border-line rounded-3xl p-4 shadow-sm transition-colors duration-300">
            <h3 className="font-semibold text-fg mb-4">Top productos</h3>
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topProducts}>
                  <CartesianGrid stroke={chartGrid} strokeDasharray="3 3" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 10, fill: chartText }}
                  />
                  <YAxis tick={{ fontSize: 10, fill: chartText }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: tooltipBg,
                      border: `1px solid ${tooltipBorder}`,
                      borderRadius: "14px",
                      color: tooltipText,
                    }}
                  />
                  <Bar
                    dataKey="quantity"
                    fill={brandColor}
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
