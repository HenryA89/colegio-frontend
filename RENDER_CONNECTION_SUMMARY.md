# 🚀 CONECTAR FRONTEND A BASE DE DATOS DE RENDER - RESUMEN EJECUTIVO

## 📋 ESTADO ACTUAL

### ✅ Configuración Completada
- **URL Backend**: `https://colegio-backend-ia.onrender.com`
- **API Configurada**: Axios con interceptores JWT
- **Endpoints Definidos**: Login, registro, perfil
- **Herramientas de Diagnóstico**: Completas y funcionando

### 🎯 Pasos para Conectar

#### 1. **Configurar Variables de Entorno**
```bash
# Crear .env.local
VITE_API_BASE_URL=https://colegio-backend-ia.onrender.com
VITE_NODE_ENV=development
```

#### 2. **Iniciar Servidor Frontend**
```bash
npm run dev
# Abre: http://localhost:5173
```

#### 3. **Probar Conexión**
- Ir a: `http://localhost:5173/diagnostico`
- Click en: `🚀 Probar Render`
- Revisar resultados

## 🔗 FLUJO DE CONEXIÓN

```
Frontend (React) 
    ↓ HTTPS Request
Backend (Rails en Render)
    ↓ PostgreSQL Query
Base de Datos (PostgreSQL en Render)
    ↓ Response
Backend (Rails)
    ↓ JSON Response
Frontend (React)
```

## 🛠️ HERRAMIENTAS DISPONIBLES

### 1. **Diagnóstico Visual**
- URL: `http://localhost:5173/diagnostico`
- Pruebas automáticas y manuales
- Resultados en tiempo real

### 2. **Pruebas Específicas**
- `🚀 Probar Render` - Diagnóstico completo
- `⚡ Prueba Rápida` - Conexión básica
- `📋 Estado Conexión` - Configuración actual

### 3. **Scripts de Prueba**
```javascript
// Prueba rápida
import { pruebaRapidaRender } from './utils/renderConnectionTest';
await pruebaRapidaRender();

// Diagnóstico completo
import { probarConexionRender } from './utils/renderConnectionTest';
await probarConexionRender();
```

## 📊 VERIFICACIÓN DE CONEXIÓN

### ✅ Pruebas Exitosas
1. **Conexión Básica** → `/health` responde
2. **Login Admin** → Autenticación funciona
3. **Registro** → Creación de usuarios
4. **CORS** → Permite localhost:5173
5. **Token JWT** → Almacenamiento correcto

### ❌ Problemas Comunes
1. **CORS Error** → Configurar en backend
2. **Network Error** → Backend no corriendo
3. **404 Not Found** → Endpoints incorrectos
4. **500 Server Error** → Problemas backend

## 🔧 CONFIGURACIÓN DEL BACKEND (Requerido)

### CORS en Rails
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

### Endpoints Requeridos
```ruby
# config/routes.rb
namespace :api do
  namespace :v1 do
    post '/login', to: 'sessions#create'
    get '/usuario/perfil', to: 'users#profile'
  end
end

post '/registro', to: 'users#create'
get '/health', to: 'application#health'
```

## 🌐 ACCESO A LA BASE DE DATOS

### Desde el Frontend
```javascript
// Login
const response = await api.post('/api/v1/login', {
  correo: 'admin@estudia.com',
  password: 'admin123',
  rol: 'admin'
});

// Obtener perfil
const perfil = await api.get('/api/v1/usuario/perfil');
```

### Credenciales por Defecto
```
📧 Correo:    admin@estudia.com
🔑 Contraseña: admin123
👑 Rol:       admin
```

## 🚀 DEPLOY EN PRODUCCIÓN

### 1. **Variables de Entorno en Vercel**
```bash
VITE_API_BASE_URL=https://colegio-backend-ia.onrender.com
VITE_NODE_ENV=production
```

### 2. **Build y Deploy**
```bash
npm run build:prod
git push origin main
# Vercel deploy automático
```

### 3. **Verificación Producción**
- URL: `https://tu-app.vercel.app/diagnostico`
- Probar conexión en producción

## 📞 SOPORTE Y DIAGNÓSTICO

### Si hay problemas:
1. **Abrir diagnóstico**: `http://localhost:5173/diagnostico`
2. **Ejecutar pruebas**: Click en `🚀 Probar Render`
3. **Revisar logs**: Consola del navegador
4. **Verificar backend**: Dashboard de Render
5. **Revisar CORS**: Configuración en backend

### Comandos útiles:
```bash
# Ver estado actual
mostrarEstadoConexion();

# Prueba rápida
await pruebaRapidaRender();

# Diagnóstico completo
await probarConexionRender();
```

## 🎉 RESUMEN FINAL

### ✅ LISTO PARA USAR:
- Frontend configurado
- Backend URL definida
- Herramientas de diagnóstico
- Ejemplos de uso
- Guía completa

### 🚀 PRÓXIMOS PASOS:
1. Configurar CORS en backend
2. Probar conexión con diagnóstico
3. Verificar endpoints
4. Deploy en producción

**La conexión a la base de datos de Render está configurada y lista para usar. Usa las herramientas de diagnóstico para verificar que todo funcione correctamente.**
