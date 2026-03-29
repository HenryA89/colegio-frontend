import api from "../api";

// Obtener calificaciones del estudiante
export const fetchCalificaciones = async (token) => {
  try {
    const res = await api.get("api/v1/estudiante/calificaciones");
    return res.data.calificaciones || [];
  } catch (error) {
    console.error("Error al obtener calificaciones:", error);
    return [];
  }
};

// Obtener calificaciones por clase
export const fetchCalificacionesPorClase = async (claseId, token) => {
  try {
    const res = await api.get(
      `api/v1/estudiante/calificaciones/clase/${claseId}`,
    );
    return res.data.calificaciones || [];
  } catch (error) {
    console.error("Error al obtener calificaciones por clase:", error);
    return [];
  }
};

// Obtener promedio general
export const fetchPromedioGeneral = async (token) => {
  try {
    const res = await api.get("api/v1/estudiante/calificaciones/promedio");
    return res.data.promedio || 0;
  } catch (error) {
    console.error("Error al obtener promedio:", error);
    return 0;
  }
};
