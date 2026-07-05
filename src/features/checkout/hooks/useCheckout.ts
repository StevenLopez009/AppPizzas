"use client";

import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { api } from "@/lib/api";

import { useCheckoutForm } from "./useCheckoutForm";
import { useCheckoutLocation } from "./useCheckoutLocation";

import { createOrder } from "../services/createOrder";
import { createOrderItems } from "../services/createOrderItems";
import { sendWhatsAppOrder } from "../services/sendWhatsAppOrder";

export function useCheckout() {
  const router = useRouter();
  const { cart, clearCart, orderType } = useCart();
  const { form, barrio, barrioFee, mesa, setBarrio, setMesa, handleChange } =
    useCheckoutForm();

  const {
    location,
    locating,
    savedLocation,
    getLocation,
    saveLocation,
    clearSavedLocation,
    sendRestaurantLocation,
  } = useCheckoutLocation();

  const subtotal = cart.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0,
  );

  const domicilio = orderType === "domicilio" ? barrioFee : 0;

  const total = subtotal + domicilio;

  const handleSubmit = async () => {
    if (cart.length === 0) {
      toast.error("Tu carrito está vacío");
      return;
    }

    if (!orderType) {
      toast.error("Selecciona el tipo de pedido");
      return;
    }

    if (orderType === "domicilio") {
      if (!form.nombre || !form.telefono || !form.direccion || !barrio) {
        toast.error("Completa todos los datos");
        return;
      }
    }

    if (orderType === "recoger") {
      if (!form.nombre || !form.telefono) {
        toast.error("Completa todos los datos");
        return;
      }
    }

    if (orderType === "mesa") {
      if (!mesa || !form.telefono?.trim()) {
        toast.error("Completa todos los datos");
        return;
      }
    }

    try {
      const order = await createOrder({
        cart,
        form,
        barrio,
        mesa,
        orderType,
        location,
        subtotal,
        domicilio,
        total,
      });

      await createOrderItems(order.id, cart);

      clearCart();
      localStorage.removeItem("order_type");

      // Solo enviar a la pasarela si NO es un pedido de mesa
      if (form.pago === "digital" && orderType !== "mesa") {
        toast.loading("Redirigiendo a pasarela de pagos...");

        try {
          const { url } = await api.post<{ url: string }>(
            "/api/checkout/sessions",
            {
              orderId: order.id,
              customerEmail: null,
            },
          );

          window.location.href = url;
          return;
        } catch (error) {
          console.error("Error creating Stripe session:", error);
          toast.error("Error al procesar el pago. Intenta de nuevo.");
          window.location.reload();
          return;
        }
      }

      // Pago en efectivo o pedido de mesa
      toast.success("Pedido enviado");
      router.push("/my-orders");

      setTimeout(() => {
        sendWhatsAppOrder({
          cart,
          form,
          barrio,
          mesa,
          total,
          domicilio,
          location,
          orderType,
        });
      }, 300);
    } catch (error) {
      console.error(error);
      toast.error("Error creando la orden");
    }
  };

  return {
    cart,
    form,
    barrio,
    mesa,
    total,
    subtotal,
    domicilio,
    location,
    locating,
    savedLocation,
    orderType,
    setBarrio,
    setMesa,
    handleChange,
    getLocation,
    saveLocation,
    clearSavedLocation,
    sendRestaurantLocation,
    handleSubmit,
  };
}
