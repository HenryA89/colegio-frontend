import axios from "axios";

const API_BASE_URL = "http://localhost:3000/api/v1";

// ✅ Creación de la instancia de Axios con encabezados por defecto
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    Accept: "application/json", // 🔹 Indica que esperamos JSON del backend
    "Content-Type": "application/json", // 🔹 Enviamos JSON
  },
});

// ✅ Interceptor de request: agrega token si existe en localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Interceptor de respuesta: captura errores del backend (Rails)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.error("Error en respuesta del servidor:", error.response.data);
    } else if (error.request) {
      console.error("No hubo respuesta del servidor:", error.request);
    } else {
      console.error("Error en configuración de la petición:", error.message);
    }
    return Promise.reject(error);
  }
);

export default api;
