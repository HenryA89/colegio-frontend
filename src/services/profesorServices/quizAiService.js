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
