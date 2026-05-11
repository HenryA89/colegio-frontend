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
// OBTENER QUIZ POR MATERIA (FLUJO SECUENCIAL COMPLETO)
// ==========================================
// 1. Obtener materias del estudiante
// 2. Obtener materiales por materia
// 3. Obtener material_id de cada material
// 4. Solicitar el quiz con el material_id obtenido
// ==========================================
export const obtenerQuizPorMateria = async (materiaId = null) => {
  try {
    console.log("🎓 OBTENIENDO QUIZ POR MATERIA (FLUJO SECUENCIAL COMPLETO)");

    // Paso 1: Obtener materias del estudiante
    console.log("📚 PASO 1: Obteniendo materias del estudiante...");
    const materiasResponse = await getMateriasEstudiante();

    if (!materiasResponse?.data || !Array.isArray(materiasResponse.data)) {
      throw new Error("No se encontraron materias para este estudiante");
    }

    const materias = materiasResponse.data;
    console.log("✅ MATERIAS ENCONTRADAS:", materias.length);

    // Si no se proporciona materiaId, usar la primera materia disponible
    let materiaIdFinal = materiaId;
    if (!materiaIdFinal) {
      if (materias.length === 0) {
        throw new Error("El estudiante no está inscrito en ninguna materia");
      }
      materiaIdFinal = materias[0].id || materias[0].materia_id;
      console.log("🎯 MATERIA SELECCIONADA AUTOMÁTICAMENTE:", materiaIdFinal);
    }

    // Validar que la materia exista en las materias del estudiante
    const materiaEncontrada = materias.find(
      (m) => m.id === materiaIdFinal || m.materia_id === materiaIdFinal,
    );

    if (!materiaEncontrada) {
      throw new Error(
        `El estudiante no está inscrito en la materia con ID: ${materiaIdFinal}`,
      );
    }

    console.log("✅ MATERIA VALIDADA:", {
      id: materiaEncontrada.id || materiaEncontrada.materia_id,
      nombre: materiaEncontrada.nombre || materiaEncontrada.titulo,
    });

    // Paso 2: Obtener materiales por materia
    console.log("📋 PASO 2: Obteniendo materiales de la materia:", materiaId);
    const materialesResponse = await getMaterialesPorMateria(materiaId);

    if (!materialesResponse?.data || !Array.isArray(materialesResponse.data)) {
      throw new Error("No se encontraron materiales para esta materia");
    }

    const materiales = materialesResponse.data;
    console.log("✅ MATERIALES ENCONTRADOS:", materiales.length);

    // Paso 3: Obtener material_id de cada material
    console.log("🔍 PASO 3: Extrayendo material_id de cada material...");
    const materialesConId = materiales.map((material) => {
      const materialId = material.id || material.material_id;
      console.log(
        `📄 Material: ${material.titulo || material.nombre || "Sin título"} - ID: ${materialId}`,
      );
      return {
        ...material,
        material_id: materialId,
        material_id_valido:
          materialId && !isNaN(materialId) && Number(materialId) > 0,
      };
    });

    // Filtrar solo materiales con ID válido
    const materialesValidos = materialesConId.filter(
      (m) => m.material_id_valido,
    );

    if (materialesValidos.length === 0) {
      throw new Error("No se encontraron materiales con ID válido");
    }

    console.log("✅ MATERIALES VÁLIDOS:", materialesValidos.length);

    // Seleccionar el material más reciente
    const materialSeleccionado = materialesValidos.reduce(
      (masReciente, material) => {
        if (!masReciente) return material;

        const fechaMaterial = new Date(
          material.created_at || material.fecha_creacion || 0,
        );
        const fechaMasReciente = new Date(
          masReciente.created_at || masReciente.fecha_creacion || 0,
        );

        return fechaMaterial > fechaMasReciente ? material : masReciente;
      },
      null,
    );

    if (!materialSeleccionado) {
      throw new Error("No hay materiales válidos disponibles en esta materia");
    }

    console.log("🎯 MATERIAL SELECCIONADO:", {
      titulo: materialSeleccionado.titulo || materialSeleccionado.nombre,
      material_id: materialSeleccionado.material_id,
    });

    // Paso 4: Solicitar el quiz con el material_id obtenido
    console.log(
      "🎓 PASO 4: Solicitando quiz con material_id:",
      materialSeleccionado.material_id,
    );
    const quizResponse = await getQuizEstudiante(
      materialSeleccionado.material_id,
    );

    console.log("✅ QUIZ OBTENIDO:", {
      material_id: materialSeleccionado.material_id,
      quiz_preguntas: quizResponse.data?.preguntas?.length || 0,
    });

    // Retornar resultado completo con todo el flujo
    return {
      success: true,
      data: {
        flujo_completo: {
          paso1_materias_estudiante: "Validado (materiaId recibido)",
          paso2_materiales_por_materia: {
            materia_id: materiaId,
            total_materiales: materiales.length,
            materiales_validos: materialesValidos.length,
          },
          paso3_materiales_extraidos: materialesValidos.map((m) => ({
            titulo: m.titulo || m.nombre,
            material_id: m.material_id,
          })),
          paso4_material_seleccionado: {
            titulo: materialSeleccionado.titulo || materialSeleccionado.nombre,
            material_id: materialSeleccionado.material_id,
          },
        },
        materia: {
          id: materiaId,
          materiales: materiales,
          materiales_validos: materialesValidos,
          material_seleccionado: materialSeleccionado,
        },
        quiz: quizResponse.data,
      },
      message: `Quiz obtenido exitosamente del material: ${materialSeleccionado.titulo || materialSeleccionado.nombre || "Material sin título"} (ID: ${materialSeleccionado.material_id})`,
    };
  } catch (error) {
    console.error("❌ ERROR EN FLUJO SECUENCIAL:", error);
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
