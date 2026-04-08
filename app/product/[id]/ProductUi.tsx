"use client";
import { useRouter } from "next/navigation";
import { ChevronLeft, Heart, Pencil, ShoppingBag, Star } from "lucide-react";
import { useEffect, useState } from "react";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { createClient } from "@/lib/supabase/client";

export default function ProductUI({ product }: { product: any }) {
  const { addToCart } = useCart();
  const [selectedSize, setSelectedSize] = useState(product.prices[0]);
  const [selectedBorder, setSelectedBorder] = useState("tradicional");
  const [isAdmin, setIsAdmin] = useState(false);
  const [title, setTitle] = useState(product.name);
  const [description, setDescription] = useState(product.description);
  const [isEditing, setIsEditing] = useState(false);
  const [editablePrices, setEditablePrices] = useState(product.prices || []);
  const router = useRouter();

  const supabase = createClient();

  useEffect(() => {
    const getUserRole = async () => {
      const { data: userData } = await supabase.auth.getUser();

      const user = userData.user;

      if (!user) return;

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profile?.role === "admin") {
        setIsAdmin(true);
      }
    };

    getUserRole();
  }, []);

  const hasMultiplePrices = product.prices?.length > 1;
  const isPizza =
    product.category?.toLowerCase().includes("pizza") &&
    product.prices?.length > 1;

  const handleAddToCart = () => {
    const item = {
      id: crypto.randomUUID(),
      product_id: product.id,

      name: product.name,
      price: selectedSize.price,
      size: selectedSize.label,
      image: product.image_url,

      extra: product.category?.toLowerCase().includes("pizza")
        ? `Borde: ${selectedBorder}`
        : null,

      quantity: 1,
    };

    addToCart(item);
  };

  const handleUpdateProduct = async () => {
    await supabase
      .from("products")
      .update({ name: title, description: description, prices: editablePrices })
      .eq("id", product.id);

    setIsEditing(false);
    router.refresh();
  };

  const handlePriceChange = (index: number, value: string) => {
    const updated = [...editablePrices];
    updated[index].price = Number(value);
    setEditablePrices(updated);
  };

  const handleDeleteProduct = async () => {
    const confirmDelete = confirm(
      "¿Seguro que quieres eliminar este producto?",
    );

    if (!confirmDelete) return;

    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", product.id);

    if (error) {
      console.error(error);
      alert("Error al eliminar el producto");
      return;
    }

    router.push("/dashboardAdmin");
  };

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen pb-24 relative font-sans">
      <div className="relative h-[250px] w-full bg-gray-100">
        <Image
          src={product.image_url || "/placeholder-pizza.jpg"}
          alt={product.name}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
          <button
            onClick={() => router.back()}
            className="p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm active:scale-95 transition"
          >
            <ChevronLeft size={20} className="text-gray-700" />
          </button>

          <div className="flex items-center gap-2">
            {isAdmin ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-md "
              >
                <Pencil size={16} />
              </button>
            ) : (
              <button className="p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm">
                <Heart size={20} className="text-gray-700" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="px-6 pt-6">
        <div className="flex justify-between items-start mb-1">
          <span className="text-orange-500 font-medium text-sm">
            {product.category || "General"}
          </span>
          <div className="flex items-center gap-1">
            <Star size={16} className="fill-yellow-400 text-yellow-400" />
            <span className="font-bold text-sm">4.9</span>
          </div>
        </div>
        <div className="flex items-center justify-between mb-4 gap-2">
          {isEditing ? (
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleUpdateProduct();
              }}
              className="text-2xl font-bold text-gray-800 leading-tight border-b border-gray-300 outline-none w-full"
              autoFocus
            />
          ) : (
            <h1 className="text-2xl font-bold text-gray-800 leading-tight">
              {title}
            </h1>
          )}

          {isAdmin && !isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 bg-gray-900 text-white px-3 py-2 rounded-xl text-sm font-semibold shadow-md"
            >
              <Pencil size={16} />
            </button>
          )}
        </div>
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            {isEditing ? (
              <input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleUpdateProduct();
                }}
                className="text-sm  text-gray w-full"
                autoFocus
              />
            ) : (
              <p className="text-gray-400 text-sm leading-relaxed">
                {description}
              </p>
            )}
          </div>
        </div>
        {isAdmin && editablePrices?.length > 0 && (
          <div className="mb-4 space-y-2">
            {editablePrices.map((p: any, index: number) => (
              <div key={p.label} className="flex justify-between items-center">
                <span className="text-sm text-gray-600">{p.label}</span>

                {isEditing ? (
                  <input
                    type="number"
                    value={p.price}
                    onChange={(e) => handlePriceChange(index, e.target.value)}
                    className="w-24 text-right border-b border-gray-300 outline-none"
                  />
                ) : (
                  <span className="text-sm font-semibold">
                    ${p.price.toLocaleString("es-CO")}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

        {hasMultiplePrices && !isAdmin && (
          <div className="mb-8">
            <h3 className="font-bold text-gray-800 mb-3">
              Seleccione un tamaño
            </h3>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {product.prices.map((s: any) => (
                <button
                  key={s.label}
                  onClick={() => setSelectedSize(s)}
                  className={`px-6 py-3 rounded-2xl font-semibold whitespace-nowrap transition active:scale-95
                    ${
                      selectedSize?.label === s.label
                        ? "bg-orange-500 text-white shadow-lg shadow-orange-200"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {isPizza && !isAdmin && (
          <div className="mb-2">
            <h3 className="font-bold text-gray-800 mb-3">Bordes de la Pizza</h3>
            <select className="w-full border border-gray-100 rounded-xl p-3 bg-gray-50 text-gray-600 outline-none focus:ring-2 focus:ring-orange-500/20">
              <option value="queso">Queso</option>
              <option value="arequipe">arequipe</option>
              <option value="bocadillo">bocadillo</option>
              <option value="chocolate">chocolate</option>
              <option value="chocolate blanco">chocolate blanco</option>
              <option value="fresa">fresa</option>
              <option value="frutos amarillos">frutos amarillos</option>
              <option value="frutos rojos">frutos rojos</option>
              <option value="melocoton">melocoton</option>
              <option value="mora">mora</option>
              <option value="nucita">nucita</option>
              <option value="nutela">nutela</option>
              <option value="queso crema">queso crema</option>
            </select>
          </div>
        )}
        {!isAdmin && (
          <textarea
            placeholder="Quieres agregar algo al pedido? Ej: Sin cebolla, extra queso, etc..."
            className="w-full mt-4 p-4 rounded-2xl bg-gray-50 border border-gray-200 text-sm text-gray-700 placeholder-gray-400 
  outline-none resize-none transition-all duration-200
  focus:bg-white focus:border-orange-400 focus:ring-4 focus:ring-orange-100 mb-6"
          />
        )}
      </div>

      {/* BARRA INFERIOR DE COMPRA */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white/90 backdrop-blur-md p-6 border-t border-gray-100 flex justify-between items-center rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
        {!isAdmin ? (
          <div>
            <p className="text-gray-400 text-xs">Precio</p>
            <p className="text-2xl font-black text-gray-800">
              ${selectedSize?.price?.toLocaleString("es-CO") || 0}
            </p>
          </div>
        ) : (
          <>
            <button
              onClick={handleDeleteProduct}
              className="bg-red-600 text-white px-8 py-4 rounded-2xl flex items-center gap-3 font-bold shadow-lg shadow-orange-900/20 active:scale-95 transition-transform"
            >
              Eliminar
            </button>
            <button
              onClick={handleUpdateProduct}
              className=" bg-green-600 text-white px-8 py-4 rounded-2xl"
            >
              Guardar cambios
            </button>
          </>
        )}
        {!isAdmin && (
          <button
            className="bg-orange-600 text-white px-8 py-4 rounded-2xl flex items-center gap-3 font-bold shadow-lg shadow-orange-900/20 active:scale-95 transition-transform"
            onClick={handleAddToCart}
          >
            <ShoppingBag size={20} />
            Agregar
          </button>
        )}
      </div>
    </div>
  );
}
