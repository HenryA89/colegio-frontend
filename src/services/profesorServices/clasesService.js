import api from "../api";

// Obtener todas las clases del profesor
export const fetchClases = async (token) => {
  const res = await api.get("api/v1/materias");
  return res.data.materias || [];
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
