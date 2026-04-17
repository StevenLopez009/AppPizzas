"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { BookMinus, PrinterIcon, TrashIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";

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
  const [dateRange, setDateRange] = useState<{
    from?: Date;
    to?: Date;
  }>({});

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

  const filteredOrders = orders.filter((order) => {
    if (!dateRange.from && !dateRange.to) return true;

    const orderDate = new Date(order.created_at);

    if (dateRange.from && orderDate < dateRange.from) return false;
    if (dateRange.to) {
      const end = new Date(dateRange.to);
      end.setHours(23, 59, 59, 999);
      if (orderDate > end) return false;
    }

    return true;
  });

  const totalSales = filteredOrders.reduce((acc, o) => acc + o.total, 0);
  const totalOrders = filteredOrders.length;

  const byType = filteredOrders.reduce(
    (acc, o) => {
      acc[o.order_type]++;
      return acc;
    },
    { domicilio: 0, mesa: 0, recoger: 0 },
  );

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-10">
      <h1 className="text-2xl md:text-4xl font-bold mb-6">Pedidos</h1>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full md:w-[300px] justify-start"
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {dateRange?.from
              ? dateRange.to
                ? `${dateRange.from.toLocaleDateString()} - ${dateRange.to.toLocaleDateString()}`
                : dateRange.from.toLocaleDateString()
              : "Seleccionar fechas"}
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-auto p-0">
          <Calendar
            mode="range"
            selected={dateRange}
            onSelect={(range) => setDateRange(range || {})}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl shadow">
          <p className="text-sm text-gray-400">Ventas</p>
          <p className="text-xl font-bold">
            ${totalSales.toLocaleString("es-CO")}
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl shadow">
          <p className="text-sm text-gray-400">Pedidos</p>
          <p className="text-xl font-bold">{totalOrders}</p>
        </div>

        <div className="bg-white p-4 rounded-xl shadow">
          <p className="text-sm text-gray-400">Domicilios</p>
          <p className="text-xl font-bold">{byType.domicilio}</p>
        </div>

        <div className="bg-white p-4 rounded-xl shadow">
          <p className="text-sm text-gray-400">Mesa/Recoger</p>
          <p className="text-xl font-bold">{byType.mesa + byType.recoger}</p>
        </div>
      </div>
      <div className="flex gap-2 mt-4 flex-wrap">
        <button
          onClick={() => {
            const today = new Date();
            setDateRange({ from: today, to: today });
          }}
          className="px-4 py-2 bg-gray-200 rounded-xl"
        >
          Hoy
        </button>

        <button
          onClick={() => {
            const today = new Date();
            const firstDay = new Date(
              today.setDate(today.getDate() - today.getDay()),
            );
            const lastDay = new Date();
            setDateRange({ from: firstDay, to: lastDay });
          }}
          className="px-4 py-2 bg-gray-200 rounded-xl"
        >
          Esta semana
        </button>

        <button
          onClick={() => {
            const now = new Date();
            const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
            const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            setDateRange({ from: firstDay, to: lastDay });
          }}
          className="px-4 py-2 bg-gray-200 rounded-xl"
        >
          Este mes
        </button>

        <button
          onClick={() => setDateRange({})}
          className="px-4 py-2 bg-red-100 text-red-600 rounded-xl"
        >
          Limpiar
        </button>
      </div>
      <div className="max-w-7xl mx-auto mt-6 mb-20">
        {/* GRID RESPONSIVE */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredOrders.map((order) => (
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
