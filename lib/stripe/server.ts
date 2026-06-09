import "server-only";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-04-10",
});

export async function createCheckoutSession({
  orderId,
  orderTotal,
  customerEmail,
  orderNumber,
}: {
  orderId: string;
  orderTotal: number;
  customerEmail?: string | null;
  orderNumber: number;
}) {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    customer_email: customerEmail || undefined,
    line_items: [
      {
        price_data: {
          currency: "cop",
          unit_amount: Math.round(orderTotal * 100),
          product_data: {
            name: `Pedido AppPizzas #${orderNumber}`,
            description: "Pago de pedido de pizzas",
          },
        },
        quantity: 1,
      },
    ],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/checkout/cancel`,
    metadata: {
      order_id: orderId,
      order_number: String(orderNumber),
    },
  });

  return session;
}

export function verifyWebhookSignature(
  body: string,
  signature: string,
): Stripe.Event | null {
  try {
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
    return event;
  } catch (error) {
    console.error("Webhook signature verification failed:", error);
    return null;
  }
}

export const stripeClient = stripe;
