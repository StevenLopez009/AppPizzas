"use client";

import { ShoppingBag } from "lucide-react";

interface Props {
  price: number;
  onAdd: () => void;
}

export default function ProductFooter({ price, onAdd }: Props) {
  const btnCls = `bg-brand-hover text-white px-8 py-4 rounded-2xl flex items-center gap-3 font-bold shadow-lg shadow-brand/20 active:scale-95 transition-transform`;

  return (
    <>
      {/* DESKTOP */}
      <div className="hidden md:flex mt-4 bg-surface/90 backdrop-blur-md p-6 border border-line rounded-2xl justify-between items-center shadow-lg">
        <div>
          <p className="text-fg-subtle text-xs">Precio</p>
          <p className="text-2xl font-black text-fg">${price.toLocaleString("es-CO")}</p>
        </div>
        <button onClick={onAdd} className={btnCls}>
          <ShoppingBag size={20} />
          Agregar
        </button>
      </div>

      {/* MOBILE */}
      <div className="z-50 fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md md:hidden bg-surface/90 backdrop-blur-md p-6 border-t border-line flex justify-between items-center rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.08)]">
        <div>
          <p className="text-fg-subtle text-xs">Precio</p>
          <p className="text-2xl font-black text-fg">${price.toLocaleString("es-CO")}</p>
        </div>
        <button onClick={onAdd} className={btnCls}>
          <ShoppingBag size={20} />
          Agregar
        </button>
      </div>
    </>
  );
}
