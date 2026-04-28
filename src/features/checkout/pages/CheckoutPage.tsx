"use client";

import CheckoutView from "../components/CheckoutView";
import { useCheckout } from "../hooks/useCheckout";

export default function CheckoutPage() {
  const checkout = useCheckout();

  return <CheckoutView {...checkout} />;
}
