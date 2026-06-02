/**
 * AppPizzas — servidor WebSocket simple.
 *
 * Endpoints WS:
 *   - /orders            → broadcast de TODOS los eventos (panel admin)
 *   - /orders/:orderId   → solo eventos de ese pedido (tracking cliente)
 *
 * Endpoint HTTP interno (POST):
 *   - /notify  body: { orderId, type, payload }
 *     Header X-Internal-Token debe coincidir con INTERNAL_TOKEN.
 *
 * Las API routes de Next.js llaman /notify cuando crean/actualizan pedidos
 * y este servidor reenvía a los clientes WS suscritos.
 */

const http = require("http");
const { WebSocketServer } = require("ws");

const PORT = Number(process.env.PORT || 3001);
const INTERNAL_TOKEN = process.env.INTERNAL_TOKEN || "";

const server = http.createServer((req, res) => {
  if (req.method === "GET" && req.url === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ ok: true }));
    return;
  }

  if (req.method === "POST" && req.url === "/notify") {
    if (!INTERNAL_TOKEN || req.headers["x-internal-token"] !== INTERNAL_TOKEN) {
      res.writeHead(401);
      res.end("unauthorized");
      return;
    }

    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1_000_000) req.destroy();
    });
    req.on("end", () => {
      try {
        const event = JSON.parse(body);
        broadcast(event);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ ok: true }));
      } catch {
        res.writeHead(400);
        res.end("bad json");
      }
    });
    return;
  }

  res.writeHead(404);
  res.end("not found");
});

const wss = new WebSocketServer({ noServer: true });

server.on("upgrade", (req, socket, head) => {
  const url = new URL(req.url, "http://localhost");
  const path = url.pathname;

  const allOrders = path === "/orders";
  const orderId = path.startsWith("/orders/") ? path.slice("/orders/".length) : null;

  if (!allOrders && !orderId) {
    socket.write("HTTP/1.1 404 Not Found\r\n\r\n");
    socket.destroy();
    return;
  }

  wss.handleUpgrade(req, socket, head, (ws) => {
    ws.subscribeAll = allOrders;
    ws.subscribeOrderId = orderId || null;
    ws.send(JSON.stringify({ type: "ready" }));
  });
});

function broadcast(event) {
  const msg = JSON.stringify(event);
  for (const client of wss.clients) {
    if (client.readyState !== 1) continue;
    if (client.subscribeAll) {
      client.send(msg);
    } else if (
      client.subscribeOrderId &&
      event.orderId === client.subscribeOrderId
    ) {
      client.send(msg);
    }
  }
}

setInterval(() => {
  for (const client of wss.clients) {
    if (client.readyState === 1) {
      try {
        client.ping();
      } catch {}
    }
  }
}, 30_000);

server.listen(PORT, () => {
  console.log(`[realtime] listening on ${PORT}`);
});
