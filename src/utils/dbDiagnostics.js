import api from "./api";

// 🔍 Herramienta de diagnóstico de conexión a base de datos
export const diagnosticarConexionDB = async () => {
  const resultados = {
    timestamp: new Date().toISOString(),
    pruebas: [],
    exito: false,
    errores: []
  };

  console.log("🔍 Iniciando diagnóstico de conexión a base de datos...");

  // 1. Prueba de conexión básica al backend
  try {
    console.log("📡 Probando conexión básica...");
    const response = await api.get("/health");
    resultados.pruebas.push({
      nombre: "Conexión básica",
      endpoint: "/health",
      estado: "✅ Éxito",
      respuesta: response.data,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    resultados.errores.push({
      prueba: "Conexión básica",
      error: error.message,
      codigo: error.response?.status,
      endpoint: "/health"
    });
    resultados.pruebas.push({
      nombre: "Conexión básica",
      endpoint: "/health",
      estado: "❌ Fallo",
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }

  // 2. Prueba de endpoint de login (sin credenciales)
  try {
    console.log("🔐 Probando endpoint de login...");
    const response = await api.post("/api/v1/login", {
      correo: "test@diagnostico.com",
      password: "test123",
      rol: "estudiante"
    }, {
      validateStatus: false // No lanzar error para 401/403
    });
    
    if (response.status === 401) {
      resultados.pruebas.push({
        nombre: "Endpoint login",
        endpoint: "/api/v1/login",
        estado: "✅ Activo (401 esperado)",
        mensaje: "Endpoint responde correctamente",
        timestamp: new Date().toISOString()
      });
    } else {
      resultados.pruebas.push({
        nombre: "Endpoint login",
        endpoint: "/api/v1/login",
        estado: "⚠️ Inesperado",
        status: response.status,
        data: response.data,
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    if (error.response?.status === 401) {
      resultados.pruebas.push({
        nombre: "Endpoint login",
        endpoint: "/api/v1/login",
        estado: "✅ Activo (401 esperado)",
        mensaje: "Endpoint responde correctamente",
        timestamp: new Date().toISOString()
      });
    } else {
      resultados.errores.push({
        prueba: "Endpoint login",
        error: error.message,
        codigo: error.response?.status,
        endpoint: "/api/v1/login"
      });
      resultados.pruebas.push({
        nombre: "Endpoint login",
        endpoint: "/api/v1/login",
        estado: "❌ Fallo",
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  // 3. Prueba de endpoint de registro
  try {
    console.log("📝 Probando endpoint de registro...");
    const response = await api.post("/registro", {
      nombre: "Usuario Test",
      correo: "test@diagnostico.com",
      password: "test123",
      password_confirmation: "test123",
      rol: "estudiante"
    }, {
      validateStatus: false
    });
    
    resultados.pruebas.push({
      nombre: "Endpoint registro",
      endpoint: "/registro",
      estado: response.status === 201 ? "✅ Funciona" : "⚠️ Revisar",
      status: response.status,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    resultados.errores.push({
      prueba: "Endpoint registro",
      error: error.message,
      codigo: error.response?.status,
      endpoint: "/registro"
    });
    resultados.pruebas.push({
      nombre: "Endpoint registro",
      endpoint: "/registro",
      estado: "❌ Fallo",
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }

  // 4. Prueba con token válido (si existe)
  const token = localStorage.getItem("token");
  if (token) {
    try {
      console.log("🎫 Probando autenticación con token...");
      const response = await api.get("/api/v1/usuario/perfil");
      resultados.pruebas.push({
        nombre: "Autenticación con token",
        endpoint: "/api/v1/usuario/perfil",
        estado: "✅ Funciona",
        usuario: response.data,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      resultados.errores.push({
        prueba: "Autenticación con token",
        error: error.message,
        codigo: error.response?.status,
        endpoint: "/api/v1/usuario/perfil"
      });
      resultados.pruebas.push({
        nombre: "Autenticación con token",
        endpoint: "/api/v1/usuario/perfil",
        estado: "❌ Fallo",
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  // 5. Verificación de configuración
  console.log("⚙️ Verificando configuración...");
  const config = {
    baseURL: api.defaults.baseURL,
    headers: api.defaults.headers,
    tieneToken: !!token
  };

  resultados.pruebas.push({
    nombre: "Configuración API",
    estado: "✅ Verificada",
    config: config,
    timestamp: new Date().toISOString()
  });

  // Resultado final
  resultados.exito = resultados.errores.length === 0;
  resultados.totalPruebas = resultados.pruebas.length;
  resultados.totalErrores = resultados.errores.length;

  console.log("📊 Resultados del diagnóstico:", resultados);
  return resultados;
};

// 🚀 Función para ejecutar diagnóstico automáticamente
export const ejecutarDiagnosticoAutomatico = async () => {
  console.log("🚀 Ejecutando diagnóstico automático de conexión...");
  
  try {
    const resultados = await diagnosticarConexionDB();
    
    // Mostrar resultados en consola
    console.group("📋 RESUMEN DEL DIAGNÓSTICO");
    console.log("🕐 Timestamp:", resultados.timestamp);
    console.log("✅ Pruebas exitosas:", resultados.totalPruebas);
    console.log("❌ Errores encontrados:", resultados.totalErrores);
    console.log("🎯 Estado general:", resultados.exito ? "✅ TODO FUNCIONA" : "❌ HAY PROBLEMAS");
    
    if (resultados.errores.length > 0) {
      console.group("🚨 DETALLES DE ERRORES:");
      resultados.errores.forEach((error, index) => {
        console.log(`${index + 1}. ${error.prueba}: ${error.error}`);
        if (error.codigo) {
          console.log(`   Código HTTP: ${error.codigo}`);
        }
        if (error.endpoint) {
          console.log(`   Endpoint: ${error.endpoint}`);
        }
      });
      console.groupEnd();
    }
    
    console.group("📋 DETALLES DE PRUEBAS:");
    resultados.pruebas.forEach((prueba, index) => {
      console.log(`${index + 1}. ${prueba.nombre}: ${prueba.estado}`);
      if (prueba.endpoint) {
        console.log(`   Endpoint: ${prueba.endpoint}`);
      }
      if (prueba.timestamp) {
        console.log(`   Timestamp: ${prueba.timestamp}`);
      }
    });
    console.groupEnd();
    
    return resultados;
  } catch (error) {
    console.error("❌ Error en diagnóstico automático:", error);
    return null;
  }
};

// 🔧 Función para probar conexión específica
export const probarEndpoint = async (endpoint, metodo = "GET", data = null) => {
  try {
    console.log(`🔍 Probando ${metodo} ${endpoint}...`);
    
    let response;
    switch (metodo.toUpperCase()) {
      case "GET":
        response = await api.get(endpoint);
        break;
      case "POST":
        response = await api.post(endpoint, data);
        break;
      case "PUT":
        response = await api.put(endpoint, data);
        break;
      case "DELETE":
        response = await api.delete(endpoint);
        break;
      default:
        throw new Error(`Método no soportado: ${metodo}`);
    }
    
    console.log(`✅ ${endpoint} - Status: ${response.status}`);
    return { exito: true, response };
  } catch (error) {
    console.log(`❌ ${endpoint} - Error: ${error.message}`);
    if (error.response?.status) {
      console.log(`   Status: ${error.response.status}`);
    }
    return { exito: false, error };
  }
};
