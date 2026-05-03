import api from "./api"; // asegúrate de tener setAuthToken en api.js

// 🔹 Iniciar sesión de usuario
export const loginUsuario = async (correo, password, rol) => {
  try {
    console.log("🔐 Iniciando sesión:", { correo, rol });

    // Validar datos de entrada
    if (!correo || !password || !rol) {
      throw new Error("Correo, contraseña y rol son obligatorios");
    }

    // Envío de credenciales al backend
    const res = await api.post("/login", { correo, password, rol });

    console.log("✅ Respuesta de login:", res.status);

    // Extraemos el token y el usuario de la respuesta
    const { token, usuario } = res.data;

    // ✅ Guardamos en localStorage
    if (token) {
      localStorage.setItem("token", token);
      localStorage.setItem("usuario", JSON.stringify(usuario));
      console.log("🔑 Token y usuario guardados en localStorage");
    }

    // Retornamos el usuario autenticado
    return { token, usuario };
  } catch (error) {
    console.error("❌ Error en login:", error.response?.data || error.message);
    throw error; // Lanzar error para manejo en el componente
  }
};

// 🔹 Registro de usuario
export const registrarUsuario = async (
  nombre,
  correo,
  password,
  password_confirmation,
  rol,
) => {
  try {
    console.log("📝 Registrando usuario:", { correo, rol });

    // Validar datos de entrada
    if (!nombre || !correo || !password || !rol) {
      throw new Error("Todos los campos son obligatorios");
    }

    if (password !== password_confirmation) {
      throw new Error("Las contraseñas no coinciden");
    }

    const res = await api.post("/registro", {
      nombre,
      correo,
      password,
      password_confirmation,
      rol,
    });

    console.log("✅ Usuario registrado:", res.status);
    return res.data;
  } catch (error) {
    console.error(
      "❌ Error en registro:",
      error.response?.data || error.message,
    );
    throw error; // Lanzar error para manejo en el componente
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
