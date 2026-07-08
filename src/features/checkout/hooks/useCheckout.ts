"use client";

import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

import { useCheckoutForm } from "./useCheckoutForm";
import { useCheckoutLocation } from "./useCheckoutLocation";

import { createOrder } from "../services/createOrder";
import { createOrderItems } from "../services/createOrderItems";
import { sendWhatsAppOrder } from "../services/sendWhatsAppOrder";

export function useCheckout() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
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
    if (loading) return;

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
    if (form.pago === "digital" && orderType !== "mesa" && !form.comprobante) {
      toast.error("Debes subir el comprobante de pago.");
      return;
    }

    setLoading(true);

    try {
      let paymentProof: string | null = null;

      if (form.pago === "digital" && form.comprobante) {
        const formData = new FormData();
        formData.append("file", form.comprobante);

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          toast.error("No se pudo subir el comprobante");
          return;
        }

        const { url } = await response.json();
        paymentProof = url;
        console.log("paymentProof:", paymentProof);
      }
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
        paymentProof,
      });

      await createOrderItems(order.id, cart);

      clearCart();
      localStorage.removeItem("order_type");

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
    } finally {
      setLoading(false);
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
    loading,
  };
}
