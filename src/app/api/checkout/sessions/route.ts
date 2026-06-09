import { NextResponse } from "next/server";
import { createCheckoutSession } from "@/lib/stripe/server";
import { getOrder } from "@/lib/repos/orders";
import { requireAuth } from "@/lib/auth/cookies";

export async function POST(req: Request) {
  try {
    await requireAuth();
  } catch {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const { orderId, customerEmail } = (await req.json()) as {
      orderId: string;
      customerEmail?: string | null;
    };

    if (!orderId) {
      return NextResponse.json({ error: "orderId required" }, { status: 400 });
    }

    const order = await getOrder(orderId);
    if (!order) {
      return NextResponse.json({ error: "order not found" }, { status: 404 });
    }

    const session = await createCheckoutSession({
      orderId,
      orderTotal: order.total,
      customerEmail: customerEmail || order.customer_email || undefined,
      orderNumber: order.order_number,
    });

    return NextResponse.json(
      { sessionId: session.id, clientSecret: session.client_secret },
      { status: 201 },
    );
  } catch (error) {
    console.error("[/api/checkout/sessions POST]", error);
    return NextResponse.json(
      { error: "Error creating checkout session" },
      { status: 500 },
    );
  }
}
