import { NextResponse } from "next/server";
import {
  deleteProduct,
  getProduct,
  updateProduct,
} from "@/lib/repos/products";
import { requireAdmin } from "@/lib/auth/cookies";
import { deleteLocalImage } from "@/lib/storage/deleteImage";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ product });
}

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
  const patch = (await req.json()) as Parameters<typeof updateProduct>[1];
  const old = await getProduct(id);
  const product = await updateProduct(id, patch);
  if (!product) return NextResponse.json({ error: "not found" }, { status: 404 });

  // Si la imagen cambió, borrar la imagen anterior
  if (patch.image_url && old?.image_url && patch.image_url !== old.image_url) {
    await deleteLocalImage(old.image_url);
  }

  return NextResponse.json({ product });
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
  const product = await getProduct(id);
  await deleteProduct(id);

  // Borrar imagen del servidor
  if (product?.image_url) {
    await deleteLocalImage(product.image_url);
  }

  return NextResponse.json({ ok: true });
}
