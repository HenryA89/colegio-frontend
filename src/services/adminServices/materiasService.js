import api from "../api";

// Obtener materias (admin)
export const fetchMaterias = async (token) => {
  try {
    const res = await api.get("api/v1/admin/materias");
    return res.data.materias || [];
  } catch (error) {
    console.error("Error al obtener materias:", error);
    return [];
  }
};

// Crear materia (admin)
export const crearMateria = async (materiaData, token) => {
  try {
    console.log("=== CREAR MATERIA ===");
    console.log("Datos recibidos:", materiaData);
    console.log("Token disponible:", !!token);

    // Validar campos obligatorios
    if (!materiaData.profesorId || materiaData.profesorId.trim() === "") {
      console.error("❌ profesorId está vacío o es nulo");
      throw new Error(
        "El profesor es obligatorio. Por favor, seleccione un profesor válido.",
      );
    }

    if (!materiaData.nombre || materiaData.nombre.trim() === "") {
      console.error("❌ nombre está vacío");
      throw new Error("El nombre de la materia es obligatorio.");
    }

    console.log("✅ Validación pasada. Enviando al backend...");
    console.log("Endpoint: POST api/v1/admin/materias");
    console.log("Payload:", JSON.stringify(materiaData, null, 2));

    const res = await api.post("api/v1/admin/materias", materiaData);

    console.log("✅ Respuesta del backend:", res.status);
    console.log("Data:", res.data);

    return res.data;
  } catch (error) {
    console.error("=== ERROR CREAR MATERIA ===");
    console.error("Error completo:", error);
    console.error("Respuesta del servidor:", error.response?.data);
    console.error("Status:", error.response?.status);
    console.error("Headers:", error.response?.headers);

    // Manejo específico de errores 422
    if (error.response?.status === 422) {
      const errores = error.response.data?.error || [];
      console.error("Errores de validación:", errores);

      if (
        errores.includes("Profesor must exist") ||
        errores.includes("Profesor es obligatorio")
      ) {
        throw new Error(
          "El profesor seleccionado no existe o no es válido. Por favor, seleccione otro profesor.",
        );
      }

      if (errores.length > 0) {
        throw new Error(`Error de validación: ${errores.join(", ")}`);
      }
    }

    // Error 401
    if (error.response?.status === 401) {
      throw new Error("No autorizado. Inicie sesión nuevamente.");
    }

    // Error 403
    if (error.response?.status === 403) {
      throw new Error("No tiene permisos para crear materias.");
    }

    // Error genérico
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Error al crear materia";
    throw new Error(errorMessage);
  }
};

// Actualizar materia (admin)
export const actualizarMateria = async (materiaId, materiaData, token) => {
  try {
    const res = await api.put(
      `api/v1/admin/materias/${materiaId}`,
      materiaData,
    );
    return res.data;
  } catch (error) {
    console.error("Error al actualizar materia:", error);
    throw error;
  }
};

// Eliminar materia (admin)
export const eliminarMateria = async (materiaId, token) => {
  try {
    const res = await api.delete(`api/v1/admin/materias/${materiaId}`);
    return res.data;
  } catch (error) {
    console.error("Error al eliminar materia:", error);
    throw error;
  }
};
