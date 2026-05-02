"use client";

import { useEffect, useRef } from "react";

type Handler = (event: { type: string; orderId?: string; order?: unknown }) => void;

const BASE_URL = process.env.NEXT_PUBLIC_REALTIME_WS_URL ?? "ws://localhost:3001";

/**
 * Hook que abre un WebSocket al servidor realtime y llama `onEvent` con cada
 * mensaje recibido. Si `orderId` es null, suscribe a todos los pedidos.
 */
export function useOrdersStream(orderId: string | null, onEvent: Handler) {
  const handlerRef = useRef(onEvent);
  handlerRef.current = onEvent;

  useEffect(() => {
    let closed = false;
    let ws: WebSocket | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

    const path = orderId ? `/orders/${orderId}` : "/orders";

    const connect = () => {
      ws = new WebSocket(`${BASE_URL}${path}`);
      ws.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data);
          handlerRef.current(data);
        } catch {
          // ignore
        }
      };
      ws.onclose = () => {
        if (closed) return;
        reconnectTimer = setTimeout(connect, 2000);
      };
      ws.onerror = () => {
        try {
          ws?.close();
        } catch {}
      };
    };

    connect();

    return () => {
      closed = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      try {
        ws?.close();
      } catch {}
    };
  }, [orderId]);
}
