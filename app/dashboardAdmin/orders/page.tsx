import { createClient } from "@/lib/supabase/client";

export default async function AdminOrders() {
  const supabase = await createClient();

  const { data: orders } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold mb-6">Pedidos 🔥</h1>

      {orders?.map((order) => (
        <div key={order.id} className="border p-4 rounded-xl mb-4 shadow-sm">
          <p>Total: ${order.total}</p>
          <p>Estado: {order.status}</p>
          <p>Fecha: {new Date(order.created_at).toLocaleString()}</p>
        </div>
      ))}
    </div>
  );
}
