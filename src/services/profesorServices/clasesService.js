import api from "../api";

// Obtener todas las clases del profesor
export const fetchClases = async (token) => {
  try {
    console.log("=== OBTENIENDO CLASES DEL PROFESOR ===");
    console.log("Token disponible:", !!token);

    // Intentar diferentes endpoints para obtener las clases del profesor
    let clasesData = [];

    try {
      // Opción 1: Endpoint específico para profesor
      console.log("Intentando endpoint de profesor...");
      const res1 = await api.get("api/v1/profesores/materias");
      console.log("✅ Respuesta de profesor/clases:", res1.data);

      if (res1.data.clases && Array.isArray(res1.data.clases)) {
        clasesData = res1.data.clases;
        console.log("✅ Usando res.data.clases:", clasesData.length, "clases");
      } else if (res1.data.data && Array.isArray(res1.data.data)) {
        clasesData = res1.data.data;
        console.log("✅ Usando res.data.data:", clasesData.length, "clases");
      } else if (Array.isArray(res1.data)) {
        clasesData = res1.data;
        console.log(
          "✅ Usando res.data directamente:",
          clasesData.length,
          "clases",
        );
      }
    } catch (err1) {
      console.log("❌ Endpoint profesor/clases falló:", err1.message);

      try {
        // Opción 2: Endpoint de materias (fallback)
        console.log("Intentando endpoint de materias...");
        const res2 = await api.get("api/v1/materias");
        console.log("✅ Respuesta de materias:", res2.data);

        if (res2.data.materias && Array.isArray(res2.data.materias)) {
          clasesData = res2.data.materias;
          console.log(
            "✅ Usando res.data.materias:",
            clasesData.length,
            "clases",
          );
        } else if (res2.data.data && Array.isArray(res2.data.data)) {
          clasesData = res2.data.data;
          console.log("✅ Usando res.data.data:", clasesData.length, "clases");
        } else if (Array.isArray(res2.data)) {
          clasesData = res2.data;
          console.log(
            "✅ Usando res.data directamente:",
            clasesData.length,
            "clases",
          );
        }
      } catch (err2) {
        console.log("❌ Endpoint materias también falló:", err2.message);
        throw new Error("No se pudieron obtener las clases de ningún endpoint");
      }
    }

    // Filtrar clases asignadas al profesor actual si no vienen filtradas
    console.log("📊 Clases recibidas:", clasesData.length);
    clasesData.forEach((clase, index) => {
      console.log(
        `  ${index + 1}. ${clase.nombre || clase.materia} - Profesor: ${clase.profesor_id || clase.profesorId || "No asignado"}`,
      );
    });

    return clasesData;
  } catch (error) {
    console.error("=== ERROR OBTENIENDO CLASES ===");
    console.error("Error completo:", error);
    console.error("Respuesta del servidor:", error.response?.data);
    console.error("Status:", error.response?.status);
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
