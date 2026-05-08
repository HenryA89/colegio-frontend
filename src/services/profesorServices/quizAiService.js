import api from "../../services/api";

// ==========================================
// VALIDAR ID NUMÉRICO
// ==========================================
const validarId = (id, nombre = "ID") => {
  const idNumerico = parseInt(id, 10);

  if (!Number.isInteger(idNumerico) || idNumerico <= 0) {
    console.error(`❌ ${nombre} inválido:`, id);

    throw new Error(`${nombre} inválido. Debe ser un número entero positivo.`);
  }

  return idNumerico;
};

// ==========================================
// OBTENER QUIZ DESDE material_clase_id
// ==========================================
export const getQuiz = async (materialClaseId, userRole = "profesor") => {
  try {
    console.log("📚 Obteniendo quiz...");

    // =========================
    // TOKEN
    // =========================
    const token = localStorage.getItem("token");

    if (!token) {
      throw new Error("No hay token de autenticación");
    }

    // =========================
    // USUARIO
    // =========================
    const usuario = localStorage.getItem("usuario");

    if (!usuario || usuario === "undefined" || usuario === "null") {
      throw new Error("Usuario no autenticado");
    }

    const usuarioData = JSON.parse(usuario);

    // =========================
    // VALIDAR MATERIAL ID
    // =========================
    const materialId = validarId(materialClaseId, "MaterialClase ID");

    console.log("🆔 MaterialClase ID:", materialId);

    // =========================
    // REQUEST
    // =========================
    const response = await api.get(
      `/api/v1/materiales_clase/${materialId}/quiz`,
    );

    console.log("✅ Response quiz:", response.data);

    if (!response?.data) {
      throw new Error("Respuesta vacía del servidor");
    }

    const backendData = response.data;

    if (!backendData.success) {
      throw new Error(
        backendData.error || "Error obteniendo información del quiz",
      );
    }

    const data = backendData.data;

    if (!data) {
      throw new Error("No se recibieron datos del quiz");
    }

    const quiz = data.quiz;

    if (!quiz) {
      throw new Error("No se encontró la estructura del quiz");
    }

    // =========================
    // NORMALIZACIÓN
    // =========================
    const normalizedQuiz = {
      id: data.quiz_id,

      material_clase_id: materialId,

      titulo: data.titulo || "Quiz sin título",

      materia: data.materia || quiz.materia || "General",

      nivel: quiz.nivel || "básico",

      descripcion: `Quiz de ${data.materia || quiz.materia || "General"}`,

      total_preguntas: quiz.total_preguntas || quiz.preguntas?.length || 0,

      preguntas: quiz.preguntas || [],

      ya_respondido: data.ya_respondido || false,

      total_participantes: data.total_participantes || 0,
    };

    // =========================
    // VALIDACIONES EXTRA
    // =========================
    if (!Array.isArray(normalizedQuiz.preguntas)) {
      normalizedQuiz.preguntas = [];
    }

    if (userRole === "estudiante") {
      if (normalizedQuiz.preguntas.length === 0) {
        throw new Error("Este quiz no tiene preguntas disponibles");
      }

      if (normalizedQuiz.ya_respondido) {
        throw new Error("Ya has respondido este quiz.");
      }
    }

    console.log("✅ Quiz normalizado:", normalizedQuiz);

    return {
      success: true,
      data: normalizedQuiz,
      message: "Quiz obtenido exitosamente",
      usuario: usuarioData,
    };
  } catch (error) {
    console.error("❌ Error obteniendo quiz:", error);

    if (error.response) {
      const status = error.response.status;

      const backendError = error.response.data?.error;

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

    throw new Error(error.message || "No se pudo obtener el quiz");
  }
};

// ==========================================
// RESPONDER QUIZ
// ==========================================
export const submitQuiz = async (quizId, respuestas) => {
  try {
    const id = validarId(quizId, "Quiz ID");

    if (!Array.isArray(respuestas) || respuestas.length === 0) {
      throw new Error("Debes responder al menos una pregunta");
    }

    const respuestasFormateadas = respuestas.map((respuesta) => ({
      pregunta_id: respuesta.pregunta_id,
      opcion_seleccionada: respuesta.opcion_seleccionada || respuesta.respuesta,
    }));

    const response = await api.post(`/api/v1/quizzes/${id}/responder`, {
      respuestas: respuestasFormateadas,
    });

    if (!response?.data?.success) {
      throw new Error(response.data?.error || "Error respondiendo quiz");
    }

    return response.data;
  } catch (error) {
    console.error("❌ Error respondiendo quiz:", error);

    throw new Error(
      error.response?.data?.error ||
        error.message ||
        "No se pudo responder el quiz",
    );
  }
};

// ==========================================
// RANKING
// ==========================================
export const getRanking = async (quizId) => {
  try {
    const id = validarId(quizId, "Quiz ID");

    const response = await api.get(`/api/v1/quizzes/${id}/top`);

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
    const id = validarId(quizId, "Quiz ID");

    const response = await api.get(`/api/v1/quizzes/${id}/resultados`);

    return response.data;
  } catch (error) {
    console.error("❌ Error obteniendo resultados:", error);

    throw new Error(
      error.response?.data?.error || "No se pudieron obtener los resultados",
    );
  }
};
