import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/UseAuth";
import {
  LayoutDashboard,
  User,
  BookOpen,
  ClipboardList,
  FileText,
  Activity,
  Users,
  BarChart2,
  GraduationCap,
  CheckSquare,
  ListChecks,
  X,
  LogOut,
} from "lucide-react";

// Objeto de íconos
const icons = {
  LayoutDashboard,
  User,
  BookOpen,
  ClipboardList,
  FileText,
  Activity,
  Users,
  BarChart2,
  GraduationCap,
  CheckSquare,
  ListChecks,
  X,
  LogOut,
};

export default function Sidebar({ onClose }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  if (!user) return null; // Si no hay usuario, no mostrar nada

  // Menús según rol
  const menuItems =
    {
      estudiante: [
        { to: "/dashboard", label: "Dashboard", icon: "LayoutDashboard" },
        { to: "/calificaciones", label: "Calificaciones", icon: "BarChart2" },
        { to: "/actividades", label: "Actividades", icon: "Activity" },
        { to: "/evaluaciones", label: "Evaluaciones", icon: "FileText" },
        { to: "/quiz", label: "Quiz", icon: "BookOpen" },
        { to: "/asistencia", label: "Asistencia", icon: "ClipboardList" },
      ],
      profesor: [
        { to: "/dashboard", label: "Dashboard", icon: "LayoutDashboard" },
        { to: "/clases", label: "Clases", icon: "BookOpen" },
        { to: "/evaluaciones", label: "Evaluaciones", icon: "FileText" },
        { to: "/actividades", label: "Actividades", icon: "ListChecks" },
        { to: "/estudiantesclases", label: "Estudiantes", icon: "Users" },
        { to: "/asistencias", label: "Asistencias", icon: "CheckSquare" },
      ],
      admin: [
        { to: "/dashboard", label: "Dashboard", icon: "LayoutDashboard" },
        { to: "/usuarios", label: "Usuarios", icon: "Users" },
        { to: "/materias", label: "Materias", icon: "GraduationCap" },
        { to: "/reportes", label: "Reportes", icon: "BarChart2" },
      ],
    }[user.rol] || [];

  const handleLogout = () => {
    logout();
    navigate("/login");
    if (onClose) onClose();
  };

  return (
    <div className="flex flex-col w-64 h-full bg-white shadow-lg dark:bg-gray-800">
      {/* Header del Sidebar */}
      <div className="flex items-center justify-between h-16 px-4 text-white bg-blue-600">
        <h1 className="text-xl font-semibold">Menú</h1>
        <button
          onClick={onClose}
          className="p-1 rounded-md lg:hidden hover:bg-blue-500 focus:outline-none"
          aria-label="Cerrar menú"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Menú de navegación */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive =
            location.pathname === item.to ||
            (item.to !== "/" && location.pathname.startsWith(item.to));
          const Icon = icons[item.icon] || icons.User; // Usar ícono por defecto si no se encuentra

          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={`flex items-center px-4 py-3 text-sm font-medium rounded-md mx-2 transition-colors ${
                isActive
                  ? "bg-blue-100 text-blue-700 dark:bg-blue-700 dark:text-white"
                  : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
              }`}
            >
              {Icon && <Icon className="flex-shrink-0 w-5 h-5 mr-3" />}
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Sección de perfil y logout */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <Link
          to="/perfil"
          onClick={onClose}
          className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          <icons.User className="w-5 h-5 mr-3" />
          <span>Mi Perfil</span>
        </Link>
        <button
          onClick={handleLogout}
          className="flex items-center w-full px-4 py-2 mt-2 text-sm font-medium text-red-600 rounded-md hover:bg-red-50 dark:text-red-400 dark:hover:bg-gray-700"
        >
          <LogOut className="w-5 h-5 mr-3" />
          <span>Cerrar sesión</span>
        </button>
      </div>
    </div>
  );
}
