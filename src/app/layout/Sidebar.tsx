import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Calendar,
  BarChart3,
  Settings,
} from "lucide-react";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/pacientes", label: "Pacientes", icon: Users },
  { to: "/consultas", label: "Consultas", icon: Calendar },
  { to: "/estadisticas", label: "Estadísticas", icon: BarChart3 },
  { to: "/configuracion", label: "Configuración", icon: Settings },
];

interface SidebarProps {
  onNavigate?: () => void;
}

export function Sidebar({ onNavigate }: SidebarProps) {
  return (
    <aside
      className={`min-h-screen w-64 shrink-0 flex-col border-r bg-card ${
        onNavigate ? "flex lg:hidden" : "hidden lg:flex"
      }`}
    >
      <div className="p-6 border-b">
        <h2 className="text-xl font-bold tracking-tight text-primary">
          Psimplicidad
        </h2>
        <p className="text-xs text-muted-foreground mt-1">
          Gestión profesional
        </p>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onNavigate}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`
              }
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}
