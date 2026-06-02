const STORAGE_KEY = "order_history";

export const CLOSED_STATUSES = new Set([
  "entregado",
  "listo_para_recoger",
]);

export interface StoredOrder {
  id: string;
  order_number: number;
  order_type: "domicilio" | "mesa" | "recoger";
  status: string;
  total: number;
  created_at: string;
  customer_name: string | null;
  items_summary: string;
}

export function getOrderHistory(): StoredOrder[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function saveOrderToHistory(order: StoredOrder): void {
  const history = getOrderHistory();
  const idx = history.findIndex((o) => o.id === order.id);
  if (idx >= 0) {
    history[idx] = order;
  } else {
    history.unshift(order);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
}

export function updateOrderStatusInHistory(id: string, status: string): void {
  const history = getOrderHistory();
  const order = history.find((o) => o.id === id);
  if (!order) return;
  order.status = status;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
}

export function isClosed(status: string): boolean {
  return CLOSED_STATUSES.has(status);
}
