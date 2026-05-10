import api from "../../services/api";

// ==========================================
// VALIDAR ID
// ==========================================
const validarId = (id, nombre = "ID") => {
  const parsedId = Number(id);

  console.log(`🆔 ${nombre}:`, parsedId);

  if (!parsedId || isNaN(parsedId) || parsedId <= 0) {
    throw new Error(`${nombre} inválido`);
  }

  return parsedId;
};

// ==========================================
// OBTENER TOKEN
// ==========================================
const obtenerToken = () => {
  const token = localStorage.getItem("token");

  if (!token || token === "undefined" || token === "null") {
    throw new Error("Sesión expirada. Inicia sesión nuevamente.");
  }

  return token;
};

// ==========================================
// OBTENER USUARIO
// ==========================================
const obtenerUsuario = () => {
  const usuario = localStorage.getItem("usuario");

  if (!usuario || usuario === "undefined" || usuario === "null") {
    throw new Error("Usuario no autenticado");
  }

  return JSON.parse(usuario);
};

// ==========================================
// MANEJO GLOBAL DE ERRORES
// ==========================================
const manejarError = (error) => {
  console.error("❌ ERROR SERVICE:", error);

  if (error.response) {
    const status = error.response.status;

    const backendError =
      error.response.data?.error || error.response.data?.message;

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
        throw new Error(backendError || "Recurso no encontrado");

      case 422:
        throw new Error(backendError || "Datos inválidos");

      case 500:
        throw new Error("Error interno del servidor");

      default:
        throw new Error(backendError || "Error desconocido");
    }
  }

  throw new Error(error.message || "Ocurrió un error inesperado");
};

// ==========================================
// NORMALIZAR QUIZ PROFESOR
// ==========================================
const normalizarQuizProfesor = (backendData, materialId) => {
  const data = backendData?.data;

  if (!data) {
    throw new Error("No se recibieron datos del quiz");
  }

  const quiz = data.quiz;

  if (!quiz) {
    throw new Error("No se encontró la estructura del quiz");
  }

  return {
    id: data.quiz_id,

    material_clase_id: materialId,

    titulo: data.titulo || "Quiz sin título",

    materia: data.materia || quiz.materia || "General",

    nivel: quiz.nivel || "Básico",

    descripcion: `Quiz de ${data.materia || quiz.materia || "General"}`,

    total_preguntas: quiz.total_preguntas || quiz.preguntas?.length || 0,

    preguntas: Array.isArray(quiz.preguntas) ? quiz.preguntas : [],

    ya_respondido: data.ya_respondido || false,

    total_participantes: data.total_participantes || 0,
  };
};

// ==========================================
// NORMALIZAR QUIZ ESTUDIANTE
// ==========================================
const normalizarQuizEstudiante = (backendData) => {
  const data = backendData?.data;

  if (!data) {
    throw new Error("No se recibieron datos del quiz");
  }

  return {
    id: data.id,

    titulo: data.titulo || "Quiz sin título",

    materia: data.materia || "General",

    nivel: data.nivel || "Básico",

    descripcion: data.descripcion || `Quiz de ${data.materia || "General"}`,

    total_preguntas: data.total_preguntas || data.preguntas?.length || 0,

    preguntas: Array.isArray(data.preguntas) ? data.preguntas : [],

    ya_respondido: data.ya_respondido || false,

    tiempo_limite: data.tiempo_limite || null,

    puntaje_maximo: data.puntaje_maximo || 100,
  };
};

// ==========================================
// OBTENER QUIZ PROFESOR
// GET /api/v1/materiales/:id/quiz
// ==========================================
export const getQuiz = async (materialId, usuario) => {
  try {
    console.log("📚 OBTENIENDO QUIZ PROFESOR:", materialId);

    const id = validarId(materialId, "Material ID");

    obtenerToken();

    obtenerUsuario(usuario);

    const response = await api.get(`/materiales/${id}/quiz`);

    console.log("✅ RESPONSE QUIZ PROFESOR:", response.data);

    if (!response?.data?.success) {
      throw new Error(response.data?.error || "No se pudo obtener el quiz");
    }

    const normalizedQuiz = normalizarQuizProfesor(response.data, id);

    // ✅ QUIZ AÚN GENERÁNDOSE
    if (normalizedQuiz.quiz_estado === "pendiente") {
      return {
        estado: "pendiente",
        mensaje: "El quiz aún se está generando",
        data: normalizedQuiz,
      };
    }

    // ✅ ERROR GENERANDO QUIZ
    if (normalizedQuiz.quiz_estado === "error") {
      throw new Error(normalizedQuiz.error || "Error generando quiz");
    }

    // ✅ VALIDAR QUIZ
    if (!normalizedQuiz.quiz || !normalizedQuiz.quiz.preguntas) {
      throw new Error("No se encontró la estructura del quiz");
    }

    return {
      estado: "completado",
      data: normalizedQuiz,
    };
  } catch (error) {
    manejarError(error);
  }
};

// ==========================================
// OBTENER QUIZ ESTUDIANTE
// GET /api/v1/quizzes/:id
// ==========================================
export const getQuizEstudiante = async (quizId) => {
  try {
    console.log("🎓 OBTENIENDO QUIZ ESTUDIANTE:", quizId);

    const id = validarId(quizId, "Quiz ID");

    obtenerToken();

    obtenerUsuario();

    const response = await api.get(`/quizzes/${id}`);

    console.log("✅ RESPONSE QUIZ ESTUDIANTE:", response.data);

    if (!response?.data?.success) {
      throw new Error(response.data?.error || "No se pudo obtener el quiz");
    }

    const normalizedQuiz = normalizarQuizEstudiante(response.data);

    if (normalizedQuiz.preguntas.length === 0) {
      throw new Error("Este quiz no tiene preguntas disponibles");
    }

    if (normalizedQuiz.ya_respondido) {
      throw new Error("Ya has respondido este quiz");
    }

    return {
      success: true,
      data: normalizedQuiz,
      message: "Quiz obtenido exitosamente",
    };
  } catch (error) {
    manejarError(error);
  }
};

// ==========================================
// RESPONDER QUIZ
// POST /api/v1/quizzes/:id/responder
// ==========================================
export const submitQuiz = async (quizId, respuestas) => {
  try {
    console.log("📝 RESPONDIENDO QUIZ:", quizId);

    const id = validarId(quizId, "Quiz ID");

    obtenerToken();

    if (!Array.isArray(respuestas) || respuestas.length === 0) {
      throw new Error("Debes responder al menos una pregunta");
    }

    const respuestasFormateadas = respuestas.map((respuesta) => ({
      pregunta_id: respuesta.pregunta_id,

      opcion_seleccionada: respuesta.opcion_seleccionada || respuesta.respuesta,
    }));

    const response = await api.post(`/quizzes/${id}/responder`, {
      respuestas: respuestasFormateadas,
    });

    console.log("✅ QUIZ RESPONDIDO:", response.data);

    if (!response?.data?.success) {
      throw new Error(response.data?.error || "No se pudo responder el quiz");
    }

    return response.data;
  } catch (error) {
    manejarError(error);
  }
};

// ==========================================
// OBTENER RANKING
// GET /api/v1/quizzes/:id/top
// ==========================================
export const getRanking = async (quizId) => {
  try {
    console.log("🏆 OBTENIENDO RANKING:", quizId);

    const id = validarId(quizId, "Quiz ID");

    obtenerToken();

    const response = await api.get(`/quizzes/${id}/top`);

    console.log("✅ RESPONSE RANKING:", response.data);

    if (!response?.data?.success) {
      throw new Error(response.data?.error || "No se pudo obtener el ranking");
    }

    return response.data;
  } catch (error) {
    manejarError(error);
  }
};

// ==========================================
// OBTENER RESULTADOS
// GET /api/v1/quizzes/:id/resultados
// ==========================================
export const getResultados = async (quizId) => {
  try {
    console.log("📊 OBTENIENDO RESULTADOS:", quizId);

    const id = validarId(quizId, "Quiz ID");

    obtenerToken();

    const response = await api.get(`/quizzes/${id}/resultados`);

    console.log("✅ RESPONSE RESULTADOS:", response.data);

    if (!response?.data?.success) {
      throw new Error(
        response.data?.error || "No se pudieron obtener los resultados",
      );
    }

    return response.data;
  } catch (error) {
    manejarError(error);
  }
};
