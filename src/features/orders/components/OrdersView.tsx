import {
  Plus,
  Minus,
  ChevronLeft,
  ShoppingBasket,
  Bike,
  Store,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function OrdersView({
  cart,
  total,
  isInRestaurant,
  updateQuantity,
  onOrder,
  onGoHome,
}: any) {
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
          onClick={onGoHome}
          className="bg-orange-500 text-white px-8 py-3 rounded-2xl font-bold shadow-lg shadow-orange-200"
        >
          Ver Menú
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen flex flex-col">
      {/* HEADER */}
      <div className="p-6 flex items-center gap-4">
        <Link href="/" className="p-2 bg-gray-50 rounded-full text-gray-600">
          <ChevronLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold text-gray-800">Mi Pedido</h1>
      </div>

      {/* LISTA */}
      <div className="px-6 space-y-6">
        {cart.map((item: any) => (
          <div key={item.id} className="flex gap-4 items-center">
            <div className="relative w-20 h-20 bg-gray-50 rounded-2xl overflow-hidden">
              <Image
                src={item.image || "/placeholder-pizza.jpg"}
                alt={item.name}
                fill
                className="object-contain p-2"
              />
            </div>

            <div className="flex-1">
              <h3 className="font-bold">{item.name}</h3>
              <p className="text-xs text-gray-400">
                {item.size} {item.extra ? `• ${item.extra}` : ""}
              </p>

              <p className="text-orange-600 font-bold">
                ${(item.price * item.quantity).toLocaleString("es-CO")}
              </p>
            </div>

            <div className="flex flex-col items-center">
              <button onClick={() => updateQuantity(item.id, "plus")}>
                <Plus size={16} />
              </button>
              <span>{item.quantity}</span>
              <button onClick={() => updateQuantity(item.id, "minus")}>
                <Minus size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* FOOTER */}
      <div className="p-4 border-t mt-auto">
        <div className="flex justify-between font-bold">
          <span>Total</span>
          <span>${total.toLocaleString("es-CO")}</span>
        </div>

        <div className="flex gap-3 mt-4">
          {isInRestaurant ? (
            <button
              className="w-full bg-orange-600 text-white py-4 rounded-2xl font-bold"
              onClick={() => onOrder("mesa")}
            >
              Pedir
            </button>
          ) : (
            <>
              <button
                className="flex items-center justify-center gap-2 w-full bg-gray-200 text-gray-800 py-3 rounded-2xl font-bold"
                onClick={() => onOrder("recoger")}
              >
                <Store /> Recoger
              </button>

              <button
                className="flex items-center justify-center gap-2 w-full bg-orange-600 text-white py-3 rounded-2xl font-bold"
                onClick={() => onOrder("domicilio")}
              >
                <Bike /> Domicilio
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
