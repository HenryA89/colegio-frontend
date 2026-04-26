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

    // Validación detallada del profesorId
    console.log("🔍 Analizando profesorId...");
    console.log("profesorId:", materiaData.profesorId);
    console.log("Tipo:", typeof materiaData.profesorId);
    console.log("Longitud:", materiaData.profesorId?.length);
    console.log("Trim():", materiaData.profesorId?.trim());
    console.log(
      "Es válido ObjectId?",
      /^[0-9a-fA-F]{24}$/.test(materiaData.profesorId),
    );

    // Validar campos obligatorios
    if (!materiaData.profesorId || materiaData.profesorId.trim() === "") {
      console.error("❌ profesorId está vacío o es nulo");
      throw new Error(
        "El profesor es obligatorio. Por favor, seleccione un profesor válido.",
      );
    }

    // Validar formato de ObjectId de MongoDB
    if (!/^[0-9a-fA-F]{24}$/.test(materiaData.profesorId)) {
      console.error("❌ profesorId no tiene formato válido de ObjectId");
      throw new Error(
        "El ID del profesor no tiene un formato válido. Por favor, seleccione un profesor de la lista.",
      );
    }

    if (!materiaData.nombre || materiaData.nombre.trim() === "") {
      console.error("❌ nombre está vacío");
      throw new Error("El nombre de la materia es obligatorio.");
    }

    // Preparar payload exactamente como lo espera el backend
    const payload = {
      nombre: materiaData.nombre.trim(),
      descripcion: materiaData.descripcion?.trim() || "",
      curso: materiaData.curso?.trim() || "",
      profesorId: materiaData.profesorId.trim(), // Asegurar que no tenga espacios
      horario: materiaData.horario?.trim() || "",
    };

    console.log("✅ Validación pasada. Enviando al backend...");
    console.log("Endpoint: POST api/v1/admin/materias");
    console.log("Payload final:", JSON.stringify(payload, null, 2));
    console.log("profesorId final:", payload.profesorId);
    console.log("Tipo profesorId final:", typeof payload.profesorId);

    const res = await api.post("api/v1/admin/materias", payload);

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
        console.error("❌ El backend dice que el profesor no existe");
        throw new Error(
          "El profesor seleccionado no existe en la base de datos. Verifique que el profesor esté registrado correctamente.",
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
