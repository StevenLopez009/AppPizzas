import { query } from "@/lib/db";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  await query(
    `
    DELETE FROM recipes
    WHERE id = ?
    `,
    [id],
  );

  return Response.json({
    success: true,
  });
}
