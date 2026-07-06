import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/cookies";
import { deleteUser } from "@/lib/repos/userPoints";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();

    const { id } = await params;

    await deleteUser(id);

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Error eliminando usuario",
      },
      {
        status: 500,
      },
    );
  }
}
