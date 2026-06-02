import { NextResponse } from "next/server";
import { createClient } from "@/lib/repos/clients";

export async function POST(req: Request) {
  const body = (await req.json()) as {
    name?: string;
    email?: string;
    phone?: string;
  };
  if (!body.name || !body.email || !body.phone) {
    return NextResponse.json(
      { error: "name, email y phone son requeridos" },
      { status: 400 },
    );
  }
  const result = await createClient({
    name: body.name,
    email: body.email,
    phone: body.phone,
  });
  return NextResponse.json(result, { status: 201 });
}
