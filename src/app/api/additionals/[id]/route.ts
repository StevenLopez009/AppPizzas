import { NextResponse } from "next/server";
import {
  deleteAdditional,
  updateAdditional,
} from "@/lib/repos/additionals";
import { requireAdmin } from "@/lib/auth/cookies";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const { id } = await params;
  const patch = (await req.json()) as Parameters<typeof updateAdditional>[1];
  const additional = await updateAdditional(id, patch);
  if (!additional) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ additional });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const { id } = await params;
  await deleteAdditional(id);
  return NextResponse.json({ ok: true });
}
