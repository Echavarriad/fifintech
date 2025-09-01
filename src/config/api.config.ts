/**
 * Configuración de la API
 */

// URL base de la API
export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  "https://fifintech.co/wp-json/custom-api/v1/";

// Endpoints de autenticación
export const AUTH_ENDPOINTS = {
  LOGIN: 'login',
  REGISTER: 'register',
  REFRESH_TOKEN: '/auth/refresh',
  LOGOUT: '/auth/logout',
  RECOVER_PASSWORD: '/auth/recover-password',
  CHANGE_PASSWORD: '/auth/change-password',
};

// Endpoints de solicitudes
export const REQUEST_ENDPOINTS = {
  GET_ACTIVE_REQUESTS: "solicitud-prestamo",
  GET_USER_REQUESTS: "requests/user",
  GET_SOLICITANTE_SOLICITUDES: "mis_solicitudes",
  GET_PRESTAMISTA_POSTULACIONES: "mis-postulaciones",
  GET_ALL_POSTULACIONES: "all-postulacion_prest",
  CREATE_REQUEST: "publicar_solicitud",
  CREATE_POSTULACION: "postulacion",
  UPDATE_REQUEST: "actualizar-solicitud",
  UPDATE_POSTULACION_ESTADO: "actualizar-estado-postulacion",
  DELETE_REQUEST: "requests",
};

// Configuración de timeouts
export const API_CONFIG = {
  TIMEOUT: 10000, // 10 segundos
  RETRY_ATTEMPTS: 3,
};

// Headers por defecto
export const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  'Accept-Encoding': 'gzip, deflate, br',
  'Connection': 'keep-alive',
  'User-Agent': 'PostmanRuntime/7.32.3',
  'X-Requested-With': 'XMLHttpRequest',
  'Cache-Control': 'no-cache',
};