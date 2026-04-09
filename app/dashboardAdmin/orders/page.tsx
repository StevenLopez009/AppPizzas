"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface OrderItem {
  id: string;
  product_name: string;
  quantity: number;
  price: number;
  size: string;
  extra?: string | null;
  observations?: string | null;
}

interface Order {
  id: string;
  created_at: string;
  customer_name: string;
  customer_phone: string;
  payment_method: string;
  customer_address: string;
  neighborhood: string;
  lat?: number | null;
  lng?: number | null;
  total: number;
  status: string;
  order_type: "domicilio" | "mesa" | "recoger";
  order_items: OrderItem[];
}

const ORDER_FLOW = {
  domicilio: ["recibido", "cocinando", "enviado", "entregado"],
  mesa: ["recibido", "cocinando", "entregado"],
  recoger: ["recibido", "cocinando", "listo_para_recoger"],
};

export default function AdminDashboard() {
  const supabase = createClient();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getOrders = async () => {
      const { data, error } = await supabase
        .from("orders")
        .select(
          `
          id,
          created_at,
          customer_name,
          customer_phone,
          customer_address,
          payment_method,
          total,
          order_type,
          status,
          neighborhood,
          lat,
          lng,
          order_items (
            id,
            product_name,
            quantity,
            price,
            size,
            extra,
            observations
          )
        `,
        )
        .order("created_at", { ascending: false });

      if (error) {
        console.log(error);
      } else {
        console.log(data);
        setOrders(data as Order[]);
      }

      setLoading(false);
    };

    getOrders();
  }, []);

  if (loading) return <p className="p-10 text-center">Cargando pedidos...</p>;

  if (orders.length === 0)
    return <p className="p-10 text-center">No hay pedidos</p>;

  const changeStatus = async (order: Order) => {
    const flow = ORDER_FLOW[order.order_type];

    const index = flow.indexOf(order.status);

    const nextStatus = flow[index + 1];

    if (!nextStatus) return;

    const { error } = await supabase
      .from("orders")
      .update({ status: nextStatus })
      .eq("id", order.id);

    if (!error) {
      setOrders((prev) =>
        prev.map((o) => (o.id === order.id ? { ...o, status: nextStatus } : o)),
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-10">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl md:text-4xl font-bold mb-6">Pedidos</h1>

        {/* GRID RESPONSIVE */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-2xl shadow-md p-5 flex flex-col justify-between"
            >
              {/* HEADER */}
              <div className="flex justify-between items-start mb-4">
                <div className="space-y-1">
                  <p className="font-bold text-lg">{order.customer_name}</p>

                  <p className="text-sm text-gray-500">
                    📞 {order.customer_phone}
                  </p>

                  <p className="text-sm text-gray-500">
                    📍 {order.customer_address}
                  </p>

                  <p className="text-sm text-gray-400">
                    💳 {order.payment_method}
                  </p>

                  {order.order_type === "domicilio" && (
                    <p className="text-sm text-gray-400">
                      {order.neighborhood}
                    </p>
                  )}

                  {order.lat && order.lng && (
                    <a
                      href={`https://www.google.com/maps?q=${order.lat},${order.lng}`}
                      target="_blank"
                      className="text-blue-500 text-sm underline"
                    >
                      📍 Ver ubicación en mapa
                    </a>
                  )}
                </div>

                <div className="text-right">
                  <p className="text-xl font-bold">
                    ${Number(order.total).toLocaleString("es-CO")}
                  </p>

                  <span className="text-xs bg-orange-100 text-orange-600 px-3 py-1 rounded-full">
                    {order.status}
                  </span>
                </div>
              </div>

              {/* ITEMS */}
              <div className="border-t pt-3 pb-3 space-y-2">
                {order.order_items?.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <div>
                      🍕{item.quantity} {item.size}
                      <p className="text-md">
                        {item.product_name} • {item.extra || "sin extra"}
                      </p>
                      {item.observations && (
                        <p className="text-sm">{item.observations}</p>
                      )}
                    </div>
                    <p className="font-semibold">
                      $
                      {Number(item.price * item.quantity).toLocaleString(
                        "es-CO",
                      )}
                    </p>
                  </div>
                ))}
              </div>
              <button
                onClick={() => changeStatus(order)}
                className="w-full bg-orange-600 text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-orange-900/20 active:scale-95 transition-transform"
              >
                Cambiar estado
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
