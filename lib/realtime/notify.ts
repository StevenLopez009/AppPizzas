import "server-only";

export type RealtimeEvent =
  | { type: "order.created"; orderId: string; order: unknown }
  | { type: "order.updated"; orderId: string; order: unknown }
  | { type: "order.deleted"; orderId: string };

const URL = process.env.REALTIME_INTERNAL_URL;
const TOKEN = process.env.REALTIME_INTERNAL_TOKEN;

export async function notifyRealtime(event: RealtimeEvent) {
  console.log("ENTRO A notifyRealtime");
  console.log("notify url:", `${URL}/notify`);
  console.log("[notifyRealtime]", {
    URL,
    TOKEN: !!TOKEN,
    event,
  });
  if (!URL || !TOKEN) {
    console.error("Faltan variables de entorno");
    return;
  }
  try {
    const response = await fetch(`${URL}/notify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Internal-Token": TOKEN,
      },
      body: JSON.stringify(event),
    });

    console.log("notify status:", response.status);
  } catch (e) {
    console.error("[notifyRealtime] error:", e);
  }
}
