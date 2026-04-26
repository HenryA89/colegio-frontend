import api from "../api";

// Obtener todas las clases del profesor
export const fetchClases = async (token) => {
  try {
    console.log("=== OBTENIENDO MATERIAS ===");
    console.log("Token disponible:", !!token);

    // Obtener ID del usuario desde el token o localStorage
    const usuario = JSON.parse(localStorage.getItem("usuario"));
    const profesorId = usuario?.id || usuario?.usuario?.id;

    console.log("ID del profesor:", profesorId);

    // Usar el endpoint correcto que el backend espera
    const res = await api.get(`api/v1/materias/${profesorId}`);

    console.log("✅ Respuesta del backend:", res.status);
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

    console.log("📊 Materias finales:", materias.length);
    materias.forEach((materia, index) => {
      console.log(
        `  ${index + 1}. ${materia.nombre} - ID: ${materia.id || materia._id}`,
      );
    });

    return materias;
  } catch (error) {
    console.error("=== ERROR OBTENIENDO MATERIAS ===");
    console.error("Error completo:", error);
    console.error("Respuesta del servidor:", error.response?.data);
    console.error("Status:", error.response?.status);
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
