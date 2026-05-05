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

// Generar quiz con IA
export const generarQuizIA = async (quizData) => {
  try {
    const response = await api.post("/api/v1/quizzes/generar", quizData);
    return response.data;
  } catch (error) {
    console.error("❌ Error generando quiz con IA:", error);
    throw new Error("No se pudo generar el quiz con IA");
  }
};

// Obtener resultados completos del quiz
export const getResultadosQuiz = async (quizId) => {
  try {
    const response = await api.get(`/api/v1/quizzes/${quizId}/resultados`);
    return response.data;
  } catch (error) {
    console.error("❌ Error obteniendo resultados del quiz:", error);
    throw new Error("No se pudo obtener los resultados del quiz");
  }
};

// Obtener podium (top 3)
export const getPodium = async (quizId) => {
  try {
    const response = await api.get(`/api/v1/quizzes/${quizId}/podium`);
    return response.data;
  } catch (error) {
    console.error("❌ Error obteniendo podium:", error);
    throw new Error("No se pudo obtener el podium");
  }
};

// Publicar quiz
export const publicarQuiz = async (quizId) => {
  try {
    const response = await api.post(`/api/v1/quizzes/${quizId}/publicar`);
    return response.data;
  } catch (error) {
    console.error("❌ Error publicando quiz:", error);
    throw new Error("No se pudo publicar el quiz");
  }
};
