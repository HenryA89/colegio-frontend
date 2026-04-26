import api from "../api";

// Obtener todas las clases del profesor
export const fetchClases = async (token) => {
  try {
    console.log("=== OBTENIENDO CLASES DEL PROFESOR ===");
    console.log("Token disponible:", !!token);

    // Usar el endpoint correcto para obtener materias
    console.log(" Llamando a /api/v1/materias...");
    const res = await api.get("api/v1/materias");

    console.log(" Respuesta de /api/v1/materias:", res.data);
    console.log("Status:", res.status);
    console.log("Estructura completa:", Object.keys(res.data));

    // Verificar diferentes posibles estructuras de respuesta
    let clasesData = [];

    if (res.data.materias && Array.isArray(res.data.materias)) {
      clasesData = res.data.materias;
      console.log(" Usando res.data.materias:", clasesData.length, "materias");
    } else if (res.data.data && Array.isArray(res.data.data)) {
      clasesData = res.data.data;
      console.log(" Usando res.data.data:", clasesData.length, "materias");
    } else if (Array.isArray(res.data)) {
      clasesData = res.data;
      console.log(
        " Usando res.data directamente:",
        clasesData.length,
        "materias",
      );
    } else {
      console.warn(" Estructura de respuesta no reconocida");
      console.warn("Datos recibidos:", res.data);
    }

    // Mostrar detalles de cada materia/clase
    console.log(" Materias recibidas:", clasesData.length);
    clasesData.forEach((materia, index) => {
      console.log(
        `  ${index + 1}. ${materia.nombre || materia.materia || "Sin nombre"} - ID: ${materia.id || materia._id} - Profesor: ${materia.profesor_id || materia.profesorId || "No asignado"}`,
      );
    });

    return clasesData;
  } catch (error) {
    console.error("=== ERROR OBTENIENDO CLASES ===");
    console.error("Error completo:", error);
    console.error("Respuesta del servidor:", error.response?.data);
    console.error("Status:", error.response?.status);
    console.error("Headers:", error.response?.headers);
    throw error;
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
