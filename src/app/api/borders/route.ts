import { NextResponse } from "next/server";
import { listBorders } from "@/lib/repos/borders";

export async function GET() {
  const borders = await listBorders();

  return NextResponse.json({ borders });
}
