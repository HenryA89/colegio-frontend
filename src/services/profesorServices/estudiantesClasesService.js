import api from "../../services/api";

// Obtener todos los estudiantes
export const fetchEstudiantesPorClase = async () => {
  try {
    console.log("=== FETCH ESTUDIANTES ===");
    console.log("Endpoint:", `/api/v1/profesores/estudiantes`);

    const response = await api.get(`/api/v1/profesores/estudiantes`);
    console.log("Respuesta HTTP:", response.status);
    console.log("Data cruda:", response.data);
    console.log("Data tipo:", typeof response.data);

    // Intentar diferentes formatos de respuesta
    let estudiantes = [];

    if (Array.isArray(response.data)) {
      estudiantes = response.data;
    } else if (
      response.data &&
      response.data.estudiantes &&
      Array.isArray(response.data.estudiantes)
    ) {
      estudiantes = response.data.estudiantes;
    } else if (
      response.data &&
      response.data.data &&
      Array.isArray(response.data.data)
    ) {
      estudiantes = response.data.data;
    }

    console.log(`📊 Estudiantes encontrados: ${estudiantes.length}`);

    // Filtrar solo estudiantes con rol de estudiante
    const estudiantesFiltrados = estudiantes.filter(
      (estudiante) =>
        estudiante.rol === "estudiante" ||
        estudiante.tipo === "estudiante" ||
        estudiante.role === "estudiante",
    );

    console.log(
      `📊 Estudiantes totales: ${estudiantes.length} → Estudiantes con rol estudiante: ${estudiantesFiltrados.length}`,
    );

    return estudiantesFiltrados;
  } catch (error) {
    console.error("❌ Error obteniendo estudiantes:", error);
    throw new Error("No se pudieron cargar los estudiantes");
  }
};

// Obtener resultados de un estudiante específico
export const fetchResultadosEstudiantes = async (estudianteId) => {
  try {
    const response = await api.get(
      `api/v1/estudiantes/${estudianteId}/resultados`,
    );
    return response.data.resultados || [];
  } catch (error) {
    console.error("❌ Error obteniendo resultados del estudiante:", error);
    throw new Error("No se pudieron cargar los resultados del estudiante");
  }
};

// Obtener resultados de una clase específica
export const fetchResultadosPorClase = async (claseId) => {
  try {
    const response = await api.get(`api/v1/clases/${claseId}/resultados`);
    return response.data.resultados || [];
  } catch (error) {
    console.error("❌ Error obteniendo resultados de la clase:", error);
    throw new Error("No se pudieron cargar los resultados de la clase");
  }
};

// Inscribir estudiante en una clase
export const inscribirEstudiante = async (claseId, estudianteData) => {
  try {
    const response = await api.post(`/api/v1/profesores/crear_clase`, {
      ...estudianteData,
      claseId: claseId,
      accion: "inscribir_estudiante",
    });
    return response.data;
  } catch (error) {
    console.error("❌ Error inscribiendo estudiante:", error);
    throw new Error("No se pudo inscribir al estudiante");
  }
};

// Inscribir automáticamente todos los estudiantes de un grado/curso en una clase
export const inscribirEstudiantesAutomaticamente = async (claseId, grado) => {
  try {
    console.log("=== INSCRIPCIÓN AUTOMÁTICA DE ESTUDIANTES ===");
    console.log("Clase ID:", claseId);
    console.log("Grado:", grado);

    const response = await api.post(`/api/v1/profesores/crear_clase`, {
      claseId: claseId,
      grado: grado,
      accion: "inscribir_automatico",
    });
    console.log("✅ Estudiantes inscritos automáticamente:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error en inscripción automática:", error);
    throw new Error(
      `No se pudo inscribir automáticamente los estudiantes: ${error.message}`,
    );
  }
};

// Obtener todos los estudiantes disponibles para inscripción (no inscritos aún)
export const fetchEstudiantesDisponibles = async (grado) => {
  try {
    console.log("=== OBTENIENDO ESTUDIANTES DISPONIBLES ===");
    console.log("Grado:", grado);

    const response = await api.get(`/api/v1/profesores/estudiantes`);
    console.log("Respuesta HTTP:", response.status);
    console.log("Data cruda:", response.data);
    console.log("Data tipo:", typeof response.data);

    // Manejar diferentes formatos de respuesta
    let estudiantes = [];
    if (Array.isArray(response.data)) {
      estudiantes = response.data;
    } else if (
      response.data?.estudiantes &&
      Array.isArray(response.data.estudiantes)
    ) {
      estudiantes = response.data.estudiantes;
    } else if (response.data?.data && Array.isArray(response.data.data)) {
      estudiantes = response.data.data;
    }

    console.log(`📊 Estudiantes disponibles: ${estudiantes.length}`);

    return estudiantes;
  } catch (error) {
    console.error("❌ Error obteniendo estudiantes disponibles:", error);
    throw new Error("No se pudieron obtener los estudiantes disponibles");
  }
};

// Inscribir todos los estudiantes en todas las clases del profesor
export const inscribirTodosEstudiantesEnTodasLasClases = async (profesorId) => {
  try {
    console.log("=== INSCRIPCIÓN MASIVA AUTOMÁTICA ===");
    console.log("Profesor ID:", profesorId);

    // 1. Obtener todas las clases del profesor
    const { fetchClases } = await import("./clasesService");
    const clases = await fetchClases(localStorage.getItem("token"));

    console.log(`📚 Clases del profesor: ${clases.length}`);
    clases.forEach((clase, index) => {
      console.log(
        `  ${index + 1}. ${clase.nombre} - ID: ${clase.id || clase._id}`,
      );
    });

    // 2. Obtener todos los estudiantes
    const estudiantes = await fetchEstudiantesPorClase();
    console.log(`👥 Estudiantes disponibles: ${estudiantes.length}`);

    if (clases.length === 0) {
      console.warn("⚠️ No hay clases disponibles para inscribir estudiantes");
      return { mensaje: "No hay clases disponibles", inscritos: 0 };
    }

    if (estudiantes.length === 0) {
      console.warn("⚠️ No hay estudiantes disponibles para inscribir");
      return { mensaje: "No hay estudiantes disponibles", inscritos: 0 };
    }

    let totalInscripciones = 0;
    let errores = [];

    // 3. Inscribir cada estudiante en cada clase usando el endpoint específico
    for (const clase of clases) {
      const claseId = clase.id || clase._id;
      console.log(`\n🔄 Procesando clase: ${clase.nombre} (ID: ${claseId})`);

      for (const estudiante of estudiantes) {
        try {
          const response = await api.post(
            `/api/v1/inscripciones/inscribir_todos`,
            {
              estudianteId: estudiante.id || estudiante._id,
              claseId: claseId,
              profesorId: profesorId,
            },
          );

          console.log(
            `✅ Estudiante ${estudiante.nombre} inscrito en ${clase.nombre}`,
          );
          totalInscripciones++;
        } catch (error) {
          console.error(
            `❌ Error inscribiendo ${estudiante.nombre} en ${clase.nombre}:`,
            error.response?.data || error.message,
          );
          errores.push({
            estudiante: estudiante.nombre,
            clase: clase.nombre,
            error: error.response?.data?.message || error.message,
          });
        }
      }
    }

    const resultado = {
      mensaje: `Proceso completado: ${totalInscripciones} inscripciones exitosas de ${clases.length * estudiantes.length} posibles`,
      totalPosibles: clases.length * estudiantes.length,
      totalExitosas: totalInscripciones,
      totalErrores: errores.length,
      clasesProcesadas: clases.length,
      estudiantesProcesados: estudiantes.length,
      errores: errores,
    };

    console.log("📊 RESULTADO FINAL:", resultado);
    return resultado;
  } catch (error) {
    console.error("❌ Error en inscripción masiva:", error);
    throw new Error(
      `No se pudo completar la inscripción masiva: ${error.message}`,
    );
  }
};

// Subir material de clase (PDF o texto)
export const subirMaterialClase = async (claseId, materialData) => {
  try {
    console.log("=== SUBIENDO MATERIAL DE CLASE ===");
    console.log("Clase ID:", claseId);
    console.log("Material Data:", materialData);

    const formData = new FormData();

    // Agregar datos básicos
    formData.append("clase_id", claseId.toString());
    formData.append(
      "material_titulo",
      materialData.titulo || "Material de Clase",
    );
    formData.append("material_texto", materialData.texto || "");

    // Agregar archivo PDF si existe
    if (materialData.archivoPdf) {
      formData.append("archivo_pdf", materialData.archivoPdf);
      console.log("📄 Archivo PDF agregado:", materialData.archivoPdf.name);
    }

    // Obtener token del profesor
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("No se encontró token de autorización");
    }

    console.log("🔍 Enviando material al backend...");

    const response = await api.post(
      "/api/v1/profesores/subir_material",
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          // No incluir Content-Type para que el navegador establezca multipart/form-data automáticamente
        },
      },
    );

    console.log("✅ Material subido exitosamente:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error subiendo material de clase:", error);
    console.error("Respuesta del servidor:", error.response?.data);

    if (error.response?.status === 413) {
      throw new Error(
        "El archivo es demasiado grande. El tamaño máximo permitido es 10MB.",
      );
    } else if (error.response?.status === 415) {
      throw new Error(
        "Formato de archivo no soportado. Solo se permiten archivos PDF.",
      );
    } else if (error.response?.status === 401) {
      throw new Error(
        "No autorizado. Tu sesión ha expirado. Por favor, inicia sesión nuevamente.",
      );
    } else {
      throw new Error(
        `No se pudo subir el material: ${error.response?.data?.message || error.message}`,
      );
    }
  }
};

// Eliminar estudiante de una clase
export const eliminarEstudianteDeClase = async (claseId, estudianteId) => {
  try {
    const response = await api.delete(
      `api/v1/clases/${claseId}/estudiantes/${estudianteId}`,
    );
    return response.data;
  } catch (error) {
    console.error("❌ Error eliminando estudiante de la clase:", error);
    throw new Error("No se pudo eliminar al estudiante de la clase");
  }
};

// Obtener estadísticas de la clase
export const fetchEstadisticasClase = async (claseId) => {
  try {
    const response = await api.get(`api/v1/clases/${claseId}/estadisticas`);
    return response.data;
  } catch (error) {
    console.error("❌ Error obteniendo estadísticas de la clase:", error);
    throw new Error("No se pudieron cargar las estadísticas de la clase");
  }
};
