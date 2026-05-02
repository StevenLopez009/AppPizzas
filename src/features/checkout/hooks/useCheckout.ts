"use client";

import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import { useCheckoutForm } from "./useCheckoutForm";
import { useCheckoutLocation } from "./useCheckoutLocation";

import { createOrder } from "../services/createOrder";
import { createOrderItems } from "../services/createOrderItems";
import { sendWhatsAppOrder } from "../services/sendWhatsAppOrder";

export function useCheckout() {
  const router = useRouter();

  const {
    cart,
    clearCart,
    setShowOrder,
    setShowOrderPage,
    setCurrentOrderId,
    orderType,
  } = useCart();

  const { form, barrio, mesa, setBarrio, setMesa, handleChange } =
    useCheckoutForm();

  const { location, getLocation, sendRestaurantLocation } =
    useCheckoutLocation();

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

      clearCart();

      localStorage.removeItem("order_type");

      toast.success("Pedido enviado");

      if (window.innerWidth < 768) {
        router.push(`/dashboard/pedido/${order.id}`);
      } else {
        setCurrentOrderId(order.id);
        setShowOrder(false);
        setShowOrderPage(false);
      }
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
    orderType,

    setBarrio,
    setMesa,

    handleChange,
    getLocation,
    sendRestaurantLocation,

    handleSubmit,
  };
}
