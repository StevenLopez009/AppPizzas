"use client";

import { usePathname, useRouter } from "next/navigation";
import { useOrders } from "../hooks/useOrders";
import { useUserLocation } from "../hooks/useUserLocation";
import OrdersView from "../components/OrdersView";

export default function OrdersPage() {
  const router = useRouter();
  const pathname = usePathname();

  const { cart, total, updateQuantity, handleOrder } = useOrders();
  const { isInRestaurant } = useUserLocation();

  const goMenu = () => router.push("/dashboard");
  const showBackArrow = pathname !== "/dashboard";

  return (
    <OrdersView
      cart={cart}
      total={total}
      isInRestaurant={isInRestaurant}
      updateQuantity={updateQuantity}
      onOrder={handleOrder}
      onGoHome={goMenu}
      onBack={goMenu}
      showBackArrow={showBackArrow}
    />
  );
}
