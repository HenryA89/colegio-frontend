import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/UseAuth";
import { useState, useEffect } from "react";
import { Menu, X, ArrowLeft } from "lucide-react";

export default function Navbar({ toggleSidebar }) {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showBackButton, setShowBackButton] = useState(false);

  // Ocultar menú en pantallas grandes
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Mostrar botón de regresar si no estamos en la página principal del dashboard
  useEffect(() => {
    const dashboardPaths = ["/dashboard", "/"];
    setShowBackButton(
      !dashboardPaths.includes(location.pathname) && location.pathname !== "/",
    );
  }, [location]);

  // Si no hay usuario logueado, no mostramos Navbar
  if (!usuario) return null;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const goBack = () => {
    navigate(-1);
  };

  return (
    <>
      <nav className="text-white bg-blue-600 shadow-lg">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Menú móvil y logo */}
            <div className="flex items-center">
              <button
                onClick={toggleSidebar}
                className="p-2 text-blue-200 rounded-md lg:hidden hover:text-white hover:bg-blue-500 focus:outline-none"
                aria-label="Toggle menu"
              >
                <Menu className="w-6 h-6" />
              </button>

              {showBackButton && (
                <button
                  onClick={goBack}
                  className="p-2 ml-2 text-blue-200 rounded-md hover:text-white hover:bg-blue-500 focus:outline-none"
                  aria-label="Go back"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
              )}

              <div className="flex items-center flex-shrink-0">
                <h1 className="ml-2 text-xl font-bold">Estud_IA</h1>
              </div>
            </div>

            {/* Menú desktop */}
            <div className="hidden lg:block">
              <div className="flex items-center ml-4 space-x-4">
                {usuario.rol === "profesor" && (
                  <>
                    <NavLink to="/profesor/clases" icon="📘" text="Clases" />
                    <NavLink
                      to="/profesor/evaluaciones-clase"
                      icon="📝"
                      text="Evaluaciones"
                    />
                    <NavLink to="/profesor/quiz-ai" icon="🤖" text="Quiz IA" />
                    <NavLink
                      to="/profesor/estudiantes-clases"
                      icon="�"
                      text="Estudiantes"
                    />
                    <NavLink
                      to="/profesor/actividades"
                      icon="🎯"
                      text="Actividades"
                    />
                    <NavLink
                      to="/profesor/asistencias"
                      icon="📋"
                      text="Asistencia"
                    />
                  </>
                )}

                {usuario.rol === "estudiante" && (
                  <>
                    <NavLink
                      to="/estudiante/calificaciones"
                      icon="📊"
                      text="Calificaciones"
                    />
                    <NavLink
                      to="/estudiante/actividades"
                      icon="🎯"
                      text="Actividades"
                    />
                    <NavLink
                      to="/estudiante/evaluaciones"
                      icon="📝"
                      text="Evaluaciones"
                    />
                  </>
                )}

                {usuario.rol === "admin" && (
                  <>
                    <NavLink to="/admin/usuarios" icon="👥" text="Usuarios" />
                    <NavLink to="/admin/materias" icon="📚" text="Materias" />
                    <NavLink to="/admin/reportes" icon="📑" text="Reportes" />
                  </>
                )}
              </div>
            </div>

            {/* Perfil y logout desktop */}
            <div className="hidden lg:block">
              <div className="flex items-center ml-4 space-x-4">
                <NavLink to="/perfil" icon="👤" text="Perfil" />
                <button
                  onClick={handleLogout}
                  className="flex items-center px-3 py-2 text-sm font-medium text-red-300 rounded-md hover:text-white hover:bg-blue-500"
                >
                  <span className="mr-1">🚪</span> Cerrar sesión
                </button>
              </div>
            </div>

            {/* Botón menú móvil */}
            <div className="lg:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 text-blue-200 rounded-md hover:text-white hover:bg-blue-500 focus:outline-none"
                aria-label="Toggle menu"
              >
                {isMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Menú móvil desplegable */}
        {isMenuOpen && (
          <div className="bg-blue-700 lg:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {usuario.rol === "profesor" && (
                <>
                  <MobileNavLink
                    to="/profesor/clases"
                    icon="📘"
                    text="Clases"
                    onClick={() => setIsMenuOpen(false)}
                  />
                  <MobileNavLink
                    to="/profesor/evaluaciones-clase"
                    icon="📝"
                    text="Evaluaciones"
                    onClick={() => setIsMenuOpen(false)}
                  />
                  <MobileNavLink
                    to="/profesor/quiz-ai"
                    icon="🤖"
                    text="Quiz IA"
                    onClick={() => setIsMenuOpen(false)}
                  />
                  <MobileNavLink
                    to="/profesor/estudiantes-clases"
                    icon="👥"
                    text="Estudiantes"
                    onClick={() => setIsMenuOpen(false)}
                  />
                  <MobileNavLink
                    to="/profesor/actividades"
                    icon="🎯"
                    text="Actividades"
                    onClick={() => setIsMenuOpen(false)}
                  />
                  <MobileNavLink
                    to="/profesor/asistencias"
                    icon="📋"
                    text="Asistencia"
                    onClick={() => setIsMenuOpen(false)}
                  />
                </>
              )}

              {usuario.rol === "estudiante" && (
                <>
                  <MobileNavLink
                    to="/estudiante/calificaciones"
                    icon="📊"
                    text="Calificaciones"
                    onClick={() => setIsMenuOpen(false)}
                  />
                  <MobileNavLink
                    to="/estudiante/actividades"
                    icon="🎯"
                    text="Actividades"
                    onClick={() => setIsMenuOpen(false)}
                  />
                  <MobileNavLink
                    to="/estudiante/evaluaciones"
                    icon="📝"
                    text="Evaluaciones"
                    onClick={() => setIsMenuOpen(false)}
                  />
                </>
              )}

              {usuario.rol === "admin" && (
                <>
                  <MobileNavLink
                    to="/admin/usuarios"
                    icon="👥"
                    text="Usuarios"
                    onClick={() => setIsMenuOpen(false)}
                  />
                  <MobileNavLink
                    to="/admin/materias"
                    icon="📚"
                    text="Materias"
                    onClick={() => setIsMenuOpen(false)}
                  />
                  <MobileNavLink
                    to="/admin/reportes"
                    icon="📑"
                    text="Reportes"
                    onClick={() => setIsMenuOpen(false)}
                  />
                </>
              )}

              <div className="pt-2 mt-2 border-t border-blue-600">
                <MobileNavLink
                  to="/perfil"
                  icon="👤"
                  text="Perfil"
                  onClick={() => setIsMenuOpen(false)}
                />
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center w-full px-3 py-2 text-sm font-medium text-left text-red-300 rounded-md hover:text-white hover:bg-blue-500"
                >
                  <span className="mr-2">🚪</span> Cerrar sesión
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}

// Componente para enlaces de navegación en desktop
function NavLink({ to, icon, text }) {
  return (
    <Link
      to={to}
      className="flex items-center px-3 py-2 text-sm font-medium text-blue-200 rounded-md hover:text-white hover:bg-blue-500"
    >
      <span className="mr-2">{icon}</span>
      {text}
    </Link>
  );
}

// Componente para enlaces de navegación en móvil
function MobileNavLink({ to, icon, text, onClick }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="flex items-center px-3 py-2 text-base font-medium text-blue-200 rounded-md hover:text-white hover:bg-blue-500"
    >
      <span className="mr-3">{icon}</span>
      {text}
    </Link>
  );
}
