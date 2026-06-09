"use client";

import { loadStripe, Stripe } from "@stripe/stripe-js";

let stripePromise: Promise<Stripe | null>;

export function getStripe() {
  console.log(
    "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY:",
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  );
  if (!stripePromise) {
    stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
  }
  return stripePromise;
}
