"use client";

import { useCart } from "@/context/CartContext";
import { Plus, Minus, ChevronLeft, ShoppingBasket } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Bike, Store } from "lucide-react";
import { useState, useEffect } from "react";

export default function Orders() {
  const [isInRestaurant, setIsInRestaurant] = useState(false);
  const { cart, updateQuantity, setOrderType } = useCart();
  const router = useRouter();

  const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const getDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ) => {
    const R = 6371e3; // metros
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  };

  useEffect(() => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;

        // Coordenadas de tu restaurante
        const restaurantLat = 4.7305116;
        const restaurantLng = -74.2782851;

        const distance = getDistance(
          userLat,
          userLng,
          restaurantLat,
          restaurantLng,
        );

        // si está a menos de 50 metros → está en el local
        if (distance < 50) {
          setIsInRestaurant(true);
        }
      },
      (error) => {
        console.log("Error obteniendo ubicación", error);
      },
    );
  }, []);

  if (cart.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-6 text-center">
        <div className="bg-gray-100 p-6 rounded-full mb-4">
          <ShoppingBasket size={48} className="text-gray-400" />
        </div>
        <h2 className="text-xl font-bold text-gray-800">
          Tu carrito está vacío
        </h2>
        <p className="text-gray-500 mt-2 mb-6">
          Parece que aún no has añadido ninguna pizza deliciosa.
        </p>
        <button
          onClick={() => router.push("/")}
          className="bg-orange-500 text-white px-8 py-3 rounded-2xl font-bold shadow-lg shadow-orange-200"
        >
          Ver Menú
        </button>
      </div>
    );
  }

  const handleOrder = (type: "domicilio" | "recoger" | "mesa") => {
    setOrderType(type);
    if (window.innerWidth < 768) {
      router.push("/orders/checkout");
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen flex flex-col font-sans">
      {/* HEADER */}
      <div className="p-6 flex items-center gap-4">
        <Link href="/" className="p-2 bg-gray-50 rounded-full text-gray-600">
          <ChevronLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold text-gray-800">Mi Pedido</h1>
      </div>

      {/* LISTA DE PRODUCTOS */}
      <div className="px-6 space-y-6">
        {cart.map((item) => (
          <div key={item.id} className="flex gap-4 items-center">
            <div className="relative w-20 h-20 bg-gray-50 rounded-2xl overflow-hidden flex-shrink-0">
              <Image
                src={item.image || "/placeholder-pizza.jpg"}
                alt={item.name}
                fill
                className="object-contain p-2"
              />
            </div>

            <div className="flex-1">
              <h3 className="font-bold text-gray-800 leading-tight">
                {item.name}
              </h3>
              <p className="text-gray-400 text-xs mt-1">
                {item.size} {item.extra ? `• ${item.extra}` : ""}
              </p>
              {item.additionals && item.additionals.length > 0 && (
                <div className="mt-1">
                  <p className="text-gray-500 text-xs"> Adicionales:</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {item.additionals.map((additional: any, idx: number) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 text-xs bg-orange-50 text-orange-700 px-2 py-0.5 rounded-full"
                      >
                        {additional.name}
                        <span className="text-orange-400">
                          (+${additional.price.toLocaleString("es-CO")})
                        </span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
              <p>
                {item.observations && (
                  <span className="text-gray-500 text-xs mt-1 block">
                    {item.observations}
                  </span>
                )}
              </p>
              <p className="text-orange-600 font-bold mt-1">
                ${(item.price * item.quantity).toLocaleString("es-CO")}
              </p>
            </div>

            {/* CONTROLES DE CANTIDAD */}
            <div className="flex flex-col items-center gap-2 bg-gray-50 rounded-xl p-1">
              <button
                className="p-1 hover:text-orange-500"
                onClick={() => updateQuantity(item.id, "plus")}
              >
                <Plus size={16} />
              </button>
              <span className="font-bold text-sm text-gray-700">
                {item.quantity}
              </span>
              <button
                className="p-1 hover:text-red-500"
                onClick={() => updateQuantity(item.id, "minus")}
              >
                <Minus size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div
        className="
          fixed sm:relative 
          bottom-0 left-0 
          w-full max-w-md sm:max-w-none 
          mx-auto 
          bg-white 
          p-4 sm:p-6 
          border-t border-gray-100 
          rounded-t-3xl sm:rounded-2xl 
          shadow-[0_-10px_40px_rgba(0,0,0,0.08)] sm:shadow-none
          sm:mt-auto
        "
      >
        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-lg sm:text-xl font-bold text-gray-800 pt-2 border-t border-dashed">
            <span>Total</span>
            <span>${total.toLocaleString("es-CO")}</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 py-2 sm:px-0">
          {isInRestaurant ? (
            <button
              onClick={() => handleOrder("mesa")}
              className="w-full bg-orange-600 text-white py-4 rounded-2xl font-bold"
            >
              Pedir
            </button>
          ) : (
            <>
              <button
                onClick={() => handleOrder("recoger")}
                className="flex items-center justify-center gap-2 w-full bg-gray-200 text-gray-800 py-3 rounded-2xl font-bold"
              >
                <Store size={20} />
                Recoger
              </button>

              <button
                onClick={() => handleOrder("domicilio")}
                className="flex items-center justify-center gap-2 w-full bg-orange-600 text-white py-3 rounded-2xl font-bold"
              >
                <Bike size={20} />
                Domicilio
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
