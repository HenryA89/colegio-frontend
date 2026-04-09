import api from "../api";

// Obtener todas las clases del profesor
export const fetchClases = async (token) => {
  const res = await api.get("api/v1/materias");
  return res.data.materias || [];
};

// Subir material de clase (PDF o texto)
export const subirClase = async ({ pdf, texto }) => {
  const formData = new FormData();
  if (pdf) formData.append("pdf", pdf);
  if (texto) formData.append("texto", texto);
  const response = await fetch("/api/v1/clases", {
    method: "POST",
    body: formData,
  });
  if (!response.ok) throw new Error("No se pudo subir la clase");
  return response;
};

// Crear nueva clase
export const crearClase = async (form, token) => {
  await api.post("api/v1/profesores/crear_clase", { ...form });
};
