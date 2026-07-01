import { query } from "@/lib/db";

export async function GET() {
  try {
    const recipes = await query(
      `
      SELECT *
      FROM recipes
      ORDER BY created_at DESC
      `,
    );

    return Response.json(recipes);
  } catch (error) {
    console.error(error);

    return Response.json(
      { message: "Error obteniendo recetas" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    await query(
      `
      INSERT INTO recipes
      (
        id,
        name,
        sale_price,
        extra_costs,
        ingredients
      )
      VALUES
      (
        UUID(),
        ?,
        ?,
        ?,
        ?
      )
      `,
      [
        body.name,
        body.salePrice,
        body.extraCosts,
        JSON.stringify(body.ingredients),
      ],
    );

    return Response.json({
      success: true,
    });
  } catch (error) {
    console.error(error);

    return Response.json(
      { message: "Error guardando receta" },
      { status: 500 },
    );
  }
}
