import { api } from "@/lib/api";
import { saveOrderToHistory } from "@/lib/orderHistory";

export async function createOrder({
  cart,
  form,
  barrio,
  mesa,
  orderType,
  location,
  subtotal,
  domicilio,
  total,
  paymentProof,
}: any) {
  // Obtener usuario autenticado si existe
  let userId: string | null = null;
  try {
    const response = await api.get<{ user: { id: string } | null }>(
      "/api/auth/me",
    );
    userId = response?.user?.id || null;
  } catch {
    // Usuario no autenticado, continuar sin user_id
  }
  const tableNum = orderType === "mesa" && mesa ? String(mesa) : null;

  const cashParsed =
    form.pago === "efectivo" && form.montoEfectivo
      ? parseInt(String(form.montoEfectivo).replace(/\s/g, ""), 10)
      : NaN;

  const orderInput = {
    user_id: userId,
    order_type: orderType,
    status: form.pago === "digital" ? "pendiente_pago" : "recibido",
    customer_name: orderType === "mesa" ? null : form.nombre,
    customer_phone: form.telefono,
    customer_address: orderType === "domicilio" ? form.direccion : null,
    table_label: tableNum,
    payment_method: form.pago,
    payment_proof: paymentProof,
    cash_amount:
      form.pago === "efectivo" &&
      form.montoEfectivo &&
      String(form.montoEfectivo).trim() !== "" &&
      Number.isFinite(cashParsed)
        ? cashParsed
        : null,
    subtotal: Number(subtotal) || 0,
    neighborhood: barrio || null,
    delivery_fee: Number(domicilio) || 0,
    total: Number(total) || 0,
    discount_percentage: 0,
    lat: location?.lat ?? null,
    lng: location?.lng ?? null,
  };

  const items = (cart as any[]).map((item) => ({
    product_id: item.product_id ?? null,
    product_name: item.name,
    price: Number(item.price) || 0,
    quantity: Math.max(1, Math.round(Number(item.quantity) || 1)),
    size: item.size,
    extra: item.extra || null,
    observations: item.observations || null,
    additionals: item.additionals || [],
    ingredients: item.ingredients || [],
  }));

  const { order } = await api.post<{
    order: {
      id: string;
      order_number: number;
      order_type: "domicilio" | "mesa" | "recoger";
      status: string;
      total: number;
      created_at: string;
      customer_name: string | null;
      order_items: { product_name: string; quantity: number }[];
    };
  }>("/api/orders", { order: orderInput, items });

  if (typeof window !== "undefined") {
    localStorage.setItem("last_order_id", order.id);

    const itemsSummary = (order.order_items ?? items)
      .map((i) => `${i.product_name} x${i.quantity}`)
      .join(", ");

    saveOrderToHistory({
      id: order.id,
      order_number: order.order_number,
      order_type: order.order_type ?? orderInput.order_type,
      status: order.status ?? "recibido",
      total: order.total ?? Number(total),
      created_at: order.created_at ?? new Date().toISOString(),
      customer_name: order.customer_name ?? null,
      items_summary: itemsSummary,
    });
  }

  return order;
}
