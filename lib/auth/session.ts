import { SignJWT, jwtVerify, type JWTPayload } from "jose";

const SESSION_COOKIE = "session";
const ALG = "HS256";
const MAX_AGE_S = 60 * 60 * 24 * 7;

export interface SessionPayload extends JWTPayload {
  sub: string;
  email: string;
  role: "user" | "admin";
}

function getSecret(): Uint8Array {
  const raw = process.env.SESSION_SECRET;
  if (!raw || raw.length < 32) {
    throw new Error(
      "SESSION_SECRET ausente o demasiado corto (>=32 chars). Revisa .env",
    );
  }
  return new TextEncoder().encode(raw);
}

export async function signSession(
  payload: Omit<SessionPayload, "iat" | "exp">,
): Promise<string> {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: ALG })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE_S}s`)
    .sign(getSecret());
}

export async function verifySession(
  token: string | undefined | null,
): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify<SessionPayload>(token, getSecret());
    return payload;
  } catch {
    return null;
  }
}

export const SESSION_CONFIG = {
  cookieName: SESSION_COOKIE,
  maxAgeSeconds: MAX_AGE_S,
};
