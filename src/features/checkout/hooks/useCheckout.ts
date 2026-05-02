"use client";

import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import { useCheckoutForm } from "./useCheckoutForm";
import { useCheckoutLocation } from "./useCheckoutLocation";

import { createOrder } from "../services/createOrder";
import { createOrderItems } from "../services/createOrderItems";
import { sendWhatsAppOrder } from "../services/sendWhatsAppOrder";
import { getDomicilio } from "../utils/barrios";

export function useCheckout() {
  const router = useRouter();

  const {
    cart,
    clearCart,
    orderType,
  } = useCart();

  const { form, barrio, mesa, setBarrio, setMesa, handleChange } =
    useCheckoutForm();

  const { location, locating, savedLocation, getLocation, saveLocation, clearSavedLocation, sendRestaurantLocation } =
    useCheckoutLocation();

  const subtotal = cart.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0,
  );

  const domicilio = orderType === "domicilio" ? getDomicilio(barrio) : 0;

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

    if (orderType === "mesa" && !mesa) {
      toast.error("Selecciona una mesa");
      return;
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
      toast.success("Pedido enviado");

      // Navigate first so the user stays in the app, then open WhatsApp on top
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
