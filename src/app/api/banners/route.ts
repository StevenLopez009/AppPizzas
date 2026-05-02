import { NextResponse } from "next/server";
import { createBanner, listBanners } from "@/lib/repos/banners";
import { requireAdmin } from "@/lib/auth/cookies";

export async function GET() {
  const banners = await listBanners();
  return NextResponse.json({ banners });
}

export async function POST(req: Request) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const { image_url } = (await req.json()) as { image_url?: string };
  if (!image_url) {
    return NextResponse.json({ error: "image_url requerido" }, { status: 400 });
  }
  const banner = await createBanner(image_url);
  return NextResponse.json({ banner }, { status: 201 });
}
