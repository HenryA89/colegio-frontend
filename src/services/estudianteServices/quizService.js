import api from "../../services/api.js";

// ==========================================
// VALIDAR ID
// ==========================================
const validarId = (id, nombre) => {
  const parsedId = Number(id);

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
// NORMALIZAR QUIZ ESTUDIANTE
// ==========================================
const normalizarQuizEstudiante = (backendData) => {
  console.log("🔍 NORMALIZANDO QUIZ ESTUDIANTE:", backendData);

  const data = backendData?.data || backendData;

  if (!data) {
    throw new Error("No se recibieron datos del quiz");
  }

  // Manejar diferentes estructuras posibles del backend
  const quizData = data.quiz || data;
  const materialData = data.material || data;

  console.log("📋 DATOS DEL QUIZ:", quizData);
  console.log("📋 DATOS DEL MATERIAL:", materialData);

  // Extraer preguntas de diferentes lugares posibles
  let preguntas = [];
  if (quizData?.preguntas && Array.isArray(quizData.preguntas)) {
    preguntas = quizData.preguntas;
  } else if (data.preguntas && Array.isArray(data.preguntas)) {
    preguntas = data.preguntas;
  } else if (quizData && Array.isArray(quizData)) {
    preguntas = quizData;
  }

  console.log("❓ PREGUNTAS ENCONTRADAS:", preguntas.length);

  // Normalizar opciones de cada pregunta
  const preguntasNormalizadas = preguntas.map((p) => {
    let opciones = [];

    if (p.opciones) {
      if (Array.isArray(p.opciones)) {
        opciones = p.opciones;
      } else if (typeof p.opciones === "object") {
        opciones = Object.entries(p.opciones).map(([letra, opcion]) => ({
          letra,
          ...(typeof opcion === "string" ? { texto: opcion } : opcion),
        }));
      }
    }

    return {
      ...p,
      opciones,
    };
  });

  const resultado = {
    id: quizData?.id || materialData?.id || data.id,

    titulo:
      quizData?.titulo ||
      materialData?.titulo ||
      data.titulo ||
      "Quiz sin título",

    materia:
      quizData?.materia || materialData?.materia || data.materia || "General",

    nivel: quizData?.nivel || materialData?.nivel || data.nivel || "Básico",

    descripcion:
      quizData?.descripcion ||
      materialData?.descripcion ||
      data.descripcion ||
      `Quiz de ${quizData?.materia || materialData?.materia || data.materia || "General"}`,

    total_preguntas:
      quizData?.total_preguntas ||
      materialData?.total_preguntas ||
      data.total_preguntas ||
      preguntas.length ||
      0,

    preguntas: preguntasNormalizadas,

    ya_respondido:
      quizData?.ya_respondido ||
      materialData?.ya_respondido ||
      data.ya_respondido ||
      false,

    tiempo_limite:
      quizData?.tiempo_limite ||
      materialData?.tiempo_limite ||
      data.tiempo_limite ||
      null,

    puntaje_maximo:
      quizData?.puntaje_maximo ||
      materialData?.puntaje_maximo ||
      data.puntaje_maximo ||
      100,
  };

  console.log("✅ QUIZ NORMALIZADO:", resultado);

  return resultado;
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

    const response = await api.get(`/materias/${id}/materiales`);

    console.log("✅ RESPONSE MATERIALES POR MATERIA:", response.data);

    if (!response?.data?.success) {
      throw new Error(
        response.data?.error ||
          "No se pudieron obtener los materiales de la materia",
      );
    }

    return response.data;
  } catch (error) {
    manejarError(error);
  }
};

// ==========================================
// OBTENER QUIZ POR MATERIA (SERVICIO UNIFICADO)
// ==========================================
// Lógica compuesta: Obtener materiales → Seleccionar más reciente → Obtener quiz
// ==========================================
export const obtenerQuizPorMateria = async (materiaId) => {
  try {
    console.log(
      "🎓 OBTENIENDO QUIZ POR MATERIA (SERVICIO UNIFICADO):",
      materiaId,
    );

    // Paso 1: Obtener materiales de la materia
    const materialesResponse = await getMaterialesPorMateria(materiaId);

    if (!materialesResponse?.data || !Array.isArray(materialesResponse.data)) {
      throw new Error("No se encontraron materiales para esta materia");
    }

    const materiales = materialesResponse.data;
    console.log("📋 MATERIALES ENCONTRADOS:", materiales.length);

    // Paso 2: Seleccionar el material más reciente (o el primero si no hay fecha)
    const materialSeleccionado = materiales.reduce((masReciente, material) => {
      if (!masReciente) return material;

      // Priorizar materiales con fecha más reciente
      const fechaMaterial = new Date(
        material.created_at || material.fecha_creacion || 0,
      );
      const fechaMasReciente = new Date(
        masReciente.created_at || masReciente.fecha_creacion || 0,
      );

      return fechaMaterial > fechaMasReciente ? material : masReciente;
    }, null);

    if (!materialSeleccionado) {
      throw new Error("No hay materiales disponibles en esta materia");
    }

    console.log("🎯 MATERIAL SELECCIONADO:", materialSeleccionado);

    // Paso 3: Obtener el quiz del material seleccionado
    const quizResponse = await getQuizEstudiante(
      materialSeleccionado.id || materialSeleccionado.material_id,
    );

    console.log("✅ QUIZ OBTENIDO POR MATERIA:", quizResponse);

    // Retornar resultado completo
    return {
      success: true,
      data: {
        materia: {
          id: materiaId,
          materiales: materiales,
          materialSeleccionado: materialSeleccionado,
        },
        quiz: quizResponse.data,
      },
      message: `Quiz obtenido del material: ${materialSeleccionado.titulo || materialSeleccionado.nombre || "Material sin título"}`,
    };
  } catch (error) {
    console.error("❌ ERROR EN SERVICIO UNIFICADO:", error);
    manejarError(error);
  }
};

// ==========================================
// OBTENER QUIZ ESTUDIANTE POR MATERIAL
// ==========================================
// GET /materiales/:materialId/quiz
// ==========================================
export const getQuizEstudiante = async (materialId) => {
  try {
    console.log("🎓 OBTENIENDO QUIZ ESTUDIANTE POR MATERIAL:", materialId);

    const id = validarId(materialId, "Material ID");

    obtenerToken();

    obtenerUsuario();

    const response = await api.get(`/quizzes/ultimo_quiz`);

    console.log("✅ RESPONSE QUIZ ESTUDIANTE:", response.data);

    if (!response?.data?.success) {
      throw new Error(response.data?.error || "No se pudo obtener el quiz");
    }

    const normalizedQuiz = normalizarQuizEstudiante(response.data);

    if (normalizedQuiz.preguntas.length === 0) {
      throw new Error("Este quiz no tiene preguntas disponibles");
    }

    return {
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

// ==========================================
// OBTENER RESULTADOS
// ==========================================
// GET /api/v1/quizzes/:id/resultados
// ==========================================
export const getResultados = async (quizId) => {
  try {
    const id = validarId(quizId, "Quiz ID");

    obtenerToken();

    obtenerUsuario();

    const response = await api.get(`/quizzes/${id}/resultado`);

    console.log("📊 RESPONSE RESULTADOS:", response.data);

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

// ==========================================
// OBTENER MATERIALES DISPONIBLES (LEGACY)
// ==========================================
// GET /estudiantes/materiales
// ==========================================
export const getMaterialesDisponibles = async () => {
  try {
    console.log("🎓 OBTENIENDO MATERIALES DISPONIBLES");

    obtenerToken();

    obtenerUsuario();

    const response = await api.get(`/estudiantes/materiales`);

    console.log("✅ RESPONSE MATERIALES:", response.data);

    if (!response?.data?.success) {
      throw new Error(
        response.data?.error || "No se pudieron obtener los materiales",
      );
    }

    return response.data;
  } catch (error) {
    manejarError(error);
  }
};
