"use client";

import { LogOut } from "lucide-react";
import ThemeToggle from "@/components/ui/ThemeToggle";

type MenuItem = {
  id: string;
  label: string;
  icon: any;
  path: string;
};

interface SidebarProps {
  menu: MenuItem[];
  activePath: string;
  onNavigate: (path: string) => void;
  onLogout?: () => void;
  title?: string;
}

export default function Sidebar({
  menu,
  activePath,
  onNavigate,
  onLogout,
  title = "Mi App",
}: SidebarProps) {
  return (
    <aside className="h-screen w-[260px] bg-surface rounded-r-3xl p-6 shadow-md flex flex-col border-r border-line-muted">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-xl font-semibold text-fg">
          {title.split(" ")[0]}{" "}
          <span className="text-brand">
            {title.split(" ").slice(1).join(" ")}
          </span>
        </h1>
      </div>

      {/* Menu */}
      <nav className="flex flex-col gap-3 flex-1">
        {menu.map((item) => {
          const Icon = item.icon;
          const isActive = activePath === item.path;

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.path)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all
                ${
                  isActive
                    ? "bg-surface-muted text-brand shadow-sm"
                    : "text-fg-subtle hover:bg-surface-muted hover:text-fg"
                }`}
            >
              <Icon size={18} />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Theme toggle + Logout */}
      <div className="flex flex-col gap-1 mt-2">
        <ThemeToggle className="w-full justify-start" />

        {onLogout && (
          <button
            onClick={onLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-fg-subtle hover:bg-red-50 dark:hover:bg-red-950/40 hover:text-red-500 dark:hover:text-red-400 transition-all"
          >
            <LogOut size={18} />
            Cerrar sesión
          </button>
        )}
      </div>
    </aside>
  );
}
