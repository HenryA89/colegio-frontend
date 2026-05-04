import api from "../api";

// Obtener usuarios (admin)
export const fetchUsuarios = async (token) => {
  try {
    console.log("=== FETCH USUARIOS ===");
    console.log("Token recibido:", !!token);
    console.log("Endpoint:", "api/v1/admin/usuarios");

    // Para endpoints de admin, usar token_admin específico
    const tokenAdmin = token || localStorage.getItem("token_admin");
    console.log("Token admin usado:", !!tokenAdmin);

    const res = await api.get("admin/usuarios", {
      headers: {
        Authorization: `Bearer ${tokenAdmin}`,
      },
    });

    console.log("Respuesta HTTP:", res.status);
    console.log("Headers:", res.headers);
    console.log("Data cruda:", res.data);
    console.log("Data tipo:", typeof res.data);

    // Intentar diferentes formatos de respuesta
    let usuarios = [];

    if (Array.isArray(res.data)) {
      usuarios = res.data;
    } else if (
      res.data &&
      res.data.usuarios &&
      Array.isArray(res.data.usuarios)
    ) {
      usuarios = res.data.usuarios;
    } else if (res.data && res.data.data && Array.isArray(res.data.data)) {
      usuarios = res.data.data;
    } else if (res.data && typeof res.data === "object") {
      // Buscar arrays dentro del objeto
      const arrays = Object.values(res.data).filter((val) =>
        Array.isArray(val),
      );
      if (arrays.length > 0) {
        usuarios = arrays[0];
      }
    }

    console.log("Usuarios extraídos:", usuarios);
    console.log("Cantidad:", usuarios.length);

    return usuarios;
  } catch (error) {
    console.error("=== ERROR FETCH USUARIOS ===");
    console.error("Error completo:", error);
    console.error("Respuesta del servidor:", error.response?.data);
    console.error("Status:", error.response?.status);
    console.error("Headers:", error.response?.headers);

    // Si es error 401, puede ser problema de autenticación
    if (error.response?.status === 401) {
      console.error("Error de autenticación - token inválido o expirado");
    }

    return [];
  }
};

// Crear usuario (admin)
export const crearUsuario = async (usuarioData, token) => {
  try {
    const tokenAdmin = token || localStorage.getItem("token_admin");
    const res = await api.post("admin/usuarios", usuarioData, {
      headers: {
        Authorization: `Bearer ${tokenAdmin}`,
      },
    });
    return res.data;
  } catch (error) {
    console.error("Error al crear usuario:", error);
    throw error;
  }
};

// Actualizar usuario (admin)
export const actualizarUsuario = async (usuarioId, usuarioData, token) => {
  try {
    const tokenAdmin = token || localStorage.getItem("token_admin");
    const res = await api.put(`admin/usuarios/${usuarioId}`, usuarioData, {
      headers: {
        Authorization: `Bearer ${tokenAdmin}`,
      },
    });
    return res.data;
  } catch (error) {
    console.error("Error al actualizar usuario:", error);
    throw error;
  }
};

// Eliminar usuario (admin)
export const eliminarUsuario = async (usuarioId, token) => {
  try {
    const tokenAdmin = token || localStorage.getItem("token_admin");
    const res = await api.delete(`admin/usuarios/${usuarioId}`, {
      headers: {
        Authorization: `Bearer ${tokenAdmin}`,
      },
    });
    return res.data;
  } catch (error) {
    console.error("Error al eliminar usuario:", error);
    throw error;
  }
};

// Inscribir estudiante individualmente en materia (admin)
export const inscribirEstudianteMateria = async (
  estudianteId,
  materiaId,
  token,
) => {
  try {
    console.log("=== INSCRIBIENDO ESTUDIANTE EN MATERIA ===");
    console.log("Estudiante ID:", estudianteId);
    console.log("Materia ID:", materiaId);

    // Validar IDs
    if (!estudianteId) {
      throw new Error("No se recibió ID de estudiante");
    }

    if (!materiaId) {
      throw new Error("No se recibió ID de materia");
    }

    const idEstudianteNumerico = Number(estudianteId);
    const idMateriaNumerico = Number(materiaId);

    if (!Number.isInteger(idEstudianteNumerico) || idEstudianteNumerico <= 0) {
      throw new Error(`ID de estudiante inválido: ${estudianteId}`);
    }

    if (!Number.isInteger(idMateriaNumerico) || idMateriaNumerico <= 0) {
      throw new Error(`ID de materia inválido: ${materiaId}`);
    }

    const tokenAdmin = token || localStorage.getItem("token_admin");
    console.log("Token admin disponible:", !!tokenAdmin);

    // POST /api/v1/admin/inscripciones/inscribir
    const res = await api.post(
      "admin/inscripciones/inscribir",
      {
        estudiante_id: idEstudianteNumerico,
        materia_id: idMateriaNumerico,
      },
      {
        headers: {
          Authorization: `Bearer ${tokenAdmin}`,
          "Content-Type": "application/json",
        },
      },
    );

    console.log("✅ Estudiante inscrito exitosamente:", res.status);
    console.log("Respuesta:", res.data);

    return res.data;
  } catch (error) {
    console.error("=== ERROR INSCRIBIENDO ESTUDIANTE ===");
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
      throw new Error("No tiene permisos para inscribir estudiantes.");
    }

    if (error.response?.status === 404) {
      throw new Error("El estudiante o la materia no existe.");
    }

    if (error.response?.status === 422) {
      throw new Error(
        "El estudiante ya está inscrito en esta materia o hay datos inválidos.",
      );
    }

    throw new Error(
      error.response?.data?.message ||
        error.message ||
        "Error al inscribir estudiante en materia",
    );
  }
};

// Inscribir estudiantes masivamente en materia (admin)
export const inscribirEstudiantesMasivo = async (
  estudiantesIds,
  materiaId,
  token,
) => {
  try {
    console.log("=== INSCRIPCIÓN MASIVA DE ESTUDIANTES ===");
    console.log("Estudiantes IDs:", estudiantesIds);
    console.log("Materia ID:", materiaId);

    // Validar datos
    if (!Array.isArray(estudiantesIds) || estudiantesIds.length === 0) {
      throw new Error("Debe proporcionar un array de IDs de estudiantes");
    }

    if (!materiaId) {
      throw new Error("No se recibió ID de materia");
    }

    const idMateriaNumerico = Number(materiaId);
    if (!Number.isInteger(idMateriaNumerico) || idMateriaNumerico <= 0) {
      throw new Error(`ID de materia inválido: ${materiaId}`);
    }

    // Validar cada ID de estudiante
    const idsEstudiantesValidados = estudiantesIds.map((id) => {
      const idNumerico = Number(id);
      if (!Number.isInteger(idNumerico) || idNumerico <= 0) {
        throw new Error(`ID de estudiante inválido: ${id}`);
      }
      return idNumerico;
    });

    const tokenAdmin = token || localStorage.getItem("token_admin");
    console.log("Token admin disponible:", !!tokenAdmin);
    console.log(
      "Cantidad de estudiantes a inscribir:",
      idsEstudiantesValidados.length,
    );

    // POST /api/v1/admin/inscripciones/inscribir_masivo
    const res = await api.post(
      "admin/inscripciones/inscribir_masivo",
      {
        materia_id: idMateriaNumerico,
        estudiantes_ids: idsEstudiantesValidados,
      },
      {
        headers: {
          Authorization: `Bearer ${tokenAdmin}`,
          "Content-Type": "application/json",
        },
      },
    );

    console.log("✅ Inscripción masiva exitosa:", res.status);
    console.log("Respuesta:", res.data);

    return res.data;
  } catch (error) {
    console.error("=== ERROR INSCRIPCIÓN MASIVA ===");
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
      throw new Error("No tiene permisos para inscribir estudiantes.");
    }

    if (error.response?.status === 404) {
      throw new Error("La materia no existe.");
    }

    if (error.response?.status === 422) {
      throw new Error(
        "Hay estudiantes ya inscritos o datos inválidos en la lista.",
      );
    }

    throw new Error(
      error.response?.data?.message ||
        error.message ||
        "Error en inscripción masiva de estudiantes",
    );
  }
};

// Obtener materias disponibles para inscripción (admin)
export const fetchMateriasDisponibles = async (token) => {
  try {
    console.log("=== OBTENIENDO MATERIAS DISPONIBLES ===");

    const tokenAdmin = token || localStorage.getItem("token_admin");
    console.log("Token admin disponible:", !!tokenAdmin);

    const res = await api.get("admin/materias", {
      headers: {
        Authorization: `Bearer ${tokenAdmin}`,
      },
    });

    console.log("✅ Materias disponibles obtenidas:", res.status);
    console.log("Cantidad:", res.data?.length || 0);

    return res.data;
  } catch (error) {
    console.error("Error obteniendo materias disponibles:", error);
    throw error;
  }
};
