"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useCart } from "@/context/CartContext";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function CheckoutUI() {
  const [orderType, setOrderType] = useState<"domicilio" | "recoger">(
    "domicilio",
  );

  const { cart, clearCart } = useCart();
  const supabase = createClient();
  const router = useRouter();

  const subtotal = cart.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0,
  );

  const domicilio = orderType === "domicilio" ? 5000 : 0;
  const total = subtotal + domicilio;

  const [form, setForm] = useState({
    nombre: "",
    telefono: "",
    direccion: "",
    pago: "efectivo",
  });

  useEffect(() => {
    const type = localStorage.getItem("order_type") as
      | "domicilio"
      | "recoger"
      | null;

    if (type) setOrderType(type);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async () => {
    if (
      !form.nombre ||
      !form.telefono ||
      (orderType === "domicilio" && !form.direccion)
    ) {
      alert("Completa todos los datos");
      return;
    }

    if (cart.length === 0) {
      alert("Tu carrito está vacío");
      return;
    }

    try {
      const { data: order, error } = await supabase
        .from("orders")
        .insert({
          order_type: orderType,
          customer_name: form.nombre,
          customer_phone: form.telefono,
          customer_address: orderType === "domicilio" ? form.direccion : null,
          payment_method: form.pago,
          subtotal,
          delivery_fee: domicilio,
          total,
          status: "recibido",
        })
        .select()
        .single();

      if (error) throw error;

      const items = cart.map((item) => ({
        order_id: order.id,
        product_id: item.product_id,
        product_name: item.name,
        price: item.price,
        quantity: item.quantity,
        size: item.size,
        extra: item.extra || null,
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(items);

      if (itemsError) throw itemsError;
      console.log(cart);

      clearCart();

      router.push(`/pedido/${order.id}`);
    } catch (err) {
      console.log(err);
      alert("Error creando la orden");
    } finally {
      localStorage.removeItem("order_type");
    }
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-gray-100 font-sans pb-32">
      {/* HEADER */}
      <div className="flex items-center gap-4 p-6">
        <Link
          href="/orders"
          className="w-10 h-10 rounded-full bg-white shadow flex items-center justify-center"
        >
          ←
        </Link>
        <h1 className="text-lg font-bold text-gray-800">Checkout</h1>
      </div>

      {/* MAP */}
      <div className="px-6">
        <div className="rounded-3xl overflow-hidden shadow bg-orange-100 h-40 flex items-center justify-center">
          <span className="text-orange-500 font-semibold">Map Preview</span>
        </div>
      </div>

      {/* ADDRESS CARD */}
      <div className="px-6 mt-6">
        <div className="bg-white rounded-3xl shadow-sm divide-y">
          {/* NOMBRE */}
          <div className="flex items-center justify-between p-4">
            <div className="flex gap-3 items-center w-full">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                🏠
              </div>

              <input
                name="nombre"
                value={form.nombre}
                onChange={handleChange}
                placeholder="Nombre"
                className="w-full outline-none font-semibold text-gray-800"
              />
            </div>
          </div>

          {/* TELEFONO */}
          <div className="flex items-center justify-between p-4">
            <div className="flex gap-3 items-center w-full">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                📞
              </div>

              <input
                name="telefono"
                value={form.telefono}
                onChange={handleChange}
                placeholder="Telefono"
                className="w-full outline-none font-semibold text-gray-800"
              />
            </div>
          </div>

          {/* DIRECCION */}
          {orderType === "domicilio" && (
            <div className="flex items-center justify-between p-4">
              <div className="flex gap-3 items-center w-full">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                  📍
                </div>

                <input
                  name="direccion"
                  value={form.direccion}
                  onChange={handleChange}
                  placeholder="Direccion"
                  className="w-full outline-none font-semibold text-gray-800"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* PAYMENT */}
      <div className="px-6 mt-6">
        <div className="bg-white rounded-3xl shadow-sm">
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-3">
              <span className="text-yellow-500 text-xl">💰</span>
              <p className="font-semibold">Efectivo</p>
            </div>

            <input
              type="radio"
              name="pago"
              value="efectivo"
              checked={form.pago === "efectivo"}
              onChange={handleChange}
            />
          </div>

          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <span className="text-orange-500 text-xl">💳</span>
              <p className="font-semibold">Nequi o Tarjeta</p>
            </div>

            <input
              type="radio"
              name="pago"
              value="digital"
              checked={form.pago === "digital"}
              onChange={handleChange}
            />
          </div>
        </div>
      </div>

      {/* FOOTER TOTAL */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white p-6 shadow-[0_-10px_40px_rgba(0,0,0,0.08)] rounded-t-3xl">
        <div className="flex justify-between mb-4 text-lg font-bold text-gray-800">
          <span>Total</span>
          <span>${Number(total).toLocaleString("es-CO")}</span>
        </div>

        <button
          onClick={handleSubmit}
          className="w-full bg-orange-600 text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-orange-900/20 active:scale-95 transition-transform"
        >
          Pedir
        </button>
      </div>
    </div>
  );
}
