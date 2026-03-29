import api from "../api";

// Obtener actividades del estudiante
export const fetchActividades = async (token) => {
  try {
    const res = await api.get("api/v1/estudiante/actividades");
    return res.data.actividades || [];
  } catch (error) {
    console.error("Error al obtener actividades:", error);
    return [];
  }
};

// Obtener actividades por clase
export const fetchActividadesPorClase = async (claseId, token) => {
  try {
    const res = await api.get(`api/v1/estudiante/actividades/clase/${claseId}`);
    return res.data.actividades || [];
  } catch (error) {
    console.error("Error al obtener actividades por clase:", error);
    return [];
  }
};

// Enviar respuesta de actividad
export const enviarRespuestaActividad = async (
  actividadId,
  respuesta,
  token,
) => {
  try {
    const res = await api.post(
      `api/v1/estudiante/actividades/${actividadId}/responder`,
      {
        respuesta,
      },
    );
    return res.data;
  } catch (error) {
    console.error("Error al enviar respuesta:", error);
    throw error;
  }
};
