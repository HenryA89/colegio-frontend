import api from "../api";

// ─── Utilidad: obtener usuario y token desde localStorage ───────────────────
const getSession = () => {
  const token = localStorage.getItem("token");
  const usuario = JSON.parse(localStorage.getItem("usuario") || "null");
  return { token, usuario };
};

// ─── Utilidad: extraer el ID del profesor de la estructura del usuario ───────
const getProfesorId = (usuario) => {
  return usuario?.id ?? usuario?.usuario?.id ?? usuario?.profesor?.id ?? null;
};

// ─── Obtener materias del profesor autenticado ────────────────────────────────
export const fetchClases = async () => {
  const { usuario } = getSession();

  if (!usuario) {
    throw new Error("No hay información del usuario en localStorage.");
  }

  const profesorId = getProfesorId(usuario);

  if (!profesorId) {
    throw new Error("No se pudo obtener el ID del profesor.");
  }

  try {
    // El backend filtra por profesor — no exponemos datos de otros profesores
    const res = await api.get(`api/v1/profesores/${profesorId}/materias`);

    // Normalizar la respuesta: aceptar res.data.materias, res.data.data o res.data[]
    const materias =
      res.data?.materias ??
      res.data?.data ??
      (Array.isArray(res.data) ? res.data : []);

    return materias;
  } catch (error) {
    const status = error.response?.status;

    if (status === 401) {
      throw new Error("Sesión expirada. Por favor, inicia sesión nuevamente.");
    }
    if (status === 403) {
      throw new Error("No tienes permisos para ver estas materias.");
    }
    if (status === 404) {
      throw new Error("No se encontraron materias para este profesor.");
    }

    throw new Error(`Error al obtener materias: ${error.message}`);
  }
};

// ─── Subir material de clase (PDF) ────────────────────────────────────────────
export const subirClase = async ({ fileInput }) => {
  const pdf = fileInput?.files?.[0];

  if (!pdf) {
    throw new Error("Debe seleccionar un archivo PDF.");
  }

  if (pdf.type !== "application/pdf") {
    throw new Error("El archivo debe ser un PDF.");
  }

  const { token } = getSession();

  if (!token) {
    throw new Error("No hay sesión activa. Por favor, inicia sesión.");
  }

  const formData = new FormData();
  // Pasar el File explícitamente con nombre de archivo
  formData.append("archivo_pdf", pdf, pdf.name);

  try {
    const response = await api.post(
      "/api/v1/profesores/subir_material",
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          // Forzar multipart — evita que Rails haga wrap_parameters
          "Content-Type": "multipart/form-data",
          // Desactiva el wrap de Rails en el frontend
          "X-No-Wrap": "true",
        },
      },
    );

    return response.data;
  } catch (error) {
    const status = error.response?.status;

    if (status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("usuario");
      throw new Error("Sesión expirada. Por favor, inicia sesión nuevamente.");
    }
    if (status === 413) {
      throw new Error("El archivo es demasiado grande.");
    }

    throw new Error(`No se pudo subir el material: ${error.message}`);
  }
};

// ─── Crear nueva clase ─────────────────────────────────────────────────────────
export const crearClase = async (form) => {
  try {
    const res = await api.post("api/v1/profesores/crear_clase", form);
    return res.data;
  } catch (error) {
    throw new Error(`Error al crear la clase: ${error.message}`);
  }
};
