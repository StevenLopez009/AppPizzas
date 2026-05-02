import "server-only";

export type RealtimeEvent =
  | { type: "order.created"; orderId: string; order: unknown }
  | { type: "order.updated"; orderId: string; order: unknown }
  | { type: "order.deleted"; orderId: string };

const URL = process.env.REALTIME_INTERNAL_URL;
const TOKEN = process.env.REALTIME_INTERNAL_TOKEN;

export async function notifyRealtime(event: RealtimeEvent) {
  if (!URL || !TOKEN) return;
  try {
    await fetch(`${URL}/notify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Internal-Token": TOKEN,
      },
      body: JSON.stringify(event),
      cache: "no-store",
    });
  } catch (e) {
    console.error("[notifyRealtime] error:", e);
  }
}
