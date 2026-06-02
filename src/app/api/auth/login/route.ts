import { NextResponse } from "next/server";
import { findUserByEmail } from "@/lib/repos/users";
import { verifyPassword } from "@/lib/auth/password";
import { setSessionCookie } from "@/lib/auth/cookies";

export async function POST(req: Request) {
  try {
    const { email, password } = (await req.json()) as {
      email?: string;
      password?: string;
    };
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email y contraseña requeridos" },
        { status: 400 },
      );
    }

    const found = await findUserByEmail(email);
    if (!found) {
      return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 });
    }

    const ok = await verifyPassword(password, found.password_hash);
    if (!ok) {
      return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 });
    }

    await setSessionCookie({
      sub: found.user.id,
      email: found.user.email,
      role: found.user.role,
    });

    return NextResponse.json({ user: found.user });
  } catch (e) {
    console.error("[/api/auth/login]", e);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
