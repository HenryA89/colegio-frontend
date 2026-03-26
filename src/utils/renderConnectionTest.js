import api from "../services/api";

// 🗄️ Script específico para probar conexión a base de datos de Render
export const probarConexionRender = async () => {
  console.log("🚀 Probando conexión a base de datos de Render...");
  
  const resultados = {
    timestamp: new Date().toISOString(),
    backend: "https://colegio-backend-ia.onrender.com",
    pruebas: [],
    exito: false,
    recomendaciones: []
  };

  // 1. Probar conexión básica al backend
  console.log("📡 1. Probando conexión básica...");
  try {
    const response = await api.get("/health", { timeout: 10000 });
    resultados.pruebas.push({
      nombre: "Conexión Básica",
      endpoint: "/health",
      estado: "✅ Éxito",
      status: response.status,
      data: response.data,
      tiempo: new Date().toISOString()
    });
    console.log("✅ Conexión básica exitosa:", response.data);
  } catch (error) {
    resultados.pruebas.push({
      nombre: "Conexión Básica",
      endpoint: "/health",
      estado: "❌ Fallo",
      error: error.message,
      codigo: error.code,
      tiempo: new Date().toISOString()
    });
    resultados.recomendaciones.push("Verificar que el backend esté corriendo en Render");
    console.error("❌ Error en conexión básica:", error.message);
  }

  // 2. Probar endpoint de login
  console.log("🔐 2. Probando endpoint de login...");
  try {
    const response = await api.post("/api/v1/login", {
      correo: "admin@estudia.com",
      password: "admin123",
      rol: "admin"
    }, { validateStatus: false });
    
    if (response.status === 200) {
      resultados.pruebas.push({
        nombre: "Login Admin",
        endpoint: "/api/v1/login",
        estado: "✅ Éxito",
        status: response.status,
        usuario: response.data.usuario,
        tiempo: new Date().toISOString()
      });
      console.log("✅ Login exitoso:", response.data.usuario);
    } else if (response.status === 401) {
      resultados.pruebas.push({
        nombre: "Login Admin",
        endpoint: "/api/v1/login",
        estado: "⚠️ 401 (Credenciales)",
        status: response.status,
        mensaje: "Endpoint activo pero credenciales incorrectas",
        tiempo: new Date().toISOString()
      });
      console.log("⚠️ Endpoint activo pero credenciales incorrectas");
    } else {
      resultados.pruebas.push({
        nombre: "Login Admin",
        endpoint: "/api/v1/login",
        estado: "❌ Error",
        status: response.status,
        error: response.data,
        tiempo: new Date().toISOString()
      });
      console.log("❌ Error en login:", response.status, response.data);
    }
  } catch (error) {
    if (error.code === 'NETWORK_ERROR' || error.code === 'ERR_CONNECTION_REFUSED') {
      resultados.pruebas.push({
        nombre: "Login Admin",
        endpoint: "/api/v1/login",
        estado: "❌ Sin Conexión",
        error: "No se puede conectar al backend",
        codigo: error.code,
        tiempo: new Date().toISOString()
      });
      resultados.recomendaciones.push("Revisar URL del backend y configuración CORS");
    } else {
      resultados.pruebas.push({
        nombre: "Login Admin",
        endpoint: "/api/v1/login",
        estado: "❌ Error",
        error: error.message,
        codigo: error.code,
        tiempo: new Date().toISOString()
      });
    }
    console.error("❌ Error en login:", error.message);
  }

  // 3. Probar endpoint de registro
  console.log("📝 3. Probando endpoint de registro...");
  try {
    const testUser = {
      nombre: "Test Render",
      correo: `test${Date.now()}@render.com`,
      password: "test123",
      password_confirmation: "test123",
      rol: "estudiante"
    };
    
    const response = await api.post("/registro", testUser, { validateStatus: false });
    
    if (response.status === 201) {
      resultados.pruebas.push({
        nombre: "Registro Usuario",
        endpoint: "/registro",
        estado: "✅ Éxito",
        status: response.status,
        usuario: response.data.usuario,
        tiempo: new Date().toISOString()
      });
      console.log("✅ Registro exitoso:", response.data.usuario);
    } else {
      resultados.pruebas.push({
        nombre: "Registro Usuario",
        endpoint: "/registro",
        estado: "⚠️ Revisar",
        status: response.status,
        error: response.data,
        tiempo: new Date().toISOString()
      });
      console.log("⚠️ Registro:", response.status, response.data);
    }
  } catch (error) {
    resultados.pruebas.push({
      nombre: "Registro Usuario",
      endpoint: "/registro",
      estado: "❌ Error",
      error: error.message,
      tiempo: new Date().toISOString()
    });
    console.error("❌ Error en registro:", error.message);
  }

  // 4. Probar con token si existe
  const token = localStorage.getItem("token");
  if (token) {
    console.log("🎫 4. Probando autenticación con token...");
    try {
      const response = await api.get("/api/v1/usuario/perfil");
      resultados.pruebas.push({
        nombre: "Perfil Usuario",
        endpoint: "/api/v1/usuario/perfil",
        estado: "✅ Éxito",
        status: response.status,
        usuario: response.data,
        tiempo: new Date().toISOString()
      });
      console.log("✅ Perfil obtenido:", response.data);
    } catch (error) {
      if (error.response?.status === 401) {
        resultados.pruebas.push({
          nombre: "Perfil Usuario",
          endpoint: "/api/v1/usuario/perfil",
          estado: "⚠️ Token Inválido",
          status: 401,
          mensaje: "Token expirado o inválido",
          tiempo: new Date().toISOString()
        });
        resultados.recomendaciones.push("Iniciar sesión nuevamente para obtener token válido");
      } else {
        resultados.pruebas.push({
          nombre: "Perfil Usuario",
          endpoint: "/api/v1/usuario/perfil",
          estado: "❌ Error",
          error: error.message,
          tiempo: new Date().toISOString()
        });
      }
      console.error("❌ Error obteniendo perfil:", error.message);
    }
  } else {
    console.log("⚠️ 4. No hay token para probar autenticación");
  }

  // 5. Verificar configuración de CORS
  console.log("🌐 5. Verificando configuración CORS...");
  try {
    const response = await api.options("/api/v1/login");
    resultados.pruebas.push({
      nombre: "CORS Check",
      endpoint: "/api/v1/login",
      estado: "✅ CORS OK",
      headers: response.headers,
      tiempo: new Date().toISOString()
    });
    console.log("✅ CORS configurado correctamente");
  } catch (error) {
    if (error.message.includes('CORS')) {
      resultados.pruebas.push({
        nombre: "CORS Check",
        endpoint: "/api/v1/login",
        estado: "❌ CORS Error",
        error: "CORS no está configurado correctamente",
        tiempo: new Date().toISOString()
      });
      resultados.recomendaciones.push("Configurar CORS en el backend para permitir localhost:5173");
    } else {
      resultados.pruebas.push({
        nombre: "CORS Check",
        endpoint: "/api/v1/login",
        estado: "⚠️ No se pudo verificar",
        error: error.message,
        tiempo: new Date().toISOString()
      });
    }
    console.log("⚠️ No se pudo verificar CORS:", error.message);
  }

  // Calcular resultado final
  const exitosas = resultados.pruebas.filter(p => p.estado.includes("✅")).length;
  const totales = resultados.pruebas.length;
  resultados.exito = exitosas >= Math.floor(totales * 0.6); // 60% de éxito mínimo
  resultados.resumen = {
    exitosas,
    totales,
    porcentaje: Math.round((exitosas / totales) * 100)
  };

  // Generar recomendaciones finales
  if (!resultados.exito) {
    resultados.recomendaciones.push("Verificar que el backend esté corriendo en Render");
    resultados.recomendaciones.push("Revisar configuración de CORS en el backend");
    resultados.recomendaciones.push("Confirmar que la base de datos esté conectada");
    resultados.recomendaciones.push("Revisar variables de entorno en Render");
  }

  console.log("📊 Resultados finales:", resultados);
  return resultados;
};

// 🎯 Función para ejecutar prueba rápida
export const pruebaRapidaRender = async () => {
  console.log("⚡ Ejecutando prueba rápida a Render...");
  
  try {
    const start = Date.now();
    const response = await api.get("/health", { timeout: 5000 });
    const end = Date.now();
    
    console.log("✅ Conexión exitosa");
    console.log(`⏱️ Tiempo de respuesta: ${end - start}ms`);
    console.log("📡 Estado:", response.status);
    
    return {
      exito: true,
      tiempo: end - start,
      status: response.status,
      data: response.data
    };
  } catch (error) {
    console.error("❌ Error en prueba rápida:", error.message);
    
    return {
      exito: false,
      error: error.message,
      codigo: error.code
    };
  }
};

// 📋 Función para mostrar estado de la conexión
export const mostrarEstadoConexion = () => {
  const estado = {
    baseURL: api.defaults.baseURL,
    headers: api.defaults.headers,
    timeout: api.defaults.timeout,
    tieneToken: !!localStorage.getItem("token"),
    timestamp: new Date().toISOString()
  };
  
  console.group("📋 Estado Actual de Conexión");
  console.log("🌐 Base URL:", estado.baseURL);
  console.log("📋 Headers:", estado.headers);
  console.log("⏱️ Timeout:", estado.timeout, "ms");
  console.log("🎫 Token:", estado.tieneToken ? "✅ Presente" : "❌ Ausente");
  console.log("🕐 Timestamp:", estado.timestamp);
  console.groupEnd();
  
  return estado;
};
