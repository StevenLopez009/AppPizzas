import { NextResponse } from "next/server";
import { createProduct, listProducts } from "@/lib/repos/products";
import { requireAdmin } from "@/lib/auth/cookies";

export async function GET() {
  const products = await listProducts();
  return NextResponse.json({ products });
}

export async function POST(req: Request) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  try {
    const body = (await req.json()) as {
      name?: string;
      description?: string;
      prices?: Array<{ label: string; price: number }>;
      image_url?: string;
      category?: string;
    };
    if (!body.name) {
      return NextResponse.json({ error: "name requerido" }, { status: 400 });
    }
    const product = await createProduct({
      name: body.name,
      description: body.description ?? null,
      prices: body.prices ?? [],
      image_url: body.image_url ?? null,
      category: body.category ?? null,
    });
    return NextResponse.json({ product }, { status: 201 });
  } catch (e) {
    console.error("[/api/products POST]", e);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
