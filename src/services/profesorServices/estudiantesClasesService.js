import api from "../../services/api";

// Obtener todos los estudiantes
export const fetchEstudiantesPorClase = async () => {
  try {
    console.log("=== FETCH ESTUDIANTES ===");
    console.log("Endpoint:", `/api/v1/admin/usuarios/estudiantes`);

    const response = await api.get(`/api/v1/admin/usuarios/estudiantes`);
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
    } else if (response.data && typeof response.data === "object") {
      // Buscar arrays dentro del objeto
      const arrays = Object.values(response.data).filter((val) =>
        Array.isArray(val),
      );
      if (arrays.length > 0) {
        estudiantes = arrays[0];
      }
    }

    console.log("Estudiantes extraídos:", estudiantes);
    console.log("Cantidad:", estudiantes.length);

    // Mostrar detalles de los estudiantes encontrados
    if (estudiantes.length > 0) {
      console.log("Primer estudiante:", estudiantes[0]);
      console.log(
        "Nombres:",
        estudiantes.slice(0, 3).map((e) => e.nombre || "Sin nombre"),
      );
      console.log(
        "IDs:",
        estudiantes.slice(0, 3).map((e) => e.id || e._id || "sin-id"),
      );
    }

    return estudiantes;
  } catch (error) {
    console.error("=== ERROR FETCH ESTUDIANTES POR CLASE ===");
    console.error("Error completo:", error);
    console.error("Respuesta del servidor:", error.response?.data);
    console.error("Status:", error.response?.status);
    console.error("Headers:", error.response?.headers);

    // Si es error 401, puede ser problema de autenticación
    if (error.response?.status === 401) {
      console.error("Error de autenticación - token inválido o expirado");
    }

    if (error.response?.status === 404) {
      console.error("Clase no encontrada - ID inválido");
    }

    throw new Error(
      `No se pudieron cargar los estudiantes de la clase (${error.response?.status || "Sin status"})`,
    );
  }
};

// Obtener resultados académicos de todos los estudiantes
export const fetchResultadosEstudiantes = async () => {
  try {
    const response = await api.get("api/v1/estudiantes/resultados");
    return response.data.resultados || [];
  } catch (error) {
    console.error("❌ Error obteniendo resultados de estudiantes:", error);
    throw new Error("No se pudieron cargar los resultados de los estudiantes");
  }
};

// Obtener resultados de estudiantes por clase específica
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
    const response = await api.post(
      `/api/v1/admin/usuarios/estudiantes`,
      estudianteData,
    );
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

    const response = await api.post(`/api/v1/admin/usuarios/estudiantes`, {
      grado: grado,
      claseId: claseId,
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

    const response = await api.get(`/api/v1/admin/usuarios/estudiantes`);

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

    console.log("✅ Estudiantes disponibles:", estudiantes.length);
    return estudiantes;
  } catch (error) {
    console.error("❌ Error obteniendo estudiantes disponibles:", error);
    throw new Error("No se pudieron obtener los estudiantes disponibles");
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
