import api from "../api";

// Obtener materias (admin)
export const fetchMaterias = async (token) => {
  try {
    console.log("=== OBTENIENDO MATERIAS ===");
    console.log("Token disponible:", !!token);

    // Para endpoints de admin, usar token_admin específico
    const tokenAdmin = token || localStorage.getItem("token_admin");
    console.log("Token admin usado:", !!tokenAdmin);

    const res = await api.get("admin/materias", {
      headers: {
        Authorization: `Bearer ${tokenAdmin}`,
      },
    });

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

// Crear materia (admin)
export const crearMateria = async (materiaData, token) => {
  try {
    console.log("=== CREAR MATERIA ===");
    console.log("Datos recibidos:", materiaData);

    // Validación detallada del profesorId
    console.log("🔍 Analizando profesorId...");
    console.log("profesorId:", materiaData.profesorId);
    console.log("Tipo:", typeof materiaData.profesorId);
    console.log("Longitud:", materiaData.profesorId?.length);

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

    // Preparar payload exactamente como lo espera el backend
    const payload = {
      nombre: materiaData.nombre.trim(),
      descripcion: materiaData.descripcion?.trim() || "",
      curso: materiaData.curso?.trim() || "",
      profesor_id: parseInt(materiaData.profesorId), // Convertir a número y usar profesor_id
      horario: materiaData.horario?.trim() || "",
    };

    console.log("✅ Validación pasada. Enviando al backend...");
    console.log("Endpoint: POST admin/materias");
    console.log("Payload final:", JSON.stringify(payload, null, 2));
    console.log("profesor_id final:", payload.profesor_id);
    console.log("Tipo profesor_id final:", typeof payload.profesor_id);

    const tokenAdmin = token || localStorage.getItem("token_admin");
    const res = await api.post("admin/materias", payload, {
      headers: {
        Authorization: `Bearer ${tokenAdmin}`,
      },
    });

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
    const tokenAdmin = token || localStorage.getItem("token_admin");
    const res = await api.put(`admin/materias/${materiaId}`, materiaData, {
      headers: {
        Authorization: `Bearer ${tokenAdmin}`,
      },
    });
    return res.data;
  } catch (error) {
    console.error("Error al actualizar materia:", error);
    throw error;
  }
};

// Eliminar materia (admin)
export const eliminarMateria = async (materiaId, token) => {
  try {
    console.log("=== ELIMINAR MATERIA ===");
    console.log("Materia ID recibido:", materiaId);
    console.log("Tipo:", typeof materiaId);

    if (!materiaId) {
      throw new Error("No se recibió ID de materia");
    }

    const idNumerico = Number(materiaId);

    if (!Number.isInteger(idNumerico) || idNumerico <= 0) {
      throw new Error(`ID inválido: ${materiaId}`);
    }

    console.log("ID numérico validado:", idNumerico);

    const tokenAdmin = token || localStorage.getItem("token_admin");
    console.log("Token admin disponible:", !!tokenAdmin);

    // DELETE /api/v1/admin/materias/:id
    const res = await api.delete(`admin/materias/${idNumerico}`, {
      headers: {
        Authorization: `Bearer ${tokenAdmin}`,
        "Content-Type": "application/json",
      },
    });

    console.log("✅ Materia eliminada exitosamente:", res.status);
    console.log("Respuesta:", res.data);

    return res.data;
  } catch (error) {
    console.error("=== ERROR ELIMINAR MATERIA ===");
    console.error("Error completo:", error);
    console.error("Respuesta del servidor:", error.response?.data);
    console.error("Status:", error.response?.status);

    // Manejo específico de errores
    if (error.response?.status === 401) {
      throw new Error(
        "No autorizado. Verifique sus credenciales de administrador.",
      );
    }

    if (error.response?.status === 403) {
      throw new Error("No tiene permisos para eliminar materias.");
    }

    if (error.response?.status === 404) {
      throw new Error("La materia no existe o ya fue eliminada.");
    }

    if (error.response?.status === 422) {
      throw new Error(
        "No se puede eliminar la materia. Puede tener clases o profesores asignados.",
      );
    }

    // Error genérico
    throw new Error(
      error.response?.data?.message ||
        error.message ||
        "Error al eliminar materia",
    );
  }
};

// Asignar materia a profesor (admin)
export const asignarMateriaProfesor = async (materiaIds, profesorId) => {
  try {
    console.log("=== ASIGNANDO MATERIA A PROFESOR ===");
    console.log("Materia IDs:", materiaIds);
    console.log("Profesor ID:", profesorId);

    const tokenAdmin = localStorage.getItem("token_admin");
    const response = await api.post(
      "/admin/asignaciones/asignar_materias",
      {
        materia_ids: materiaIds,
        profesor_id: profesorId,
      },
      {
        headers: {
          Authorization: `Bearer ${tokenAdmin}`,
        },
      },
    );

    console.log("✅ Respuesta del backend:", response.status);
    console.log("Datos de respuesta:", response.data);

    return response.data;
  } catch (error) {
    console.error("Error al asignar materia a profesor:", error);

    // Manejo específico de errores
    if (error.response?.status === 422) {
      const errores = error.response.data?.error || [];
      console.error("Errores de validación:", errores);

      if (errores.includes("Profesor must exist")) {
        throw new Error(
          "El profesor seleccionado no existe en la base de datos. Verifique que el profesor esté registrado correctamente.",
        );
      }

      if (errores.includes("Materia must exist")) {
        throw new Error(
          "La materia seleccionada no existe en la base de datos.",
        );
      }

      if (errores.length > 0) {
        throw new Error(`Error de validación: ${errores.join(", ")}`);
      }
    }

    // Error 401
    if (error.response?.status === 401) {
      throw new Error(
        "No autorizado. Verifique sus credenciales de administrador.",
      );
    }

    // Error 403
    if (error.response?.status === 403) {
      throw new Error("No tiene permisos para realizar esta acción.");
    }

    // Error 404
    if (error.response?.status === 404) {
      throw new Error(
        "El endpoint de asignación no está disponible. Contacte al administrador.",
      );
    }

    // Error genérico
    throw new Error(
      error.response?.data?.message ||
        error.message ||
        "Error al asignar materia al profesor",
    );
  }
};

// Asignar todas las materias a todos los profesores (admin)
export const asignarTodasMaterias = async () => {
  try {
    console.log("=== ASIGNANDO TODAS LAS MATERIAS A TODOS LOS PROFESORES ===");

    const tokenAdmin = localStorage.getItem("token_admin");
    const response = await api.post(
      "/admin/asignaciones/asignar_todas_materias",
      {},
      {
        headers: {
          Authorization: `Bearer ${tokenAdmin}`,
        },
      },
    );

    console.log("✅ Respuesta del backend:", response.status);
    console.log("Datos de respuesta:", response.data);

    return response.data;
  } catch (error) {
    console.error("Error al asignar todas las materias:", error);

    // Manejo específico de errores
    if (error.response?.status === 401) {
      throw new Error(
        "No autorizado. Verifique sus credenciales de administrador.",
      );
    }

    if (error.response?.status === 403) {
      throw new Error("No tiene permisos para realizar esta acción.");
    }

    if (error.response?.status === 404) {
      throw new Error(
        "El endpoint de asignación masiva no está disponible. Contacte al administrador.",
      );
    }

    throw new Error(
      error.response?.data?.message ||
        error.message ||
        "Error al asignar todas las materias",
    );
  }
};
