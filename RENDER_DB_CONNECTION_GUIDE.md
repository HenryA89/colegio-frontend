# 🗄️ GUÍA COMPLETA: Conectar Frontend a Base de Datos de Render

## 📋 REQUISITOS PREVIOS

### 1. Backend en Render
- ✅ Backend desplegado en Render.com
- ✅ URL del backend: `https://colegio-backend-ia.onrender.com`
- ✅ Base de datos PostgreSQL conectada al backend
- ✅ CORS configurado para el frontend

### 2. Frontend Local
- ✅ Node.js v18+
- ✅ React + Vite configurado
- ✅ Axios instalado

## 🔗 PASOS PARA CONECTAR

### Paso 1: Configurar Variables de Entorno

#### Opción A: Archivo .env.local (Desarrollo)
```bash
# Crear archivo .env.local
VITE_API_BASE_URL=https://colegio-backend-ia.onrender.com
VITE_NODE_ENV=development
VITE_ENABLE_DEBUG=true
```

#### Opción B: Archivo .env.production (Producción)
```bash
# Crear archivo .env.production
VITE_API_BASE_URL=https://colegio-backend-ia.onrender.com
VITE_NODE_ENV=production
VITE_ENABLE_DEBUG=false
```

### Paso 2: Verificar Configuración de API

El archivo `src/services/api.js` ya está configurado:

```javascript
// ✅ Configuración correcta
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 
                    "https://colegio-backend-ia.onrender.com";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});
```

### Paso 3: Verificar Endpoints del Backend

Los endpoints deben coincidir con el backend:

```javascript
// src/services/AutnServices.jsx
POST https://colegio-backend-ia.onrender.com/api/v1/login
POST /registro
GET  /api/v1/usuario/perfil
```

### Paso 4: Configurar CORS en el Backend

En el backend (Rails), agregar:

```ruby
# config/initializers/cors.rb
Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    origins ['http://localhost:5173', 'https://tu-frontend.vercel.app']
    resource '*',
      headers: :any,
      methods: [:get, :post, :put, :patch, :delete, :options, :head],
      credentials: true
  end
end
```

## 🧪 PROBAR LA CONEXIÓN

### Método 1: Usar el Diagnóstico Integrado

1. Iniciar el servidor local:
```bash
npm run dev
```

2. Abrir en navegador:
```
http://localhost:5173/diagnostico
```

3. Ejecutar el diagnóstico automático

### Método 2: Prueba Manual en Consola

```javascript
// En la consola del navegador
import api from './src/services/api.js';

// Probar conexión básica
try {
  const response = await api.get('/health');
  console.log('✅ Conexión exitosa:', response.data);
} catch (error) {
  console.error('❌ Error de conexión:', error);
}

// Probar login
try {
  const response = await api.post('/api/v1/login', {
    correo: 'admin@estudia.com',
    password: 'admin123',
    rol: 'admin'
  });
  console.log('✅ Login exitoso:', response.data);
} catch (error) {
  console.error('❌ Error login:', error.response?.data || error.message);
}
```

## 🚨 SOLUCIÓN DE PROBLEMAS COMUNES

### Problema 1: CORS Error
```
Access to XMLHttpRequest at 'https://colegio-backend-ia.onrender.com/api/v1/login' 
from origin 'http://localhost:5173' has been blocked by CORS policy
```

**Solución:**
1. Configurar CORS en el backend (ver Paso 4)
2. Agregar `http://localhost:5173` a los origins permitidos
3. Reiniciar el servidor del backend

### Problema 2: Network Error
```
Network Error
ERR_CONNECTION_REFUSED
```

**Solución:**
1. Verificar que el backend esté corriendo en Render
2. Revisar la URL del backend
3. Verificar que no haya firewall bloqueando

### Problema 3: 404 Not Found
```
POST https://colegio-backend-ia.onrender.com/api/v1/login 404 (Not Found)
```

**Solución:**
1. Verificar que los endpoints existan en el backend
2. Confirmar el path correcto (`/api/v1/login` vs `/login`)
3. Revisar las rutas en el backend

### Problema 4: 500 Internal Server Error
```
POST https://colegio-backend-ia.onrender.com/api/v1/login 500 (Internal Server Error)
```

**Solución:**
1. Revisar los logs del backend en Render
2. Verificar conexión a la base de datos
3. Comprobar que los parámetros sean correctos

## 📊 VERIFICACIÓN DE LA BASE DE DATOS

### 1. Conexión del Backend a la BD
El backend debe tener configurada la conexión a PostgreSQL:

```ruby
# config/database.yml (Rails)
production:
  adapter: postgresql
  encoding: unicode
  pool: 5
  url: <%= ENV['DATABASE_URL'] %>
```

### 2. Variables de Entorno en Render
En el dashboard de Render, configurar:

```bash
DATABASE_URL=postgresql://usuario:password@host:port/database
RAILS_ENV=production
SECRET_KEY_BASE=tu-secret-key
```

### 3. Migraciones de la BD
Asegurar que las migraciones se hayan ejecutado:

```bash
# En el servidor de Render
rails db:migrate RAILS_ENV=production
```

## 🎯 FLUJO COMPLETO DE CONEXIÓN

### 1. Frontend → Backend → Base de Datos

```
Frontend (React) 
    ↓ HTTP Request
Backend (Rails en Render)
    ↓ Query SQL
Base de Datos (PostgreSQL en Render)
    ↓ Response
Backend (Rails)
    ↓ JSON Response
Frontend (React)
```

### 2. Ejemplo de Flujo de Login

```javascript
// 1. Usuario hace login en frontend
const loginData = {
  correo: "admin@estudia.com",
  password: "admin123",
  rol: "admin"
};

// 2. Frontend envía a backend
const response = await api.post('/api/v1/login', loginData);

// 3. Backend consulta base de datos
// SELECT * FROM usuarios WHERE correo = 'admin@estudia.com'

// 4. Base de datos responde con usuario

// 5. Backend genera JWT y responde
{
  "token": "jwt-token-123",
  "usuario": { "id": 1, "correo": "admin@estudia.com", "rol": "admin" }
}

// 6. Frontend recibe y guarda token
localStorage.setItem('token', response.data.token);
```

## 🔧 CONFIGURACIÓN AVANZADA

### 1. Timeout y Reintentos
```javascript
// api.js - Configuración avanzada
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 segundos
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

// Reintentos automáticos
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.code === 'ECONNABORTED' && !error.config.__retryCount) {
      error.config.__retryCount = 1;
      return api.request(error.config);
    }
    return Promise.reject(error);
  }
);
```

### 2. Manejo de Cache
```javascript
// Cache para respuestas
const cache = new Map();

api.interceptors.request.use((config) => {
  if (config.method === 'get') {
    const cacheKey = `${config.url}${JSON.stringify(config.params)}`;
    if (cache.has(cacheKey)) {
      return Promise.resolve({ data: cache.get(cacheKey) });
    }
  }
  return config;
});
```

## 📱 TESTING DE LA CONEXIÓN

### 1. Pruebas Unitarias
```javascript
// src/__tests__/api.test.js
import api from '../services/api';

test('should connect to backend', async () => {
  const response = await api.get('/health');
  expect(response.status).toBe(200);
});
```

### 2. Pruebas de Integración
```javascript
// src/__tests__/auth.test.js
import { loginUsuario } from '../services/AutnServices';

test('should login successfully', async () => {
  const result = await loginUsuario('admin@estudia.com', 'admin123', 'admin');
  expect(result).toHaveProperty('token');
  expect(result).toHaveProperty('usuario');
});
```

## 🚀 DEPLOY EN PRODUCCIÓN

### 1. Configurar Variables en Vercel
```bash
# En Vercel dashboard
VITE_API_BASE_URL=https://colegio-backend-ia.onrender.com
VITE_NODE_ENV=production
```

### 2. Build y Deploy
```bash
npm run build:prod
npm run deploy
```

### 3. Verificación en Producción
1. Abrir la URL de producción
2. Ir a `/diagnostico`
3. Ejecutar pruebas
4. Verificar que todo esté ✅

---

## 📞 SOPORTE

Si tienes problemas:

1. **Revisa los logs** del backend en Render
2. **Usa el diagnóstico** integrado
3. **Verifica CORS** y variables de entorno
4. **Prueba endpoints** individualmente
5. **Contacta soporte** si es necesario

¡Listo! Tu frontend ahora está conectado a la base de datos de Render. 🎉
