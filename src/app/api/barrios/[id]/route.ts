import { NextResponse } from "next/server";
import { updateBarrio, deleteBarrio } from "@/lib/repos/barrios";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const patch = await req.json();
  const barrio = await updateBarrio(id, patch);
  if (!barrio) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  return NextResponse.json({ barrio });
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await deleteBarrio(id);
  return NextResponse.json({ ok: true });
}
