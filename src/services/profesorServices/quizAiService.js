import api from "../../services/api";

// ==========================================
// OBTENER QUIZ
// ==========================================
export const getQuiz = async (materialClaseId, userRole = "profesor") => {
  try {
    console.log("📚 Obteniendo quiz...");

    // ==========================================
    // VALIDACIONES PREVIAS
    // ==========================================

    const token = localStorage.getItem("token");

    if (!token) {
      throw new Error("No hay token de autenticación");
    }

    const usuario = localStorage.getItem("usuario");

    if (!usuario || usuario === "undefined" || usuario === "null") {
      throw new Error("Usuario no autenticado");
    }

    const usuarioData = JSON.parse(usuario);

    // ==========================================
    // VALIDAR ID
    // ==========================================

    const quizIdNumerico = parseInt(materialClaseId, 10);

    if (!Number.isInteger(quizIdNumerico) || quizIdNumerico <= 0) {
      console.error("❌ quizId inválido:", materialClaseId);

      throw new Error(
        "ID de quiz inválido. Debe ser un número entero positivo.",
      );
    }

    console.log("🆔 Quiz ID:", quizIdNumerico);

    // ==========================================
    // PETICIÓN
    // ==========================================

    const response = await api.get(`/api/v1/materiales/${quizIdNumerico}/quiz`);

    console.log("✅ Response quiz:", response.data);

    // ==========================================
    // VALIDAR RESPUESTA
    // ==========================================

    if (!response?.data) {
      throw new Error("Respuesta vacía del servidor");
    }

    const backendData = response.data;

    if (!backendData.success) {
      throw new Error(
        backendData.error || "Error obteniendo información del quiz",
      );
    }

    // ==========================================
    // ESTRUCTURA REAL DEL BACKEND
    // ==========================================
    /**
     * Backend devuelve:
     *
     * {
     *   success: true,
     *   data: {
     *     quiz_id,
     *     titulo,
     *     materia,
     *     quiz: {
     *       materia,
     *       nivel,
     *       total_preguntas,
     *       preguntas: []
     *     },
     *     ya_respondido,
     *     total_participantes
     *   }
     * }
     */

    const data = backendData.data;

    if (!data) {
      throw new Error("No se recibieron datos del quiz");
    }

    const quiz = data.quiz;

    if (!quiz) {
      throw new Error("No se encontró la estructura del quiz");
    }

    // ==========================================
    // NORMALIZAR DATOS
    // ==========================================

    const normalizedQuiz = {
      id: data.quiz_id,

      titulo: data.titulo || "Quiz sin título",

      materia: data.materia || quiz.materia || "General",

      nivel: quiz.nivel || "básico",

      descripcion: `Quiz de ${data.materia || quiz.materia || "General"}`,

      total_preguntas: quiz.total_preguntas || quiz.preguntas?.length || 0,

      preguntas: quiz.preguntas || [],

      ya_respondido: data.ya_respondido || false,

      total_participantes: data.total_participantes || 0,
    };

    // ==========================================
    // VALIDACIONES EXTRA
    // ==========================================

    if (!Array.isArray(normalizedQuiz.preguntas)) {
      normalizedQuiz.preguntas = [];
    }

    if (userRole === "estudiante") {
      if (normalizedQuiz.preguntas.length === 0) {
        throw new Error("Este quiz no tiene preguntas disponibles");
      }

      if (normalizedQuiz.ya_respondido) {
        throw new Error(
          "Ya has respondido este quiz. No puedes responderlo nuevamente.",
        );
      }
    }

    console.log("✅ Quiz normalizado:", normalizedQuiz);

    return {
      success: true,
      data: {
        quiz: normalizedQuiz,
        usuario: usuarioData,
      },
      message: "Quiz obtenido exitosamente",
    };
  } catch (error) {
    console.error("❌ Error obteniendo quiz:", error);

    // ==========================================
    // AXIOS ERROR
    // ==========================================

    if (error.response) {
      const status = error.response.status;
      const backendError = error.response.data?.error;

      console.error("📛 Backend Error:", backendError);

      switch (status) {
        case 400:
          throw new Error(backendError || "Solicitud inválida");

        case 401:
          localStorage.removeItem("token");
          localStorage.removeItem("usuario");

          throw new Error("Sesión expirada. Inicia sesión nuevamente.");

        case 403:
          throw new Error(backendError || "No tienes permisos");

        case 404:
          throw new Error(backendError || "Quiz no encontrado");

        case 422:
          throw new Error(backendError || "Quiz no disponible");

        case 500:
          throw new Error("Error interno del servidor");

        default:
          throw new Error(backendError || "Error desconocido");
      }
    }

    // ==========================================
    // ERROR NORMAL
    // ==========================================

    throw new Error(error.message || "No se pudo obtener el quiz");
  }
};

// ==========================================
// RESPONDER QUIZ
// ==========================================
export const submitQuiz = async (quizId, respuestas) => {
  try {
    const token = localStorage.getItem("token");

    if (!token) {
      throw new Error("No hay token de autenticación");
    }

    const quizIdNumerico = parseInt(quizId, 10);

    if (!Number.isInteger(quizIdNumerico) || quizIdNumerico <= 0) {
      throw new Error("ID de quiz inválido");
    }

    if (!Array.isArray(respuestas) || respuestas.length === 0) {
      throw new Error("Debes responder al menos una pregunta");
    }

    // ==========================================
    // FORMATO QUE ESPERA EL BACKEND
    // ==========================================

    const respuestasFormateadas = respuestas.map((respuesta) => ({
      pregunta_id: respuesta.pregunta_id,
      opcion_seleccionada: respuesta.opcion_seleccionada || respuesta.respuesta,
    }));

    console.log("📤 Enviando respuestas:", respuestasFormateadas);

    const response = await api.post(
      `/api/v1/quizzes/${quizIdNumerico}/responder`,
      {
        respuestas: respuestasFormateadas,
      },
    );

    console.log("✅ Resultado quiz:", response.data);

    if (!response?.data?.success) {
      throw new Error(response.data?.error || "Error respondiendo quiz");
    }

    return {
      success: true,
      data: response.data.data,
      message: "Quiz respondido exitosamente",
    };
  } catch (error) {
    console.error("❌ Error respondiendo quiz:", error);

    if (error.response) {
      const backendError = error.response.data?.error;

      throw new Error(backendError || "No se pudo responder el quiz");
    }

    throw new Error(error.message || "No se pudo responder el quiz");
  }
};

// ==========================================
// RANKING
// ==========================================
export const getRanking = async (quizId) => {
  try {
    const quizIdNumerico = parseInt(quizId, 10);

    if (!Number.isInteger(quizIdNumerico) || quizIdNumerico <= 0) {
      throw new Error("ID de quiz inválido");
    }

    const response = await api.get(`/api/v1/quizzes/${quizIdNumerico}/top`);

    return response.data;
  } catch (error) {
    console.error("❌ Error obteniendo ranking:", error);

    throw new Error(
      error.response?.data?.error || "No se pudo obtener el ranking",
    );
  }
};

// ==========================================
// RESULTADOS
// ==========================================
export const getResultados = async (quizId) => {
  try {
    const quizIdNumerico = parseInt(quizId, 10);

    if (!Number.isInteger(quizIdNumerico) || quizIdNumerico <= 0) {
      throw new Error("ID de quiz inválido");
    }

    const response = await api.get(
      `/api/v1/quizzes/${quizIdNumerico}/resultados`,
    );

    return response.data;
  } catch (error) {
    console.error("❌ Error obteniendo resultados:", error);

    throw new Error(
      error.response?.data?.error || "No se pudieron obtener los resultados",
    );
  }
};
