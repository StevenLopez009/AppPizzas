import { NextResponse } from "next/server";
import { updateCategory, deleteCategory } from "@/lib/repos/categories";
import { requireAdmin } from "@/lib/auth/cookies";

async function guard() {
  try { await requireAdmin(); return null; }
  catch { return NextResponse.json({ error: "forbidden" }, { status: 403 }); }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const err = await guard(); if (err) return err;
  const { id } = await params;
  const body = (await req.json()) as { name?: string; sort_order?: number };
  try {
    const category = await updateCategory(id, body);
    if (!category) return NextResponse.json({ error: "not found" }, { status: 404 });
    return NextResponse.json({ category });
  } catch (e: any) {
    if (e?.code === "ER_DUP_ENTRY") {
      return NextResponse.json({ error: "Ya existe una categoría con ese nombre" }, { status: 409 });
    }
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const err = await guard(); if (err) return err;
  const { id } = await params;
  await deleteCategory(id);
  return NextResponse.json({ ok: true });
}
