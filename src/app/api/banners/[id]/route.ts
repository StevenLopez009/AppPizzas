import { NextResponse } from "next/server";
import { deleteBanner } from "@/lib/repos/banners";
import { requireAdmin } from "@/lib/auth/cookies";

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
  await deleteBanner(id);
  return NextResponse.json({ ok: true });
}
