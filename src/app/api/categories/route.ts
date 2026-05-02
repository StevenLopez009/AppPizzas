import { NextResponse } from "next/server";
import { listCategories, createCategory } from "@/lib/repos/categories";
import { requireAdmin } from "@/lib/auth/cookies";

export async function GET() {
  const categories = await listCategories();
  return NextResponse.json({ categories });
}

export async function POST(req: Request) {
  try { await requireAdmin(); } catch {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const { name, sort_order } = (await req.json()) as { name?: string; sort_order?: number };
  if (!name?.trim()) {
    return NextResponse.json({ error: "name requerido" }, { status: 400 });
  }
  try {
    const category = await createCategory(name, sort_order ?? 0);
    return NextResponse.json({ category }, { status: 201 });
  } catch (e: any) {
    if (e?.code === "ER_DUP_ENTRY") {
      return NextResponse.json({ error: "Ya existe una categoría con ese nombre" }, { status: 409 });
    }
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
