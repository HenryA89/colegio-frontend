import api from "../api";

// Obtener evaluaciones del estudiante
export const fetchEvaluaciones = async (token) => {
  try {
    const res = await api.get("/estudiante/evaluaciones");
    return res.data.evaluaciones || [];
  } catch (error) {
    console.error("Error al obtener evaluaciones:", error);
    return [];
  }
};

// Obtener evaluaciones por clase
export const fetchEvaluacionesPorClase = async (claseId, token) => {
  try {
    const res = await api.get(`/estudiante/evaluaciones/clase/${claseId}`);
    return res.data.evaluaciones || [];
  } catch (error) {
    console.error("Error al obtener evaluaciones por clase:", error);
    return [];
  }
};

// Responder evaluación
export const responderEvaluacion = async (evaluacionId, respuestas, token) => {
  try {
    const res = await api.post(
      `/estudiante/evaluaciones/${evaluacionId}/responder`,
      {
        respuestas,
      }
    );
    return res.data;
  } catch (error) {
    console.error("Error al responder evaluación:", error);
    throw error;
  }
};
