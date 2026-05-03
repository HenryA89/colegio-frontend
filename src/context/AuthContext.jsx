import { createContext, useState, useEffect } from "react";
import { loginUsuario, registrarUsuario } from "../services/AutnServices"; // ✅ corregido

// Creamos el contexto global de autenticación
export const AuthContext = createContext();

export default function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🧠 Cargar sesión almacenada al iniciar la app
  useEffect(() => {
    const data = localStorage.getItem("usuario");
    if (data) {
      setUsuario(JSON.parse(data));
    }
    setLoading(false);
  }, []);

  // 🔐 Login real contra backend
  const login = async (correo, password, rol) => {
    try {
      console.log("🔐 Iniciando sesión desde AuthContext:", { correo, rol });

      const response = await loginUsuario(correo, password, rol);

      if (!response) {
        throw new Error("No se pudo conectar con el servidor");
      }

      const { token, usuario } = response;

      if (token && usuario) {
        // Validar que el usuario tenga ID numérico
        if (!usuario.id || typeof usuario.id !== "number") {
          throw new Error(
            "Respuesta de usuario inválida: ID no encontrado o no es numérico",
          );
        }

        // Crear objeto de usuario con token incluido
        const userData = {
          ...usuario,
          token: token,
          rol: usuario.rol?.toLowerCase() || rol.toLowerCase(), // Asegurar que siempre haya un rol
        };

        console.log("✅ Usuario autenticado:", userData);

        // Actualizar estado y almacenamiento local
        setUsuario(userData);
        localStorage.setItem("token", token);
        localStorage.setItem("usuario", JSON.stringify(userData));

        return userData;
      } else {
        throw new Error(response?.message || "Error en la autenticación");
      }
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      throw error;
    }
  };

  // 🧾 Registro real (si el backend lo permite)
  const register = async (
    nombre,
    correo,
    password,
    password_confirmation,
    rol,
  ) => {
    try {
      const data = await registrarUsuario(
        nombre,
        correo,
        password,
        password_confirmation,
        rol,
      );

      if (data?.token) {
        const userData = { ...data.usuario, token: data.token };
        setUsuario(userData);
        localStorage.setItem("usuario", JSON.stringify(userData));
        localStorage.setItem("token", data.token);
        return userData;
      } else {
        throw new Error(data?.error || "Error al registrar usuario");
      }
    } catch (error) {
      console.error("Error en registro:", error);
      throw error;
    }
  };

  // 🚪 Logout
  const logout = () => {
    localStorage.removeItem("usuario");
    localStorage.removeItem("token");
    setUsuario(null);
  };

  return (
    <AuthContext.Provider value={{ usuario, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
