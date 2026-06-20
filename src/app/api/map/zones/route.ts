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
        0,
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
  try {
    const zones = await query(`
      SELECT
        id,
        label,
        type,
        col_pos AS zoneCol,
        row_pos AS zoneRow,
        col_span AS colSpan,
        row_span AS rowSpan,
        occupied
      FROM restaurant_zones
      ORDER BY label ASC
    `);

    return NextResponse.json({ zones });
  } catch (error) {
    console.error("GET /api/map/zones", error);

    return NextResponse.json({ error: "Error loading zones" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();

    await query(
      `
      UPDATE restaurant_zones
      SET
        col_pos = ?,
        row_pos = ?
      WHERE id = ?
      `,
      [body.col, body.row, body.id],
    );

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json({ error: "Error updating zone" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    await query(
      `
      DELETE FROM restaurant_zones
      WHERE id = ?
      `,
      [id],
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error deleting zone" }, { status: 500 });
  }
}
