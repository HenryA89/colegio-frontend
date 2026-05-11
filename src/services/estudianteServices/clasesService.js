import api from "../api";

// Obtener clases del estudiante
export const fetchClasesEstudiante = async (token) => {
  try {
    const res = await api.get("/estudiante/clases");
    return res.data.clases || [];
  } catch (error) {
    console.error("Error al obtener clases:", error);
    return [];
  }
};

// Obtener detalles de una clase específica
export const fetchDetalleClase = async (claseId, token) => {
  try {
    const res = await api.get(`/estudiante/clases/${claseId}`);
    return res.data.clase || null;
  } catch (error) {
    console.error("Error al obtener detalle de clase:", error);
    return null;
  }
};

// Inscribirse a una clase
export const inscribirseAClase = async (claseId, token) => {
  try {
    const res = await api.post(`/estudiante/clases/${claseId}/inscribir`);
    return res.data;
  } catch (error) {
    console.error("Error al inscribirse a la clase:", error);
    throw error;
  }
};
