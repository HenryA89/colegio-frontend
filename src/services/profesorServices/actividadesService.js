import api from "../api";

// Obtener actividades del profesor
export const fetchActividadesProfesor = async (token) => {
  try {
    const res = await api.get("/profesor/actividades");
    return res.data.actividades || [];
  } catch (error) {
    console.error("Error al obtener actividades:", error);
    return [];
  }
};

// Crear actividad
export const crearActividad = async (actividadData, token) => {
  try {
    const res = await api.post("/profesor/actividades", actividadData);
    return res.data;
  } catch (error) {
    console.error("Error al crear actividad:", error);
    throw error;
  }
};

// Actualizar actividad
export const actualizarActividad = async (
  actividadId,
  actividadData,
  token
) => {
  try {
    const res = await api.put(
      `/profesor/actividades/${actividadId}`,
      actividadData
    );
    return res.data;
  } catch (error) {
    console.error("Error al actualizar actividad:", error);
    throw error;
  }
};

// Eliminar actividad
export const eliminarActividad = async (actividadId, token) => {
  try {
    const res = await api.delete(`/profesor/actividades/${actividadId}`);
    return res.data;
  } catch (error) {
    console.error("Error al eliminar actividad:", error);
    throw error;
  }
};

// Obtener respuestas de estudiantes para una actividad
export const fetchRespuestasActividad = async (actividadId, token) => {
  try {
    const res = await api.get(
      `/profesor/actividades/${actividadId}/respuestas`
    );
    return res.data.respuestas || [];
  } catch (error) {
    console.error("Error al obtener respuestas:", error);
    return [];
  }
};
