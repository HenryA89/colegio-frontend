import api, { validarYParsearId } from "../api";

// Obtener materias asignadas al profesor
export const fetchMateriasAsignadas = async (token) => {
  try {
    console.log("=== OBTENIENDO MATERIAS ASIGNADAS ===");

    // Validar token específico de profesor
    const tokenValido = token || localStorage.getItem("usuario");

    if (!tokenValido) {
      throw new Error("No autenticado");
    }

    // Validar formato del token
    if (typeof tokenValido !== "string" || tokenValido.trim() === "") {
      throw new Error("Token inválido: formato incorrecto");
    }

    console.log("🔑 Token presente");
    console.log("🔍 Longitud del token:", tokenValido.length);
    console.log("🔍 Tipo de token:", typeof tokenValido);

    // Request directa con headers completos
    const res = await api.get("/profesores/materias_asignadas", {
      headers: {
        Authorization: `Bearer ${tokenValido.trim()}`,
        "Content-Type": "application/json",
      },
    });

    console.log("✅ Status:", res.status);
    console.log("📦 Response:", res.data);

    // Parsing según estructura del backend
    let materias = [];

    if (res.data?.success && res.data?.data?.materias) {
      // Estructura exitosa del backend
      materias = res.data.data.materias;
      console.log("✅ Materias obtenidas del backend:", materias.length);

      // Log de resumen
      const resumen = res.data.data.resumen;
      if (resumen) {
        console.log("📊 Resumen:", resumen);
      }
    } else if (res.data?.success === false && res.data?.data?.materias) {
      // Estructura con error pero datos disponibles
      materias = res.data.data.materias;
      console.log("⚠️ Materias con error:", materias.length);
      console.log("❌ Error:", res.data.error);
    } else if (res.data?.success === false) {
      // Error sin datos
      console.log("❌ Error del backend:", res.data.error);
      materias = [];
    } else {
      // Fallback para otras estructuras
      materias = res?.data?.data?.materias ?? res?.data?.materias ?? [];
      console.log("🔄 Usando fallback, materias:", materias.length);
    }

    console.log("📚 Materias finales:", materias.length);

    // Validar estructura de materias
    if (materias.length > 0) {
      console.log("📋 Estructura de materia ejemplo:", materias[0]);
    }

    return materias;
  } catch (error) {
    console.error("Error en fetchMateriasAsignadas:", error);

    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Respuesta del servidor:", error.response.data);
      console.error("Headers:", error.response.headers);

      if (error.response.status === 500) {
        // Error interno del servidor
        console.error("🔥 Error 500 - Detalles completos:");
        console.error("- URL:", error.config?.url);
        console.error("- Método:", error.config?.method);
        console.error("- Headers enviados:", error.config?.headers);
        console.error("- Data enviada:", error.config?.data);

        throw new Error(
          "Error interno del servidor (500). El backend está experimentando problemas. Por favor, contacta al administrador.",
        );
      } else if (error.response.status === 403) {
        // Forbidden - No es profesor
        throw new Error(
          "Acceso denegado: Solo los profesores pueden consultar sus materias asignadas.",
        );
      } else if (error.response.status === 401) {
        throw new Error(
          "No autorizado: Tu sesión ha expirado. Por favor, inicia sesión nuevamente.",
        );
      } else if (error.response.status === 404) {
        throw new Error(
          "Materias no encontradas: No se encontraron materias asignadas para este profesor.",
        );
      } else {
        // Otros errores HTTP
        throw new Error(
          `Error del servidor (${error.response.status}): ${error.response.data?.error || error.response.data?.message || "Error desconocido"}`,
        );
      }
    } else if (error.request) {
      // Error de red o sin respuesta
      console.error("🔌 Error de red:", error.message);
      throw new Error(
        "Error de conexión: No se pudo conectar con el servidor. Verifica tu conexión a internet.",
      );
    } else {
      // Error de configuración u otros
      console.error("⚙️ Error de configuración:", error.message);
      throw new Error(`Error en la configuración: ${error.message}`);
    }

    return [];
  }
};

// Obtener todas las clases del profesor
export const fetchClases = async (token) => {
  try {
    console.log("=== OBTENIENDO CLASES ===");

    // Obtener información del usuario
    const usuario = JSON.parse(localStorage.getItem("usuario"));

    if (!usuario) {
      throw new Error("No hay información del usuario en localStorage");
    }

    // Extraer ID del profesor con múltiples fallbacks
    const profesorId =
      usuario?.id || usuario?.usuario?.id || usuario?.profesor?.id;

    if (!profesorId) {
      throw new Error("No se pudo obtener el ID del profesor del usuario");
    }

    // Validar que el ID sea numérico
    const idValidado = validarYParsearId(profesorId, "profesor_id");

    console.log("👨‍🏫 Obteniendo clases para profesor:", idValidado);

    // Obtener clases del profesor
    const res = await api.get(`/profesores/materias_asignadas`);

    console.log("✅ Respuesta del backend:", res.status);
    console.log("Estructura de la respuesta:", res.data);

    // Verificar diferentes posibles estructuras de respuesta
    let clases = [];

    if (res.data.materias && Array.isArray(res.data.materias)) {
      clases = res.data.materias;
      console.log("✅ Usando res.data.materias:", clases.length, "clases");
    } else if (res.data.data && Array.isArray(res.data.data)) {
      clases = res.data.data;
      console.log("✅ Usando res.data.data:", clases.length, "clases");
    } else if (res.data.clases && Array.isArray(res.data.clases)) {
      clases = res.data.clases;
      console.log("✅ Usando res.data.clases:", clases.length, "clases");
    } else if (Array.isArray(res.data)) {
      clases = res.data;
      console.log("✅ Usando res.data directamente:", clases.length, "clases");
    } else {
      console.warn("⚠️ No se encontró un array de clases en la respuesta");
      console.warn("Estructura recibida:", Object.keys(res.data));
    }

    // Filtrar clases por profesor
    if (Array.isArray(clases)) {
      const clasesFiltradas = clases.filter((clase) => {
        const claseProfesorId = clase.profesor_id || clase.profesorId;
        const coincide = claseProfesorId === idValidado;
        console.log(
          `Clase ${clase.nombre}: profesor_id=${claseProfesorId}, busca=${idValidado}, coincide=${coincide}`,
        );
        return coincide;
      });

      console.log(
        `📊 Filtrado: ${clases.length} totales → ${clasesFiltradas.length} del profesor`,
      );
      return clasesFiltradas;
    }

    return clases;
  } catch (error) {
    console.error("=== ERROR OBTENIENDO MATERIAS ===");
    console.error("Error completo:", error);

    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Respuesta del servidor:", error.response.data);

      if (error.response.status === 403) {
        throw new Error(
          "Acceso denegado: No tienes permisos para ver estas materias. Por favor, verifica tu rol o contacta al administrador.",
        );
      } else if (error.response.status === 401) {
        throw new Error(
          "No autorizado: Tu sesión ha expirado. Por favor, inicia sesión nuevamente.",
        );
      } else if (error.response.status === 404) {
        throw new Error(
          "Materias no encontradas: No se encontraron materias para este profesor.",
        );
      }
    }

    return [];
  }
};

// Subir material PDF a una clase
export const subirMaterial = async ({ file, titulo, claseId }) => {
  try {
    // Validar archivo PDF
    if (!file || file.type !== "application/pdf") {
      throw new Error("Se requiere un archivo PDF válido");
    }

    // Validar tamaño máximo (10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      throw new Error("El archivo PDF no puede ser mayor a 10MB");
    }

    const formData = new FormData();
    formData.append("archivo_pdf", file);
    formData.append("titulo", titulo || file.name);

    // claseId es completamente opcional - no se requiere para subir material
    if (claseId) {
      const idValidado = validarYParsearId(claseId, "clase_id");
      formData.append("clase_id", idValidado);
      console.log("📋 ClaseId incluido (opcional):", idValidado);
    } else {
      console.log("📋 Subiendo material sin clase específica (general)");
    }

    console.log("📤 Subiendo material:", {
      fileName: file.name,
      fileSize: file.size,
      claseId: claseId || "sin clase",
    });

    const response = await api.post("/profesores/subir_material", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        "X-Requested-With": "XMLHttpRequest",
      },
    });

    console.log("✅ Material subido exitosamente:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error subiendo material:", error);
    throw error;
  }
};

// Crear nueva clase
export const crearClase = async (form) => {
  try {
    // Validar datos del formulario
    if (!form.nombre || form.nombre.trim() === "") {
      throw new Error("El nombre de la clase es obligatorio");
    }

    if (!form.materia_id) {
      throw new Error("El ID de la materia es obligatorio");
    }

    // Validar ID de materia
    const materiaId = validarYParsearId(form.materia_id, "materia_id");

    const payload = {
      nombre: form.nombre.trim(),
      materia_id: materiaId,
      descripcion: form.descripcion || "",
      ...form,
    };

    console.log("🏫 Creando nueva clase:", payload);

    const response = await api.post("/profesores/crear_clase", payload);

    console.log("✅ Clase creada exitosamente:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error creando clase:", error);
    throw error;
  }
};
