"use client";

import { ShoppingBag } from "lucide-react";

interface Props {
  price: number;
  onAdd: () => void;
}

export default function ProductFooter({ price, onAdd }: Props) {
  return (
    <>
      {/* FOOTER DESKTOP */}
      <div
        className="
          hidden md:flex
          mt-4
          bg-white/90 backdrop-blur-md
          p-6
          border border-gray-100
          rounded-2xl
          justify-between items-center
          shadow-lg
        "
      >
        <div>
          <p className="text-gray-400 text-xs">Precio</p>

          <p className="text-2xl font-black text-gray-800">
            ${price.toLocaleString("es-CO")}
          </p>
        </div>

        <button
          onClick={onAdd}
          className="
            bg-brand-hover
            text-white
            px-8 py-4
            rounded-2xl
            flex items-center gap-3
            font-bold
            shadow-lg shadow-brand/20
            active:scale-95
            transition-transform
          "
        >
          <ShoppingBag size={20} />
          Agregar
        </button>
      </div>

      {/* FOOTER MOBILE */}
      <div
        className="
          z-50
          fixed
          bottom-0
          left-1/2
          -translate-x-1/2
          w-full
          max-w-md
          md:hidden
          bg-white/90
          backdrop-blur-md
          p-6
          border-t border-gray-100
          flex justify-between items-center
          rounded-t-3xl
          shadow-[0_-10px_40px_rgba(0,0,0,0.05)]
        "
      >
        <div>
          <p className="text-gray-400 text-xs">Precio</p>

          <p className="text-2xl font-black text-gray-800">
            ${price.toLocaleString("es-CO")}
          </p>
        </div>

        <button
          onClick={onAdd}
          className="
            bg-brand-hover
            text-white
            px-8 py-4
            rounded-2xl
            flex items-center gap-3
            font-bold
            shadow-lg shadow-brand/20
            active:scale-95
            transition-transform
          "
        >
          <ShoppingBag size={20} />
          Agregar
        </button>
      </div>
    </>
  );
}
