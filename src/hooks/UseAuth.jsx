import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

// Hook personalizado para acceder al contexto de autenticación
export const useAuth = () => {
  return useContext(AuthContext);
};
