import api from "../api";

// Obtener todas las clases del profesor
export const fetchClases = async (token) => {
  try {
    console.log("=== OBTENIENDO MATERIAS ===");
    console.log("Token disponible:", !!token);

    // Obtener ID del usuario desde el token o localStorage
    const usuario = JSON.parse(localStorage.getItem("usuario"));
    const tokenStorage = localStorage.getItem("token");

    console.log("Usuario completo:", usuario);
    console.log(
      "Token en storage:",
      tokenStorage ? "disponible" : "no disponible",
    );

    // Validar que tengamos el ID del profesor
    if (!usuario) {
      throw new Error("No hay información del usuario en localStorage");
    }

    const profesorId =
      usuario?.id || usuario?.usuario?.id || usuario?.profesor?.id;

    if (!profesorId) {
      throw new Error("No se pudo obtener el ID del profesor del usuario");
    }

    console.log("ID del profesor:", profesorId);
    console.log("Rol del usuario:", usuario?.rol || usuario?.usuario?.rol);

    // Usar directamente el endpoint general de materias
    console.log("🔍 Obteniendo materias desde endpoint general...");
    const res = await api.get("api/v1/materias");
    const endpointUsed = "api/v1/materias";

    console.log(
      "✅ Respuesta del backend (endpoint: " + endpointUsed + "):",
      res.status,
    );
    console.log("Estructura completa de la respuesta:", res.data);
    console.log("res.data.materias:", res.data.materias);
    console.log("Tipo de res.data.materias:", typeof res.data.materias);
    console.log("Longitud de materias:", res.data.materias?.length);

    // Verificar diferentes posibles estructuras de respuesta
    let materias = [];

    if (res.data.materias && Array.isArray(res.data.materias)) {
      materias = res.data.materias;
      console.log("✅ Usando res.data.materias:", materias.length, "materias");
    } else if (res.data.data && Array.isArray(res.data.data)) {
      materias = res.data.data;
      console.log("✅ Usando res.data.data:", materias.length, "materias");
    } else if (Array.isArray(res.data)) {
      materias = res.data;
      console.log(
        "✅ Usando res.data directamente:",
        materias.length,
        "materias",
      );
    } else {
      console.warn("⚠️ No se encontró un array de materias en la respuesta");
      console.warn("Estructura recibida:", Object.keys(res.data));
    }

    // Filtrar materias por profesor
    if (Array.isArray(materias)) {
      const materiasFiltradas = materias.filter((materia) => {
        const materiaProfesorId = materia.profesor_id || materia.profesorId;
        const coincide = materiaProfesorId === profesorId;
        console.log(
          `Materia ${materia.nombre}: profesor_id=${materiaProfesorId}, busca=${profesorId}, coincide=${coincide}`,
        );
        return coincide;
      });

      console.log(
        `📊 Filtrado: ${materias.length} totales → ${materiasFiltradas.length} del profesor`,
      );
      materias = materiasFiltradas;
    }

    console.log("📊 Materias finales:", materias.length);
    materias.forEach((materia, index) => {
      console.log(
        `  ${index + 1}. ${materia.nombre} - ID: ${materia.id || materia._id} - Profesor: ${materia.profesor_id || materia.profesorId}`,
      );
    });

    return materias;
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
// Subir material de clase (PDF o texto)
export const subirClase = async ({ claseId, pdf }) => {
  try {
    console.log("=== INICIANDO SUBIDA DE MATERIAL ===");
    console.log("claseId recibido:", claseId);
    console.log("pdf recibido:", pdf ? pdf.name : "null");

    const formData = new FormData();

    // Agregar clase_id (requerido por el backend)
    if (claseId) {
      formData.append("clase_id", claseId.toString());
      console.log("✅ clase_id agregado al FormData:", claseId.toString());
    } else {
      console.error("❌ claseId es nulo o undefined");
      throw new Error("claseId es requerido");
    }

    // Agregar archivo_pdf si existe
    if (pdf) {
      formData.append("archivo_pdf", pdf);
      console.log(
        "✅ archivo_pdf agregado al FormData:",
        pdf.name,
        "Tamaño:",
        pdf.size,
        "Tipo:",
        pdf.type,
      );
    } else {
      console.error("❌ pdf es nulo o undefined");
      throw new Error("pdf es requerido");
    }

    // Obtener token del profesor
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("❌ No se encontró token de autorización");
      throw new Error("No se encontró token de autorización");
    }

    console.log("🔍 FormData completo:");
    for (let [key, value] of formData.entries()) {
      console.log(
        `  ${key}:`,
        typeof value === "object"
          ? `${value.name} (${value.size} bytes)`
          : value,
      );
    }

    console.log("🚀 Enviando request a: api/v1/profesores/subir_material");
    console.log("🔑 Token disponible:", !!token);

    // Usar axios con la configuración normal del proyecto
    const response = await api.post(
      "api/v1/profesores/subir_material",
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          // No incluir Content-Type para que el navegador establezca multipart/form-data automáticamente
        },
      },
    );

    console.log("📊 Status de la respuesta:", response.status);
    console.log("✅ Respuesta del backend:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error al subir clase:", error);
    console.error("❌ Detalles del error:", error.message);
    throw new Error("No se pudo subir la clase");
  }
};

// Crear nueva clase
export const crearClase = async (form, token) => {
  await api.post("api/v1/profesores/crear_clase", { ...form });
};
