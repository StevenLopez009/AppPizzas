import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

export async function createOrderItems(orderId: string, cart: any[]) {
  const items = cart.map((item) => ({
    order_id: orderId,
    product_id: item.product_id,
    product_name: item.name,
    price: item.price,
    quantity: item.quantity,
    size: item.size,
    extra: item.extra || null,
    observations: item.observations || null,
    additionals: item.additionals || [],
  }));

  const { error } = await supabase.from("order_items").insert(items);

  if (error) {
    throw error;
  }
}
