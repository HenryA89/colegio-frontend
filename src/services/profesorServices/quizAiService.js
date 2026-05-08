import api from "../../services/api";

// Obtener quiz
export const getQuiz = async (quizId) => {
  try {
    // ✅ Petición configurada correctamente
    const response = await api.get(`/api/v1/quizzes/${quizId}`);

    // ✅ Verificar respuesta exitosa
    if (!response.data) {
      throw new Error("Respuesta vacía del servidor");
    }

    // ✅ Estructura estándar de respuesta
    return {
      success: true,
      data: {
        quiz: response.data,
      },
      message: "Quiz obtenido exitosamente",
    };
  } catch (error) {
    console.error("❌ Error obteniendo quiz:", error);

    // ✅ Manejo específico de errores
    if (error.response?.status === 401) {
      throw new Error("No autorizado. Token inválido o expirado.");
    } else if (error.response?.status === 403) {
      throw new Error(
        "Acceso denegado. No tienes permisos para ver este quiz.",
      );
    } else if (error.response?.status === 404) {
      throw new Error("Quiz no encontrado. Verifica el ID.");
    } else if (error.response?.status === 422) {
      throw new Error(
        "ID de quiz inválido. Debe ser un número entero positivo.",
      );
    } else if (error.response?.status >= 500) {
      throw new Error("Error del servidor. Por favor intenta más tarde.");
    } else {
      throw new Error("No se pudo obtener el quiz. Verifica tu conexión.");
    }
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
