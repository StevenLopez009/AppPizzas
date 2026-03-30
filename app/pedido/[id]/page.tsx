"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useParams } from "next/navigation";
import OrderTrackingTime from "@/components/orderTrackingTime/OrderTrackingTime";

export default function OrderPage() {
  const [orderType, setOrderType] = useState<
    "domicilio" | "mesa" | "recoger" | null
  >(null);
  const supabase = createClient();
  const params = useParams();
  const orderId = params.id as string;

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

  if (status === "entregado" || status === "listo_para_recoger") {
    return (
      <div className="p-10 text-center">
        <h1 className="text-2xl font-bold">Pedido finalizado ✅</h1>
        <p className="mt-4 text-gray-500">
          Tu pedido ya fue entregado. ¡Gracias por tu compra!
        </p>
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
