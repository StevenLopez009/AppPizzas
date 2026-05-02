import { NextResponse } from "next/server";
import {
  createAdditional,
  listAdditionals,
} from "@/lib/repos/additionals";
import { requireAdmin } from "@/lib/auth/cookies";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const category = url.searchParams.get("category") || undefined;
  const onlyActive = url.searchParams.get("active") === "1";
  const additionals = await listAdditionals({ category, onlyActive });
  return NextResponse.json({ additionals });
}

export async function POST(req: Request) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const body = (await req.json()) as {
    name?: string;
    price?: number | string;
    category?: string;
    active?: boolean;
  };
  if (!body.name) {
    return NextResponse.json({ error: "name requerido" }, { status: 400 });
  }
  const additional = await createAdditional({
    name: body.name,
    price: Number(body.price ?? 0),
    category: body.category ?? null,
    active: body.active,
  });
  return NextResponse.json({ additional }, { status: 201 });
}
