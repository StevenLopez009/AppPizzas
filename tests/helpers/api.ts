import { vi } from "vitest";

export type FetchHandler = (
  url: string,
  init?: RequestInit,
) => Promise<Response> | Response | undefined;

/**
 * Stub de `global.fetch` con resoluciones por ruta.
 *
 * routes: { "GET /api/products": { products: [...] } }
 *         "POST /api/auth/login": { user: {...} }
 *         "POST /api/auth/login": { __status: 401, error: "Bad" }
 */
export function stubFetch(
  routes: Record<string, unknown | ((init?: RequestInit) => unknown)>,
  fallback?: FetchHandler,
) {
  const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const method = (init?.method ?? "GET").toUpperCase();
    const url = typeof input === "string" ? input : input.toString();
    const key = `${method} ${url}`;

    if (key in routes) {
      const value = routes[key];
      const resolved =
        typeof value === "function"
          ? (value as (init?: RequestInit) => unknown)(init)
          : value;

      const status = (resolved as { __status?: number })?.__status ?? 200;
      const body = JSON.stringify(resolved ?? {});
      return new Response(body, {
        status,
        headers: { "content-type": "application/json" },
      });
    }

    if (fallback) {
      const r = await fallback(url, init);
      if (r) return r;
    }

    return new Response(JSON.stringify({ error: `unhandled ${key}` }), {
      status: 404,
      headers: { "content-type": "application/json" },
    });
  });

  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}
