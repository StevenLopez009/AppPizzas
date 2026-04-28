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
  title?: string;
  highlightColor?: string;
}

export default function Sidebar({
  menu,
  activePath,
  onNavigate,
  title = "Mi App",
  highlightColor = "orange-500",
}: SidebarProps) {
  return (
    <aside className="h-screen w-[260px] bg-white rounded-r-3xl p-6 shadow-md">
      {/* Header */}
      <div className="mb-10">
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
          const isActive = activePath === item.path;

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.path)}
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
