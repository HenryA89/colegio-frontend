import api from "../api";

// Obtener materias (admin)
export const fetchMaterias = async (token) => {
  try {
    const res = await api.get("/admin/materias");
    return res.data.materias || [];
  } catch (error) {
    console.error("Error al obtener materias:", error);
    return [];
  }
};

// Crear materia (admin)
export const crearMateria = async (materiaData, token) => {
  try {
    const res = await api.post("/admin/materias", materiaData);
    return res.data;
  } catch (error) {
    console.error("Error al crear materia:", error);
    throw error;
  }
};

// Actualizar materia (admin)
export const actualizarMateria = async (materiaId, materiaData, token) => {
  try {
    const res = await api.put(`/admin/materias/${materiaId}`, materiaData);
    return res.data;
  } catch (error) {
    console.error("Error al actualizar materia:", error);
    throw error;
  }
};

// Eliminar materia (admin)
export const eliminarMateria = async (materiaId, token) => {
  try {
    const res = await api.delete(`/admin/materias/${materiaId}`);
    return res.data;
  } catch (error) {
    console.error("Error al eliminar materia:", error);
    throw error;
  }
};
