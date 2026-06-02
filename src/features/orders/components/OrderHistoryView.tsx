"use client";

import { ClipboardList, Clock, CheckCircle, Bike, Store, UtensilsCrossed } from "lucide-react";
import { useOrderHistory } from "../hooks/useOrderHistory";
import type { StoredOrder } from "@/lib/orderHistory";
import OrderTrackingTime from "@/components/orderTrackingTime/OrderTrackingTime";

const STATUS_LABEL: Record<string, string> = {
  recibido: "Recibido",
  cocinando: "En cocina",
  enviado: "En camino",
  entregado: "Entregado",
  listo_para_recoger: "Listo para recoger",
};

const STATUS_COLOR: Record<string, string> = {
  recibido: "bg-surface-muted text-fg-muted",
  cocinando: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  enviado: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  entregado: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  listo_para_recoger: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
};

const ORDER_TYPE_ICON: Record<string, React.ReactNode> = {
  domicilio: <Bike size={14} />,
  mesa: <UtensilsCrossed size={14} />,
  recoger: <Store size={14} />,
};

const ORDER_TYPE_LABEL: Record<string, string> = {
  domicilio: "Domicilio",
  mesa: "Mesa",
  recoger: "Recoger",
};

function OrderCard({ order, live = false }: { order: StoredOrder; live?: boolean }) {
  const orderType = (["domicilio", "mesa", "recoger"].includes(order.order_type)
    ? order.order_type
    : "domicilio") as "domicilio" | "mesa" | "recoger";
  const date = new Date(order.created_at);
  const dateStr = date.toLocaleDateString("es-CO", { day: "2-digit", month: "short" });
  const timeStr = date.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="bg-surface rounded-2xl shadow-sm border border-line overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-line-muted">
        <div className="flex items-center gap-2">
          <span className="font-extrabold text-fg text-base">#{order.order_number}</span>
          <span className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLOR[order.status] ?? "bg-surface-muted text-fg-muted"}`}>
            {live && <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse inline-block" />}
            {STATUS_LABEL[order.status] ?? order.status}
          </span>
        </div>
        <div className="text-xs text-fg-subtle text-right">
          <p>{dateStr}</p>
          <p>{timeStr}</p>
        </div>
      </div>

      {/* Body */}
      <div className="px-4 py-3 space-y-1">
        <div className="flex items-center gap-1.5 text-xs text-fg-muted">
          {ORDER_TYPE_ICON[order.order_type]}
          <span>{ORDER_TYPE_LABEL[order.order_type]}</span>
          {order.customer_name && (
            <span className="text-fg-subtle">· {order.customer_name}</span>
          )}
        </div>
        <p className="text-xs text-fg-muted line-clamp-2">{order.items_summary}</p>
      </div>

      {live && (
        <div className="px-4 pb-4 pt-2">
          <OrderTrackingTime status={order.status} orderType={orderType} />
        </div>
      )}

      {/* Footer */}
      <div className="px-4 py-2 bg-surface-muted flex justify-end">
        <span className="font-bold text-sm text-fg">${Number(order.total).toLocaleString("es-CO")}</span>
      </div>
    </div>
  );
}

export default function OrderHistoryView() {
  const { activeOrders, closedOrders, loading } = useOrderHistory();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-fg-subtle text-sm">Cargando pedidos…</p>
      </div>
    );
  }

  const empty = activeOrders.length === 0 && closedOrders.length === 0;

  if (empty) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
        <div className="bg-surface-muted p-6 rounded-full mb-4">
          <ClipboardList size={40} className="text-fg-subtle" />
        </div>
        <h2 className="text-lg font-bold text-fg">Sin pedidos aún</h2>
        <p className="text-fg-muted text-sm mt-1">Tus pedidos aparecerán aquí una vez que hagas uno.</p>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-8">
      <h1 className="text-2xl font-bold text-fg">Mis pedidos</h1>

      {activeOrders.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Clock size={16} className="text-yellow-500" />
            <h2 className="text-sm font-semibold text-fg-muted uppercase tracking-wide">En curso</h2>
          </div>
          <div className="space-y-3">
            {activeOrders.map((o) => <OrderCard key={o.id} order={o} live />)}
          </div>
        </section>
      )}

      {closedOrders.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle size={16} className="text-green-500" />
            <h2 className="text-sm font-semibold text-fg-muted uppercase tracking-wide">Completados</h2>
          </div>
          <div className="space-y-3">
            {closedOrders.map((o) => <OrderCard key={o.id} order={o} />)}
          </div>
        </section>
      )}
    </div>
  );
}
