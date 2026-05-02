import { api } from "@/lib/api";

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
}: any) {
  const tableNum =
    orderType === "mesa" && mesa !== "" && mesa != null
      ? parseInt(String(mesa).trim(), 10)
      : null;
  const cashParsed =
    form.pago === "efectivo" && form.montoEfectivo
      ? parseInt(String(form.montoEfectivo).replace(/\s/g, ""), 10)
      : NaN;

  const orderInput = {
    order_type: orderType,
    status: "recibido",
    customer_name: orderType === "mesa" ? null : form.nombre,
    customer_phone: orderType === "mesa" ? null : form.telefono,
    customer_address: orderType === "domicilio" ? form.direccion : null,
    table_number:
      orderType === "mesa" && Number.isFinite(tableNum as number)
        ? tableNum
        : null,
    payment_method: form.pago,
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
  }));

  const { order } = await api.post<{ order: { id: string } }>("/api/orders", {
    order: orderInput,
    items,
  });

  if (typeof window !== "undefined") {
    localStorage.setItem("last_order_id", order.id);
  }

  return order;
}
