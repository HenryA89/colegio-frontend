import api from "../../services/api";

// Obtener evaluaciones de una clase específica
export const fetchEvaluacionesClase = async (claseId) => {
  try {
    const response = await api.get(`api/v1/clases/${claseId}/evaluaciones`);
    return response.data.evaluaciones || [];
  } catch (error) {
    console.error("❌ Error obteniendo evaluaciones de la clase:", error);
    throw new Error("No se pudieron cargar las evaluaciones de la clase");
  }
};

// Crear nueva evaluación para una clase
export const crearEvaluacionClase = async (claseId, evaluacionData) => {
  try {
    const response = await api.post(`api/v1/clases/${claseId}/evaluaciones`, evaluacionData);
    return response.data;
  } catch (error) {
    console.error("❌ Error creando evaluación:", error);
    throw new Error("No se pudo crear la evaluación");
  }
};

// Actualizar evaluación existente
export const actualizarEvaluacionClase = async (claseId, evaluacionId, evaluacionData) => {
  try {
    const response = await api.put(`api/v1/clases/${claseId}/evaluaciones/${evaluacionId}`, evaluacionData);
    return response.data;
  } catch (error) {
    console.error("❌ Error actualizando evaluación:", error);
    throw new Error("No se pudo actualizar la evaluación");
  }
};

// Eliminar evaluación de una clase
export const eliminarEvaluacionClase = async (claseId, evaluacionId) => {
  try {
    const response = await api.delete(`api/v1/clases/${claseId}/evaluaciones/${evaluacionId}`);
    return response.data;
  } catch (error) {
    console.error("❌ Error eliminando evaluación:", error);
    throw new Error("No se pudo eliminar la evaluación");
  }
};

// Obtener detalles de una evaluación específica
export const fetchDetallesEvaluacion = async (claseId, evaluacionId) => {
  try {
    const response = await api.get(`api/v1/clases/${claseId}/evaluaciones/${evaluacionId}`);
    return response.data;
  } catch (error) {
    console.error("❌ Error obteniendo detalles de evaluación:", error);
    throw new Error("No se pudieron cargar los detalles de la evaluación");
  }
};

// Obtener respuestas de estudiantes para una evaluación
export const fetchRespuestasEvaluacionClase = async (claseId, evaluacionId) => {
  try {
    const response = await api.get(`api/v1/clases/${claseId}/evaluaciones/${evaluacionId}/respuestas`);
    return response.data.respuestas || [];
  } catch (error) {
    console.error("❌ Error obteniendo respuestas de evaluación:", error);
    throw new Error("No se pudieron cargar las respuestas de la evaluación");
  }
};

// Publicar evaluación (hacerla visible para estudiantes)
export const publicarEvaluacion = async (claseId, evaluacionId) => {
  try {
    const response = await api.post(`api/v1/clases/${claseId}/evaluaciones/${evaluacionId}/publicar`);
    return response.data;
  } catch (error) {
    console.error("❌ Error publicando evaluación:", error);
    throw new Error("No se pudo publicar la evaluación");
  }
};

// Obtener estadísticas de evaluación
export const fetchEstadisticasEvaluacion = async (claseId, evaluacionId) => {
  try {
    const response = await api.get(`api/v1/clases/${claseId}/evaluaciones/${evaluacionId}/estadisticas`);
    return response.data;
  } catch (error) {
    console.error("❌ Error obteniendo estadísticas de evaluación:", error);
    throw new Error("No se pudieron cargar las estadísticas de la evaluación");
  }
};
