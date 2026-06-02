import { NextResponse } from "next/server";
import { listBarrios, createBarrio } from "@/lib/repos/barrios";

export async function GET() {
  const barrios = await listBarrios();
  return NextResponse.json({ barrios });
}

export async function POST(req: Request) {
  const { name, delivery_fee, sort_order } = await req.json();
  if (!name || delivery_fee === undefined) {
    return NextResponse.json({ error: "name y delivery_fee son requeridos" }, { status: 400 });
  }
  const barrio = await createBarrio(name, Number(delivery_fee), sort_order ?? 0);
  return NextResponse.json({ barrio }, { status: 201 });
}
