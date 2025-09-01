/**
 * Servicio HTTP para manejar las llamadas a la API
 */

import { API_BASE_URL, DEFAULT_HEADERS, API_CONFIG } from '../config/api.config';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  requiresAuth?: boolean;
  timeout?: number;
}

class HttpService {
  private baseURL: string;

  constructor() {
    this.baseURL = API_BASE_URL;
  }

  /**
   * Realiza una petición HTTP
   */
  async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const {
      method = 'GET',
      headers = {},
      body,
      requiresAuth = false,
      timeout = API_CONFIG.TIMEOUT
    } = options;

    console.log('🚀 Iniciando petición HTTP:', { endpoint, method, requiresAuth });

    try {
      // Configurar headers
      const requestHeaders = {
        ...DEFAULT_HEADERS,
        ...headers
      };

      console.log('📋 Headers configurados:', requestHeaders);

      // Agregar token de autenticación si es requerido
      if (requiresAuth) {
        const token = await AsyncStorage.getItem('auth_token');
        console.log('🔑 Token obtenido:', token ? 'Token presente' : 'No hay token');
        if (token) {
          (requestHeaders as Record<string, string>)['Authorization'] = `Bearer ${token}`;
        }
      }

      // Configurar timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      // Realizar petición
      const url = `${this.baseURL}${endpoint}`;
      const requestBody = body ? JSON.stringify(body) : undefined;
      
      // Log detallado de la petición
      console.log('🌐 HTTP Request:', {
        method,
        url,
        headers: requestHeaders,
        body: requestBody
      });
      console.log('📤 Raw Request Details:', {
        fullURL: url,
        bodyString: requestBody,
        headersCount: Object.keys(requestHeaders).length
      });
      
      const response = await fetch(url, {
        method,
        headers: requestHeaders,
        body: requestBody,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Verificar respuesta
      if (!response.ok) {
        const errorText = await response.text();
        const responseHeaders = {};
        response.headers.forEach((value, key) => {
          (responseHeaders as any)[key] = value;
        });
        
        console.log('❌ HTTP Error Details:', {
          status: response.status,
          statusText: response.statusText,
          url: response.url,
          responseHeaders,
          errorBody: errorText,
          requestMethod: method,
          requestHeaders: requestHeaders,
          requestBody: requestBody
        });
        
        // Logs adicionales para Trae IDE
        console.error('🚨 ERROR 403 - DETALLES COMPLETOS:');
        console.error('URL:', response.url);
        console.error('Status:', response.status);
        console.error('Request Headers:', JSON.stringify(requestHeaders, null, 2));
        console.error('Request Body:', requestBody);
        console.error('Response Headers:', JSON.stringify(responseHeaders, null, 2));
        console.error('Response Body:', errorText);
        console.warn('🔍 COMPARAR CON POSTMAN - Headers que podrían faltar:');
        console.warn('- Cookies de sesión');
        console.warn('- X-WP-Nonce');
        console.warn('- Referer header');
        console.warn('- Authorization header específico de WordPress');
        
        // Recrear response para handleErrorResponse
        const errorResponse = new Response(errorText, {
          status: response.status,
          statusText: response.statusText,
          headers: response.headers
        });
        
        await this.handleErrorResponse(errorResponse);
      }

      // Parsear respuesta
      const data = await response.json();
      
      // Log de la respuesta
      console.log('📥 HTTP Response:', {
        status: response.status,
        statusText: response.statusText,
        url: response.url,
        data
      });
      
      return data as T;

    } catch (error) {
      console.log('❌ Error en petición HTTP:', {
        endpoint,
        method,
        error: error instanceof Error ? error.message : 'Error desconocido',
        stack: error instanceof Error ? error.stack : undefined
      });
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('Tiempo de espera agotado. Verifica tu conexión a internet.');
        }
        throw error;
      }
      throw new Error('Error desconocido en la petición');
    }
  }

  private async handleErrorResponse(response: Response): Promise<never> {
    let errorMessage = `Error ${response.status}: ${response.statusText}`;
    let fullErrorData = '';
    
    try {
      const errorData = await response.text();
      fullErrorData = errorData;
      if (errorData) {
        const parsed = JSON.parse(errorData);
        errorMessage = parsed.message || parsed.error || errorData;
      }
    } catch {
      // Si no se puede parsear el JSON, usar el texto completo
      errorMessage = fullErrorData || errorMessage;
    }

    switch (response.status) {
      case 400:
        throw new Error(errorMessage || 'Datos inválidos');
      case 401:
        throw new Error('Credenciales inválidas');
      case 403:
        throw new Error(`ERROR 403 - ${errorMessage}. Respuesta completa del servidor: ${fullErrorData}`);
      case 404:
        throw new Error('Recurso no encontrado');
      case 422:
        throw new Error(errorMessage || 'Datos de entrada inválidos');
      case 500:
        throw new Error('Error interno del servidor');
      case 503:
        throw new Error('Servicio no disponible temporalmente');
      default:
        throw new Error(errorMessage);
    }
  }

  /**
   * Métodos de conveniencia
   */
  async get<T>(endpoint: string, requiresAuth = false): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET', requiresAuth });
  }

  async post<T>(endpoint: string, body?: any, requiresAuth = false): Promise<T> {
    return this.request<T>(endpoint, { method: 'POST', body, requiresAuth });
  }

  async put<T>(endpoint: string, body?: any, requiresAuth = false): Promise<T> {
    return this.request<T>(endpoint, { method: 'PUT', body, requiresAuth });
  }

  async delete<T>(endpoint: string, requiresAuth = false): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE', requiresAuth });
  }
}

export const httpService = new HttpService();