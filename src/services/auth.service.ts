import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  User, 
  LoginCredentials, 
  AuthResponse, 
  RegisterData, 
  RecoverPasswordData,
  ChangePasswordData,
  UserRole
} from '../models/auth.models';
import { AUTH_ENDPOINTS } from '../config/api.config';
import { httpService } from './http.service';

// Constantes para las claves de almacenamiento
const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

/**
 * Servicio de autenticación
 * Proporciona métodos para gestionar la autenticación de usuarios
 */
class AuthService {
  /**
   * Inicia sesión con las credenciales proporcionadas
   * @param credentials Credenciales de inicio de sesión (email y password)
   * @returns Promesa con la respuesta de autenticación
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      // Validar credenciales
      if (!credentials.email || !credentials.password) {
        throw new Error('Email y contraseña son requeridos');
      }
      
      if (credentials.password.length < 6) {
        throw new Error('La contraseña debe tener al menos 6 caracteres');
      }
      
      // Llamada a la API real
      console.log('🔐 Iniciando login para:', credentials.email);
      
      const data = await httpService.post(AUTH_ENDPOINTS.LOGIN, {
        username: credentials.email,
        password: credentials.password,
      });
      
      console.log('📋 Respuesta completa del API:', JSON.stringify(data, null, 2));
      console.log('👤 Datos del usuario:', JSON.stringify(data.user, null, 2));
      console.log('🔍 Username específico del API:', data.user?.username);
      console.log('✅ Login exitoso para usuario:', data.user?.name, 'con roles:', data.user?.roles);
      
      // Mapear la respuesta de la API al formato esperado
      const authResponse: AuthResponse = {
        user: {
          id: data.user?.id || 0,
          email: data.user?.email || credentials.email,
          name: data.user?.name || 'Usuario',
          username: data.user?.username || '',
          roles: data.user?.roles || ['cliente'],
          profilePicture: data.user?.profilePicture,
          phoneNumber: data.user?.phoneNumber,
          lastLogin: new Date()
        },
        token: data.token || `temp_token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        refreshToken: data.refreshToken,
        expiresIn: data.expiresIn || 3600
      };
      
      console.log('🔄 Datos mapeados:', JSON.stringify(authResponse, null, 2));
      
      // No guardar en AsyncStorage automáticamente después del registro
      // El usuario debe iniciar sesión manualmente
      // await this.saveAuthData(authResponse);
      
      return authResponse;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Error en login: ${error.message}`);
      }
      throw new Error('Error desconocido en login');
    }
  }
  
  /**
   * Registra un nuevo usuario
   * @param registerData Datos para el registro
   * @returns Promesa con la respuesta de autenticación
   */
  async register(registerData: RegisterData): Promise<AuthResponse> {
    try {
      // Validar datos
      if (!registerData.email || !registerData.password || !registerData.name) {
        throw new Error('Todos los campos son requeridos');
      }
      
      if (registerData.password.length < 6) {
        throw new Error('La contraseña debe tener al menos 6 caracteres');
      }
      
      // Llamada a la API real
      console.log('📝 Enviando datos de registro:', JSON.stringify(registerData, null, 2));
      
      const data = await httpService.post(AUTH_ENDPOINTS.REGISTER, registerData);
      
      console.log('📋 Respuesta completa del registro:', JSON.stringify(data, null, 2));
      console.log('👤 Datos del usuario en registro:', JSON.stringify(data.user, null, 2));
      console.log('🔍 Estructura de data:', Object.keys(data));
      console.log('🔍 Estructura de data.user:', data.user ? Object.keys(data.user) : 'data.user es undefined');
      
      // Verificar si la respuesta tiene la estructura esperada
      if (!data.user) {
        console.log('⚠️ El servidor no devolvió datos del usuario, creando objeto de usuario desde datos del formulario');
        // Crear objeto de usuario basado en los datos del formulario
        data.user = {
          id: Date.now(), // ID temporal basado en timestamp
          email: registerData.email,
          name: registerData.name,
          lastName: registerData.lastname,
          username: registerData.username,
          phone: registerData.phone,
          role: registerData.role || 'cliente',
          roles: [registerData.role || 'cliente']
        };
        console.log('✅ Objeto de usuario creado:', JSON.stringify(data.user, null, 2));
      }
      
      // Mapear la respuesta de la API al formato esperado
      const authResponse: AuthResponse = {
        user: {
          id: data.user.id || data.user.ID || Date.now(), // Usar timestamp como ID temporal si no viene del servidor
          email: data.user.email || registerData.email,
          name: data.user.name || registerData.name || 'Usuario', // Asegurar que name no esté vacío
          lastName: data.user.lastName || registerData.lastname,
          roles: data.user.roles || [data.user.role] || ['cliente'],
          profilePicture: data.user.profilePicture || data.user.photo,
          phoneNumber: data.user.phoneNumber || data.user.phone || registerData.phone,
          username: data.user.username || registerData.username,
          lastLogin: new Date()
        },
        token: data.token || '',
        refreshToken: data.refreshToken || '',
        expiresIn: data.expiresIn || 3600
      };
      
      console.log('🔄 AuthResponse mapeado:', JSON.stringify(authResponse, null, 2));
      
      // Validar que los datos críticos estén presentes antes de guardar
      if (!authResponse.user.id || !authResponse.user.name) {
        console.error('❌ Error: Datos críticos del usuario faltantes después del mapeo');
        console.error('❌ ID:', authResponse.user.id);
        console.error('❌ Name:', authResponse.user.name);
        throw new Error('Error en el registro: datos del usuario incompletos');
      }
      
      // Guardar en AsyncStorage
      await this.saveAuthData(authResponse);
      
      console.log('✅ Registro completado exitosamente con datos válidos');
      
      return authResponse;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Error en registro: ${error.message}`);
      }
      throw new Error('Error desconocido en registro');
    }
  }
  
  /**
   * Cierra la sesión del usuario actual
   */
  async logout(): Promise<void> {
    try {
      // Intentar notificar al servidor (opcional)
      try {
        await httpService.post(AUTH_ENDPOINTS.LOGOUT, {}, true);
      } catch (error) {
        // Si falla la notificación al servidor, continuar con logout local
        console.warn('No se pudo notificar logout al servidor:', error);
      }
      
      // Eliminar datos de autenticación localmente
      await AsyncStorage.removeItem(TOKEN_KEY);
      await AsyncStorage.removeItem(USER_KEY);
    } catch (error) {
      console.error('Error en logout:', error);
    }
  }
  
  /**
   * Inicia el proceso de recuperación de contraseña
   * @param data Datos para recuperar la contraseña (email)
   * @returns Promesa con un mensaje de éxito
   */
  async recoverPassword(data: RecoverPasswordData): Promise<string> {
    try {
      if (!data.email) {
        throw new Error('El email es requerido');
      }
      
      // Llamada a la API real
      const response = await httpService.post(AUTH_ENDPOINTS.RECOVER_PASSWORD, {
        email: data.email,
      });
      
      return response.message || 'Se ha enviado un correo con instrucciones para restablecer tu contraseña';
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Error en recuperación de contraseña: ${error.message}`);
      }
      throw new Error('Error desconocido en recuperación de contraseña');
    }
  }
  
  /**
   * Cambia la contraseña del usuario actual
   * @param data Datos para cambiar la contraseña
   * @returns Promesa con un mensaje de éxito
   */
  async changePassword(data: ChangePasswordData): Promise<string> {
    try {
      if (!data.oldPassword || !data.newPassword || !data.confirmPassword) {
        throw new Error('Todos los campos son requeridos');
      }
      
      if (data.newPassword !== data.confirmPassword) {
        throw new Error('Las contraseñas no coinciden');
      }
      
      if (data.newPassword.length < 6) {
        throw new Error('La nueva contraseña debe tener al menos 6 caracteres');
      }
      
      // Llamada a la API real (requiere autenticación)
      const response = await httpService.post(AUTH_ENDPOINTS.CHANGE_PASSWORD, {
        oldPassword: data.oldPassword,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword,
      }, true);
      
      return response.message || 'Contraseña actualizada correctamente';
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Error en cambio de contraseña: ${error.message}`);
      }
      throw new Error('Error desconocido en cambio de contraseña');
    }
  }
  
  /**
   * Verifica si hay un usuario autenticado
   * @returns Promesa con la respuesta de autenticación o null si no hay usuario
   */
  async getCurrentAuth(): Promise<AuthResponse | null> {
    try {
      console.log('🔍 getCurrentAuth - Iniciando recuperación de datos de autenticación');
      
      // Obtener token y datos de usuario con manejo de errores individual
      let token: string | null = null;
      let userJson: string | null = null;
      
      try {
        token = await AsyncStorage.getItem(TOKEN_KEY);
        console.log('🔍 getCurrentAuth - Token recuperado:', token ? 'Presente' : 'Ausente');
      } catch (tokenError) {
        console.error('🚨 Error al recuperar token de AsyncStorage:', tokenError);
        return null;
      }
      
      try {
        userJson = await AsyncStorage.getItem(USER_KEY);
        console.log('🔍 getCurrentAuth - UserJson recuperado:', userJson ? 'Presente' : 'Ausente');
        console.log('🔍 getCurrentAuth - UserJson contenido (primeros 100 chars):', userJson?.substring(0, 100));
      } catch (userError) {
        console.error('🚨 Error al recuperar datos de usuario de AsyncStorage:', userError);
        return null;
      }
      
      if (!token || !userJson) {
        console.log('🔍 getCurrentAuth - Faltan datos de autenticación');
        return null;
      }
      
      // Validar que userJson sea un JSON válido antes de parsearlo
      let user: User;
      try {
        if (userJson.trim() === '' || userJson === 'null' || userJson === 'undefined') {
          console.warn('🔍 getCurrentAuth - UserJson está vacío o es inválido');
          return null;
        }
        
        user = JSON.parse(userJson);
        console.log('🔍 getCurrentAuth - Usuario parseado exitosamente:', JSON.stringify(user, null, 2));
        console.log('🔍 getCurrentAuth - Roles del usuario parseado:', user.roles);
        
        // Validar estructura básica del usuario
        if (!user || typeof user !== 'object') {
          console.warn('🔍 getCurrentAuth - Usuario no es un objeto válido:', user);
          return null;
        }
        
        if (!user.id) {
          console.warn('🔍 getCurrentAuth - Usuario sin ID:', {
            id: user.id,
            hasId: 'id' in user,
            idType: typeof user.id,
            userKeys: Object.keys(user)
          });
          return null;
        }
        
        if (!user.name) {
          console.warn('🔍 getCurrentAuth - Usuario sin name:', {
            name: user.name,
            hasName: 'name' in user,
            nameType: typeof user.name,
            userKeys: Object.keys(user)
          });
          return null;
        }
        
      } catch (parseError) {
        console.error('🚨 Error al parsear JSON de usuario:', {
          error: parseError,
          userJson: userJson,
          timestamp: new Date().toISOString()
        });
        
        // Limpiar datos corruptos
        try {
          await AsyncStorage.removeItem(USER_KEY);
          await AsyncStorage.removeItem(TOKEN_KEY);
          console.log('🔍 getCurrentAuth - Datos corruptos limpiados');
        } catch (cleanupError) {
          console.error('🚨 Error al limpiar datos corruptos:', cleanupError);
        }
        
        return null;
      }
      
      return {
        user,
        token
      };
    } catch (error) {
      console.error('🚨 Error general en getCurrentAuth:', {
        error: error,
        message: error instanceof Error ? error.message : 'Error desconocido',
        stack: error instanceof Error ? error.stack : 'No stack available',
        timestamp: new Date().toISOString()
      });
      return null;
    }
  }
  
  /**
   * Guarda los datos de autenticación en AsyncStorage
   * @param authResponse Respuesta de autenticación
   */
  private async saveAuthData(authResponse: AuthResponse): Promise<void> {
    try {
      console.log('💾 Guardando datos de autenticación:', JSON.stringify(authResponse.user, null, 2));
      await AsyncStorage.setItem(TOKEN_KEY, authResponse.token);
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(authResponse.user));
      console.log('✅ Datos guardados exitosamente en AsyncStorage');
    } catch (error) {
      console.error('Error al guardar datos de autenticación:', error);
    }
  }

  /**
   * Limpia completamente los datos de autenticación
   */
  async clearAllAuthData(): Promise<void> {
    try {
      await AsyncStorage.removeItem(TOKEN_KEY);
      await AsyncStorage.removeItem(USER_KEY);
      console.log('🧹 Datos de autenticación limpiados completamente');
    } catch (error) {
      console.error('Error al limpiar datos de autenticación:', error);
    }
  }
}

// Exportar una instancia única del servicio
export const authService = new AuthService();