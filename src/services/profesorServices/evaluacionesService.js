import api from "../api";

// Obtener evaluaciones del profesor
export const fetchEvaluacionesProfesor = async (token) => {
  try {
    const res = await api.get("/profesor/evaluaciones");
    return res.data.evaluaciones || [];
  } catch (error) {
    console.error("Error al obtener evaluaciones:", error);
    return [];
  }
};

// Crear evaluación
export const crearEvaluacion = async (evaluacionData, token) => {
  try {
    const res = await api.post("/profesor/evaluaciones", evaluacionData);
    return res.data;
  } catch (error) {
    console.error("Error al crear evaluación:", error);
    throw error;
  }
};

// Actualizar evaluación
export const actualizarEvaluacion = async (
  evaluacionId,
  evaluacionData,
  token
) => {
  try {
    const res = await api.put(
      `/profesor/evaluaciones/${evaluacionId}`,
      evaluacionData
    );
    return res.data;
  } catch (error) {
    console.error("Error al actualizar evaluación:", error);
    throw error;
  }
};

// Eliminar evaluación
export const eliminarEvaluacion = async (evaluacionId, token) => {
  try {
    const res = await api.delete(`/profesor/evaluaciones/${evaluacionId}`);
    return res.data;
  } catch (error) {
    console.error("Error al eliminar evaluación:", error);
    throw error;
  }
};

// Obtener respuestas de estudiantes para una evaluación
export const fetchRespuestasEvaluacion = async (evaluacionId, token) => {
  try {
    const res = await api.get(
      `/profesor/evaluaciones/${evaluacionId}/respuestas`
    );
    return res.data.respuestas || [];
  } catch (error) {
    console.error("Error al obtener respuestas:", error);
    return [];
  }
};
