import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/UseAuth";
import AccessDenied from "../pages/AccessDenied";

export default function PrivateRoute({ children, roles, rol }) {
  const { usuario } = useAuth();
  const allowedRoles = roles ?? rol ?? [];

  // Si no hay usuario → redirige al login
  if (!usuario) {
    return <Navigate to="/" replace />;
  }

  // Si el rol no tiene permisos → muestra página elegante
  if (allowedRoles.length > 0 && !allowedRoles.includes(usuario.rol)) {
    return <AccessDenied />;
  }

  return children;
}
