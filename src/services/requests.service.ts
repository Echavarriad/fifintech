/**
 * Servicio para manejar las solicitudes
 */

import { REQUEST_ENDPOINTS, API_BASE_URL } from '../config/api.config';
import { httpService } from './http.service';

// Endpoints adicionales para pagos mensuales
const GET_PAGOS_MENSUALES = 'pago-mensual';
const GET_USER_PAGOS_MENSUALES = 'pago-mensual';

// Endpoints para abonos a capital
const GET_ABONOS_CAPITAL = 'abono-a-capital';
const GET_USER_ABONOS_CAPITAL = 'abono-a-capital';

// Interfaz para las solicitudes
export interface Solicitud {
  ID: string;
  post_date: string;
  post_date_gmt: string;
  post_content: string;
  post_title: string;
  post_excerpt: string;
  post_status: string;
  comment_status: string;
  ping_status: string;
  post_password: string;
  post_name: string;
  to_ping: string;
  pinged: string;
  post_modified: string;
  post_modified_gmt: string;
  post_content_filtered: string;
  post_parent: string;
  guid: string;
  menu_order: string;
  post_type: string;
  post_mime_type: string;
  comment_count: string;
  author_id: string;
  author_name: string;
  meta: {
    _edit_last?: string;
    _edit_lock?: string;
    _plazo_en_meses?: string;
    foto_usuario?: string;
    _foto_usuario?: string;
    tasa_mensual?: string;
    _tasa_mensual?: string;
    _destino_o_descripcion_del_prestamo?: string;
    destino_o_descripcion_del_prestamo?: string;
    _titulo_personalizado?: string;
    admin_form_source?: string;
    titulo_personalizado?: string;
    _monto_solicitado?: string;
    plazo_en_meses?: string;
    monto_solicitado?: string;
    _wpuf_form_id?: string;
    _wpuf_lock_editing_post?: string;
    desembolsado?: string;
    _desembolsado?: string;
    wpr_secondary_image_id?: string;
    fea_limit_visibilty?: string;
    _yoast_wpseo_content_score?: string;
    _yoast_wpseo_estimated_reading_time_minutes?: string;
    [key: string]: any;
  };
  // Campos adicionales para compatibilidad con código existente
  id?: string | number;
  usuarioId?: string | number;
  titulo?: string;
  tipo?: string;
  estado?: string;
  clienteNombre?: string;
  monto?: number;
  tiempoPrestamo?: string | number;
  fechaCreacion?: string;
  fechaActualizacion?: string;
  // Campos adicionales de la API mapeada
  prestamo_id?: string;
  prestamo?: {
    ID: number;
    title: string;
    content: string;
    meta: {
      monto_solicitado?: string[];
      _monto_solicitado?: string[];
      plazo_en_meses?: string[];
      _plazo_en_meses?: string[];
      destino_o_descripcion_del_prestamo?: string[];
      _destino_o_descripcion_del_prestamo?: string[];
      foto_usuario?: string[];
      _foto_usuario?: string[];
      tasa_mensual?: string[];
      _tasa_mensual?: string[];
      [key: string]: any;
    };
  };
}

// Respuesta de la API para solicitudes
export interface SolicitudesResponse {
  data: Solicitud[];
  total?: number;
  pagina?: number;
  totalPaginas?: number;
}

// Interfaz para pagos mensuales
export interface PagoMensual {
  ID: string;
  post_author: string;
  post_date: string;
  post_date_gmt: string;
  post_content: string;
  post_title: string;
  post_excerpt: string;
  post_status: string;
  comment_status: string;
  ping_status: string;
  post_password: string;
  post_name: string;
  to_ping: string;
  pinged: string;
  post_modified: string;
  post_modified_gmt: string;
  post_content_filtered: string;
  post_parent: string;
  guid: string;
  menu_order: string;
  post_type: string;
  post_mime_type: string;
  comment_count: string;
  meta: {
    _wpuf_lock_editing_post?: string;
    numero_cuota?: string;
    _numero_cuota?: string;
    _edit_lock?: string;
    _wp_old_date?: string;
    _edit_last?: string;
    _wpuf_form_id?: string;
    cuota_pagada?: string;
    _cuota_pagada?: string;
    usuario_solicitante?: string;
    _usuario_solicitante?: string;
    solicitud_relacionada?: string;
    _solicitud_relacionada?: string;
    wpr_secondary_image_id?: string;
    fea_limit_visibilty?: string;
    _yoast_wpseo_content_score?: string;
    _yoast_wpseo_estimated_reading_time_minutes?: string;
    _elementor_page_assets?: string;
  };
  // Campos adicionales para compatibilidad con código existente
  id?: string | number;
  numero_cuota?: number;
  cuota_pagada?: boolean;
  monto_cuota?: number;
  fecha_vencimiento?: string;
  fecha_pago?: string;
  usuario_solicitante?: string;
  solicitud_relacionada?: string;
  estado_pago?: 'pendiente' | 'pagado' | 'vencido';
}

// Interfaz para las postulaciones del prestamista
export interface Postulacion {
  ID: string;
  post_date: string;
  post_date_gmt: string;
  post_content: string;
  post_title: string;
  post_excerpt: string;
  post_status: string;
  comment_status: string;
  ping_status: string;
  post_password: string;
  post_name: string;
  to_ping: string;
  pinged: string;
  post_modified: string;
  post_modified_gmt: string;
  post_content_filtered: string;
  post_parent: string;
  guid: string;
  menu_order: string;
  post_type: string;
  post_mime_type: string;
  comment_count: string;
  author_id: number;
  author_name: string;
  meta: {
    id_prestamo?: string;
    _id_prestamo?: string;
    _edit_lock?: string;
    [key: string]: any;
  };
  // Información del préstamo relacionado
  prestamo?: {
    ID: number;
    title: string;
    content: string;
    meta: {
      monto_solicitado?: string[];
      _monto_solicitado?: string[];
      plazo_en_meses?: string[];
      _plazo_en_meses?: string[];
      destino_o_descripcion_del_prestamo?: string[];
      _destino_o_descripcion_del_prestamo?: string[];
      foto_usuario?: string[];
      _foto_usuario?: string[];
      tasa_mensual?: string[];
      _tasa_mensual?: string[];
      [key: string]: any;
    };
  };
  // Campos calculados para compatibilidad
  solicitud_id?: string;
  prestamista_id?: string;
  monto_ofrecido?: number;
  tasa_interes?: number;
  plazo_meses?: number;
  estado?: 'pendiente' | 'aceptada' | 'rechazada' | 'retirada';
  estado_postulacion?: string; // Campo del API con valores como 'Aceptada', 'Pendiente', 'Rechazada'
  fecha_postulacion?: string;
  comentarios?: string;
  solicitud?: {
    titulo: string;
    monto_solicitado: number;
    autor_nombre: string;
    fecha_solicitud: string;
  };
}

// Respuesta de la API para postulaciones
export interface PostulacionesResponse {
  data: Postulacion[];
  total?: number;
  pagina?: number;
  totalPaginas?: number;
}

// Interfaz para abonos a capital
export interface AbonoCapital {
  ID: string;
  post_author: string;
  post_date: string;
  post_date_gmt: string;
  post_content: string;
  post_title: string;
  post_excerpt: string;
  post_status: string;
  comment_status: string;
  ping_status: string;
  post_password: string;
  post_name: string;
  to_ping: string;
  pinged: string;
  post_modified: string;
  post_modified_gmt: string;
  post_content_filtered: string;
  post_parent: string;
  guid: string;
  menu_order: string;
  post_type: string;
  post_mime_type: string;
  comment_count: string;
  meta: {
    _edit_lock?: string;
    [key: string]: any;
  };
  // Campos adicionales para compatibilidad con código existente
  id?: string | number;
  monto_abono?: number;
  fecha_abono?: string;
  usuario_solicitante?: string;
  solicitud_relacionada?: string;
  estado_abono?: 'pendiente' | 'aplicado' | 'rechazado';
}

// Respuesta de la API para pagos mensuales
export interface PagosMensualesResponse {
  data: PagoMensual[];
  total?: number;
  pagina?: number;
  totalPaginas?: number;
}

// Respuesta de la API para abonos a capital
export interface AbonosCapitalResponse {
  data: AbonoCapital[];
  total?: number;
  pagina?: number;
  totalPaginas?: number;
}

/**
 * Servicio de solicitudes
 * Proporciona métodos para gestionar las solicitudes
 */
class RequestsService {
  /**
   * Obtiene todas las solicitudes activas de la plataforma
   * @returns Promesa con las solicitudes activas
   */
  async getActiveSolicitudes(): Promise<Solicitud[]> {
    try {
      console.log('🔄 Obteniendo solicitudes activas...');
      console.log('📡 Endpoint consultado:', REQUEST_ENDPOINTS.GET_ACTIVE_REQUESTS);
      
      const response = await httpService.get<SolicitudesResponse>(
        REQUEST_ENDPOINTS.GET_ACTIVE_REQUESTS,
        true // Requiere autenticación
      );
      
      console.log('📥 Respuesta completa del servidor:', JSON.stringify(response, null, 2));
      console.log('✅ Solicitudes activas obtenidas:', response.data?.length || 0);
      
      // Mapear los datos de la API a los campos esperados por el componente
      const solicitudesMapeadas = (response.data || []).map(solicitud => ({
        ...solicitud,
        // Mapeo de campos para compatibilidad con el componente
        id: solicitud.ID,
        usuarioId: solicitud.author_id,
        clienteNombre: solicitud.author_name,
        titulo: solicitud.post_title, // Título de la solicitud para identificación
        tipo: solicitud.post_type || 'solicitud-prestamo',
        estado: solicitud.post_status,
        monto: solicitud.meta?.monto_solicitado ? parseFloat(solicitud.meta.monto_solicitado) : 
               solicitud.meta?._monto_solicitado ? parseFloat(solicitud.meta._monto_solicitado) : 0,
        tiempoPrestamo: solicitud.meta?.plazo_en_meses || solicitud.meta?._plazo_en_meses || '',
        plazo: solicitud.meta?.plazo_en_meses || solicitud.meta?._plazo_en_meses || '',
        destino_o_descripcion_del_prestamo: solicitud.meta?.destino_o_descripcion_del_prestamo || solicitud.meta?._destino_o_descripcion_del_prestamo || '',
        desembolsado: solicitud.meta?.desembolsado || solicitud.meta?._desembolsado || '',
        fechaCreacion: solicitud.post_date,
        fechaActualizacion: solicitud.post_modified
      }));
      
      console.log('🔄 Solicitudes mapeadas:', solicitudesMapeadas.length);
      console.log('📋 Primera solicitud mapeada:', solicitudesMapeadas[0]);
      
      return solicitudesMapeadas;
    } catch (error) {
      console.error('❌ Error al obtener solicitudes activas:', error);
      console.error('🔍 Detalles del error:', JSON.stringify(error, null, 2));
      throw new Error('No se pudieron cargar las solicitudes activas');
    }
  }

  /**
   * Obtiene las solicitudes de un usuario específico
   * @param userId ID del usuario (requerido por el API)
   * @returns Promesa con las solicitudes del usuario
   */
  async getUserSolicitudes(userId: number): Promise<Solicitud[]> {
    try {
      console.log('🔄 Obteniendo solicitudes del usuario:', userId);
      
      // Construir la URL con el parámetro author_id requerido
      const endpoint = `${REQUEST_ENDPOINTS.GET_SOLICITANTE_SOLICITUDES}?author_id=${userId}`;
      
      console.log('📡 Endpoint consultado:', endpoint);
      
      const response = await httpService.get<SolicitudesResponse>(
        endpoint,
        true // Requiere autenticación
      );
      
      console.log('📥 Respuesta completa del servidor:', JSON.stringify(response, null, 2));
      console.log('✅ Solicitudes del usuario obtenidas:', response.data?.length || 0);
      
      return response.data || [];
    } catch (error) {
      console.error('❌ Error al obtener solicitudes del usuario:', error);
      console.error('🔍 Detalles del error:', JSON.stringify(error, null, 2));
      throw new Error('No se pudieron cargar las solicitudes del usuario');
    }
  }

  /**
   * Obtiene las postulaciones del prestamista actual
   * @param authorId ID del autor/prestamista (requerido por el API)
   * @returns Promesa con las postulaciones del prestamista
   */
  async getPrestamistaPostulaciones(authorId: number): Promise<Postulacion[]> {
    try {
      console.log('🔄 Obteniendo postulaciones del prestamista...');
      console.log('👤 ID del autor:', authorId);
      
      // Construir la URL con el parámetro author_id requerido
      const endpoint = `${REQUEST_ENDPOINTS.GET_PRESTAMISTA_POSTULACIONES}?author_id=${authorId}`;
      
      console.log('📡 Endpoint consultado:', endpoint);
      
      const response = await httpService.get<PostulacionesResponse>(
        endpoint,
        true // Requiere autenticación
      );
      
      console.log('✅ Postulaciones obtenidas:', response.data?.length || 0);
      console.log('📊 Respuesta completa del servidor:', response);
      
      return response.data || [];
    } catch (error) {
      console.error('❌ Error al obtener postulaciones del prestamista:', error);
      // En caso de error, retornar array vacío
      return [];
    }
  }

  /**
   * Obtiene todas las postulaciones para administradores
   * @returns Promesa con todas las postulaciones
   */
  async getAllPostulaciones(): Promise<Postulacion[]> {
    try {
      console.log('🔍 Obteniendo todas las postulaciones para admin');
      console.log('📡 Endpoint:', REQUEST_ENDPOINTS.GET_ALL_POSTULACIONES);
      
      const response = await httpService.get<any>(
        REQUEST_ENDPOINTS.GET_ALL_POSTULACIONES,
        true // Requiere autenticación
      );
      
      console.log('📥 Respuesta completa del API:', JSON.stringify(response, null, 2));
      console.log('📊 Tipo de respuesta:', typeof response);
      console.log('📊 Es array la respuesta?:', Array.isArray(response));
      
      let postulaciones: any[] = [];
      
      // Verificar si la respuesta es directamente un array
      if (Array.isArray(response)) {
        console.log('✅ Respuesta es array directo, cantidad:', response.length);
        postulaciones = response;
      }
      // Verificar si la respuesta tiene la propiedad data
      else if (response && response.data && Array.isArray(response.data)) {
        console.log('✅ Respuesta tiene propiedad data, cantidad:', response.data.length);
        postulaciones = response.data;
      }
      // Verificar si la respuesta es un objeto con las postulaciones directamente
      else if (response && typeof response === 'object') {
        const keys = Object.keys(response);
        console.log('🔍 Claves de la respuesta:', keys);
        
        // Buscar arrays en las propiedades del objeto
        for (const key of keys) {
          if (Array.isArray(response[key])) {
            console.log(`✅ Encontrado array en propiedad '${key}', cantidad:`, response[key].length);
            postulaciones = response[key];
            break;
          }
        }
      }
      
      // Debug detallado de cada postulación para verificar estructura de ID
      console.log('🔍 DEBUG - Analizando estructura de postulaciones:');
      postulaciones.forEach((postulacion, index) => {
        console.log(`📋 Postulación ${index + 1}:`);
        console.log('  - ID:', postulacion.ID);
        console.log('  - Tipo de ID:', typeof postulacion.ID);
        console.log('  - id (minúscula):', postulacion.id);
        console.log('  - Tipo de id:', typeof postulacion.id);
        console.log('  - post_title:', postulacion.post_title);
        console.log('  - author_name:', postulacion.author_name);
        console.log('  - Todas las propiedades:', Object.keys(postulacion));
      });
      
      if (postulaciones.length === 0) {
        console.warn('⚠️ No se encontraron postulaciones o respuesta inesperada:', response);
      }
      
      return postulaciones as Postulacion[];
      
    } catch (error) {
      console.error('❌ Error al obtener todas las postulaciones:', error);
      console.error('🔍 Detalles del error:', JSON.stringify(error, null, 2));
      return []; // Devolver array vacío en lugar de lanzar error
    }
  }

  /**
   * Crea una nueva postulación
   * @param postulacionData Datos de la postulación
   * @returns Promesa con la postulación creada
   */
  async createPostulacion(postulacionData: { id_prestamo: number; author_id: number }): Promise<any> {
    try {
      console.log('🔄 Creando nueva postulación...');
      console.log('📤 Datos enviados:', JSON.stringify(postulacionData, null, 2));
      
      const response = await httpService.post<any>(
        REQUEST_ENDPOINTS.CREATE_POSTULACION,
        postulacionData,
        true // Requiere autenticación
      );
      
      console.log('✅ Postulación creada exitosamente:', response);
      return response;
    } catch (error) {
      console.error('❌ Error al crear postulación:', error);
      
      // Proporcionar mensajes de error más específicos
      if (error instanceof Error) {
        if (error.message.includes('403')) {
          throw new Error('No tienes permisos para postularte. Verifica que estés autenticado.');
        } else if (error.message.includes('404')) {
          throw new Error('El servicio de postulaciones no está disponible temporalmente.');
        } else if (error.message.includes('500')) {
          throw new Error('Error interno del servidor. Intenta nuevamente en unos minutos.');
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
          throw new Error('Error de conexión. Verifica tu conexión a internet.');
        }
        throw error;
      }
      
      throw new Error('No se pudo enviar la postulación. Intenta nuevamente.');
    }
  }

  /**
   * Actualiza el estado de una postulación
   * @param postulacionId ID de la postulación
   * @param nuevoEstado Nuevo estado de la postulación
   * @returns Promesa con la postulación actualizada
   */
  async updateEstadoPostulacion(postulacionId: string, nuevoEstado: string): Promise<any> {
    try {
      console.log('🔄 Actualizando estado de postulación...');
      console.log('📤 ID:', postulacionId, 'Nuevo estado:', nuevoEstado);
      
      // Verificar si postulacionId es válido
      if (!postulacionId || postulacionId === 'null' || postulacionId === 'undefined') {
        throw new Error('ID de postulación inválido o faltante');
      }
      
      const parsedId = parseInt(postulacionId);
      console.log('🔍 DEBUG - postulacionId recibido:', postulacionId);
      console.log('🔍 DEBUG - Tipo de postulacionId:', typeof postulacionId);
      console.log('🔍 DEBUG - parseInt result:', parsedId);
      console.log('🔍 DEBUG - isNaN(parsedId):', isNaN(parsedId));
      console.log('🔍 DEBUG - nuevoEstado:', nuevoEstado);
      
      if (isNaN(parsedId)) {
        throw new Error(`No se pudo convertir el ID '${postulacionId}' a número`);
      }
      
      const postulacionData = {
        id: parsedId,
        estado_postulacion: nuevoEstado
      };
      
      console.log('📤 Datos enviados:', JSON.stringify(postulacionData, null, 2));
      console.log('🔍 DEBUG - URL completa:', `${API_BASE_URL}${REQUEST_ENDPOINTS.UPDATE_POSTULACION_ESTADO}`);
      
      const response = await httpService.post<any>(
        REQUEST_ENDPOINTS.UPDATE_POSTULACION_ESTADO,
        postulacionData,
        true // Requiere autenticación
      );
      
      console.log('✅ Estado de postulación actualizado exitosamente:', response);
      return response;
    } catch (error) {
      console.error('❌ Error al actualizar estado de postulación:', error);
      
      // Proporcionar mensajes de error más específicos
      if (error instanceof Error) {
        if (error.message.includes('403')) {
          throw new Error('No tienes permisos para actualizar esta postulación.');
        } else if (error.message.includes('404')) {
          throw new Error('La postulación no fue encontrada.');
        } else if (error.message.includes('500')) {
          throw new Error('Error interno del servidor. Intenta nuevamente en unos minutos.');
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
          throw new Error('Error de conexión. Verifica tu conexión a internet.');
        }
        throw error;
      }
      
      throw new Error('No se pudo actualizar el estado de la postulación. Intenta nuevamente.');
    }
  }

  /**
   * Crea una nueva solicitud
   * @param solicitudData Datos de la solicitud
   * @returns Promesa con la solicitud creada
   */
  async createSolicitud(solicitudData: Partial<Solicitud>): Promise<Solicitud> {
    try {
      console.log('🔄 Creando nueva solicitud...');
      console.log('📤 Datos enviados:', JSON.stringify(solicitudData, null, 2));
      
      const response = await httpService.post<Solicitud>(
        REQUEST_ENDPOINTS.CREATE_REQUEST,
        solicitudData,
        true // Requiere autenticación
      );
      
      console.log('✅ Solicitud creada exitosamente:', response);
      return response;
    } catch (error) {
      console.error('❌ Error al crear solicitud:', error);
      
      // Proporcionar mensajes de error más específicos
      if (error instanceof Error) {
        if (error.message.includes('403')) {
          throw new Error('No tienes permisos para crear solicitudes. Verifica que estés autenticado.');
        } else if (error.message.includes('404')) {
          throw new Error('El servicio de solicitudes no está disponible temporalmente.');
        } else if (error.message.includes('500')) {
          throw new Error('Error interno del servidor. Intenta nuevamente en unos minutos.');
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
          throw new Error('Error de conexión. Verifica tu conexión a internet.');
        }
        throw error;
      }
      
      throw new Error('No se pudo crear la solicitud. Intenta nuevamente.');
    }
  }

  /**
   * Actualiza una solicitud existente
   * @param solicitudId ID de la solicitud
   * @param solicitudData Datos actualizados
   * @returns Promesa con la solicitud actualizada
   */
  async updateSolicitud(solicitudId: number, solicitudData: Partial<Solicitud>): Promise<Solicitud> {
    try {
      console.log('🔄 Actualizando solicitud:', solicitudId);
      
      // Incluir el ID y la acción en el cuerpo de la petición
      const dataWithId = {
        ...solicitudData,
        id: solicitudId,
        action: 'update' // Indicar que es una actualización
      };
      
      console.log('📤 Datos enviados para actualización:', JSON.stringify(dataWithId, null, 2));
      
      const response = await httpService.post<Solicitud>(
        REQUEST_ENDPOINTS.UPDATE_REQUEST,
        dataWithId,
        true // Requiere autenticación
      );
      
      console.log('✅ Solicitud actualizada exitosamente:', response.id || response.ID);
      return response;
    } catch (error) {
      console.error('❌ Error al actualizar solicitud:', error);
      // Propagar el error original en lugar de crear uno genérico
      throw error;
    }
  }

  /**
   * Obtiene una solicitud específica por ID
   * @param solicitudId ID de la solicitud
   * @returns Promesa con la solicitud encontrada
   */
  async getSolicitudById(solicitudId: string | number): Promise<Solicitud | null> {
    try {
      console.log('🔄 Obteniendo solicitud por ID:', solicitudId);
      
      // Primero intentar obtener todas las solicitudes activas
      const solicitudes = await this.getActiveSolicitudes();
      
      // Buscar la solicitud específica
      const solicitudEncontrada = solicitudes.find(solicitud => 
        solicitud.ID === String(solicitudId) || solicitud.id === solicitudId
      );
      
      if (solicitudEncontrada) {
        console.log('✅ Solicitud encontrada:', solicitudEncontrada.ID);
        return solicitudEncontrada;
      }
      
      console.log('⚠️ Solicitud no encontrada con ID:', solicitudId);
      return null;
    } catch (error) {
      console.error('❌ Error al obtener solicitud por ID:', error);
      throw new Error('No se pudo obtener la solicitud');
    }
  }

  /**
   * Elimina una solicitud
   * @param solicitudId ID de la solicitud
   * @returns Promesa con confirmación de eliminación
   */
  async deleteSolicitud(solicitudId: number): Promise<{ message: string }> {
    try {
      console.log('🔄 Eliminando solicitud:', solicitudId);
      
      const response = await httpService.delete<{ message: string }>(
        `${REQUEST_ENDPOINTS.DELETE_REQUEST}/${solicitudId}`,
        true // Requiere autenticación
      );
      
      console.log('✅ Solicitud eliminada exitosamente');
      return response;
    } catch (error) {
      console.error('❌ Error al eliminar solicitud:', error);
      throw new Error('No se pudo eliminar la solicitud');
    }
  }

  /**
   * Obtiene todos los pagos mensuales
   * @returns Promesa con los pagos mensuales
   */
  async getPagosMensuales(): Promise<PagoMensual[]> {
    try {
      console.log('🔄 Obteniendo pagos mensuales...');
      console.log('📡 Endpoint consultado:', GET_PAGOS_MENSUALES);
      
      const response = await httpService.get<PagosMensualesResponse>(
        GET_PAGOS_MENSUALES,
        true // Requiere autenticación
      );
      
      console.log('📥 Respuesta completa del servidor:', JSON.stringify(response, null, 2));
      console.log('✅ Pagos mensuales obtenidos:', response.data?.length || 0);
      
      return response.data || [];
    } catch (error) {
      console.error('❌ Error al obtener pagos mensuales:', error);
      console.error('🔍 Detalles del error:', JSON.stringify(error, null, 2));
      throw new Error('No se pudieron cargar los pagos mensuales');
    }
  }

  /**
   * Obtiene los pagos mensuales de un usuario específico
   * @param userId ID del usuario
   * @returns Promesa con los pagos mensuales del usuario
   */
  async getUserPagosMensuales(userId: number): Promise<PagoMensual[]> {
    try {
      console.log('🔄 Obteniendo pagos mensuales del usuario:', userId);
      
      // Construir la URL con el parámetro author_id requerido
      const endpoint = `${GET_USER_PAGOS_MENSUALES}?author_id=${userId}`;
      
      console.log('📡 Endpoint consultado:', endpoint);
      
      const response = await httpService.get<PagosMensualesResponse>(
        endpoint,
        true // Requiere autenticación
      );
      
      console.log('📥 Respuesta completa del servidor:', JSON.stringify(response, null, 2));
      console.log('✅ Pagos mensuales del usuario obtenidos:', response.data?.length || 0);
      
      return response.data || [];
    } catch (error) {
      console.error('❌ Error al obtener pagos mensuales del usuario:', error);
      console.error('🔍 Detalles del error:', JSON.stringify(error, null, 2));
      throw new Error('No se pudieron cargar los pagos mensuales del usuario');
    }
  }

  /**
   * Obtiene todos los abonos a capital
   * @returns Promesa con los abonos a capital
   */
  async getAbonosCapital(): Promise<AbonoCapital[]> {
    try {
      console.log('🔄 Obteniendo abonos a capital...');
      console.log('📡 Endpoint consultado:', GET_ABONOS_CAPITAL);
      
      const response = await httpService.get<AbonosCapitalResponse>(
        GET_ABONOS_CAPITAL,
        true // Requiere autenticación
      );
      
      console.log('📥 Respuesta completa del servidor:', JSON.stringify(response, null, 2));
      console.log('✅ Abonos a capital obtenidos:', response.data?.length || 0);
      
      return response.data || [];
    } catch (error) {
      console.error('❌ Error al obtener abonos a capital:', error);
      console.error('🔍 Detalles del error:', JSON.stringify(error, null, 2));
      throw new Error('No se pudieron cargar los abonos a capital');
    }
  }

  /**
   * Obtiene los abonos a capital de un usuario específico
   * @param userId ID del usuario
   * @returns Promesa con los abonos a capital del usuario
   */
  async getUserAbonosCapital(userId: number): Promise<AbonoCapital[]> {
    try {
      console.log('🔄 Obteniendo abonos a capital del usuario:', userId);
      
      // Construir la URL con el parámetro author_id requerido
      const endpoint = `${GET_USER_ABONOS_CAPITAL}?author_id=${userId}`;
      
      console.log('📡 Endpoint consultado:', endpoint);
      
      const response = await httpService.get<AbonosCapitalResponse>(
        endpoint,
        true // Requiere autenticación
      );
      
      console.log('📥 Respuesta completa del servidor:', JSON.stringify(response, null, 2));
      console.log('✅ Abonos a capital del usuario obtenidos:', response.data?.length || 0);
      
      return response.data || [];
    } catch (error) {
      console.error('❌ Error al obtener abonos a capital del usuario:', error);
      console.error('🔍 Detalles del error:', JSON.stringify(error, null, 2));
      throw new Error('No se pudieron cargar los abonos a capital del usuario');
    }
  }
}

// Exportar instancia del servicio
export const requestsService = new RequestsService();
export default RequestsService;