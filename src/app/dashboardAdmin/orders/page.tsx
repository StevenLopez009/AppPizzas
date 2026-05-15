"use client";

import { useEffect, useState } from "react";
import { BookMinus, Plus, PrinterIcon, TrashIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { api } from "@/lib/api";
import { useOrdersStream } from "@/lib/realtime/client";

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
  order_number: number;
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
  table_number?: number | null;
  order_type: "domicilio" | "mesa" | "recoger";
  order_items: OrderItem[];
  discount_percentage: number;
  delivery_fee?: number;
}

const ORDER_FLOW = {
  domicilio: ["recibido", "cocinando", "enviado", "entregado"],
  mesa: ["recibido", "cocinando", "entregado"],
  recoger: ["recibido", "cocinando", "listo_para_recoger"],
};

export default function AdminDashboard() {
  const router = useRouter();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<{
    from?: Date;
    to?: Date;
  }>({});
  const [activeDiscount, setActiveDiscount] = useState<string | null>(null);
  const [discounts, setDiscounts] = useState<Record<string, number>>({});
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [extraName, setExtraName] = useState("");
  const [extraPrice, setExtraPrice] = useState("");
  const [pendingStatus, setPendingStatus] = useState<Record<string, string>>(
    {},
  );
  const [search, setSearch] = useState("");

  const STATUS_STYLES: Record<string, string> = {
    recibido: "bg-gray-500 text-gray-700",
    cocinando: "bg-yellow-500 text-yellow-800",
    enviado: "bg-blue-500 text-blue-800",
    entregado: "bg-green-500 text-green-800",
    listo_para_recoger: "bg-green-500 text-purple-800",
  };

  const STATUS_BTN: Record<string, string> = {
    recibido: "bg-gray-500 hover:bg-gray-600",
    cocinando: "bg-yellow-500 hover:bg-yellow-600",
    enviado: "bg-blue-500 hover:bg-blue-600",
    entregado: "bg-green-500 hover:bg-green-600",
    listo_para_recoger: "bg-green-500 hover:bg-green-600",
  };

  async function refreshOrders() {
    try {
      const { orders } = await api.get<{ orders: Order[] }>("/api/orders");
      setOrders(orders);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refreshOrders();
  }, []);

  useOrdersStream(null, (event) => {
    if (event.type === "order.created" && event.order) {
      const incoming = event.order as Order;
      setOrders((prev) =>
        prev.find((o) => o.id === incoming.id) ? prev : [incoming, ...prev],
      );
      router;
    } else if (event.type === "order.updated" && event.order) {
      const updated = event.order as Order;
      setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
    } else if (event.type === "order.deleted" && event.orderId) {
      setOrders((prev) => prev.filter((o) => o.id !== event.orderId));
    }
  });

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
      await api.delete(`/api/orders/${encodeURIComponent(orderId)}`);
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
      toast.success("Pedido eliminado");
    } catch (e) {
      console.error("Error eliminando pedido:", e);
      toast.error("Error al eliminar el pedido. Intenta de nuevo.");
    }
  };

  if (loading) return <p className="p-10 text-center">Cargando pedidos...</p>;

  if (orders.length === 0)
    return <p className="p-10 text-center">No hay pedidos</p>;

  const changeStatus = async (order: Order, targetStatus?: string) => {
    const flow = ORDER_FLOW[order.order_type];
    const status =
      targetStatus ??
      (() => {
        const index = flow.indexOf(order.status);
        return flow[index + 1];
      })();
    if (!status) return;

    try {
      const { order: updated } = await api.patch<{ order: Order }>(
        `/api/orders/${encodeURIComponent(order.id)}`,
        { status },
      );
      setOrders((prev) => prev.map((o) => (o.id === order.id ? updated : o)));
      setPendingStatus((prev) => {
        const next = { ...prev };
        delete next[order.id];
        return next;
      });
    } catch (e) {
      console.error(e);
    }
  };

  const formatItem = (item: OrderItem) => {
    // Pizza por mitades
    if (item.extra?.includes("Mitades:")) {
      const mitadesMatch = item.extra.match(/Mitades:\s*([^|]+)/);
      const bordesMatch = item.extra.match(/Bordes:\s*([^|]+)/);
      const adicionalesMatch = item.extra.match(/Adicionales:\s*(.*)/);
      const sabores = mitadesMatch?.[1]?.split("/").map((s) => s.trim());
      const bordes = bordesMatch?.[1]?.split("/").map((b) => b.trim());
      const adicionales = adicionalesMatch?.[1]?.trim();
      return `${item.quantity}x ${item.product_name} ${item.size ?? ""} — ${sabores?.[0] ?? ""} (borde ${bordes?.[0] ?? "normal"}) / ${sabores?.[1] ?? ""} (borde ${bordes?.[1] ?? "normal"})${adicionales ? `, adicionales: ${adicionales}` : ""}`
        .replace(/\s+/g, " ")
        .trim();
    }

    // Cualquier otro producto
    const parts: string[] = [`${item.quantity}x ${item.product_name}`];
    if (item.size && item.size !== "extra") parts.push(item.size);
    if (item.extra) parts.push(item.extra);
    return parts.join(", ");
  };

  const filteredOrders = orders.filter((order) => {
    const orderDate = new Date(order.created_at);
    if (dateRange.from && orderDate < dateRange.from) return false;
    if (dateRange.to && orderDate > dateRange.to) return false;
    if (
      search &&
      !(order.customer_name || "").toLowerCase().includes(search.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const totalSales = filteredOrders.reduce((acc, o) => {
    const final = o.total - (o.total * (o.discount_percentage || 0)) / 100;
    return acc + final;
  }, 0);

  const applyDiscount = async (order: Order) => {
    const discount = discounts[order.id];
    if (discount === undefined || discount < 0 || discount > 100) {
      toast.error("Descuento inválido");
      return;
    }

    try {
      const { order: updated } = await api.patch<{ order: Order }>(
        `/api/orders/${encodeURIComponent(order.id)}`,
        { discount_percentage: discount },
      );
      setOrders((prev) => prev.map((o) => (o.id === order.id ? updated : o)));
      setActiveDiscount(null);
      toast.success("Descuento aplicado");
    } catch (e) {
      console.error(e);
      toast.error("Error aplicando descuento");
    }
  };

  const byType = filteredOrders.reduce(
    (acc, o) => {
      acc[o.order_type]++;
      return acc;
    },
    { domicilio: 0, mesa: 0, recoger: 0 },
  );

  const handleAddExtra = async () => {
    if (!extraName || !extraPrice || !selectedOrder) {
      toast.error("Completa los campos");
      return;
    }

    try {
      const { order: updated } = await api.post<{ order: Order }>(
        `/api/orders/${encodeURIComponent(selectedOrder)}/items`,
        {
          product_name: extraName,
          quantity: 1,
          price: Number(extraPrice),
          size: "extra",
        },
      );
      if (updated) {
        setOrders((prev) =>
          prev.map((o) => (o.id === updated.id ? updated : o)),
        );
      }
      toast.success("Extra agregado");
    } catch (e) {
      console.error(e);
      toast.error("Error agregando extra");
    }

    setExtraName("");
    setExtraPrice("");
    setSelectedOrder(null);
  };

  return (
    <div className="min-h-screen bg-canvas p-4 md:p-10">
      <h1 className="text-2xl md:text-4xl font-bold text-fg mb-6">Pedidos</h1>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="
        w-full md:w-[300px] justify-start
        rounded-2xl border-line bg-surface
        shadow-sm hover:shadow-md
        transition-all duration-200
        text-fg font-medium
      "
          >
            <CalendarIcon className="mr-2 h-4 w-4 text-brand" />
            {dateRange?.from
              ? dateRange.to
                ? `${dateRange.from.toLocaleDateString()} - ${dateRange.to.toLocaleDateString()}`
                : dateRange.from.toLocaleDateString()
              : "Seleccionar fechas"}
          </Button>
        </PopoverTrigger>

        <PopoverContent
          className="
      w-auto p-4
      rounded-2xl border border-line
      shadow-xl
      bg-surface
    "
        >
          <div className="rounded-xl overflow-hidden">
            <Calendar
              mode="range"
              selected={
                dateRange.from
                  ? { from: dateRange.from, to: dateRange.to }
                  : undefined
              }
              onSelect={(range) =>
                setDateRange(range ? { from: range.from, to: range.to } : {})
              }
              numberOfMonths={2}
              className="p-2"
            />
          </div>
        </PopoverContent>
      </Popover>
      <input
        type="text"
        placeholder="Buscar cliente..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full md:w-[300px] mt-4 px-4 py-2 rounded-xl border border-line bg-canvas text-fg placeholder:text-fg-subtle focus:outline-none focus:ring-2 focus:ring-brand-ring"
      />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 mt-6">
        {[
          { label: "Ventas", value: `$${totalSales.toLocaleString("es-CO")}` },
          { label: "Domicilios", value: byType.domicilio },
          { label: "Mesa", value: byType.mesa },
          { label: "Recoger", value: byType.recoger },
        ].map(({ label, value }) => (
          <div
            key={label}
            className="bg-surface border border-line p-4 rounded-xl shadow-sm"
          >
            <p className="text-sm text-fg-muted">{label}</p>
            <p className="text-xl font-bold text-fg">{value}</p>
          </div>
        ))}
      </div>
      <div className="flex gap-2 mt-4 flex-wrap">
        {[
          {
            label: "Hoy",
            onClick: () => {
              const today = new Date();
              const start = new Date(today);
              start.setHours(0, 0, 0, 0);
              const end = new Date(today);
              end.setHours(23, 59, 59, 999);
              setDateRange({ from: start, to: end });
            },
          },
          {
            label: "Esta semana",
            onClick: () => {
              const today = new Date();
              const firstDay = new Date(
                today.setDate(today.getDate() - today.getDay()),
              );
              setDateRange({ from: firstDay, to: new Date() });
            },
          },
          {
            label: "Este mes",
            onClick: () => {
              const now = new Date();
              setDateRange({
                from: new Date(now.getFullYear(), now.getMonth(), 1),
                to: new Date(now.getFullYear(), now.getMonth() + 1, 0),
              });
            },
          },
        ].map(({ label, onClick }) => (
          <button
            key={label}
            onClick={onClick}
            className="px-4 py-2 bg-surface border border-line rounded-xl shadow-sm hover:shadow-md text-fg font-medium transition-all duration-150 active:scale-95"
          >
            {label}
          </button>
        ))}
        <button
          onClick={() => setDateRange({})}
          className="px-4 py-2 bg-surface border border-red-200 dark:border-red-900/50 rounded-xl shadow-sm hover:shadow-md text-red-500 font-medium transition-all duration-150 active:scale-95"
        >
          Limpiar
        </button>
      </div>
      <div className="max-w-7xl mx-auto mt-6 mb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredOrders.map((order) => {
            const finalTotal =
              order.total -
              (order.total * (order.discount_percentage || 0)) / 100;

            return (
              <div
                key={order.id}
                className="bg-surface border border-line rounded-2xl shadow-md overflow-hidden flex flex-col justify-between"
              >
                {/* Order number header */}
                <div className="bg-surface-raised px-5 py-2 flex items-center justify-between border-b border-line">
                  <span className="text-fg font-extrabold text-lg tracking-wide">
                    Pedido&nbsp;#{order.order_number}
                  </span>
                  <span className="text-xs text-fg-subtle">
                    {new Date(order.created_at).toLocaleTimeString("es-CO", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>

                <div className="p-5 flex flex-col flex-1 justify-between">
                  <div className="flex justify-between items-start mb-4">
                    <div className="space-y-1">
                      {order.order_type === "mesa" && (
                        <p className="font-bold text-lg">
                          {order.table_number}
                        </p>
                      )}
                      {order.order_type !== "mesa" && (
                        <>
                          <p className="font-bold text-lg">
                            {order.customer_name}
                          </p>
                          <p className="text-sm text-fg-muted">
                            {order.customer_phone}
                          </p>

                          <p className="text-sm text-fg-muted">
                            {order.customer_address}
                          </p>
                        </>
                      )}

                      <p className="text-sm text-fg-muted">
                        {order.payment_method}
                      </p>
                      <p className="text-sm text-fg-muted">
                        {order.cash_amount
                          ? `Paga con $${Number(order.cash_amount).toLocaleString("es-CO")}`
                          : "No especificado"}
                      </p>

                      {order.order_type === "domicilio" && (
                        <p className="text-sm text-fg-muted">
                          {order.neighborhood}
                        </p>
                      )}

                      {order.lat && order.lng && (
                        <a
                          href={`https://www.google.com/maps?q=${order.lat},${order.lng}`}
                          target="_blank"
                          className="text-blue-500 text-sm underline"
                        >
                          Ver ubicación en mapa
                        </a>
                      )}
                    </div>

                    <div className="text-right">
                      {order.order_type === "domicilio" &&
                        order.delivery_fee && (
                          <p className="text-sm text-fg-muted">
                            Domicilio: $
                            {Number(order.delivery_fee).toLocaleString("es-CO")}
                          </p>
                        )}
                      {order.discount_percentage > 0 && (
                        <p className="text-sm line-through text-fg-subtle">
                          ${Number(order.total).toLocaleString("es-CO")}
                        </p>
                      )}

                      <p className="text-xl font-bold text-green-600">
                        ${finalTotal.toLocaleString("es-CO")}
                      </p>
                      <span
                        className={`text-xs px-3 py-1 rounded-full font-semibold ${
                          STATUS_STYLES[order.status] ||
                          "bg-surface-muted text-fg-muted"
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>
                  </div>

                  <div className="border-t pt-3 pb-3 space-y-2">
                    {order.order_items?.map((item) => (
                      <div
                        key={item.id}
                        className="flex justify-between text-sm"
                      >
                        <div>
                          <p className="text-md">{formatItem(item)}</p>
                          {item.observations && (
                            <p className="text-sm">{item.observations}</p>
                          )}
                          {item.additionals && item.additionals.length > 0 && (
                            <p className="text-brand text-xs mt-1">
                              Adicional: {item.additionals[0]?.name} (+$
                              {item.additionals[0]?.price.toLocaleString(
                                "es-CO",
                              )}
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
                  <div className="border-t pt-3 space-y-4 mt-4">
                    <div className="flex flex-row gap-3">
                      {activeDiscount !== order.id ? (
                        <>
                          <button
                            onClick={() =>
                              deleteOrder(order.id, order.customer_name)
                            }
                            className="w-full hover:bg-orange-600 py-3 rounded-2xl font-semibold text-base shadow-md hover:shadow-lg shadow-red-900/20 transition-all duration-200 active:scale-95 flex items-center justify-center gap-2"
                          >
                            <TrashIcon className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => openKitchenOrder(order.id)}
                            className="w-full hover:bg-orange-600 py-3 rounded-2xl font-semibold text-base shadow-md hover:shadow-lg shadow-red-900/20 transition-all duration-200 active:scale-95 flex items-center justify-center gap-2"
                          >
                            <BookMinus className="w-5 h-5" />
                          </button>

                          <button
                            onClick={() => openInvoice(order.id)}
                            className="w-full hover:bg-orange-600 py-3 rounded-2xl font-semibold text-base shadow-md hover:shadow-lg shadow-red-900/20 transition-all duration-200 active:scale-95 flex items-center justify-center gap-2"
                          >
                            <PrinterIcon className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => setActiveDiscount(order.id)}
                            className="w-full hover:bg-orange-600 py-3 rounded-2xl font-semibold text-base shadow-md hover:shadow-lg shadow-red-900/20 transition-all duration-200 active:scale-95 flex items-center justify-center gap-2"
                          >
                            %
                          </button>
                        </>
                      ) : (
                        <>
                          <input
                            type="number"
                            placeholder="%"
                            value={discounts[order.id] || ""}
                            onChange={(e) =>
                              setDiscounts({
                                ...discounts,
                                [order.id]: Number(e.target.value),
                              })
                            }
                            className="w-full border border-line bg-canvas text-fg rounded-2xl px-3 py-2 outline-none focus:ring-2 focus:ring-brand-ring"
                          />
                          <button
                            onClick={() => applyDiscount(order)}
                            className="w-full hover:bg-blue-600 text-black py-3 rounded-2xl font-semibold text-base shadow-md hover:shadow-lg shadow-blue-900/20 transition-all duration-200 active:scale-95 flex items-center justify-center gap-2"
                          >
                            Aplicar
                          </button>
                        </>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setSelectedOrder(order.id);
                          setExtraName("");
                          setExtraPrice("");
                        }}
                        className="w-full hover:bg-red-600 py-3 rounded-2xl font-semibold text-base shadow-md hover:shadow-lg shadow-red-900/20 transition-all duration-200 active:scale-95 flex items-center justify-center gap-2"
                      >
                        <Plus />
                      </button>

                      <div className="basis-[70%] flex gap-1">
                        <select
                          value={pendingStatus[order.id] ?? order.status}
                          onChange={(e) =>
                            setPendingStatus((prev) => ({
                              ...prev,
                              [order.id]: e.target.value,
                            }))
                          }
                          className="flex-1 rounded-2xl border border-line bg-canvas text-fg px-2 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-brand"
                        >
                          {ORDER_FLOW[order.order_type].map((s) => (
                            <option key={s} value={s}>
                              {s.replace(/_/g, " ")}
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={() =>
                            changeStatus(order, pendingStatus[order.id])
                          }
                          disabled={
                            (pendingStatus[order.id] ?? order.status) ===
                            order.status
                          }
                          className={`px-3 py-2 rounded-2xl text-white font-bold text-sm shadow-md transition-all duration-200 active:scale-95 disabled:opacity-40 ${STATUS_BTN[order.status] ?? "bg-gray-500 hover:bg-gray-600"}`}
                        >
                          OK
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-surface border border-line p-6 rounded-2xl w-[300px] space-y-4 shadow-2xl">
            <h2 className="text-lg font-bold text-fg">
              Agregar producto extra
            </h2>

            <input
              type="text"
              placeholder="Nombre"
              value={extraName}
              onChange={(e) => setExtraName(e.target.value)}
              className="w-full border border-line bg-canvas text-fg placeholder:text-fg-subtle rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-brand-ring"
            />

            <input
              type="number"
              placeholder="Precio"
              value={extraPrice}
              onChange={(e) => setExtraPrice(e.target.value)}
              className="w-full border border-line bg-canvas text-fg placeholder:text-fg-subtle rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-brand-ring"
            />

            <div className="flex gap-2">
              <button
                onClick={() => setSelectedOrder(null)}
                className="w-full bg-surface-muted text-fg py-2 rounded-xl hover:bg-line transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddExtra}
                className="w-full bg-green-500 text-white py-2 rounded-xl hover:bg-green-600 transition"
              >
                Agregar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
