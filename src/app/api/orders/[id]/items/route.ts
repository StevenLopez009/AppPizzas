import { NextResponse } from "next/server";
import { addOrderItem, getOrder, type NewOrderItemInput } from "@/lib/repos/orders";
import { notifyRealtime } from "@/lib/realtime/notify";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const item = (await req.json()) as NewOrderItemInput;
  const inserted = await addOrderItem(id, item);
  const order = await getOrder(id);
  if (order) await notifyRealtime({ type: "order.updated", orderId: id, order });
  return NextResponse.json({ item: inserted, order }, { status: 201 });
}
