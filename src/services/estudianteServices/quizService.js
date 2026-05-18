import api from "../../services/api";

// ==========================================
// VALIDAR ID
// ==========================================
const validarId = (id, nombre = "ID") => {
  const parsedId = Number(id);

  console.log(`🆔 ${nombre}:`, parsedId);

  if (!Number.isInteger(parsedId) || parsedId <= 0) {
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
// NORMALIZAR OPCIONES DEL QUIZ PARA ESTUDIANTE
// ==========================================
const normalizarOpcionesEstudiante = (opciones) => {
  if (!opciones) {
    return [];
  }

  if (Array.isArray(opciones)) {
    return opciones.map((opcion) => {
      if (typeof opcion === "string") {
        return opcion;
      }

      return (
        opcion?.texto ||
        opcion?.enunciado ||
        opcion?.valor ||
        String(opcion ?? "")
      );
    });
  }

  if (typeof opciones === "object") {
    return Object.values(opciones).map((opcion) => {
      if (typeof opcion === "string") {
        return opcion;
      }

      return (
        opcion?.texto ||
        opcion?.enunciado ||
        opcion?.valor ||
        String(opcion ?? "")
      );
    });
  }

  return [];
};

// ==========================================
// NORMALIZAR QUIZ ESTUDIANTE (Basado en estructura del profesor)
// ==========================================
const normalizarQuizEstudiante = (backendData) => {
  const data = backendData?.data;

  if (!data) {
    throw new Error("No se recibieron datos del quiz");
  }

  const quiz = data.quiz || data;

  return {
    id: data.quiz_id || quiz?.id || data.id,

    material_id: data.material_id || data.material_clase_id || null,

    titulo: data.titulo || quiz?.titulo || "Quiz sin título",

    materia: data.materia || quiz?.materia || "General",

    nivel: data.nivel || quiz?.nivel || "Básico",

    descripcion:
      data.descripcion ||
      quiz?.descripcion ||
      `Quiz de ${data.materia || quiz?.materia || "General"}`,

    quiz_estado: data.quiz_estado || quiz?.quiz_estado || "completado",

    total_preguntas:
      data.total_preguntas ||
      quiz?.total_preguntas ||
      quiz?.preguntas?.length ||
      data.preguntas?.length ||
      0,

    preguntas: (Array.isArray(quiz?.preguntas)
      ? quiz.preguntas
      : data.preguntas || []
    ).map((p) => ({
      ...p,
      id: p.id || p.pregunta_id || p.question_id || null,
      pregunta: p.pregunta || p.enunciado || p.texto || p.titulo || "",
      opciones: normalizarOpcionesEstudiante(p.opciones),
    })),

    ya_respondido: data.ya_respondido || quiz?.ya_respondido || false,

    tiempo_limite: data.tiempo_limite || quiz?.tiempo_limite || null,

    puntaje_maximo: data.puntaje_maximo || quiz?.puntaje_maximo || 100,
  };
};

// ==========================================
// OBTENER MATERIAS DEL ESTUDIANTE
// ==========================================
// GET /api/v1/estudiante/materias
// ==========================================
export const getMateriasEstudiante = async () => {
  try {
    console.log("🎓 OBTENIENDO MATERIAS DEL ESTUDIANTE");

    obtenerToken();
    obtenerUsuario();

    const response = await api.get(`/materias`);

    console.log("✅ RESPONSE MATERIAS DEL ESTUDIANTE:", response.data);

    if (!response?.data?.success) {
      throw new Error(
        response.data?.error ||
          "No se pudieron obtener las materias del estudiante",
      );
    }

    return response.data;
  } catch (error) {
    manejarError(error);
  }
};

// ==========================================
// OBTENER MATERIALES POR MATERIA
// ==========================================
// GET /api/v1/materias/:materia_id/materiales
// ==========================================
export const getMaterialesPorMateria = async (materiaId) => {
  try {
    console.log("🎓 OBTENIENDO MATERIALES POR MATERIA:", materiaId);

    const id = validarId(materiaId, "Materia ID");

    obtenerToken();

    obtenerUsuario();

    const response = await api.get(`/materiales`, {
      params: { materia_id: materiaId },
    });

    console.log("✅ RESPONSE MATERIALES POR MATERIA:", response.data);

    if (!response?.data?.success) {
      throw new Error(
        response.data?.error || "No se pudieron obtener los materiales",
      );
    }

    const materiales =
      response.data?.data?.materiales ||
      response.data?.data ||
      response.data?.materiales ||
      [];

    const materialesFiltrados = Array.isArray(materiales)
      ? materiales.filter((material) => Number(material.materia_id) === id)
      : [];

    if (!materialesFiltrados.length) {
      throw new Error("No se encontraron materiales para esta materia");
    }

    return {
      success: true,
      data: materialesFiltrados,
      message: "Materiales obtenidos exitosamente",
    };
  } catch (error) {
    manejarError(error);
  }
};

// ==========================================
// OBTENER QUIZ ESTUDIANTE
// ==========================================
// GET /api/v1/estudiantes/materiales/:materialId/quiz
// ==========================================
export const getQuizEstudiante = async (materialId) => {
  try {
    console.log("🎓 OBTENIENDO QUIZ ESTUDIANTE POR MATERIAL:", materialId);

    const id = validarId(materialId, "Material ID");

    obtenerToken();

    obtenerUsuario();

    const response = await api.get(`/quizzes/${id}`);

    console.log("✅ RESPONSE QUIZ ESTUDIANTE:", response.data);

    if (!response?.data?.success) {
      throw new Error(response.data?.error || "No se pudo obtener el quiz");
    }

    const normalizedQuiz = normalizarQuizEstudiante(response.data);

    if (normalizedQuiz.quiz_estado === "pendiente") {
      return {
        success: false,
        estado: "pendiente",
        message: "El quiz aún se está generando",
        data: normalizedQuiz,
      };
    }

    if (normalizedQuiz.quiz_estado === "error") {
      throw new Error(response.data?.error || "Error generando quiz");
    }

    if (normalizedQuiz.preguntas.length === 0) {
      throw new Error("Este quiz no tiene preguntas disponibles");
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
// ==========================================
// POST /api/v1/quizzes/:id/responder
// ==========================================
export const submitQuiz = async (quizId, respuestas) => {
  try {
    const id = validarId(quizId, "Quiz ID");

    if (
      (!Array.isArray(respuestas) && typeof respuestas !== "object") ||
      (Array.isArray(respuestas) && respuestas.length === 0) ||
      (typeof respuestas === "object" && Object.keys(respuestas).length === 0)
    ) {
      throw new Error("Debes responder al menos una pregunta");
    }

    // Manejar diferentes formatos de entrada
    let respuestasFormateadas = [];

    if (Array.isArray(respuestas)) {
      // Formato array: [{pregunta_id: 1, opcion_seleccionada: 2}, ...]
      respuestasFormateadas = respuestas.map((respuesta) => ({
        pregunta_id: respuesta.pregunta_id,
        opcion_seleccionada:
          respuesta.opcion_seleccionada || respuesta.respuesta,
      }));
    } else if (typeof respuestas === "object" && respuestas !== null) {
      // Formato objeto: {0: 1, 1: 2, 2: 0} (índice: opción)
      respuestasFormateadas = Object.entries(respuestas).map(
        ([preguntaId, opcionIndex]) => ({
          pregunta_id: parseInt(preguntaId),
          opcion_seleccionada: parseInt(opcionIndex),
        }),
      );
    }

    const response = await api.post(`/quizzes/${id}/responder`, {
      respuestas: respuestasFormateadas,
    });

    if (!response?.data?.success) {
      throw new Error(response.data?.error || "Error respondiendo quiz");
    }

    return response.data;
  } catch (error) {
    manejarError(error);
  }
};

// ==========================================
// OBTENER RANKING
// ==========================================
// GET /api/v1/quizzes/:id/top
// ==========================================
export const getRanking = async (quizId) => {
  try {
    const id = validarId(quizId, "Quiz ID");

    obtenerToken();

    obtenerUsuario();

    const response = await api.get(`/quizzes/${id}/top`);

    console.log("🏆 RESPONSE RANKING:", response.data);

    if (!response?.data?.success) {
      throw new Error(response.data?.error || "No se pudo obtener el ranking");
    }

    return response.data;
  } catch (error) {
    manejarError(error);
  }
};
