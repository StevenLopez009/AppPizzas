"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export const useOrderTracking = (orderId: string | null) => {
  const supabase = createClient();

  const [status, setStatus] = useState<string | null>(null);
  const [orderType, setOrderType] = useState<
    "domicilio" | "mesa" | "recoger" | null
  >(null);

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

  return { status, orderType };
};
