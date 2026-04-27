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

    // Intentar diferentes endpoints para obtener las materias
    let res;
    let endpointUsed = "";

    try {
      // Opción 1: Endpoint específico para profesor
      console.log("🔍 Intentando endpoint específico para profesor...");
      res = await api.get(`api/v1/materias/${profesorId}`);
      endpointUsed = `api/v1/materias/${profesorId}`;
      console.log("✅ Endpoint específico funcionó");
    } catch (err1) {
      console.log(
        "❌ Endpoint específico falló:",
        err1.response?.status,
        err1.response?.data,
      );

      if (err1.response?.status === 403) {
        console.warn(
          "⚠️ Acceso denegado al endpoint específico, intentando endpoint general...",
        );
      }

      try {
        // Opción 2: Endpoint general de materias (fallback)
        console.log("🔍 Intentando endpoint general de materias...");
        res = await api.get("api/v1/materias");
        endpointUsed = "api/v1/materias";
        console.log("✅ Endpoint general funcionó");
      } catch (err2) {
        console.log(
          "❌ Endpoint general también falló:",
          err2.response?.status,
          err2.response?.data,
        );
        throw new Error(
          "No se pudieron obtener las materias de ningún endpoint",
        );
      }
    }

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

    // Filtrar materias por profesor si el endpoint no lo hace automáticamente
    if (endpointUsed === "api/v1/materias" && Array.isArray(materias)) {
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
export const subirClase = async ({ pdf, texto }) => {
  try {
    const formData = new FormData();
    if (pdf) formData.append("pdf", pdf);
    if (texto) formData.append("texto", texto);

    const response = await api.post("api/v1/clases", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error al subir clase:", error);
    throw new Error("No se pudo subir la clase");
  }
};

// Crear nueva clase
export const crearClase = async (form, token) => {
  await api.post("api/v1/profesores/crear_clase", { ...form });
};
