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
export const subirClase = async ({ pdf }) => {
  try {
    console.log("=== INICIANDO SUBIDA DE MATERIAL ===");
    console.log("pdf recibido:", pdf ? pdf.name : "null");

    // Validar que se tenga un archivo PDF
    if (!pdf) {
      console.error("❌ No se proporcionó archivo PDF");
      throw new Error("Debe seleccionar un archivo PDF");
    }

    // Obtener y validar token del profesor
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("❌ No se encontró token de autorización en localStorage");
      throw new Error(
        "No hay sesión activa. Por favor, inicie sesión nuevamente.",
      );
    }

    // Validar formato del token (debe ser JWT válido)
    try {
      const tokenParts = token.split(".");
      if (tokenParts.length !== 3) {
        console.error("❌ Token con formato inválido (no es JWT)");
        throw new Error("Token de autenticación inválido");
      }

      // Decodificar payload del token para verificar expiración
      const payload = JSON.parse(atob(tokenParts[1]));
      const currentTime = Date.now() / 1000;

      if (payload.exp && payload.exp < currentTime) {
        console.error(
          "❌ Token expirado. Exp:",
          new Date(payload.exp * 1000),
          "Actual:",
          new Date(currentTime),
        );
        throw new Error(
          "Tu sesión ha expirado. Por favor, inicie sesión nuevamente.",
        );
      }

      console.log("✅ Token válido y no expirado");
      console.log("🔑 Token payload:", {
        userId: payload.sub || payload.userId,
        role: payload.role,
        exp: new Date(payload.exp * 1000),
      });
    } catch (tokenError) {
      console.error("❌ Error validando token:", tokenError);
      throw new Error("Error en la validación del token de autenticación");
    }

    const formData = new FormData();

    // Agregar solo archivo_pdf (sin clase_id)
    formData.append("archivo_pdf", pdf);
    console.log(
      "✅ archivo_pdf agregado al FormData:",
      pdf.name,
      "Tamaño:",
      pdf.size,
      "Tipo:",
      pdf.type,
    );

    console.log("🔍 FormData completo:");
    for (let [key, value] of formData.entries()) {
      console.log(
        `  ${key}:`,
        typeof value === "object"
          ? `${value.name} (${value.size} bytes)`
          : value,
      );
    }

    // Verificar URL completa y configuración
    const baseURL =
      import.meta.env.VITE_API_BASE_URL ||
      "https://colegio-backend-ia.onrender.com";
    const fullURL = `${baseURL}/api/v1/profesores/subir_material`;

    console.log("🌐 Configuración de la petición:");
    console.log("  - Base URL:", baseURL);
    console.log("  - Endpoint:", "/api/v1/profesores/subir_material");
    console.log("  - URL completa:", fullURL);
    console.log("  - Método:", "POST");
    console.log("  - Headers:", {
      Authorization: `Bearer ${token.substring(0, 20)}...`,
      "Content-Type": "multipart/form-data (automático)",
    });
    console.log("🚀 Enviando request a: /api/v1/profesores/subir_material");
    console.log("🔑 Token validado y disponible:", !!token);

    // Usar axios con la configuración normal del proyecto
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

    console.log("📊 Status de la respuesta:", response.status);
    console.log("✅ Respuesta del backend:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error al subir clase:", error);
    console.error("❌ Detalles del error:", error.message);

    // Manejar errores específicos de autenticación
    if (
      error.message?.includes("expirado") ||
      error.message?.includes("sesión")
    ) {
      // Limpiar token expirado
      localStorage.removeItem("token");
      localStorage.removeItem("usuario");
      throw new Error("Sesión expirada. Por favor, inicie sesión nuevamente.");
    }

    throw new Error(`No se pudo subir el material: ${error.message}`);
  }
};

// Crear nueva clase
export const crearClase = async (form, token) => {
  await api.post("api/v1/profesores/crear_clase", { ...form });
};
