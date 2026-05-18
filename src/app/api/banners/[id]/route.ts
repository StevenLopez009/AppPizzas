import { NextResponse } from "next/server";
import { deleteBanner, getBanner } from "@/lib/repos/banners";
import { requireAdmin } from "@/lib/auth/cookies";
import { deleteLocalImage } from "@/lib/storage/deleteImage";

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
  const banner = await getBanner(id);
  await deleteBanner(id);

  // Borrar imagen del servidor
  if (banner?.image_url) {
    await deleteLocalImage(banner.image_url);
  }

  return NextResponse.json({ ok: true });
}
