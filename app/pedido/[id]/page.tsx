"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useParams } from "next/navigation";

export default function OrderPage() {
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
        .select("status")
        .eq("id", orderId)
        .single();

      if (data) setStatus(data.status);
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
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [orderId]);

  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold">Seguimiento del pedido</h1>

      <p className="mt-6 text-2xl">Estado: {status ?? "Cargando pedido..."}</p>
    </div>
  );
}
