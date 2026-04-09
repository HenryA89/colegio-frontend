import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { routes } from "./routes/Routes";
import AuthProvider from "./context/AuthContext";
import PrivateRoute from "./components/PrivateRoute";
import DashboardLayout from "./layouts/DashboardLayout";
import NotFound from "./pages/NotFound";
import { Suspense } from "react";
import LoadingSpinner from "./components/LoadingSpinner";

// Componente para manejar el layout
const LayoutWrapper = ({ children }) => {
  const location = useLocation();

  // Verificar si la ruta actual es pública o privada
  const isPublicRoute = routes.some(
    (route) => route.path === location.pathname && !route.isPrivate,
  );

  if (isPublicRoute) {
    return <>{children}</>;
  }

  return <DashboardLayout>{children}</DashboardLayout>;
};

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {routes.map(({ path, element, isPrivate, roles }) => {
            if (isPrivate) {
              return (
                <Route
                  key={path}
                  path={path}
                  element={
                    <PrivateRoute roles={roles}>
                      <Suspense fallback={<LoadingSpinner />}>
                        <LayoutWrapper>{element}</LayoutWrapper>
                      </Suspense>
                    </PrivateRoute>
                  }
                />
              );
            }
            return (
              <Route
                key={path}
                path={path}
                element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <LayoutWrapper>{element}</LayoutWrapper>
                  </Suspense>
                }
              />
            );
          })}

          {/* Ruta 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
