"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useCart } from "@/context/CartContext";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import imgDelivery from "@/assets/images/bannerDelivery.png";

export default function CheckoutUI() {
  const [location, setLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [orderType, setOrderType] = useState<"domicilio" | "recoger">(
    "domicilio",
  );
  const [barrio, setBarrio] = useState("");

  const { cart, clearCart } = useCart();
  const supabase = createClient();
  const router = useRouter();

  const subtotal = cart.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0,
  );

  const preciosBarrio: Record<string, number> = {
    prosperidad: 4000,
    parques: 6000,
    opalo: 5000,
    sociego: 3000,
    otros: 6000,
  };

  const domicilio = orderType === "domicilio" ? preciosBarrio[barrio] || 0 : 0;
  const total = subtotal + domicilio;

  const [form, setForm] = useState({
    nombre: "",
    telefono: "",
    direccion: "",
    pago: "efectivo",
    montoEfectivo: "",
  });

  useEffect(() => {
    const type = localStorage.getItem("order_type") as
      | "domicilio"
      | "recoger"
      | null;

    if (type) setOrderType(type);
  }, []);

  const getLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        setLocation(coords);
      },
      (error) => {
        console.log(error);
        alert("No se pudo obtener la ubicación");
      },
    );
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const generateWhatsAppMessage = () => {
    const items = cart
      .map(
        (item) =>
          `🍕 ${item.quantity}x ${item.name} (${item.size}) - ${item.extra || "sin extra"} - ${item.observations ? `📝 ${item.observations}` : ""} - $${(item.price * item.quantity).toLocaleString("es-CO")}`,
      )
      .join("\n");

    const montoEfectivoTexto =
      form.pago === "efectivo" && form.montoEfectivo
        ? `\n💵 Paga con: $${parseInt(form.montoEfectivo).toLocaleString("es-CO")}\n🔄 Cambio: $${(parseInt(form.montoEfectivo) - total).toLocaleString("es-CO")}`
        : "";

    return `
🧾 *Nuevo Pedido*

👤 Cliente: ${form.nombre}
📞 Tel: ${form.telefono}
${orderType === "domicilio" ? `📍 Dirección: ${form.direccion}` : ""}
${orderType === "domicilio" ? `🏘️ Barrio: ${barrio}` : ""}
${location ? `📍 Ubicación: https://www.google.com/maps?q=${location.lat},${location.lng}` : ""}

🛵 Tipo: ${orderType}
💳 Pago: ${form.pago}${montoEfectivoTexto}

📦 Pedido:
${items}

🚚 Domicilio: $${domicilio.toLocaleString("es-CO")}
💰 Total: $${total.toLocaleString("es-CO")}
`;
  };

  const sendToWhatsApp = () => {
    const phone = "573161534971";
    const message = generateWhatsAppMessage();
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  const handleSubmit = async () => {
    if (
      !form.nombre ||
      !form.telefono ||
      (orderType === "domicilio" && (!form.direccion || !barrio))
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
          lat: location?.lat || null,
          lng: location?.lng || null,
          customer_name: form.nombre,
          customer_phone: form.telefono,
          customer_address: orderType === "domicilio" ? form.direccion : null,
          payment_method: form.pago,
          cash_amount:
            form.pago === "efectivo" ? parseInt(form.montoEfectivo) : null,
          subtotal,
          neighborhood: barrio,
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
        observations: item.observations || null,
        additionals: item.additionals || [],
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(items);

      if (itemsError) throw itemsError;

      sendToWhatsApp();
      clearCart();

      router.push(`/pedido/${order.id}`);
    } catch (err) {
      console.log(err);
      alert("Error creando la orden");
    } finally {
      localStorage.removeItem("order_type");
    }
  };

  const cambio =
    form.pago === "efectivo" && form.montoEfectivo
      ? parseInt(form.montoEfectivo) - total
      : 0;

  return (
    <div className="max-w-md mx-auto min-h-screen bg-gray-100 font-sans pb-32">
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
        <div className="rounded-3xl overflow-hidden shadow bg-orange-100 h-40">
          {orderType === "domicilio" ? (
            <div
              className="relative h-full w-full flex items-center"
              style={{
                backgroundImage: `
                    linear-gradient(to right, #fde7d8 1%, transparent),
                    url(${imgDelivery.src})
                  `,
                backgroundSize: "100% 100%, contain",
                backgroundPosition: "left, right center",
                backgroundRepeat: "no-repeat",
              }}
            >
              <div className="relative z-10 flex flex-col items-start justify-center gap-3 px-5 text-white max-w-[70%]">
                {!location ? (
                  <>
                    <p className="text-sm font-semibold leading-tight text-black">
                      Comparte tu ubicación <br /> para un envío más rápido
                    </p>

                    <button
                      onClick={getLocation}
                      className="bg-orange-600 px-2 py-2 rounded-xl text-sm font-semibold shadow-md active:scale-95 transition"
                    >
                      📍 Compartir ubicación
                    </button>
                  </>
                ) : (
                  <>
                    <p className="text-lg text-black font-semibold">
                      Ubicación <br /> compartida
                    </p>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p>Recoger</p>
            </div>
          )}
        </div>
      </div>

      {/* ADDRESS CARD */}
      <div className="px-6 mt-4">
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
            <>
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
              <div className="flex items-center justify-between p-4">
                <select
                  value={barrio}
                  onChange={(e) => setBarrio(e.target.value)}
                  className="w-full outline-none"
                >
                  <option value="">Barrio</option>
                  <option value="prosperidad">La prosperidad 4.000$</option>
                  <option value="parques">
                    Parques santamaria, san jose, san carlos 6.000$
                  </option>
                  <option value="opalo">Opalo y verdes 5.000$</option>
                  <option value="sociego">El sociego 3.000$</option>
                  <option value="otros">Otros 6.000$</option>
                </select>
              </div>
            </>
          )}
        </div>
      </div>

      {/* PAYMENT */}
      <div className="px-6 mt-2">
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

          {form.pago === "efectivo" && (
            <div className="p-4 border-b bg-white">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                💵 ¿Con cuánto pagas?
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                  $
                </span>
                <input
                  type="number"
                  name="montoEfectivo"
                  value={form.montoEfectivo}
                  onChange={handleChange}
                  placeholder="Monto en efectivo"
                  className="w-full pl-8 pr-4 py-3 border border-orange-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                  min={total}
                  step="1000"
                />
              </div>
              {form.montoEfectivo && parseInt(form.montoEfectivo) >= total && (
                <div className="mt-2 text-sm text-green-600">
                  💰 Cambio: ${cambio.toLocaleString("es-CO")}
                </div>
              )}
              {form.montoEfectivo && parseInt(form.montoEfectivo) < total && (
                <div className="mt-2 text-sm text-red-600">
                  ⚠️ El monto debe ser mayor o igual al total ($
                  {total.toLocaleString("es-CO")})
                </div>
              )}
            </div>
          )}

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
