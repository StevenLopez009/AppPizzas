import { NextResponse } from "next/server";
import {
  deleteOrder,
  getOrder,
  updateOrder,
} from "@/lib/repos/orders";
import { notifyRealtime } from "@/lib/realtime/notify";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const order = await getOrder(id);
  if (!order) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ order });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const patch = (await req.json()) as Parameters<typeof updateOrder>[1];
  const order = await updateOrder(id, patch);
  if (!order) return NextResponse.json({ error: "not found" }, { status: 404 });
  await notifyRealtime({ type: "order.updated", orderId: id, order });
  return NextResponse.json({ order });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  await deleteOrder(id);
  await notifyRealtime({ type: "order.deleted", orderId: id });
  return NextResponse.json({ ok: true });
}
