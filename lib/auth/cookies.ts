import "server-only";
import { cookies } from "next/headers";
import { SESSION_CONFIG, signSession, verifySession, type SessionPayload } from "./session";

export async function getSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  const token = store.get(SESSION_CONFIG.cookieName)?.value;
  return verifySession(token);
}

export async function setSessionCookie(payload: Omit<SessionPayload, "iat" | "exp">) {
  const token = await signSession(payload);
  const store = await cookies();
  store.set(SESSION_CONFIG.cookieName, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_CONFIG.maxAgeSeconds,
  });
}

export async function clearSessionCookie() {
  const store = await cookies();
  store.set(SESSION_CONFIG.cookieName, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

export async function requireAdmin() {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    throw Object.assign(new Error("forbidden"), { status: 403 });
  }
  return session;
}
