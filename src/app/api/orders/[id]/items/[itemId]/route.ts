import { NextResponse } from "next/server";
import { deleteOrderItem, getOrder } from "@/lib/repos/orders";
import { notifyRealtime } from "@/lib/realtime/notify";

export async function DELETE(
  req: Request,
  {
    params,
  }: {
    params: Promise<{
      id: string;
      itemId: string;
    }>;
  },
) {
  const { id, itemId } = await params;

  await deleteOrderItem(id, itemId);

  const order = await getOrder(id);

  if (order) {
    await notifyRealtime({
      type: "order.updated",
      orderId: id,
      order,
    });
  }

  return NextResponse.json({
    success: true,
    order,
  });
}
