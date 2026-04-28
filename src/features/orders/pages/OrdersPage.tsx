"use client";

import { useRouter } from "next/navigation";
import { useOrders } from "../hooks/useOrders";
import { useUserLocation } from "../hooks/useUserLocation";
import OrdersView from "../components/OrdersView";

export default function OrdersPage() {
  const router = useRouter();

  const { cart, total, updateQuantity, handleOrder } = useOrders();
  const { isInRestaurant } = useUserLocation();

  return (
    <OrdersView
      cart={cart}
      total={total}
      isInRestaurant={isInRestaurant}
      updateQuantity={updateQuantity}
      onOrder={handleOrder}
      onGoHome={() => router.push("/dashboard")}
    />
  );
}
