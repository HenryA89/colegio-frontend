import api from "../../services/api";

// Obtener estudiantes de una clase específica
export const fetchEstudiantesPorClase = async (claseId) => {
  try {
    const response = await api.get(`api/v1/clases/${claseId}/estudiantes`);
    return response.data.estudiantes || [];
  } catch (error) {
    console.error("❌ Error obteniendo estudiantes de la clase:", error);
    throw new Error("No se pudieron cargar los estudiantes de la clase");
  }
};

// Obtener resultados académicos de todos los estudiantes
export const fetchResultadosEstudiantes = async () => {
  try {
    const response = await api.get("api/v1/estudiantes/resultados");
    return response.data.resultados || [];
  } catch (error) {
    console.error("❌ Error obteniendo resultados de estudiantes:", error);
    throw new Error("No se pudieron cargar los resultados de los estudiantes");
  }
};

// Obtener resultados de estudiantes por clase específica
export const fetchResultadosPorClase = async (claseId) => {
  try {
    const response = await api.get(`api/v1/clases/${claseId}/resultados`);
    return response.data.resultados || [];
  } catch (error) {
    console.error("❌ Error obteniendo resultados de la clase:", error);
    throw new Error("No se pudieron cargar los resultados de la clase");
  }
};

// Inscribir estudiante en una clase
export const inscribirEstudiante = async (claseId, estudianteData) => {
  try {
    const response = await api.post(`api/v1/clases/${claseId}/inscribir`, estudianteData);
    return response.data;
  } catch (error) {
    console.error("❌ Error inscribiendo estudiante:", error);
    throw new Error("No se pudo inscribir al estudiante");
  }
};

// Eliminar estudiante de una clase
export const eliminarEstudianteDeClase = async (claseId, estudianteId) => {
  try {
    const response = await api.delete(`api/v1/clases/${claseId}/estudiantes/${estudianteId}`);
    return response.data;
  } catch (error) {
    console.error("❌ Error eliminando estudiante de la clase:", error);
    throw new Error("No se pudo eliminar al estudiante de la clase");
  }
};

// Obtener estadísticas de la clase
export const fetchEstadisticasClase = async (claseId) => {
  try {
    const response = await api.get(`api/v1/clases/${claseId}/estadisticas`);
    return response.data;
  } catch (error) {
    console.error("❌ Error obteniendo estadísticas de la clase:", error);
    throw new Error("No se pudieron cargar las estadísticas de la clase");
  }
};
