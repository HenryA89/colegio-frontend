import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/UseAuth";
import AccessDenied from "../pages/AccessDenied";

export default function PrivateRoute({ children, rol }) {
  const { usuario } = useAuth();

  // Si no hay usuario → redirige al login
  if (!usuario) {
    return <Navigate to="/" replace />;
  }

  // Si el rol no tiene permisos → muestra página elegante
  if (rol && rol.length > 0 && !rol.includes(usuario.rol)) {
    return <AccessDenied />;
  }

  return children;
}
