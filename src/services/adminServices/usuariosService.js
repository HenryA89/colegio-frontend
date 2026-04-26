import api from "../api";

// Obtener usuarios (admin)
export const fetchUsuarios = async (token) => {
  try {
    console.log("=== FETCH USUARIOS ===");
    console.log("Token recibido:", !!token);
    console.log("Endpoint:", "api/v1/admin/usuarios");

    const res = await api.get("api/v1/admin/usuarios");
    console.log("Respuesta HTTP:", res.status);
    console.log("Headers:", res.headers);
    console.log("Data cruda:", res.data);
    console.log("Data tipo:", typeof res.data);

    // Intentar diferentes formatos de respuesta
    let usuarios = [];

    if (Array.isArray(res.data)) {
      usuarios = res.data;
    } else if (
      res.data &&
      res.data.usuarios &&
      Array.isArray(res.data.usuarios)
    ) {
      usuarios = res.data.usuarios;
    } else if (res.data && res.data.data && Array.isArray(res.data.data)) {
      usuarios = res.data.data;
    } else if (res.data && typeof res.data === "object") {
      // Buscar arrays dentro del objeto
      const arrays = Object.values(res.data).filter((val) =>
        Array.isArray(val),
      );
      if (arrays.length > 0) {
        usuarios = arrays[0];
      }
    }

    console.log("Usuarios extraídos:", usuarios);
    console.log("Cantidad:", usuarios.length);

    return usuarios;
  } catch (error) {
    console.error("=== ERROR FETCH USUARIOS ===");
    console.error("Error completo:", error);
    console.error("Respuesta del servidor:", error.response?.data);
    console.error("Status:", error.response?.status);
    console.error("Headers:", error.response?.headers);

    // Si es error 401, puede ser problema de autenticación
    if (error.response?.status === 401) {
      console.error("Error de autenticación - token inválido o expirado");
    }

    return [];
  }
};

// Crear usuario (admin)
export const crearUsuario = async (usuarioData, token) => {
  try {
    const res = await api.post("api/v1/admin/usuarios", usuarioData);
    return res.data;
  } catch (error) {
    console.error("Error al crear usuario:", error);
    throw error;
  }
};

// Actualizar usuario (admin)
export const actualizarUsuario = async (usuarioId, usuarioData, token) => {
  try {
    const res = await api.put(
      `api/v1/admin/usuarios/${usuarioId}`,
      usuarioData,
    );
    return res.data;
  } catch (error) {
    console.error("Error al actualizar usuario:", error);
    throw error;
  }
};

// Eliminar usuario (admin)
export const eliminarUsuario = async (usuarioId, token) => {
  try {
    const res = await api.delete(`api/v1/admin/usuarios/${usuarioId}`);
    return res.data;
  } catch (error) {
    console.error("Error al eliminar usuario:", error);
    throw error;
  }
};
