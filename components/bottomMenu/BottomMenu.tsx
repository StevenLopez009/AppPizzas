"use client";
import { useRouter } from "next/navigation";
import { Home, Heart, ShoppingCart, User } from "lucide-react";
import { useState } from "react";

export default function BottomMenu() {
  const [active, setActive] = useState("home");
  const router = useRouter();

  const items = [
    { id: "home", icon: Home },
    { id: "fav", icon: Heart },
    { id: "orders", icon: ShoppingCart },
    { id: "profile", icon: User },
  ];

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-md">
      <div className="bg-gray-100 rounded-3xl px-6 py-4 shadow-xl flex justify-between items-center relative">
        <div
          className="absolute bottom-2 h-1 w-10 bg-orange-500 rounded-full transition-all duration-300"
          style={{
            left: `${items.findIndex((i) => i.id === active) * 25}%`,
            transform: "translateX(50%)",
          }}
        />

        {items.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.id;

          return (
            <button
              key={item.id}
              onClick={() => {
                setActive(item.id);

                if (item.id === "home") router.push("/");
                if (item.id === "fav") router.push("/favorites");
                if (item.id === "orders") router.push("/orders");
                if (item.id === "profile") router.push("/profile");
              }}
              className="flex flex-col items-center justify-center w-full"
            >
              <Icon
                size={26}
                className={`transition ${
                  isActive ? "text-gray-900" : "text-gray-400"
                }`}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
