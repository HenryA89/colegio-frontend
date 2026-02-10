import api from "../api";

// Obtener usuarios (admin)
export const fetchUsuarios = async (token) => {
  try {
    const res = await api.get("/admin/usuarios");
    return res.data.usuarios || [];
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    return [];
  }
};

// Crear usuario (admin)
export const crearUsuario = async (usuarioData, token) => {
  try {
    const res = await api.post("/admin/usuarios", usuarioData);
    return res.data;
  } catch (error) {
    console.error("Error al crear usuario:", error);
    throw error;
  }
};

// Actualizar usuario (admin)
export const actualizarUsuario = async (usuarioId, usuarioData, token) => {
  try {
    const res = await api.put(`/admin/usuarios/${usuarioId}`, usuarioData);
    return res.data;
  } catch (error) {
    console.error("Error al actualizar usuario:", error);
    throw error;
  }
};

// Eliminar usuario (admin)
export const eliminarUsuario = async (usuarioId, token) => {
  try {
    const res = await api.delete(`/admin/usuarios/${usuarioId}`);
    return res.data;
  } catch (error) {
    console.error("Error al eliminar usuario:", error);
    throw error;
  }
};
