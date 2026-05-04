import api, { validarYParsearId } from "../api";

// Obtener materias asignadas al profesor
export const fetchMateriasAsignadas = async (token) => {
  try {
    console.log("=== OBTENIENDO MATERIAS ASIGNADAS ===");

    // Validar token
    const tokenValido = token || localStorage.getItem("token");
    if (!tokenValido) {
      throw new Error("No se proporcionó token de autenticación");
    }

    console.log("� Token disponible:", !!tokenValido);

    // Obtener materias asignadas al profesor con headers correctos
    const res = await api.get(`/profesores/materias_asignadas`, {
      headers: {
        Authorization: `Bearer ${tokenValido}`,
        "Content-Type": "application/json",
      },
    });

    console.log("✅ Respuesta del backend:", res.status);
    console.log("Estructura de la respuesta:", res.data);

    // Verificar diferentes posibles estructuras de respuesta
    let materias = [];

    if (
      res.data.data &&
      res.data.data.materias &&
      Array.isArray(res.data.data.materias)
    ) {
      materias = res.data.data.materias;
    } else if (res.data.materias && Array.isArray(res.data.materias)) {
      materias = res.data.materias;
    } else if (res.data.data && Array.isArray(res.data.data)) {
      materias = res.data.data;
    } else if (Array.isArray(res.data)) {
      materias = res.data;
    } else {
      materias = [];
    }

    console.log("📚 Materias asignadas procesadas:", materias.length);
    console.log("📋 Detalle de materias:", materias);

    return materias;
  } catch (error) {
    console.error("Error en fetchMateriasAsignadas:", error);

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
          "Materias no encontradas: No se encontraron materias asignadas para este profesor.",
        );
      }
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
    const res = await api.get(`/admin/materias`);

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

    // Validar y agregar claseId si existe
    if (claseId) {
      const idValidado = validarYParsearId(claseId, "clase_id");
      formData.append("clase_id", idValidado);
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
