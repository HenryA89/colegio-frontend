/**
 * 🔧 Utilidades de Validación y Manejo de Datos
 * Compatible con backend Ruby on Rails
 */

import { VALIDATION_CONFIG, HTTP_STATUS, ERROR_MESSAGES } from "../config/endpoints";

/**
 * 🔢 Valida y parsea un ID a número entero
 * @param {any} id - ID a validar
 * @param {string} nombreCampo - Nombre del campo para mensajes de error
 * @returns {number} ID validado como número entero
 * @throws {Error} Si el ID es inválido
 */
export const validarYParsearId = (id, nombreCampo = "ID") => {
  if (id === null || id === undefined) {
    throw new Error(`${nombreCampo} es requerido`);
  }

  const parsedId = parseInt(id);
  
  if (isNaN(parsedId)) {
    throw new Error(`${nombreCampo} debe ser un número válido`);
  }
  
  if (parsedId <= 0) {
    throw new Error(`${nombreCampo} debe ser un número positivo`);
  }
  
  return parsedId;
};

/**
 * 📄 Valida un archivo PDF
 * @param {File} file - Archivo a validar
 * @returns {boolean} true si es válido
 * @throws {Error} Si el archivo es inválido
 */
export const validarArchivoPDF = (file) => {
  if (!file) {
    throw new Error("Debe seleccionar un archivo");
  }

  if (file.type !== VALIDATION_CONFIG.ALLOWED_FILE_TYPES.PDF) {
    throw new Error("El archivo debe ser un PDF");
  }

  if (file.size > VALIDATION_CONFIG.MAX_FILE_SIZES.PDF) {
    const maxSizeMB = VALIDATION_CONFIG.MAX_FILE_SIZES.PDF / (1024 * 1024);
    throw new Error(`El archivo PDF no puede ser mayor a ${maxSizeMB}MB`);
  }

  return true;
};

/**
 * 📝 Valida datos de un quiz
 * @param {Object} quizData - Datos del quiz a validar
 * @returns {boolean} true si es válido
 * @throws {Error} Si los datos son inválidos
 */
export const validarDatosQuiz = (quizData) => {
  if (!quizData) {
    throw new Error("Los datos del quiz son requeridos");
  }

  // Validar título
  if (!quizData.titulo || quizData.titulo.trim() === '') {
    throw new Error("El título del quiz es obligatorio");
  }

  if (quizData.titulo.length > 200) {
    throw new Error("El título no puede exceder 200 caracteres");
  }

  // Validar número de preguntas
  const numPreguntas = parseInt(quizData.numeroPreguntas) || 0;
  if (numPreguntas < 1 || numPreguntas > VALIDATION_CONFIG.LIMITS.MAX_PREGUNTAS_QUIZ) {
    throw new Error(`El número de preguntas debe estar entre 1 y ${VALIDATION_CONFIG.LIMITS.MAX_PREGUNTAS_QUIZ}`);
  }

  // Validar tiempo por pregunta
  const tiempoPorPregunta = parseInt(quizData.tiempoPorPregunta) || 0;
  if (tiempoPorPregunta < VALIDATION_CONFIG.LIMITS.MIN_TIEMPO_PREGUNTA || 
      tiempoPorPregunta > VALIDATION_CONFIG.LIMITS.MAX_TIEMPO_PREGUNTA) {
    throw new Error(`El tiempo por pregunta debe estar entre ${VALIDATION_CONFIG.LIMITS.MIN_TIEMPO_PREGUNTA} y ${VALIDATION_CONFIG.LIMITS.MAX_TIEMPO_PREGUNTA} segundos`);
  }

  // Validar dificultad
  if (!quizData.dificultad || !Object.values(VALIDATION_CONFIG.LIMITS).includes(quizData.dificultad)) {
    throw new Error("La dificultad seleccionada no es válida");
  }

  return true;
};

/**
 * 📋 Valida respuestas de un quiz
 * @param {Array} respuestas - Array de respuestas a validar
 * @param {Array} preguntas - Array de preguntas para referencia
 * @returns {boolean} true si es válido
 * @throws {Error} Si las respuestas son inválidas
 */
export const validarRespuestasQuiz = (respuestas, preguntas) => {
  if (!Array.isArray(respuestas)) {
    throw new Error("Las respuestas deben ser un array");
  }

  if (!Array.isArray(preguntas)) {
    throw new Error("Las preguntas deben ser un array");
  }

  if (respuestas.length !== preguntas.length) {
    throw new Error("Debe responder todas las preguntas");
  }

  // Validar cada respuesta
  respuestas.forEach((respuesta, index) => {
    if (!respuesta.pregunta_id) {
      throw new Error(`La respuesta ${index + 1} no tiene pregunta_id`);
    }

    if (respuesta.opcion_seleccionada === undefined || respuesta.opcion_seleccionada === null) {
      throw new Error(`La respuesta ${index + 1} no tiene opción seleccionada`);
    }

    // Validar que el pregunta_id sea numérico
    validarYParsearId(respuesta.pregunta_id, `pregunta_id_${index + 1}`);
  });

  return true;
};

/**
 * 👤 Valida datos de usuario
 * @param {Object} userData - Datos del usuario a validar
 * @returns {boolean} true si es válido
 * @throws {Error} Si los datos son inválidos
 */
export const validarDatosUsuario = (userData) => {
  if (!userData) {
    throw new Error("Los datos del usuario son requeridos");
  }

  // Validar nombre
  if (!userData.nombre || userData.nombre.trim() === '') {
    throw new Error("El nombre es obligatorio");
  }

  if (userData.nombre.length < 2 || userData.nombre.length > 100) {
    throw new Error("El nombre debe tener entre 2 y 100 caracteres");
  }

  // Validar correo
  if (!userData.correo || userData.correo.trim() === '') {
    throw new Error("El correo es obligatorio");
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(userData.correo)) {
    throw new Error("El correo electrónico no es válido");
  }

  // Validar contraseña
  if (!userData.password || userData.password.length < 6) {
    throw new Error("La contraseña debe tener al menos 6 caracteres");
  }

  if (userData.password.length > 50) {
    throw new Error("La contraseña no puede exceder 50 caracteres");
  }

  // Validar confirmación de contraseña
  if (userData.password !== userData.password_confirmation) {
    throw new Error("Las contraseñas no coinciden");
  }

  // Validar rol
  if (!userData.rol) {
    throw new Error("El rol es obligatorio");
  }

  return true;
};

/**
 * 📊 Formatea tamaño de archivo
 * @param {number} bytes - Tamaño en bytes
 * @returns {string} Tamaño formateado
 */
export const formatearTamanoArchivo = (bytes) => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * 📅 Formatea fecha
 * @param {Date|string} fecha - Fecha a formatear
 * @returns {string} Fecha formateada
 */
export const formatearFecha = (fecha) => {
  const date = new Date(fecha);
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * 🎨 Obtiene mensaje de error según código HTTP
 * @param {number} status - Código HTTP
 * @param {string} customMessage - Mensaje personalizado
 * @returns {string} Mensaje de error
 */
export const obtenerMensajeError = (status, customMessage = null) => {
  if (customMessage) {
    return customMessage;
  }

  switch (status) {
    case HTTP_STATUS.BAD_REQUEST:
      return ERROR_MESSAGES.VALIDATION;
    case HTTP_STATUS.UNAUTHORIZED:
      return ERROR_MESSAGES.UNAUTHORIZED;
    case HTTP_STATUS.FORBIDDEN:
      return ERROR_MESSAGES.FORBIDDEN;
    case HTTP_STATUS.NOT_FOUND:
      return ERROR_MESSAGES.NOT_FOUND;
    case HTTP_STATUS.UNPROCESSABLE_ENTITY:
      return ERROR_MESSAGES.VALIDATION;
    case HTTP_STATUS.INTERNAL_SERVER_ERROR:
    case HTTP_STATUS.BAD_GATEWAY:
    case HTTP_STATUS.SERVICE_UNAVAILABLE:
      return ERROR_MESSAGES.SERVER_ERROR;
    default:
      return ERROR_MESSAGES.UNKNOWN;
  }
};

/**
 * 🔍 Limpia y normaliza un objeto de datos
 * @param {Object} data - Objeto a limpiar
 * @returns {Object} Objeto limpio
 */
export const limpiarDatos = (data) => {
  if (!data || typeof data !== 'object') {
    return {};
  }

  const cleaned = {};
  
  Object.keys(data).forEach(key => {
    const value = data[key];
    
    // Ignorar valores nulos, undefined o strings vacíos
    if (value !== null && value !== undefined && value !== '') {
      // Trim strings
      if (typeof value === 'string') {
        cleaned[key] = value.trim();
      } else {
        cleaned[key] = value;
      }
    }
  });

  return cleaned;
};

/**
 * 🔄 Convierte snake_case a camelCase
 * @param {string} str - String en snake_case
 * @returns {string} String en camelCase
 */
export const snakeToCamel = (str) => {
  return str.replace(/_([a-z])/g, (match, letter) => letter.toUpperCase());
};

/**
 * 🔄 Convierte camelCase a snake_case
 * @param {string} str - String en camelCase
 * @returns {string} String en snake_case
 */
export const camelToSnake = (str) => {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
};

/**
 * 📋 Genera un ID único
 * @returns {string} ID único
 */
export const generarIdUnico = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

/**
 * 🎯 Valida puntuación
 * @param {number} puntaje - Puntaje a validar
 * @param {number} maximo - Puntaje máximo
 * @returns {boolean} true si es válido
 */
export const validarPuntaje = (puntaje, maximo) => {
  const num = parseFloat(puntaje);
  const max = parseFloat(maximo);
  
  if (isNaN(num) || isNaN(max)) {
    throw new Error("El puntaje y el máximo deben ser números válidos");
  }
  
  if (num < 0 || num > max) {
    throw new Error(`El puntaje debe estar entre 0 y ${max}`);
  }
  
  return true;
};

/**
 * 📊 Calcula porcentaje
 * @param {number} valor - Valor actual
 * @param {number} total - Valor total
 * @returns {number} Porcentaje calculado
 */
export const calcularPorcentaje = (valor, total) => {
  if (total === 0) return 0;
  return Math.round((valor / total) * 100);
};

export default {
  validarYParsearId,
  validarArchivoPDF,
  validarDatosQuiz,
  validarRespuestasQuiz,
  validarDatosUsuario,
  formatearTamanoArchivo,
  formatearFecha,
  obtenerMensajeError,
  limpiarDatos,
  snakeToCamel,
  camelToSnake,
  generarIdUnico,
  validarPuntaje,
  calcularPorcentaje
};
