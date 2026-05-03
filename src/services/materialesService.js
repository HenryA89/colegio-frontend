import api, { validarYParsearId } from "./api";

/**
 * 📁 Servicios optimizados para gestión de materiales y quizzes
 * Compatible con backend Ruby on Rails en producción (Render)
 */

// 👨‍🏫 Subir Material (PDF)
export const subirMaterial = async ({ file, titulo, claseId }) => {
  try {
    const formData = new FormData();
    
    // 📎 Archivo PDF obligatorio
    if (!file || file.type !== 'application/pdf') {
      throw new Error('Se requiere un archivo PDF válido');
    }
    
    formData.append("archivo_pdf", file);
    formData.append("titulo", titulo || file.name);

    // 🏫 ID de clase (opcional)
    if (claseId) {
      const idValidado = validarYParsearId(claseId, "clase_id");
      formData.append("clase_id", idValidado);
    }

    console.log("📤 Subiendo material:", { 
      fileName: file.name, 
      fileSize: file.size, 
      claseId: claseId || "sin clase" 
    });

    const response = await api.post("/profesores/subir_material", formData, {
      headers: { 
        "Content-Type": "multipart/form-data",
        // Headers adicionales para Rails
        "X-Requested-With": "XMLHttpRequest"
      }
    });

    console.log("✅ Material subido exitosamente:", response.data);
    return response.data;

  } catch (error) {
    console.error("❌ Error subiendo material:", error);
    throw error;
  }
};

// 📊 Consultar estado del quiz
export const obtenerEstadoQuiz = async (materialId) => {
  try {
    const id = validarYParsearId(materialId, "material_id");
    
    console.log("🔍 Consultando estado del quiz para material:", id);
    
    const response = await api.get(`/materiales/${id}/quiz`);
    
    console.log("✅ Estado del quiz obtenido:", response.data);
    return response.data;

  } catch (error) {
    console.error("❌ Error obteniendo estado del quiz:", error);
    throw error;
  }
};

// 🎯 Obtener quiz completo
export const obtenerQuiz = async (materialId) => {
  try {
    const id = validarYParsearId(materialId, "material_id");
    
    console.log("🎯 Obteniendo quiz completo para material:", id);
    
    const response = await api.get(`/quizzes/${id}`);
    
    console.log("✅ Quiz obtenido:", response.data);
    return response.data;

  } catch (error) {
    console.error("❌ Error obteniendo quiz:", error);
    throw error;
  }
};

// 📝 Responder quiz
export const responderQuiz = async (materialId, respuestas) => {
  try {
    const id = validarYParsearId(materialId, "material_id");

    // 📋 Validar estructura de respuestas
    if (!Array.isArray(respuestas) || respuestas.length === 0) {
      throw new Error("Las respuestas deben ser un array no vacío");
    }

    // 🔢 Validar y parsear cada respuesta
    const respuestasValidadas = respuestas.map((r, index) => {
      if (!r.pregunta_id || r.opcion_seleccionada === undefined) {
        throw new Error(`Respuesta ${index + 1} inválida: falta pregunta_id u opcion_seleccionada`);
      }

      return {
        pregunta_id: validarYParsearId(r.pregunta_id, `pregunta_id_${index + 1}`),
        opcion_seleccionada: parseInt(r.opcion_seleccionada)
      };
    });

    const payload = {
      respuestas: respuestasValidadas
    };

    console.log("📝 Enviando respuestas:", { 
      materialId: id, 
      cantidadRespuestas: respuestasValidadas.length 
    });

    const response = await api.post(`/quizzes/${id}/responder`, payload);
    
    console.log("✅ Quiz respondido exitosamente:", response.data);
    return response.data;

  } catch (error) {
    console.error("❌ Error respondiendo quiz:", error);
    throw error;
  }
};

// 📈 Obtener resultado individual
export const obtenerResultado = async (materialId) => {
  try {
    const id = validarYParsearId(materialId, "material_id");
    
    console.log("📈 Obteniendo resultado para material:", id);
    
    const response = await api.get(`/quizzes/${id}/resultado`);
    
    console.log("✅ Resultado obtenido:", response.data);
    return response.data;

  } catch (error) {
    console.error("❌ Error obteniendo resultado:", error);
    throw error;
  }
};

// 🏆 Obtener ranking TOP 3
export const obtenerTop = async (materialId) => {
  try {
    const id = validarYParsearId(materialId, "material_id");
    
    console.log("🏆 Obteniendo TOP 3 para material:", id);
    
    const response = await api.get(`/quizzes/${id}/top`);
    
    console.log("✅ Ranking TOP 3 obtenido:", response.data);
    return response.data;

  } catch (error) {
    console.error("❌ Error obteniendo ranking:", error);
    throw error;
  }
};

// 📋 Obtener todos los materiales del profesor
export const obtenerMaterialesProfesor = async () => {
  try {
    console.log("📋 Obteniendo materiales del profesor");
    
    const response = await api.get("/profesor/materiales");
    
    console.log("✅ Materiales obtenidos:", response.data);
    return response.data;

  } catch (error) {
    console.error("❌ Error obteniendo materiales:", error);
    throw error;
  }
};

// 🗑️ Eliminar material
export const eliminarMaterial = async (materialId) => {
  try {
    const id = validarYParsearId(materialId, "material_id");
    
    console.log("🗑️ Eliminando material:", id);
    
    const response = await api.delete(`/materiales/${id}`);
    
    console.log("✅ Material eliminado exitosamente:", response.data);
    return response.data;

  } catch (error) {
    console.error("❌ Error eliminando material:", error);
    throw error;
  }
};

// 🔍 Buscar materiales por clase
export const obtenerMaterialesPorClase = async (claseId) => {
  try {
    const id = validarYParsearId(claseId, "clase_id");
    
    console.log("🔍 Buscando materiales para clase:", id);
    
    const response = await api.get(`/clases/${id}/materiales`);
    
    console.log("✅ Materiales de clase obtenidos:", response.data);
    return response.data;

  } catch (error) {
    console.error("❌ Error obteniendo materiales de clase:", error);
    throw error;
  }
};

// 📊 Obtener estadísticas de un material
export const obtenerEstadisticasMaterial = async (materialId) => {
  try {
    const id = validarYParsearId(materialId, "material_id");
    
    console.log("📊 Obteniendo estadísticas para material:", id);
    
    const response = await api.get(`/materiales/${id}/estadisticas`);
    
    console.log("✅ Estadísticas obtenidas:", response.data);
    return response.data;

  } catch (error) {
    console.error("❌ Error obteniendo estadísticas:", error);
    throw error;
  }
};

export default {
  subirMaterial,
  obtenerEstadoQuiz,
  obtenerQuiz,
  responderQuiz,
  obtenerResultado,
  obtenerTop,
  obtenerMaterialesProfesor,
  eliminarMaterial,
  obtenerMaterialesPorClase,
  obtenerEstadisticasMaterial
};
