import api from "./api"; // asegúrate de tener setAuthToken en api.js

// 🔹 Iniciar sesión de usuario
export const loginUsuario = async (correo, password, rol) => {
  try {
    // Envío de credenciales al backend
    const res = await api.post("/login", { correo, password, rol });

    // Extraemos el token y el usuario de la respuesta
    const { token, usuario } = res.data;

    // ✅ Guardamos en localStorage
    if (token) {
      localStorage.setItem("token", token);
      localStorage.setItem("usuario", JSON.stringify(usuario));
    }

    // Retornamos el usuario autenticado
    return { token, usuario };
  } catch (error) {
    console.error("❌ Error en login:", error.response?.data || error.message);
    return null;
  }
};

// 🔹 Registro de usuario
export const registrarUsuario = async (
  nombre,
  correo,
  password,
  password_confirmation,
  rol
) => {
  try {
    const res = await api.post("/registro", {
      nombre,
      correo,
      password,
      password_confirmation,
      rol,
    });
    return res.data;
  } catch (error) {
    console.error(
      "❌ Error en registro:",
      error.response?.data || error.message
    );
    return null;
  }
};

// 🔹 Cerrar sesión
export const logoutUsuario = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("usuario");
};

// 🔹 Obtener usuario autenticado
export const obtenerUsuarioAutenticado = () => {
  const usuario = localStorage.getItem("usuario");
  return usuario ? JSON.parse(usuario) : null;
};
