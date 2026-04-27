import api from "../../services/api";

// Obtener material reciente de una clase para generar quiz
export const fetchMaterialReciente = async (claseId) => {
  try {
    const response = await api.get(
      `api/v1/clases/${claseId}/materiales/reciente`,
    );
    return response.data;
  } catch (error) {
    console.error("❌ Error obteniendo material reciente:", error);
    throw new Error("No se pudo obtener el material reciente de la clase");
  }
};

// Extraer temas de un PDF usando IA
export const extraerTemasPDF = async (materialId) => {
  try {
    const response = await api.post(`api/v1/quiz-ia/extraer-temas`, {
      materialId,
    });
    return response.data;
  } catch (error) {
    console.error("❌ Error extrayendo temas del PDF:", error);
    throw new Error("No se pudieron extraer los temas del PDF");
  }
};

// Generar quiz con IA basado en el material (1 clase)
export const generarQuizConIA = async (claseId, opciones) => {
  try {
    const payload = {
      claseId,
      ...opciones,
    };

    // Si se va a usar material PDF, agregar el materialId
    if (opciones.usarMaterialPDF && opciones.materialId) {
      payload.materialId = opciones.materialId;
    }

    const response = await api.post(`api/v1/quiz-ia/generar`, payload);
    return response.data;
  } catch (error) {
    console.error("❌ Error generando quiz con IA:", error);
    throw new Error("No se pudo generar el quiz con IA");
  }
};

// Generar evaluación con IA basado en múltiples clases
export const generarEvaluacionConIA = async ({ clasesIds, opciones }) => {
  try {
    const response = await api.post(`api/v1/evaluacion-ia/generar`, {
      clasesIds,
      ...opciones,
    });
    return response.data;
  } catch (error) {
    console.error("❌ Error generando evaluación con IA:", error);
    throw new Error("No se pudo generar la evaluación con IA");
  }
};

// Guardar evaluación generada por IA
export const guardarEvaluacionIA = async (evaluacionData) => {
  try {
    const response = await api.post(
      `api/v1/evaluacion-ia/guardar`,
      evaluacionData,
    );
    return response.data;
  } catch (error) {
    console.error("❌ Error guardando evaluación IA:", error);
    throw new Error("No se pudo guardar la evaluación IA");
  }
};

// Obtener evaluaciones IA del profesor
export const fetchEvaluacionesIA = async () => {
  try {
    const response = await api.get(`api/v1/evaluacion-ia`);
    return response.data;
  } catch (error) {
    console.error("❌ Error obteniendo evaluaciones IA:", error);
    throw new Error("No se pudieron obtener las evaluaciones IA");
  }
};

// Guardar quiz generado por IA
export const guardarQuizIA = async (quizData) => {
  try {
    const response = await api.post(`api/v1/quiz-ia/guardar`, quizData);
    return response.data;
  } catch (error) {
    console.error("❌ Error guardando quiz IA:", error);
    throw new Error("No se pudo guardar el quiz");
  }
};

// Obtener quizzes generados por IA
export const fetchQuizzesIA = async (claseId) => {
  try {
    const response = await api.get(`api/v1/clases/${claseId}/quizzes-ia`);
    return response.data.quizzes || [];
  } catch (error) {
    console.error("❌ Error obteniendo quizzes IA:", error);
    throw new Error("No se pudieron cargar los quizzes generados por IA");
  }
};

// Editar quiz generado por IA
export const editarQuizIA = async (quizId, quizData) => {
  try {
    const response = await api.put(`api/v1/quiz-ia/${quizId}`, quizData);
    return response.data;
  } catch (error) {
    console.error("❌ Error editando quiz IA:", error);
    throw new Error("No se pudo editar el quiz");
  }
};

// Eliminar quiz generado por IA
export const eliminarQuizIA = async (quizId) => {
  try {
    const response = await api.delete(`api/v1/quiz-ia/${quizId}`);
    return response.data;
  } catch (error) {
    console.error("❌ Error eliminando quiz IA:", error);
    throw new Error("No se pudo eliminar el quiz");
  }
};

// Publicar quiz para estudiantes
export const publicarQuizIA = async (quizId) => {
  try {
    const response = await api.post(`api/v1/quiz-ia/${quizId}/publicar`);
    return response.data;
  } catch (error) {
    console.error("❌ Error publicando quiz IA:", error);
    throw new Error("No se pudo publicar el quiz");
  }
};

// Obtener resultados de quiz IA
export const fetchResultadosQuizIA = async (quizId) => {
  try {
    const response = await api.get(`api/v1/quiz-ia/${quizId}/resultados`);
    return response.data.resultados || [];
  } catch (error) {
    console.error("❌ Error obteniendo resultados quiz IA:", error);
    throw new Error("No se pudieron cargar los resultados del quiz");
  }
};

// Obtener estadísticas de quiz IA
export const fetchEstadisticasQuizIA = async (quizId) => {
  try {
    const response = await api.get(`api/v1/quiz-ia/${quizId}/estadisticas`);
    return response.data;
  } catch (error) {
    console.error("❌ Error obteniendo estadísticas quiz IA:", error);
    throw new Error("No se pudieron cargar las estadísticas del quiz");
  }
};
