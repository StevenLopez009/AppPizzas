"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useOrdersStream } from "@/lib/realtime/client";
import {
  getOrderHistory,
  saveOrderToHistory,
  updateOrderStatusInHistory,
  isClosed,
  type StoredOrder,
} from "@/lib/orderHistory";

export function useOrderHistory() {
  const [orders, setOrders] = useState<StoredOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = getOrderHistory();
    if (stored.length === 0) {
      setLoading(false);
      return;
    }

    const active = stored.filter((o) => !isClosed(o.status));
    if (active.length === 0) {
      setOrders(stored);
      setLoading(false);
      return;
    }

    let cancelled = false;

    Promise.all(
      active.map(async (o) => {
        try {
          const { order } = await api.get<{ order: { status: string } }>(
            `/api/orders/${encodeURIComponent(o.id)}`,
          );
          if (!cancelled) {
            updateOrderStatusInHistory(o.id, order.status);
          }
          return { ...o, status: order.status };
        } catch {
          return o;
        }
      }),
    ).then((refreshed) => {
      if (cancelled) return;
      const closedIds = new Set(active.map((o) => o.id));
      const closed = stored.filter((o) => !closedIds.has(o.id));
      const all = [...refreshed, ...closed].sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );
      setOrders(all);
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  useOrdersStream(null, (event) => {
    if (event.type === "order.updated" && event.order) {
      const updated = event.order as { id: string; status: string };
      setOrders((prev) => {
        const exists = prev.find((o) => o.id === updated.id);
        if (!exists) return prev;
        const next = prev.map((o) =>
          o.id === updated.id ? { ...o, status: updated.status } : o,
        );
        // Persist the updated status
        updateOrderStatusInHistory(updated.id, updated.status);
        // If now closed, persist the full entry
        if (isClosed(updated.status)) {
          saveOrderToHistory({ ...exists, status: updated.status });
        }
        return next;
      });
    } else if (event.type === "order.deleted" && event.orderId) {
      setOrders((prev) => prev.filter((o) => o.id !== event.orderId));
    }
  });

  const activeOrders = orders.filter((o) => !isClosed(o.status));
  const closedOrders = orders.filter((o) => isClosed(o.status));

  return { activeOrders, closedOrders, loading };
}
