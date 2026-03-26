"use client";

import { createContext, useContext, useState, useEffect } from "react";

interface CartItem {
  id: string;
  product_id: string;
  name: string;
  price: number;
  size: string;
  image: string;
  extra?: string | null;
  quantity: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  clearCart: () => void;
  totalItems: number;
  updateQuantity: (id: string, action: "plus" | "minus") => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);

  // Cargar carrito de localStorage al iniciar
  useEffect(() => {
    const savedCart = localStorage.getItem("pizza-cart");
    if (savedCart) setCart(JSON.parse(savedCart));
  }, []);

  // Guardar en localStorage cada vez que cambie
  useEffect(() => {
    localStorage.setItem("pizza-cart", JSON.stringify(cart));
  }, [cart]);

  const addToCart = (newItem: CartItem) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find(
        (item) =>
          item.product_id === newItem.product_id &&
          item.size === newItem.size &&
          item.extra === newItem.extra,
      );

      if (existingItem) {
        return prevCart.map((item) =>
          item.product_id === newItem.product_id &&
          item.size === newItem.size &&
          item.extra === newItem.extra
            ? { ...item, quantity: item.quantity + newItem.quantity }
            : item,
        );
      }

      return [...prevCart, newItem];
    });
  };

  const updateQuantity = (id: string, action: "plus" | "minus") => {
    setCart((prevCart) =>
      prevCart
        .map((item) => {
          if (item.id === id) {
            const newQuantity =
              action === "plus" ? item.quantity + 1 : item.quantity - 1;
            return { ...item, quantity: newQuantity };
          }
          return item;
        })
        .filter((item) => item.quantity > 0),
    );
  };

  const clearCart = () => setCart([]);

  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{ cart, addToCart, clearCart, totalItems, updateQuantity }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context)
    throw new Error("useCart debe usarse dentro de un CartProvider");
  return context;
};
