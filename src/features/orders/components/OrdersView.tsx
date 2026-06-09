import {
  Plus,
  Minus,
  ChevronLeft,
  ShoppingBasket,
  Bike,
  Store,
} from "lucide-react";
import Image from "next/image";

export default function OrdersView({
  cart,
  total,
  isInRestaurant,
  updateQuantity,
  onOrder,
  onGoHome,
  onBack,
  showBackArrow = true,
}: any) {
  if (cart.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-6 text-center">
        <div className="bg-surface-muted p-6 rounded-full mb-4">
          <ShoppingBasket size={48} className="text-fg-subtle" />
        </div>
        <h2 className="text-xl font-bold text-fg">Tu carrito está vacío</h2>
        <p className="text-fg-muted mt-2 mb-6">
          Parece que aún no has añadido ninguna pizza deliciosa.
        </p>
        <button
          onClick={onGoHome}
          className="bg-brand text-white px-8 py-3 rounded-2xl font-bold shadow-lg shadow-brand/30"
        >
          Ver Menú
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-surface min-h-screen flex flex-col">
      {/* HEADER */}
      <div className="p-6 flex items-center gap-4">
        {showBackArrow ? (
          <button
            type="button"
            onClick={onBack}
            className="p-2 bg-surface-muted rounded-full text-fg-muted hover:bg-line transition cursor-pointer"
            aria-label="Volver al menú"
          >
            <ChevronLeft size={20} />
          </button>
        ) : (
          <span className="w-10 shrink-0" aria-hidden />
        )}
        <h1 className="text-2xl font-bold text-fg">Mi Pedido</h1>
      </div>

      {/* LISTA */}
      <div className="px-6 space-y-6">
        {cart.map((item: any) => (
          <div key={item.id} className="flex gap-4 items-center">
            <div className="relative w-20 h-20 bg-surface-muted rounded-2xl overflow-hidden">
              <Image
                src={item.image || "/placeholder-pizza.jpg"}
                alt={item.name}
                fill
                className="object-contain p-2"
              />
            </div>

            <div className="flex-1">
              <h3 className="font-bold text-fg">{item.name}</h3>
              <p className="text-xs text-fg-subtle">
                {item.size} {item.extra ? `• ${item.extra}` : ""}
              </p>
              <p className="text-brand-text font-bold">
                ${(item.price * item.quantity).toLocaleString("es-CO")}
              </p>
            </div>

            <div className="flex flex-col items-center text-fg-muted">
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
      <div className="p-4 border-t border-line mt-auto">
        <div className="flex justify-between font-bold text-fg">
          <span>Total</span>
          <span>${total.toLocaleString("es-CO")}</span>
        </div>

        <div className=" mt-4">
          {isInRestaurant ? (
            <button
              className="w-full bg-brand-hover text-white py-4 rounded-2xl font-bold"
              onClick={() => onOrder("mesa")}
            >
              Pedir
            </button>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <button
                className="flex items-center justify-center gap-2 bg-surface-muted text-fg py-3 rounded-2xl font-bold"
                onClick={() => onOrder("recoger")}
              >
                <Store /> Recoger
              </button>

              <button
                className="flex items-center justify-center gap-2 bg-brand-hover text-white py-3 rounded-2xl font-bold"
                onClick={() => onOrder("domicilio")}
              >
                <Bike /> Domicilio
              </button>

              <button
                className="col-span-2 flex items-center justify-center gap-2 bg-brand-hover text-white py-3 rounded-2xl font-bold"
                onClick={() => onOrder("mesa")}
              >
                Restaurante
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
