"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { BookMinus, PrinterIcon, TrashIcon } from "lucide-react";
import { useRouter } from "next/navigation";

interface OrderItem {
  id: string;
  product_name: string;
  quantity: number;
  price: number;
  size: string;
  extra?: string | null;
  observations?: string | null;
  additionals?: Array<{ name: string; price: number }> | null;
}

interface Order {
  id: string;
  created_at: string;
  customer_name: string;
  customer_phone: string;
  payment_method: string;
  cash_amount?: number | null;
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
  const router = useRouter();
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
          cash_amount,
          order_items (
            id,
            product_name,
            quantity,
            price,
            size,
            extra,
            observations,
            additionals
          )
        `,
        )
        .order("created_at", { ascending: false });

      if (error) {
        console.log(error);
      } else {
        setOrders(data as Order[]);
      }

      setLoading(false);
    };

    getOrders();
  }, []);

  const openInvoice = (orderId: string) => {
    window.open(`/dashboardAdmin/factura/${orderId}`, "_blank");
  };

  const openKitchenOrder = (orderId: string) => {
    window.open(`/dashboardAdmin/comanda/${orderId}`, "_blank");
  };

  const deleteOrder = async (orderId: string, customerName: string) => {
    const confirmDelete = window.confirm(
      `¿Estás seguro de eliminar el pedido de ${customerName}?\n\nEsta acción no se puede deshacer.`,
    );

    if (!confirmDelete) return;

    try {
      const { error: itemsError } = await supabase
        .from("order_items")
        .delete()
        .eq("order_id", orderId);

      if (itemsError) throw itemsError;
      const { error: orderError } = await supabase
        .from("orders")
        .delete()
        .eq("id", orderId);

      if (orderError) throw orderError;

      setOrders((prevOrders) => prevOrders.filter((o) => o.id !== orderId));
    } catch (error) {
      console.error("Error eliminando pedido:", error);
      alert("❌ Error al eliminar el pedido. Por favor, intenta de nuevo.");
    }
  };

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
                  <p className="text-sm text-gray-400">
                    {order.cash_amount
                      ? `Paga con $${order.cash_amount.toLocaleString("es-CO")}`
                      : "No especificado"}
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
                        {item.product_name} •{" "}
                        {item.extra ? `borde ${item.extra}` : "sin borde"}
                      </p>
                      {item.observations && (
                        <p className="text-sm">{item.observations}</p>
                      )}
                      {item.additionals && (
                        <p className="text-gray-500 text-xs mt-1">
                          Adicional: {item.additionals?.[0]?.name} (+$
                          {item.additionals?.[0]?.price.toLocaleString("es-CO")}
                          )
                        </p>
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
              <div className="space-y-4 mt-4">
                <div className="flex flex-row gap-3">
                  <button
                    onClick={() => deleteOrder(order.id, order.customer_name)}
                    className="w-full  hover:bg-red-600 text-black py-3 rounded-2xl font-semibold text-base shadow-md hover:shadow-lg shadow-red-900/20 transition-all duration-200 active:scale-95 flex items-center justify-center gap-2"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => openKitchenOrder(order.id)}
                    className="w-full hover:bg-green-600 text-black py-3 rounded-2xl font-semibold text-base shadow-md hover:shadow-lg shadow-green-900/20 transition-all duration-200 active:scale-95 flex items-center justify-center gap-2"
                  >
                    <PrinterIcon className="w-5 h-5" />
                  </button>

                  <button
                    onClick={() => openInvoice(order.id)}
                    className="w-full  hover:bg-blue-600 text-black py-3 rounded-2xl font-semibold text-base shadow-md hover:shadow-lg shadow-blue-900/20 transition-all duration-200 active:scale-95 flex items-center justify-center gap-2"
                  >
                    <BookMinus className="w-5 h-5" />
                  </button>
                </div>
                <button
                  onClick={() => changeStatus(order)}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white py-5 rounded-3xl font-bold text-lg shadow-lg hover:shadow-xl shadow-orange-900/30 transition-all duration-200 active:scale-95 flex items-center justify-center gap-2"
                >
                  Cambiar estado
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
