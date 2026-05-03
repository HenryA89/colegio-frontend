/**
 * 📡 Configuración de Endpoints y Constantes de la API
 * Compatible con backend Ruby on Rails en producción (Render)
 */

// 🚀 URL base de producción
export const API_BASE_URL = "https://colegio-backend-ia.onrender.com/api/v1";

// 🔐 Endpoints de Autenticación
export const AUTH_ENDPOINTS = {
  LOGIN: "/login",
  REGISTER: "/registro",
  LOGOUT: "/logout"
};

// 👥 Endpoints de Usuarios (Admin)
export const ADMIN_USERS_ENDPOINTS = {
  LIST: "/admin/usuarios",
  CREATE: "/admin/usuarios",
  UPDATE: (id) => `/admin/usuarios/${id}`,
  DELETE: (id) => `/admin/usuarios/${id}`
};

// 📚 Endpoints de Materias (Admin)
export const ADMIN_MATERIAS_ENDPOINTS = {
  LIST: "/admin/materias",
  CREATE: "/admin/materias",
  UPDATE: (id) => `/admin/materias/${id}`,
  DELETE: (id) => `/admin/materias/${id}`,
  ASIGNAR_MATERIAS: "/admin/asignaciones/asignar_materias",
  ASIGNAR_TODAS: "/admin/asignaciones/asignar_todas_materias"
};

// 🏫 Endpoints de Clases (Profesor)
export const PROFESOR_CLASES_ENDPOINTS = {
  LIST: (profesorId) => `/profesores/${profesorId}/clases`,
  CREATE: "/profesores/crear_clase",
  SUBIR_MATERIAL: "/profesores/subir_material",
  MATERIALES: "/profesor/materiales"
};

// 🤖 Endpoints de Quiz AI
export const QUIZ_AI_ENDPOINTS = {
  EXTRAER_TEMAS: "/quiz-ia/extraer-temas",
  GENERAR: "/quiz-ia/generar",
  GUARDAR: "/quiz-ia/guardar",
  LIST: (claseId) => `/clases/${claseId}/quizzes-ia`,
  UPDATE: (id) => `/quiz-ia/${id}`,
  DELETE: (id) => `/quiz-ia/${id}`,
  PUBLICAR: (id) => `/quiz-ia/${id}/publicar`,
  RESULTADOS: (id) => `/quiz-ia/${id}/resultados`,
  ESTADISTICAS: (id) => `/quiz-ia/${id}/estadisticas`
};

// 📝 Endpoints de Evaluaciones
export const EVALUACIONES_ENDPOINTS = {
  LIST: (claseId) => `/clases/${claseId}/evaluaciones`,
  CREATE: (claseId) => `/clases/${claseId}/evaluaciones`,
  UPDATE: (claseId, id) => `/clases/${claseId}/evaluaciones/${id}`,
  DELETE: (claseId, id) => `/clases/${claseId}/evaluaciones/${id}`,
  DETALLES: (claseId, id) => `/clases/${claseId}/evaluaciones/${id}`,
  RESPUESTAS: (claseId, id) => `/clases/${claseId}/evaluaciones/${id}/respuestas`,
  PUBLICAR: (claseId, id) => `/clases/${claseId}/evaluaciones/${id}/publicar`,
  ESTADISTICAS: (claseId, id) => `/clases/${claseId}/evaluaciones/${id}/estadisticas`
};

// 🎯 Endpoints de Evaluaciones IA
export const EVALUACIONES_IA_ENDPOINTS = {
  GENERAR: "/evaluacion-ia/generar",
  GUARDAR: "/evaluacion-ia/guardar",
  LIST: "/evaluacion-ia"
};

// 📊 Endpoints de Reportes (Admin)
export const ADMIN_REPORTES_ENDPOINTS = {
  LIST: "/admin/reportes",
  ESTUDIANTES: "/admin/reportes/estudiantes",
  PROFESORES: "/admin/reportes/profesores",
  CLASES: "/admin/reportes/clases"
};

// 📋 Endpoints de Materiales y Quizzes
export const MATERIALES_ENDPOINTS = {
  SUBIR: "/profesores/subir_material",
  ESTADO_QUIZ: (id) => `/materiales/${id}/quiz`,
  OBTENER_QUIZ: (id) => `/quizzes/${id}`,
  RESPONDER_QUIZ: (id) => `/quizzes/${id}/responder`,
  RESULTADO: (id) => `/quizzes/${id}/resultado`,
  TOP: (id) => `/quizzes/${id}/top`,
  LISTAR: "/profesor/materiales",
  ELIMINAR: (id) => `/materiales/${id}`,
  POR_CLASE: (claseId) => `/clases/${claseId}/materiales`,
  ESTADISTICAS: (id) => `/materiales/${id}/estadisticas`
};

// 👨‍🎓 Endpoints de Estudiantes
export const ESTUDIANTES_ENDPOINTS = {
  LIST: "/admin/estudiantes",
  DETALLE: (id) => `/admin/estudiantes/${id}`,
  ASISTENCIA: "/estudiante/asistencia/registrar",
  QUIZ_ACTUAL: "/quiz-actual",
  RESPONDER_QUIZ: "/responder-quiz",
  ACTIVIDAD_ARCHIVO: (id) => `/estudiante/actividades/${id}/archivo`
};

// 🤖 Endpoint Directo IA
export const IA_DIRECT_ENDPOINTS = {
  CREAR_QUIZ: "https://colegio-backend-ia.onrender.com/api/v1/ai/crear_quiz"
};

// 🔍 Endpoint de Sistema
export const SYSTEM_ENDPOINTS = {
  HEALTH: "/health"
};

// 📋 Endpoints de Materias (General)
export const MATERIAS_ENDPOINTS = {
  LIST: "/materias"
};

// 🔧 Configuración de Validación
export const VALIDATION_CONFIG = {
  // Tamaños máximos de archivos (bytes)
  MAX_FILE_SIZES: {
    PDF: 10 * 1024 * 1024, // 10MB
    IMAGE: 5 * 1024 * 1024, // 5MB
    DOCUMENT: 5 * 1024 * 1024 // 5MB
  },
  
  // Tipos de archivos permitidos
  ALLOWED_FILE_TYPES: {
    PDF: 'application/pdf',
    IMAGE: ['image/jpeg', 'image/png', 'image/gif'],
    DOCUMENT: ['application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
  },
  
  // Límites de datos
  LIMITS: {
    MAX_PREGUNTAS_QUIZ: 20,
    MAX_OPCIONES_PREGUNTA: 6,
    MAX_TIEMPO_PREGUNTA: 300, // 5 minutos
    MIN_TIEMPO_PREGUNTA: 10, // 10 segundos
    MAX_INTENTOS_QUIZ: 5
  }
};

// 🎨 Códigos de Estado HTTP
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503
};

// 🔄 Mensajes de Error
export const ERROR_MESSAGES = {
  NETWORK: "No se pudo conectar con el servidor. Verifica tu conexión a internet.",
  TIMEOUT: "La conexión tardó demasiado tiempo. Intenta nuevamente.",
  UNAUTHORIZED: "Sesión expirada. Por favor, inicia sesión nuevamente.",
  FORBIDDEN: "Acceso denegado. No tienes permisos para esta acción.",
  NOT_FOUND: "Recurso no encontrado. Verifica la URL o los parámetros.",
  VALIDATION: "Datos inválidos. Verifica la información enviada.",
  SERVER_ERROR: "Error del servidor. Por favor, intenta más tarde.",
  UNKNOWN: "Ocurrió un error inesperado. Intenta nuevamente."
};

// 🎭 Roles de Usuario
export const USER_ROLES = {
  ADMIN: "admin",
  PROFESOR: "profesor", 
  ESTUDIANTE: "estudiante"
};

// 📊 Tipos de Quiz
export const QUIZ_TYPES = {
  OPCION_MULTIPLE: "opcion",
  VERDADERO_FALSO: "verdadero_falso",
  SELECCION_MULTIPLE: "multiple",
  MIXTO: "mixto"
};

// 📈 Niveles de Dificultad
export const DIFFICULTY_LEVELS = {
  FACIL: "facil",
  MEDIA: "media",
  DIFICIL: "dificil"
};

export default {
  API_BASE_URL,
  AUTH_ENDPOINTS,
  ADMIN_USERS_ENDPOINTS,
  ADMIN_MATERIAS_ENDPOINTS,
  PROFESOR_CLASES_ENDPOINTS,
  QUIZ_AI_ENDPOINTS,
  EVALUACIONES_ENDPOINTS,
  EVALUACIONES_IA_ENDPOINTS,
  ADMIN_REPORTES_ENDPOINTS,
  MATERIALES_ENDPOINTS,
  ESTUDIANTES_ENDPOINTS,
  IA_DIRECT_ENDPOINTS,
  SYSTEM_ENDPOINTS,
  MATERIAS_ENDPOINTS,
  VALIDATION_CONFIG,
  HTTP_STATUS,
  ERROR_MESSAGES,
  USER_ROLES,
  QUIZ_TYPES,
  DIFFICULTY_LEVELS
};
