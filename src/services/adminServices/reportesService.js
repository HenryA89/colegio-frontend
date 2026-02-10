import api from "../api";

// Obtener reportes (admin)
export const fetchReportes = async (token) => {
  try {
    const res = await api.get("/admin/reportes");
    return res.data.reportes || [];
  } catch (error) {
    console.error("Error al obtener reportes:", error);
    return [];
  }
};

// Generar reporte de estudiantes
export const generarReporteEstudiantes = async (filtros, token) => {
  try {
    const res = await api.post("/admin/reportes/estudiantes", filtros);
    return res.data;
  } catch (error) {
    console.error("Error al generar reporte de estudiantes:", error);
    throw error;
  }
};

// Generar reporte de profesores
export const generarReporteProfesores = async (filtros, token) => {
  try {
    const res = await api.post("/admin/reportes/profesores", filtros);
    return res.data;
  } catch (error) {
    console.error("Error al generar reporte de profesores:", error);
    throw error;
  }
};

// Generar reporte de clases
export const generarReporteClases = async (filtros, token) => {
  try {
    const res = await api.post("/admin/reportes/clases", filtros);
    return res.data;
  } catch (error) {
    console.error("Error al generar reporte de clases:", error);
    throw error;
  }
};
