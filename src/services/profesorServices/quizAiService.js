import api from "../../services/api";

// Obtener quiz
export const getQuiz = async (quizId) => {
  try {
    const response = await api.get(`/api/v1/quizzes/${quizId}`);
    return response.data;
  } catch (error) {
    console.error("❌ Error obteniendo quiz:", error);
    throw new Error("No se pudo obtener el quiz");
  }
};

// Responder quiz
export const submitQuiz = async (quizId, respuestas) => {
  try {
    const response = await api.post(`/api/v1/quizzes/${quizId}/responder`, {
      respuestas,
    });
    return response.data;
  } catch (error) {
    console.error("❌ Error respondiendo quiz:", error);
    throw new Error("No se pudo responder el quiz");
  }
};

// Ver ranking
export const getRanking = async (quizId) => {
  try {
    const response = await api.get(`/api/v1/quizzes/${quizId}/top`);
    return response.data;
  } catch (error) {
    console.error("❌ Error obteniendo ranking:", error);
    throw new Error("No se pudo obtener el ranking");
  }
};

// Obtener resultados de todos los estudiantes
export const getResultados = async (quizId) => {
  try {
    const response = await api.get(`/api/v1/quizzes/${quizId}/resultados`);
    return response.data;
  } catch (error) {
    console.error("❌ Error obteniendo resultados:", error);
    throw new Error("No se pudo obtener los resultados");
  }
};
