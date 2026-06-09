"use client";

import { loadStripe, Stripe } from "@stripe/stripe-js";

let stripePromise: Promise<Stripe | null>;

export function getStripe() {
  if (!stripePromise) {
    stripePromise = loadStripe(
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
    );
  }
  return stripePromise;
}

export async function redirectToCheckout(sessionId: string) {
  const stripe = await getStripe();
  if (!stripe) throw new Error("Stripe is not available");

  const { error } = await stripe.redirectToCheckout({ sessionId });

  if (error) {
    throw new Error(error.message || "Failed to redirect to checkout");
  }
}
