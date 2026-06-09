import { NextResponse } from "next/server";
import { verifyWebhookSignature, stripeClient } from "@/lib/stripe/server";
import { updateOrder, getOrder } from "@/lib/repos/orders";
import { notifyRealtime } from "@/lib/realtime/notify";
import Stripe from "stripe";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 },
    );
  }

  const event = verifyWebhookSignature(body, signature);
  if (!event) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  try {
    switch (event.type) {
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const orderId = paymentIntent.metadata?.order_id;

        if (!orderId) {
          console.warn("payment_intent.succeeded without order_id metadata");
          break;
        }

        const order = await getOrder(orderId);
        if (!order) {
          console.warn(`Order not found: ${orderId}`);
          break;
        }

        // Actualizar orden a "recibido" si está en "pendiente_pago"
        if (order.status === "pendiente_pago") {
          await updateOrder(orderId, { status: "recibido" });

          // Notificar en tiempo real
          await notifyRealtime({
            event: "order.updated",
            data: {
              id: orderId,
              status: "recibido",
              payment_method: "stripe",
              payment_intent_id: paymentIntent.id,
            },
          });
        }

        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const orderId = paymentIntent.metadata?.order_id;

        if (!orderId) break;

        // Actualizar orden a "pago_rechazado"
        await updateOrder(orderId, {
          status: "pago_rechazado",
          payment_method: "stripe",
        });

        // Notificar
        await notifyRealtime({
          event: "order.updated",
          data: {
            id: orderId,
            status: "pago_rechazado",
            error: paymentIntent.last_payment_error?.message,
          },
        });

        break;
      }

      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        const paymentIntentId = charge.payment_intent as string;

        if (paymentIntentId) {
          const paymentIntent =
            await stripeClient.paymentIntents.retrieve(paymentIntentId);
          const orderId = paymentIntent.metadata?.order_id;

          if (orderId) {
            await updateOrder(orderId, { status: "reembolsado" });

            await notifyRealtime({
              event: "order.updated",
              data: {
                id: orderId,
                status: "reembolsado",
              },
            });
          }
        }

        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[/api/webhooks/stripe]", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 },
    );
  }
}
