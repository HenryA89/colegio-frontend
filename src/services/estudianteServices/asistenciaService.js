import api from "../api";

// Obtener asistencia del estudiante
export const fetchAsistencia = async (token) => {
  try {
    const res = await api.get("api/v1/estudiante/asistencia");
    return res.data.asistencia || [];
  } catch (error) {
    console.error("Error al obtener asistencia:", error);
    return [];
  }
};

// Obtener asistencia por clase
export const fetchAsistenciaPorClase = async (claseId, token) => {
  try {
    const res = await api.get(`api/v1/estudiante/asistencia/clase/${claseId}`);
    return res.data.asistencia || [];
  } catch (error) {
    console.error("Error al obtener asistencia por clase:", error);
    return [];
  }
};

// Obtener porcentaje de asistencia
export const fetchPorcentajeAsistencia = async (token) => {
  try {
    const res = await api.get("api/v1/estudiante/asistencia/porcentaje");
    return res.data.porcentaje || 0;
  } catch (error) {
    console.error("Error al obtener porcentaje de asistencia:", error);
    return 0;
  }
};
