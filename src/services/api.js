import axios from "axios";

// 🚀 URL de producción obligatoria - no usar localhost
const API_BASE_URL = "https://colegio-backend-ia.onrender.com/api/v1";

// ✅ Creación de la instancia de Axios con configuración robusta
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
  timeout: 30000, // 30 segundos timeout para producción
});

// � Función para validar y parsear IDs
export const validarYParsearId = (id, nombreCampo = "ID") => {
  const parsedId = parseInt(id);

  if (!Number.isInteger(parsedId) || parsedId <= 0) {
    throw new Error(
      `${nombreCampo} inválido: debe ser un número entero positivo`,
    );
  }

  return parsedId;
};

// 🔐 Interceptor de request: agrega token y valida configuración
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // 📝 Logging controlado en desarrollo
    if (import.meta.env.DEV) {
      console.log("🚀 API Request:", {
        method: config.method?.toUpperCase(),
        url: config.url,
        baseURL: config.baseURL,
        data: config.data,
        headers: {
          ...config.headers,
          Authorization: config.headers.Authorization ? "***" : undefined,
        },
      });
    }

    return config;
  },
  (error) => {
    console.error("❌ Error en interceptor de request:", error);
    return Promise.reject(error);
  },
);

// 🛡️ Interceptor de respuesta: manejo robusto de errores
api.interceptors.response.use(
  (response) => {
    // 📝 Logging controlado en desarrollo
    if (import.meta.env.DEV) {
      console.log("✅ API Response:", {
        status: response.status,
        url: response.config.url,
        data: response.data,
      });
    }
    return response;
  },
  (error) => {
    // 🚨 Manejo específico de errores HTTP
    if (error.response) {
      const { status, data } = error.response;

      console.error(`❌ Error ${status}:`, data);

      // 🔓 Manejo de autenticación
      if (status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("usuario");
        window.location.href = "/login";
        return Promise.reject(
          new Error("Sesión expirada. Por favor, inicia sesión nuevamente."),
        );
      }

      // 🚫 Manejo de autorización
      if (status === 403) {
        return Promise.reject(
          new Error("Acceso denegado. No tienes permisos para esta acción."),
        );
      }

      // 🔍 Manejo de recurso no encontrado
      if (status === 404) {
        return Promise.reject(
          new Error("Recurso no encontrado. Verifica la URL o los parámetros."),
        );
      }

      // 📝 Manejo de validación
      if (status === 422) {
        const mensajeError = data?.errors
          ? Object.values(data.errors).flat().join(", ")
          : data?.message ||
            "Datos inválidos. Verifica la información enviada.";
        return Promise.reject(new Error(mensajeError));
      }

      // 🌐 Manejo de errores de servidor
      if (status >= 500) {
        return Promise.reject(
          new Error("Error del servidor. Por favor, intenta más tarde."),
        );
      }

      // 📋 Error genérico con mensaje del backend
      const mensaje = data?.message || data?.error || "Error en la solicitud";
      return Promise.reject(new Error(mensaje));
    }

    // 🌐 Errores de red o conexión
    if (error.request) {
      console.error("❌ Error de red:", error.request);
      return Promise.reject(
        new Error(
          "No se pudo conectar con el servidor. Verifica tu conexión a internet.",
        ),
      );
    }

    // ⚙️ Errores de configuración
    console.error("❌ Error de configuración:", error.message);
    return Promise.reject(
      new Error("Error en la configuración de la solicitud."),
    );
  },
);

export default api;
