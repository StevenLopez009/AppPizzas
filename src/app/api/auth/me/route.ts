import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/cookies";
import { findUserById } from "@/lib/repos/users";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ user: null }, { status: 200 });

  const user = await findUserById(session.sub);
  return NextResponse.json({ user });
}
