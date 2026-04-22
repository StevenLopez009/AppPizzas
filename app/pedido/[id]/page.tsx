"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useParams } from "next/navigation";
import OrderTrackingTime from "@/components/orderTrackingTime/OrderTrackingTime";
import { useCart } from "@/context/CartContext";
import { ShoppingBasket } from "lucide-react";
import { useRouter } from "next/navigation";

export default function OrderPage() {
  const [orderType, setOrderType] = useState<
    "domicilio" | "mesa" | "recoger" | null
  >(null);
  const supabase = createClient();
  const params = useParams();
  const { currentOrderId } = useCart();
  const orderId = (params?.id as string) || currentOrderId;
  const router = useRouter();

  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) return;
    localStorage.setItem("last_order_id", orderId);

    const getOrder = async () => {
      const { data } = await supabase
        .from("orders")
        .select("status, order_type")
        .eq("id", orderId)
        .single();

      if (data) {
        setStatus(data.status);
        setOrderType(data.order_type);
      }
    };

    getOrder();

    const channel = supabase
      .channel("order-" + orderId)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "orders",
          filter: `id=eq.${orderId}`,
        },
        (payload) => {
          setStatus(payload.new.status);
          setOrderType(payload.new.order_type);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [orderId]);

  if (!orderId) {
    return <p className="p-10 text-center">Cargando pedido...</p>;
  }

  if (status === "entregado" || status === "listo_para_recoger") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-6 text-center">
        <div className="bg-gray-100 p-6 rounded-full mb-4">
          <ShoppingBasket size={48} className="text-gray-400" />
        </div>
        <h2 className="text-xl font-bold text-gray-800">
          No tienes pedidos activos
        </h2>
        <p className="text-gray-500 mt-2 mb-6">Añade una pizza deliciosa.</p>
        <button
          onClick={() => router.push("/")}
          className="bg-orange-500 text-white px-8 py-3 rounded-2xl font-bold shadow-lg shadow-orange-200"
        >
          Ver Menú
        </button>
      </div>
    );
  }

  if (!status || !orderType) {
    return <p className="p-10 text-center">Cargando pedido...</p>;
  }

  return (
    <div className="p-10">
      <OrderTrackingTime status={status} orderType={orderType} />
    </div>
  );
}
