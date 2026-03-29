import api from "../api";

// Obtener estudiantes de una clase
export const fetchEstudiantesClase = async (claseId, token) => {
  try {
    const res = await api.get(`api/v1/profesor/clases/${claseId}/estudiantes`);
    return res.data.estudiantes || [];
  } catch (error) {
    console.error("Error al obtener estudiantes de la clase:", error);
    return [];
  }
};

// Registrar asistencia
export const registrarAsistencia = async (claseId, asistenciaData, token) => {
  try {
    const res = await api.post(
      `api/v1/profesor/clases/${claseId}/asistencia`,
      asistenciaData,
    );
    return res.data;
  } catch (error) {
    console.error("Error al registrar asistencia:", error);
    throw error;
  }
};

// Obtener historial de asistencia de una clase
export const fetchHistorialAsistencia = async (claseId, token) => {
  try {
    const res = await api.get(
      `api/v1/profesor/clases/${claseId}/asistencia/historial`,
    );
    return res.data.historial || [];
  } catch (error) {
    console.error("Error al obtener historial de asistencia:", error);
    return [];
  }
};

// Obtener estadísticas de asistencia
export const fetchEstadisticasAsistencia = async (claseId, token) => {
  try {
    const res = await api.get(
      `api/v1/profesor/clases/${claseId}/asistencia/estadisticas`,
    );
    return res.data.estadisticas || {};
  } catch (error) {
    console.error("Error al obtener estadísticas de asistencia:", error);
    return {};
  }
};
