import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/cookies";
import { getUserPoints, getUserPointsHistory } from "@/lib/repos/userPoints";

export async function GET(req: Request) {
  try {
    const session = await requireAuth();
    const userId = session?.sub;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const points = await getUserPoints(userId);
    const history = await getUserPointsHistory(userId);

    return NextResponse.json({ points, history });
  } catch (error) {
    console.error("[/api/user-points GET]", error);
    return NextResponse.json(
      { error: "Error fetching points" },
      { status: 500 },
    );
  }
}
