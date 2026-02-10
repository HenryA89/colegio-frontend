import api from "./src/services/api";

// Función para probar la conexión con la API
export const testApiConnection = async () => {
  console.log("🔍 Probando conexión con la API...");

  try {
    // Probar endpoint básico de salud
    const healthResponse = await api.get("/health");
    console.log("✅ API saludable:", healthResponse.data);

    // Probar endpoint de login
    const loginResponse = await api.post("/login", {
      email: "test@test.com",
      password: "test123",
    });
    console.log("✅ Login funcionando:", loginResponse.data);

    return true;
  } catch (error) {
    console.error("❌ Error de conexión:", error.message);
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Data:", error.response.data);
    }
    return false;
  }
};

// Función para probar endpoints específicos
export const testEndpoints = async () => {
  const endpoints = [
    "/auth/login",
    "/auth/register",
    "/estudiante/clases",
    "/profesor/clases",
    "/admin/usuarios",
    "/admin/materias",
    "/admin/reportes",
  ];

  console.log("🔍 Probando endpoints específicos...");

  for (const endpoint of endpoints) {
    try {
      const response = await api.get(endpoint);
      console.log(`✅ ${endpoint}:`, response.status);
    } catch (error) {
      console.log(`❌ ${endpoint}:`, error.response?.status || error.message);
    }
  }
};

// Función para verificar configuración
export const verifyConfiguration = () => {
  console.log("🔍 Verificando configuración...");

  const baseURL = api.defaults.baseURL;
  console.log("Base URL:", baseURL);

  const headers = api.defaults.headers;
  console.log("Headers:", headers);

  if (baseURL === "http://localhost:3000/api/v1") {
    console.log("✅ Configuración correcta");
    return true;
  } else {
    console.log("❌ Configuración incorrecta");
    return false;
  }
};
