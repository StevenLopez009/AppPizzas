import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

export async function createOrder({
  form,
  barrio,
  mesa,
  orderType,
  location,
  subtotal,
  domicilio,
  total,
}: any) {
  const { data, error } = await supabase
    .from("orders")
    .insert({
      order_type: orderType,

      lat: location?.lat || null,
      lng: location?.lng || null,

      customer_name: orderType === "mesa" ? null : form.nombre,

      customer_phone: orderType === "mesa" ? null : form.telefono,

      customer_address: orderType === "domicilio" ? form.direccion : null,

      table_number: orderType === "mesa" ? mesa : null,

      payment_method: form.pago,

      cash_amount:
        form.pago === "efectivo" && form.montoEfectivo
          ? parseInt(form.montoEfectivo)
          : null,

      subtotal,

      neighborhood: barrio || null,

      delivery_fee: domicilio,

      total,

      status: "recibido",
    })
    .select()
    .single();

  if (error) {
    console.log(error);
    throw error;
  }

  localStorage.setItem("last_order_id", data.id);

  return data;
}
