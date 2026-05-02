import { LogOut } from "lucide-react";

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
    <aside className="h-screen w-[260px] bg-white rounded-r-3xl p-6 shadow-md flex flex-col">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-xl font-semibold text-gray-700">
          {title.split(" ")[0]}{" "}
          <span className="text-brand">{title.split(" ").slice(1).join(" ")}</span>
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
                    ? "bg-white text-brand shadow-sm"
                    : "text-gray-400 hover:bg-white hover:text-gray-600"
                }`}
            >
              <Icon size={18} />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Logout */}
      {onLogout && (
        <button
          onClick={onLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all mt-2"
        >
          <LogOut size={18} />
          Cerrar sesión
        </button>
      )}
    </aside>
  );
}
