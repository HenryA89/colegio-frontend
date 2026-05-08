import api from "../../services/api";

// Obtener quiz con validaciones robustas
export const getQuiz = async (quizId, userRole = "profesor") => {
  try {
    // Validaciones previas
    console.log(" Verificando configuración para obtener quiz...");

    // 1. Validar token JWT
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error(
        "No hay token de autenticación. Por favor inicia sesión.",
      );
    }

    // 2. Validar que el ID sea numérico
    const quizIdNumerico = parseInt(quizId);
    if (isNaN(quizIdNumerico) || quizIdNumerico <= 0) {
      throw new Error(
        "ID de quiz inválido. Debe ser un número entero positivo.",
      );
    }

    // 3. Verificar que el usuario esté autenticado
    const usuario = localStorage.getItem("usuario");
    if (!usuario || usuario === "undefined" || usuario === "null") {
      throw new Error(
        "Usuario no autenticado. Por favor inicia sesión nuevamente.",
      );
    }

    const usuarioData = JSON.parse(usuario);
    console.log(` ${userRole} autenticado:`, usuarioData.nombre);

    // 4. Verificar permisos según rol
    if (userRole === "profesor" && usuarioData.rol !== "profesor") {
      throw new Error(
        "Solo los profesores pueden acceder a esta función. Acceso denegado.",
      );
    } else if (userRole === "estudiante" && usuarioData.rol !== "estudiante") {
      throw new Error(
        "Solo los estudiantes pueden responder quizzes. Acceso denegado.",
      );
    }

    // Petición configurada correctamente
    console.log(" Obteniendo quiz:", quizIdNumerico);
    const response = await api.get(`/api/v1/quizzes/${quizIdNumerico}`);

    // Verificar respuesta exitosa (axios ya maneja el JSON)
    if (!response.data) {
      throw new Error("Respuesta vacía del servidor");
    }

    // Verificar estructura de respuesta del backend
    const data = response.data;

    // Verificar éxito del backend
    if (!data.success) {
      throw new Error(data.error || "La respuesta del backend no indica éxito");
    }

    // Extraer y normalizar datos del quiz
    const quizData = data.data.quiz;

    if (!quizData) {
      throw new Error("Estructura de respuesta inválida: falta data.quiz");
    }

    // Validar datos mínimos del quiz
    const camposRequeridos =
      userRole === "profesor"
        ? ["id", "titulo", "materia"]
        : ["id", "titulo", "descripcion", "duracion", "preguntas"];

    const camposFaltantes = camposRequeridos.filter(
      (campo) => !quizData[campo],
    );

    if (camposFaltantes.length > 0) {
      throw new Error(
        `Datos del quiz incompletos. Faltan: ${camposFaltantes.join(", ")}`,
      );
    }

    // Validaciones específicas para estudiantes
    if (userRole === "estudiante") {
      // Verificar que el quiz esté publicado
      if (!quizData.publicado && !backendData.data.published) {
        throw new Error(
          "Este quiz no está disponible aún. Contacta a tu profesor.",
        );
      }

      // Verificar que tenga preguntas
      if (!quizData.preguntas || quizData.preguntas.length === 0) {
        throw new Error("Este quiz no tiene preguntas disponibles.");
      }

      // Verificar si ya fue respondido
      if (backendData.data.ya_respondido) {
        throw new Error(
          "Ya has respondido este quiz. No puedes responderlo nuevamente.",
        );
      }
    }

    // Normalizar estructura para el frontend
    const normalizedQuiz = {
      id: backendData.data.quiz_id || quizData.id || quizIdNumerico,
      titulo:
        backendData.data.titulo ||
        quizData.titulo ||
        quizData.materia ||
        "Quiz sin título",
      descripcion:
        quizData.descripcion ||
        `Quiz de ${quizData.materia || "general"} - Nivel ${quizData.nivel || "básico"}`,
      materia: quizData.materia || backendData.data.materia || "General",
      nivel: quizData.nivel || "básico",
      duracion: quizData.duracion || 30, // Valor por defecto si no viene del backend
      publicado: quizData.publicado || backendData.data.published || true, // Asumimos que está publicado si el backend lo devuelve
      preguntas: quizData.preguntas || [],
      total_preguntas:
        quizData.total_preguntas || quizData.preguntas?.length || 0,
      ya_respondido: backendData.data.ya_respondido || false,
      total_participantes: backendData.data.total_participantes || 0,
      // Datos adicionales para profesores
      creado_por: quizData.creado_por || usuarioData.id,
      fecha_creacion: quizData.fecha_creacion || new Date().toISOString(),
      fecha_actualizacion:
        quizData.fecha_actualizacion || new Date().toISOString(),
    };

    console.log(" Quiz obtenido exitosamente:", {
      id: normalizedQuiz.id,
      titulo: normalizedQuiz.titulo,
      preguntas: normalizedQuiz.preguntas.length,
      duracion: normalizedQuiz.duracion,
      publicado: normalizedQuiz.publicado,
      rol: userRole,
    });

    // Estructura estándar de respuesta para el frontend
    return {
      success: true,
      data: {
        quiz: normalizedQuiz,
        usuario: usuarioData,
      },
      message: "Quiz obtenido exitosamente",
    };
  } catch (error) {
    console.error(" Error obteniendo quiz:", error);

    // Manejo específico de errores
    let mensajeError = "No se pudo obtener el quiz. Verifica tu conexión.";

    if (error.message.includes("token")) {
      mensajeError =
        "Error de autenticación. Por favor inicia sesión nuevamente.";
      localStorage.removeItem("token");
      localStorage.removeItem("usuario");
    } else if (error.message.includes("permisos")) {
      mensajeError = "No tienes permisos para acceder a esta función.";
    } else if (error.message.includes("inválido")) {
      mensajeError = "ID de quiz inválido. Verifica la URL.";
    } else if (error.message.includes("no encontrado")) {
      mensajeError = "Quiz no encontrado. Verifica el ID.";
    } else if (error.message.includes("no está disponible")) {
      mensajeError =
        "Este quiz no está disponible aún. Contacta a tu profesor.";
    } else if (error.message.includes("preguntas")) {
      mensajeError = "Este quiz no tiene preguntas disponibles.";
    } else if (error.message.includes("ya respondido")) {
      mensajeError =
        "Ya has respondido este quiz. No puedes responderlo nuevamente.";
    } else if (error.message.includes("estructura")) {
      mensajeError = "Error en la respuesta del servidor. Intente más tarde.";
    } else if (error.response?.status === 401) {
      mensajeError = "No autorizado. Token inválido o expirado.";
      localStorage.removeItem("token");
      localStorage.removeItem("usuario");
    } else if (error.response?.status === 403) {
      mensajeError = "Acceso denegado. No tienes permisos para ver este quiz.";
    } else if (error.response?.status === 404) {
      mensajeError = "Quiz no encontrado. Verifica el ID.";
    } else if (error.response?.status === 422) {
      mensajeError = "ID de quiz inválido. Debe ser un número entero positivo.";
    } else if (error.response?.status >= 500) {
      mensajeError = "Error del servidor. Por favor intenta más tarde.";
    } else {
      mensajeError = error.message || mensajeError;
    }

    throw new Error(mensajeError);
  }
};

// Responder quiz
export const submitQuiz = async (quizId, respuestas) => {
  try {
    // Validar configuración previa
    // ✅ Validar configuración previa
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error(
        "No hay token de autenticación. Por favor inicia sesión.",
      );
    }

    // ✅ Validar que el ID sea numérico
    const quizIdNumerico = parseInt(quizId);
    if (isNaN(quizIdNumerico) || quizIdNumerico <= 0) {
      throw new Error(
        "ID de quiz inválido. Debe ser un número entero positivo.",
      );
    }

    // ✅ Validar que el usuario sea estudiante
    const usuario = localStorage.getItem("usuario");
    if (!usuario) {
      throw new Error(
        "Usuario no autenticado. Por favor inicia sesión nuevamente.",
      );
    }

    const usuarioData = JSON.parse(usuario);
    if (usuarioData.rol !== "estudiante") {
      throw new Error("Solo los estudiantes pueden responder quizzes.");
    }

    // ✅ Validar que haya respuestas
    if (!respuestas || respuestas.length === 0) {
      throw new Error("No hay respuestas para enviar.");
    }

    // ✅ Validar que todas las respuestas tengan formato correcto
    const respuestasValidas = respuestas.every(
      (r) => r && r.pregunta_id && r.respuesta && r.respuesta.trim() !== "",
    );

    if (!respuestasValidas) {
      throw new Error("Todas las respuestas deben ser completadas.");
    }

    console.log("📤 Enviando respuestas del quiz:", {
      quizId: quizIdNumerico,
      respuestasCount: respuestas.length,
      usuario: usuarioData.nombre,
    });

    // ✅ Petición configurada correctamente
    const response = await api.post(
      `/api/v1/quizzes/${quizIdNumerico}/responder`,
      {
        respuestas,
      },
    );

    // ✅ Verificar respuesta exitosa
    if (!response.data) {
      throw new Error("Respuesta vacía del servidor");
    }

    // ✅ Estructura estándar de respuesta
    return {
      success: true,
      data: {
        resultado: response.data,
        puntaje: response.data.puntaje || 0,
        porcentaje: response.data.porcentaje || 0,
        correctas: response.data.correctas || 0,
        incorrectas: response.data.incorrectas || 0,
        tiempo: response.data.tiempo || "00:00",
      },
      message: "Quiz respondido exitosamente",
    };
  } catch (error) {
    console.error("❌ Error respondiendo quiz:", error);

    // ✅ Manejo específico de errores
    if (error.response?.status === 401) {
      throw new Error("No autorizado. Token inválido o expirado.");
    } else if (error.response?.status === 403) {
      throw new Error(
        "Acceso denegado. No tienes permisos para responder este quiz.",
      );
    } else if (error.response?.status === 404) {
      throw new Error("Quiz no encontrado. Verifica el ID.");
    } else if (error.response?.status === 422) {
      throw new Error("Datos inválidos. Verifica tus respuestas.");
    } else if (error.response?.status >= 500) {
      throw new Error("Error del servidor. Por favor intenta más tarde.");
    } else {
      throw new Error("No se pudo responder el quiz. Verifica tu conexión.");
    }
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
