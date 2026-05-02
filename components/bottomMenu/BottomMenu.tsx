"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

type MenuItem = {
  id: string;
  icon: any;
  path?: string;
  onClick?: () => void;
  badge?: number;
};

type BottomMenuProps = {
  items: MenuItem[];
  defaultActive?: string;
};

export default function BottomMenu({ items, defaultActive }: BottomMenuProps) {
  const [active, setActive] = useState(defaultActive || items[0]?.id);
  const router = useRouter();

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-md">
      <div className="bg-gray-100 rounded-3xl px-6 py-4 shadow-xl flex justify-between items-center relative">
        {/* indicador */}
        <div
          className="absolute bottom-2 h-1 w-10 bg-brand rounded-full transition-all duration-300"
          style={{
            left: `${items.findIndex((i) => i.id === active) * (100 / items.length)}%`,
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

                if (item.onClick) {
                  item.onClick();
                } else if (item.path) {
                  router.push(item.path);
                }
              }}
              className="flex flex-col items-center justify-center w-full relative"
            >
              <Icon
                size={26}
                className={`transition ${
                  isActive ? "text-gray-900" : "text-gray-400"
                }`}
              />
              {item.badge !== undefined && item.badge > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 shadow-md">
                  {item.badge > 99 ? "99+" : item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
