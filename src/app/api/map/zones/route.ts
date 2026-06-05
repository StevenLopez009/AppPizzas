import { query } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    await query(
      `
      INSERT INTO restaurant_zones (
        id,
        label,
        type,
        col_pos,
        row_pos,
        col_span,
        row_span,
        occupied
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        body.id,
        body.label,
        body.type,
        body.col,
        body.row,
        body.colSpan,
        body.rowSpan,
        false,
      ],
    );

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json({ success: false }, { status: 500 });
  }
}

export async function GET() {
  const zones = await query(
    `
    SELECT
      id,
      label,
      type,
      occupied
    FROM restaurant_zones
    ORDER BY label ASC
    `,
  );

  return NextResponse.json({
    zones,
  });
}
