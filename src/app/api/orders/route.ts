import { NextResponse } from "next/server";
import {
  createOrderWithItems,
  listOrders,
  type NewOrderItemInput,
} from "@/lib/repos/orders";
import { notifyRealtime } from "@/lib/realtime/notify";

export async function GET() {
  const orders = await listOrders();
  return NextResponse.json({ orders });
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      order: Parameters<typeof createOrderWithItems>[0];
      items: NewOrderItemInput[];
    };
    if (!body?.order || !Array.isArray(body?.items)) {
      return NextResponse.json(
        { error: "Body inválido. Se esperan { order, items }" },
        { status: 400 },
      );
    }
    const order = await createOrderWithItems(body.order, body.items);
    await notifyRealtime({
      type: "order.created",
      orderId: order.id,
      order,
    });
    return NextResponse.json({ order }, { status: 201 });
  } catch (e) {
    console.error("[/api/orders POST]", e);
    const detail =
      e instanceof Error
        ? e.message
        : typeof e === "string"
          ? e
          : "Error interno";
    return NextResponse.json(
      {
        error:
          process.env.NODE_ENV === "development" ? detail : "Error interno",
      },
      { status: 500 },
    );
  }
}
