"use client";

import { usePathname, useRouter } from "next/navigation";

type MenuItem = {
  id: string;
  label: string;
  icon: any;
  path: string;
};

interface SidebarProps {
  menu: MenuItem[];
  title?: string;
  highlightColor?: string; // opcional (ej: orange-500)
}

export default function Sidebar({
  menu,
  title = "Mi App",
  highlightColor = "orange-500",
}: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <aside className="fixed md:static top-0 left-0 h-screen w-[260px] bg-white rounded-r-3xl p-6 shadow-md z-50 transition-transform duration-300">
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <h1 className="text-xl font-semibold text-gray-700">
          {title.split(" ")[0]}{" "}
          <span className={`text-${highlightColor}`}>
            {title.split(" ").slice(1).join(" ")}
          </span>
        </h1>
      </div>

      {/* Menu */}
      <nav className="flex flex-col gap-3">
        {menu.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.path;

          return (
            <button
              key={item.id}
              onClick={() => router.push(item.path)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all
                ${
                  isActive
                    ? "bg-white text-orange-500 shadow-sm"
                    : "text-gray-400 hover:bg-white hover:text-gray-600"
                }`}
            >
              <Icon size={18} />
              {item.label}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
