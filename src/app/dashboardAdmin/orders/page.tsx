"use client";

import { useEffect, useState } from "react";
import { BookMinus, Check, Plus, PrinterIcon, TrashIcon } from "lucide-react";
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
  mesa: ["recibido", "cocinando", "listo_cocina", "entregado"],
  recoger: ["recibido", "cocinando", "recoger"],
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
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [extraName, setExtraName] = useState("");
  const [extraPrice, setExtraPrice] = useState("");
  const [pendingStatus, setPendingStatus] = useState<Record<string, string>>(
    {},
  );
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(true);

  const STATUS_STYLES: Record<string, string> = {
    recibido: "bg-gray-500 text-gray-700",
    cocinando: "bg-yellow-500 text-yellow-800",
    enviado: "bg-blue-500 text-blue-800",
    listo_cocina: "bg-pink-500 text-pink-800",
    entregado: "bg-green-500 text-green-800",
    recoger: "bg-green-500 text-purple-800",
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

  const salesByPaymentMethod = filteredOrders.reduce(
    (acc, order) => {
      const method = order.payment_method || "Sin definir";

      const total =
        order.total - (order.total * (order.discount_percentage || 0)) / 100;

      acc[method] = (acc[method] || 0) + total;

      return acc;
    },
    {} as Record<string, number>,
  );

  const handleAddExtra = async () => {
    if (!extraName || !extraPrice || !selectedOrder) {
      toast.error("Completa los campos");
      return;
    }

    try {
      const { order: updated } = await api.post<{ order: Order }>(
        `/api/orders/${encodeURIComponent(selectedOrder.id)}/items`,
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

  const handleDeleteItem = async (orderId: string, itemId: string) => {
    try {
      const { order: updated } = await api.delete<{
        order: Order;
      }>(
        `/api/orders/${encodeURIComponent(orderId)}/items/${encodeURIComponent(itemId)}`,
      );

      if (updated) {
        setOrders((prev) =>
          prev.map((o) => (o.id === updated.id ? updated : o)),
        );

        setSelectedOrder(updated);
      }

      toast.success("Producto eliminado");
    } catch (error) {
      console.error(error);
      toast.error("Error eliminando producto");
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header responsivo */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-fg">
          Pedidos
        </h1>

        {/* Filtros en layout responsivo */}

        <div className="flex flex-col sm:flex-row gap-3">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full sm:w-auto justify-start rounded-2xl border-line bg-surface shadow-sm hover:shadow-md transition-all duration-200 text-fg font-medium"
              >
                <CalendarIcon className="mr-2 h-4 w-4 text-brand shrink-0" />
                <span className="truncate">
                  {dateRange?.from
                    ? dateRange.to
                      ? `${dateRange.from.toLocaleDateString()} - ${dateRange.to.toLocaleDateString()}`
                      : dateRange.from.toLocaleDateString()
                    : "Seleccionar fechas"}
                </span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-4 rounded-2xl border border-line shadow-xl bg-surface">
              <div className="rounded-xl overflow-hidden">
                <Calendar
                  mode="range"
                  selected={
                    dateRange.from
                      ? { from: dateRange.from, to: dateRange.to }
                      : undefined
                  }
                  onSelect={(range) =>
                    setDateRange(
                      range ? { from: range.from, to: range.to } : {},
                    )
                  }
                  numberOfMonths={1}
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
            className="w-full sm:w-auto sm:min-w-[250px] px-4 py-2 rounded-xl border border-line bg-canvas text-fg placeholder:text-fg-subtle focus:outline-none focus:ring-2 focus:ring-brand-ring"
          />
        </div>
      </div>

      {open && (
        <>
          {/* Stats cards responsivos */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
            {[
              {
                label: "Ventas",
                value: `$${totalSales.toLocaleString("es-CO")}`,
              },
              { label: "Domicilios", value: byType.domicilio },
              { label: "Mesa", value: byType.mesa },
              { label: "Recoger", value: byType.recoger },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="bg-surface border border-line p-3 sm:p-4 rounded-xl shadow-sm"
              >
                <p className="text-xs sm:text-sm text-fg-muted">{label}</p>
                <p className="text-base sm:text-xl font-bold text-fg break-words">
                  {value}
                </p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {Object.entries(salesByPaymentMethod).map(([method, total]) => {
              const isMainMethod =
                method.toLowerCase().includes("efectivo") ||
                method.toLowerCase().includes("digital");

              return (
                <div
                  key={method}
                  className={`bg-surface border border-line rounded-2xl p-4 shadow-md ${
                    isMainMethod ? "col-span-2" : ""
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs tracking-wide text-fg-muted">
                      {method}
                    </span>

                    <span className="h-2 w-2 rounded-full bg-green-500" />
                  </div>

                  <p className="mt-3 text-2xl font-bold text-fg">
                    ${Number(total).toLocaleString("es-CO")}
                  </p>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Botones de filtros rápidos */}
      <div className="flex gap-2 mt-4 flex-wrap mb-6">
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
          {
            label: "Ocultar",
            onClick: () => setOpen((prev) => !prev),
          },
        ].map(({ label, onClick }) => (
          <button
            key={label}
            onClick={onClick}
            className="px-3 sm:px-4 py-2 bg-surface border border-line rounded-xl shadow-sm hover:shadow-md text-fg font-medium transition-all duration-150 active:scale-95 text-sm sm:text-base"
          >
            {label}
          </button>
        ))}
        <button
          onClick={() => setDateRange({})}
          className="px-3 sm:px-4 py-2 bg-surface border border-red-200 dark:border-red-900/50 rounded-xl shadow-sm hover:shadow-md text-red-500 font-medium transition-all duration-150 active:scale-95 text-sm sm:text-base"
        >
          Limpiar
        </button>
      </div>

      {/* Grid de pedidos responsivo */}
      <div className="w-full mt-6 mb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-2 sm:gap-2">
          {filteredOrders.map((order) => {
            const finalTotal =
              order.total -
              (order.total * (order.discount_percentage || 0)) / 100;

            return (
              <div
                key={order.id}
                className="bg-surface border border-line rounded-2xl shadow-md overflow-hidden flex flex-col justify-between w-full"
              >
                <div
                  className={`px-4 sm:px-5 py-2 sm:py-3 flex items-center justify-between border-b border-line ${STATUS_STYLES[order.status]?.replace("hover:bg-", "bg-") || "bg-gray-500"}`}
                >
                  <span className="text-white font-extrabold text-base sm:text-lg tracking-wide">
                    Pedido&nbsp;#{order.order_number}
                  </span>
                  <span className="text-white/80 text-xs">
                    {new Date(order.created_at).toLocaleTimeString("es-CO", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>

                <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between">
                  {/* Info del pedido */}
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-4">
                    <div className="space-y-1 flex-1">
                      {order.order_type === "mesa" && (
                        <p className="font-bold text-base sm:text-lg">
                          {order.table_number}
                        </p>
                      )}
                      {order.order_type !== "mesa" && (
                        <>
                          <p className="font-bold text-base sm:text-lg break-words">
                            {order.customer_name}
                          </p>
                          <p className="text-xs sm:text-sm text-fg-muted break-words">
                            {order.customer_phone}
                          </p>
                          <p className="text-xs sm:text-sm text-fg-muted break-words">
                            {order.customer_address}
                          </p>
                        </>
                      )}

                      <p className="text-xs sm:text-sm text-fg-muted">
                        {order.payment_method}
                      </p>
                      <p className="text-xs sm:text-sm text-fg-muted">
                        {order.cash_amount
                          ? `Paga con $${Number(order.cash_amount).toLocaleString("es-CO")}`
                          : "No especificado"}
                      </p>

                      {order.order_type === "domicilio" && (
                        <p className="text-xs sm:text-sm text-fg-muted break-words">
                          {order.neighborhood}
                        </p>
                      )}

                      {order.lat && order.lng && (
                        <a
                          href={`https://www.google.com/maps?q=${order.lat},${order.lng}`}
                          target="_blank"
                          className="text-blue-500 text-xs sm:text-sm underline inline-block break-words"
                        >
                          Ver ubicación en mapa
                        </a>
                      )}
                    </div>

                    <div className="text-left sm:text-right">
                      {order.order_type === "domicilio" &&
                        order.delivery_fee && (
                          <p className="text-xs sm:text-sm text-fg-muted">
                            Domicilio: $
                            {Number(order.delivery_fee).toLocaleString("es-CO")}
                          </p>
                        )}
                      {order.discount_percentage > 0 && (
                        <p className="text-xs sm:text-sm line-through text-fg-subtle">
                          ${Number(order.total).toLocaleString("es-CO")}
                        </p>
                      )}

                      <p className="text-lg sm:text-xl font-bold text-green-600">
                        ${finalTotal.toLocaleString("es-CO")}
                      </p>
                      <span
                        className={`text-xs px-2 sm:px-3 py-1 rounded-full font-semibold inline-block ${
                          STATUS_STYLES[order.status] ||
                          "bg-surface-muted text-fg-muted"
                        }`}
                      >
                        {order.status.replace(/_/g, " ")}
                      </span>
                    </div>
                  </div>

                  {/* Items del pedido */}
                  <div className="border-t pt-3 pb-3 space-y-2">
                    {order.order_items?.map((item) => (
                      <div
                        key={item.id}
                        className="flex flex-col sm:flex-row sm:justify-between text-xs sm:text-sm gap-2"
                      >
                        <div className="flex-1">
                          <p className="text-sm sm:text-md break-words">
                            {formatItem(item)}
                          </p>
                          {item.observations && (
                            <p className="text-xs sm:text-sm text-fg-muted mt-1 break-words">
                              Obs: {item.observations}
                            </p>
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
                        <p className="font-semibold text-right sm:text-left">
                          $
                          {Number(item.price * item.quantity).toLocaleString(
                            "es-CO",
                          )}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* ACCIONES DEL PEDIDO */}
                  <div className="border-t pt-3 space-y-3 mt-4">
                    {/* Fila 1: Botones de acción principales con colores del estado */}
                    <div className="grid grid-cols-4 gap-2">
                      {activeDiscount !== order.id ? (
                        <>
                          <button
                            onClick={() =>
                              deleteOrder(order.id, order.customer_name)
                            }
                            className={`${STATUS_STYLES[order.status] || "bg-gray-500 hover:bg-gray-600"} text-white py-2 rounded-xl font-semibold text-sm shadow-md transition-all duration-200 active:scale-95 flex items-center justify-center`}
                            title="Eliminar"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openKitchenOrder(order.id)}
                            className={`${STATUS_STYLES[order.status] || "bg-gray-500 hover:bg-gray-600"} text-white py-2 rounded-xl font-semibold text-sm shadow-md transition-all duration-200 active:scale-95 flex items-center justify-center`}
                            title="Comanda"
                          >
                            <BookMinus className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openInvoice(order.id)}
                            className={`${STATUS_STYLES[order.status] || "bg-gray-500 hover:bg-gray-600"} text-white py-2 rounded-xl font-semibold text-sm shadow-md transition-all duration-200 active:scale-95 flex items-center justify-center`}
                            title="Factura"
                          >
                            <PrinterIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setActiveDiscount(order.id)}
                            className={`${STATUS_STYLES[order.status] || "bg-gray-500 hover:bg-gray-600"} text-white py-2 rounded-xl font-semibold text-sm shadow-md transition-all duration-200 active:scale-95 flex items-center justify-center`}
                            title="Descuento"
                          >
                            %
                          </button>
                        </>
                      ) : (
                        <>
                          <div className="col-span-3">
                            <input
                              type="number"
                              placeholder="% descuento"
                              value={discounts[order.id] || ""}
                              onChange={(e) =>
                                setDiscounts({
                                  ...discounts,
                                  [order.id]: Number(e.target.value),
                                })
                              }
                              className="w-full border border-line bg-canvas text-fg rounded-xl px-2 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-ring"
                            />
                          </div>
                          <button
                            onClick={() => applyDiscount(order)}
                            className={`${STATUS_STYLES[order.status] || "bg-blue-500 hover:bg-blue-600"} text-white py-2 rounded-xl font-semibold text-sm shadow-md transition-all duration-200 active:scale-95`}
                          >
                            Ok
                          </button>
                        </>
                      )}
                    </div>

                    {/* Fila 2: Botón de agregar extra y cambio de estado */}
                    <div className="grid grid-cols-12 gap-2 items-center">
                      {/* Botón de agregar extra */}
                      <button
                        onClick={() => {
                          setSelectedOrder(order);
                          setExtraName("");
                          setExtraPrice("");
                        }}
                        className={`col-span-3 ${STATUS_STYLES[order.status] || "bg-yellow-500 hover:bg-yellow-600"} text-white py-2 rounded-xl font-semibold text-sm shadow-md transition-all duration-200 active:scale-95 flex items-center justify-center gap-1`}
                        title="Agregar extra"
                      >
                        <Plus className="w-4 h-4" />
                      </button>

                      {/* Select de estado */}
                      <select
                        value={pendingStatus[order.id] ?? order.status}
                        onChange={(e) =>
                          setPendingStatus((prev) => ({
                            ...prev,
                            [order.id]: e.target.value,
                          }))
                        }
                        className="col-span-7 rounded-xl border border-line bg-canvas text-fg px-2 py-2 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-brand"
                      >
                        {ORDER_FLOW[order.order_type].map((s) => (
                          <option key={s} value={s}>
                            {s.replace(/_/g, " ")}
                          </option>
                        ))}
                      </select>

                      {/* Botón OK */}
                      <button
                        onClick={() =>
                          changeStatus(order, pendingStatus[order.id])
                        }
                        disabled={
                          (pendingStatus[order.id] ?? order.status) ===
                          order.status
                        }
                        className={`col-span-2 px-2 py-2 rounded-xl text-white font-bold text-xs sm:text-sm shadow-md transition-all duration-200 active:scale-95 disabled:opacity-40 ${STATUS_STYLES[order.status] ?? "bg-gray-500 hover:bg-gray-600"}`}
                      >
                        <Check />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal para agregar extra responsivo */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-surface border border-line p-4 sm:p-6 rounded-2xl w-full max-w-[90%] sm:max-w-[400px] space-y-4 shadow-2xl">
            {selectedOrder?.order_items?.length > 0 && (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                <h3 className="font-semibold">Productos del pedido</h3>

                {selectedOrder.order_items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between border rounded-lg p-2"
                  >
                    <div>
                      <p className="font-medium">
                        {item.quantity}x {item.product_name}
                      </p>
                      <p className="text-xs text-gray-500">
                        ${item.price.toLocaleString("es-CO")}
                      </p>
                    </div>

                    <button
                      onClick={() =>
                        handleDeleteItem(selectedOrder.id, item.id)
                      }
                      className="bg-red-500 text-white px-2 py-1 rounded"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <h2 className="text-base sm:text-lg font-bold text-fg">
              Agregar producto extra
            </h2>
            <input
              type="text"
              placeholder="Nombre"
              value={extraName}
              onChange={(e) => setExtraName(e.target.value)}
              className="w-full border border-line bg-canvas text-fg placeholder:text-fg-subtle rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-brand-ring text-sm sm:text-base"
            />

            <input
              type="number"
              placeholder="Precio"
              value={extraPrice}
              onChange={(e) => setExtraPrice(e.target.value)}
              className="w-full border border-line bg-canvas text-fg placeholder:text-fg-subtle rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-brand-ring text-sm sm:text-base"
            />

            <div className="flex gap-2">
              <button
                onClick={() => setSelectedOrder(null)}
                className="flex-1 bg-surface-muted text-fg py-2 rounded-xl hover:bg-line transition text-sm sm:text-base"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddExtra}
                className="flex-1 bg-green-500 text-white py-2 rounded-xl hover:bg-green-600 transition text-sm sm:text-base"
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
