import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/cookies";
import { updateUserPoints } from "@/lib/repos/userPoints";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();

    const { id } = await params;
    const { points, reason } = (await req.json()) as {
      points: number;
      reason?: string;
    };

    if (points == null || typeof points !== "number") {
      return NextResponse.json({ error: "Invalid points value" }, { status: 400 });
    }

    await updateUserPoints(id, Math.max(0, points), reason || "admin_adjustment");

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[/api/admin/users/[id]/points PATCH]", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error updating points" },
      { status: 500 },
    );
  }
}
