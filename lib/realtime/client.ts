"use client";

import { useEffect, useRef } from "react";

type Handler = (event: {
  type: string;
  orderId?: string;
  order?: unknown;
}) => void;

export function useOrdersStream(orderId: string | null, onEvent: Handler) {
  const handlerRef = useRef(onEvent);
  handlerRef.current = onEvent;

  useEffect(() => {
    let closed = false;
    let ws: WebSocket | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

    const proto = window.location.protocol === "https:" ? "wss:" : "ws:";
    const baseUrl = `${proto}//${window.location.hostname}:3001`;
    const path = orderId ? `/orders/${orderId}` : "/orders";

    const connect = () => {
      ws = new WebSocket(`${baseUrl}${path}`);
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
