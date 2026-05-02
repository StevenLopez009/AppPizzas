"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useOrdersStream } from "@/lib/realtime/client";

interface OrderSnapshot {
  status: string;
  order_type: "domicilio" | "mesa" | "recoger";
}

export const useOrderTracking = (orderId: string | null) => {
  const [status, setStatus] = useState<string | null>(null);
  const [orderType, setOrderType] = useState<
    "domicilio" | "mesa" | "recoger" | null
  >(null);

  useEffect(() => {
    if (!orderId) return;
    localStorage.setItem("last_order_id", orderId);

    let cancelled = false;
    (async () => {
      try {
        const { order } = await api.get<{ order: OrderSnapshot }>(
          `/api/orders/${encodeURIComponent(orderId)}`,
        );
        if (cancelled) return;
        setStatus(order.status);
        setOrderType(order.order_type);
      } catch {
        // silencio
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [orderId]);

  useOrdersStream(orderId, (event) => {
    if (event.type !== "order.updated" || !event.order) return;
    const o = event.order as Partial<OrderSnapshot>;
    if (o.status) setStatus(o.status);
    if (o.order_type) setOrderType(o.order_type);
  });

  return { status, orderType };
};
