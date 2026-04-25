"use client";

import { BookMinus, PrinterIcon, TrashIcon } from "lucide-react";

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
  table_number?: number | null;
  order_type: "domicilio" | "mesa" | "recoger";
  order_items: OrderItem[];
  discount_percentage: number;
  delivery_fee?: number;
}

interface Props {
  order: Order;
  onDelete: (id: string, name: string) => void;
  onOpenInvoice: (id: string) => void;
  onOpenKitchen: (id: string) => void;
  onChangeStatus: (order: Order) => void;
  onSetDiscount: (id: string) => void;
  onApplyDiscount: (order: Order) => void;
  activeDiscount: string | null;
  discounts: Record<string, number>;
  setDiscounts: (val: Record<string, number>) => void;
  STATUS_STYLES: Record<string, string>;
}

export default function OrderCard({
  order,
  onDelete,
  onOpenInvoice,
  onOpenKitchen,
  onChangeStatus,
  onSetDiscount,
  onApplyDiscount,
  activeDiscount,
  discounts,
  setDiscounts,
  STATUS_STYLES,
}: Props) {
  const finalTotal =
    order.total - (order.total * (order.discount_percentage || 0)) / 100;

  return (
    <div className="bg-white rounded-2xl shadow-md p-5 flex flex-col justify-between">
      {/* HEADER */}
      <div className="flex justify-between items-start mb-4">
        <div className="space-y-1">
          {order.order_type === "mesa" ? (
            <p className="font-bold text-lg">Mesa {order.table_number}</p>
          ) : (
            <>
              <p className="font-bold text-lg">{order.customer_name}</p>
              <p className="text-sm text-gray-500">📞 {order.customer_phone}</p>
              <p className="text-sm text-gray-500">
                📍 {order.customer_address}
              </p>
            </>
          )}

          <p className="text-sm text-gray-400">💳 {order.payment_method}</p>

          {order.cash_amount && (
            <p className="text-sm text-gray-400">
              Paga con ${order.cash_amount.toLocaleString("es-CO")}
            </p>
          )}

          {order.order_type === "domicilio" && (
            <p className="text-sm text-gray-400">{order.neighborhood}</p>
          )}
        </div>

        <div className="text-right">
          {order.discount_percentage > 0 && (
            <p className="text-sm line-through text-gray-400">
              ${order.total.toLocaleString("es-CO")}
            </p>
          )}

          <p className="text-xl font-bold text-green-600">
            ${finalTotal.toLocaleString("es-CO")}
          </p>

          <span
            className={`text-xs px-3 py-1 rounded-full font-semibold ${
              STATUS_STYLES[order.status] || "bg-gray-100 text-gray-600"
            }`}
          >
            {order.status}
          </span>
        </div>
      </div>

      {/* ITEMS */}
      <div className="border-t pt-3 pb-3 space-y-2">
        {order.order_items?.map((item) => (
          <div key={item.id} className="flex justify-between text-sm">
            <div>
              {item.quantity} {item.size}
              <p className="text-md">{item.product_name}</p>
              {item.observations && (
                <p className="text-xs">{item.observations}</p>
              )}
            </div>

            <p className="font-semibold">
              ${Number(item.price * item.quantity).toLocaleString("es-CO")}
            </p>
          </div>
        ))}
      </div>

      {/* ACTIONS */}
      <div className="border-t pt-3 space-y-4 mt-4">
        <div className="flex gap-2">
          {activeDiscount !== order.id ? (
            <>
              <button
                onClick={() => onDelete(order.id, order.customer_name)}
                className="w-full"
              >
                <TrashIcon />
              </button>

              <button
                onClick={() => onOpenKitchen(order.id)}
                className="w-full"
              >
                <BookMinus />
              </button>

              <button
                onClick={() => onOpenInvoice(order.id)}
                className="w-full"
              >
                <PrinterIcon />
              </button>

              <button
                onClick={() => onSetDiscount(order.id)}
                className="w-full"
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
                className="w-full border rounded-xl px-3 py-2"
              />
              <button onClick={() => onApplyDiscount(order)} className="w-full">
                Aplicar
              </button>
            </>
          )}
        </div>

        <button
          onClick={() => onChangeStatus(order)}
          className={`w-full text-white py-3 rounded-xl ${
            STATUS_STYLES[order.status]
          }`}
        >
          Cambiar estado
        </button>
      </div>
    </div>
  );
}
