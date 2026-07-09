import { NextRequest, NextResponse } from "next/server";
import { createBorder, listBorders } from "@/lib/repos/borders";

export async function GET() {
  const borders = await listBorders();

  return NextResponse.json({ borders });
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  const border = await createBorder({
    name: body.name,
    active: body.active,
  });

  return NextResponse.json({ border }, { status: 201 });
}
