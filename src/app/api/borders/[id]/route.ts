import { NextRequest, NextResponse } from "next/server";
import { updateBorder, deleteBorder } from "@/lib/repos/borders";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await req.json();

  const border = await updateBorder(id, {
    name: body.name,
    active: body.active,
  });

  return NextResponse.json({ border });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  await deleteBorder(id);

  return NextResponse.json({ success: true });
}
