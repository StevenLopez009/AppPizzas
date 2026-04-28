"use client";

import { useParams, useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useOrderTracking } from "../hooks/useOrderTracking";
import OrderPageView from "../components/OrderPageView";

export default function OrderPage() {
  const params = useParams();
  const router = useRouter();
  const { currentOrderId } = useCart();

  const orderId = (params?.id as string) || currentOrderId;

  const { status, orderType } = useOrderTracking(orderId);

  if (!orderId) {
    return <p className="p-10 text-center">Cargando pedido...</p>;
  }

  return (
    <OrderPageView
      status={status}
      orderType={orderType}
      onGoHome={() => router.push("/")}
    />
  );
}
