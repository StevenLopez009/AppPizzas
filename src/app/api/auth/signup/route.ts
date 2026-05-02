import { NextResponse } from "next/server";
import { createUser, findUserByEmail } from "@/lib/repos/users";
import { setSessionCookie } from "@/lib/auth/cookies";

export async function POST(req: Request) {
  try {
    const { email, password, name, phone } = (await req.json()) as {
      email?: string;
      password?: string;
      name?: string;
      phone?: string;
    };

    if (!email || !password || password.length < 6) {
      return NextResponse.json(
        { error: "Email y contraseña (mínimo 6) son requeridos" },
        { status: 400 },
      );
    }

    const existing = await findUserByEmail(email);
    if (existing) {
      return NextResponse.json(
        { error: "Ya existe un usuario con ese email" },
        { status: 409 },
      );
    }

    const user = await createUser({ email, password, name, phone });
    await setSessionCookie({ sub: user.id, email: user.email, role: user.role });
    return NextResponse.json({ user }, { status: 201 });
  } catch (e) {
    console.error("[/api/auth/signup]", e);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
