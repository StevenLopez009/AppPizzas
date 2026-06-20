import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/cookies";
import { getAllUsersWithPoints } from "@/lib/repos/userPoints";

export async function GET(req: Request) {
  try {
    await requireAdmin();

    const users = await getAllUsersWithPoints();

    const formattedUsers = users.map((user) => ({
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      points: user.points,
      created_at:
        user.created_at instanceof Date
          ? user.created_at.toISOString()
          : String(user.created_at),
    }));

    return NextResponse.json({ users: formattedUsers });
  } catch (error) {
    console.error("[/api/admin/users-points GET]", error);
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
}
