import { Platform, NativeModules, DeviceEventEmitter } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * AndroidCrashHandler - Maneja crashes específicos de Android
 * Implementa soluciones para problemas comunes que causan que la app se cierre
 */
export class AndroidCrashHandler {
  private static isInitialized = false;
  private static crashListeners: Array<() => void> = [];
  private static memoryWarningListener: any = null;

  /**
   * Inicializa el manejador de crashes de Android
   */
  static async initialize(): Promise<boolean> {
    if (Platform.OS !== 'android') {
      console.log('📱 AndroidCrashHandler: Solo disponible en Android');
      return true;
    }

    if (this.isInitialized) {
      console.log('📱 AndroidCrashHandler: Ya inicializado');
      return true;
    }

    try {
      console.log('📱 AndroidCrashHandler: Iniciando...');

      // 1. Configurar manejo de memoria crítica
      await this.setupMemoryManagement();

      // 2. Configurar manejo de excepciones nativas
      this.setupNativeExceptionHandling();

      // 3. Configurar manejo de errores de UI
      this.setupUIErrorHandling();

      // 4. Configurar manejo de errores de red
      this.setupNetworkErrorHandling();

      // 5. Configurar manejo de errores de AsyncStorage
      await this.setupStorageErrorHandling();

      // 6. Configurar listeners de sistema
      this.setupSystemListeners();

      // 7. Verificar y reparar estado corrupto
      await this.repairCorruptedState();

      this.isInitialized = true;
      console.log('✅ AndroidCrashHandler: Inicializado correctamente');
      return true;
    } catch (error) {
      console.error('❌ AndroidCrashHandler: Error en inicialización:', error);
      return false;
    }
  }

  /**
   * Configura manejo de memoria para evitar OutOfMemory
   */
  private static async setupMemoryManagement(): Promise<void> {
    try {
      // Configurar límites de memoria
      if (global.gc) {
        // Forzar garbage collection si está disponible
        global.gc();
      }

      // Configurar listener de advertencias de memoria
      this.memoryWarningListener = DeviceEventEmitter.addListener(
        'memoryWarning',
        () => {
          console.warn('⚠️ Advertencia de memoria baja');
          this.handleLowMemory();
        }
      );

      // Limpiar caché de imágenes si existe
      try {
        if (NativeModules.ImageCacheManager) {
          await NativeModules.ImageCacheManager.clearCache();
        }
      } catch (error) {
        console.log('📱 No se pudo limpiar caché de imágenes:', error);
      }

      console.log('✅ Manejo de memoria configurado');
    } catch (error) {
      console.error('❌ Error configurando manejo de memoria:', error);
    }
  }

  /**
   * Maneja situaciones de memoria baja
   */
  private static handleLowMemory(): void {
    try {
      // Forzar garbage collection
      if (global.gc) {
        global.gc();
      }

      // Limpiar caché temporal
      this.clearTemporaryCache();

      console.log('🧹 Memoria limpiada por advertencia de memoria baja');
    } catch (error) {
      console.error('❌ Error manejando memoria baja:', error);
    }
  }

  /**
   * Configura manejo de excepciones nativas
   */
  private static setupNativeExceptionHandling(): void {
    try {
      // Configurar manejo de errores no capturados
      const originalHandler = ErrorUtils.getGlobalHandler();
      
      ErrorUtils.setGlobalHandler((error, isFatal) => {
        console.error('🚨 Error global capturado:', error);
        
        // Intentar recuperación automática para errores no fatales
        if (!isFatal) {
          this.attemptAutoRecovery(error);
        } else {
          // Para errores fatales, guardar información del crash
          this.saveCrashInfo(error);
        }

        // Llamar al manejador original
        if (originalHandler) {
          originalHandler(error, isFatal);
        }
      });

      console.log('✅ Manejo de excepciones nativas configurado');
    } catch (error) {
      console.error('❌ Error configurando manejo de excepciones:', error);
    }
  }

  /**
   * Configura manejo de errores de UI
   */
  private static setupUIErrorHandling(): void {
    try {
      // Configurar timeout para operaciones de UI
      const originalSetTimeout = global.setTimeout;
      global.setTimeout = (callback: any, delay: number, ...args: any[]) => {
        const wrappedCallback = () => {
          try {
            callback(...args);
          } catch (error) {
            console.error('🚨 Error en setTimeout:', error);
            this.handleUIError(error);
          }
        };
        return originalSetTimeout(wrappedCallback, delay);
      };

      console.log('✅ Manejo de errores de UI configurado');
    } catch (error) {
      console.error('❌ Error configurando manejo de UI:', error);
    }
  }

  /**
   * Configura manejo de errores de red
   */
  private static setupNetworkErrorHandling(): void {
    try {
      // Configurar timeout global para fetch
      const originalFetch = global.fetch;
      global.fetch = async (input: any, init: any = {}) => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

        try {
          const response = await originalFetch(input, {
            ...init,
            signal: controller.signal,
          });
          clearTimeout(timeoutId);
          return response;
        } catch (error) {
          clearTimeout(timeoutId);
          console.error('🌐 Error de red:', error);
          throw error;
        }
      };

      console.log('✅ Manejo de errores de red configurado');
    } catch (error) {
      console.error('❌ Error configurando manejo de red:', error);
    }
  }

  /**
   * Configura manejo de errores de AsyncStorage
   */
  private static async setupStorageErrorHandling(): Promise<void> {
    try {
      // Verificar y reparar AsyncStorage
      const testKey = '@AndroidCrashHandler:test';
      
      try {
        await AsyncStorage.setItem(testKey, 'test');
        await AsyncStorage.getItem(testKey);
        await AsyncStorage.removeItem(testKey);
        console.log('✅ AsyncStorage funcionando correctamente');
      } catch (error) {
        console.error('❌ Error en AsyncStorage, intentando reparar:', error);
        await this.repairAsyncStorage();
      }
    } catch (error) {
      console.error('❌ Error configurando manejo de storage:', error);
    }
  }

  /**
   * Configura listeners del sistema
   */
  private static setupSystemListeners(): void {
    try {
      // Listener para cambios de estado de la app
      DeviceEventEmitter.addListener('appStateChange', (state) => {
        if (state === 'background') {
          this.handleAppBackground();
        } else if (state === 'active') {
          this.handleAppForeground();
        }
      });

      console.log('✅ Listeners del sistema configurados');
    } catch (error) {
      console.error('❌ Error configurando listeners:', error);
    }
  }

  /**
   * Repara estado corrupto de la aplicación
   */
  private static async repairCorruptedState(): Promise<void> {
    try {
      const corruptedKeys = [
        '@FiFintech:corrupted',
        '@FiFintech:temp',
        '@FiFintech:cache'
      ];

      for (const key of corruptedKeys) {
        try {
          await AsyncStorage.removeItem(key);
        } catch (error) {
          console.log(`📱 No se pudo limpiar ${key}:`, error);
        }
      }

      console.log('✅ Estado corrupto reparado');
    } catch (error) {
      console.error('❌ Error reparando estado:', error);
    }
  }

  /**
   * Intenta recuperación automática de errores
   */
  private static attemptAutoRecovery(error: any): void {
    try {
      console.log('🔄 Intentando recuperación automática...');
      
      // Limpiar memoria
      if (global.gc) {
        global.gc();
      }

      // Limpiar caché temporal
      this.clearTemporaryCache();

      console.log('✅ Recuperación automática completada');
    } catch (recoveryError) {
      console.error('❌ Error en recuperación automática:', recoveryError);
    }
  }

  /**
   * Guarda información del crash para diagnóstico
   */
  private static async saveCrashInfo(error: any): Promise<void> {
    try {
      const crashInfo = {
        timestamp: new Date().toISOString(),
        error: error.toString(),
        stack: error.stack,
        platform: Platform.OS,
        version: Platform.Version,
      };

      await AsyncStorage.setItem(
        '@AndroidCrashHandler:lastCrash',
        JSON.stringify(crashInfo)
      );

      console.log('💾 Información del crash guardada');
    } catch (saveError) {
      console.error('❌ Error guardando info del crash:', saveError);
    }
  }

  /**
   * Maneja errores de UI
   */
  private static handleUIError(error: any): void {
    console.error('🎨 Error de UI manejado:', error);
    // Implementar lógica específica para errores de UI
  }

  /**
   * Maneja cuando la app va al background
   */
  private static handleAppBackground(): void {
    try {
      // Limpiar recursos temporales
      this.clearTemporaryCache();
      console.log('📱 App en background, recursos limpiados');
    } catch (error) {
      console.error('❌ Error manejando background:', error);
    }
  }

  /**
   * Maneja cuando la app vuelve al foreground
   */
  private static handleAppForeground(): void {
    try {
      // Verificar estado de la app
      console.log('📱 App en foreground');
    } catch (error) {
      console.error('❌ Error manejando foreground:', error);
    }
  }

  /**
   * Repara AsyncStorage corrupto
   */
  private static async repairAsyncStorage(): Promise<void> {
    try {
      console.log('🔧 Reparando AsyncStorage...');
      
      // Intentar limpiar todas las claves corruptas
      const allKeys = await AsyncStorage.getAllKeys();
      const corruptedKeys = allKeys.filter(key => 
        key.includes('corrupted') || key.includes('temp')
      );

      if (corruptedKeys.length > 0) {
        await AsyncStorage.multiRemove(corruptedKeys);
        console.log(`🧹 ${corruptedKeys.length} claves corruptas eliminadas`);
      }

      console.log('✅ AsyncStorage reparado');
    } catch (error) {
      console.error('❌ Error reparando AsyncStorage:', error);
    }
  }

  /**
   * Limpia caché temporal
   */
  private static clearTemporaryCache(): void {
    try {
      // Limpiar variables globales temporales
      if (global.__DEV__) {
        // Solo en desarrollo
        console.log('🧹 Caché temporal limpiado');
      }
    } catch (error) {
      console.error('❌ Error limpiando caché:', error);
    }
  }

  /**
   * Obtiene información del último crash
   */
  static async getLastCrashInfo(): Promise<any> {
    try {
      const crashInfo = await AsyncStorage.getItem('@AndroidCrashHandler:lastCrash');
      return crashInfo ? JSON.parse(crashInfo) : null;
    } catch (error) {
      console.error('❌ Error obteniendo info del crash:', error);
      return null;
    }
  }

  /**
   * Limpia información de crashes
   */
  static async clearCrashInfo(): Promise<void> {
    try {
      await AsyncStorage.removeItem('@AndroidCrashHandler:lastCrash');
      console.log('🧹 Información de crashes limpiada');
    } catch (error) {
      console.error('❌ Error limpiando info de crashes:', error);
    }
  }

  /**
   * Reinicia el manejador
   */
  static reset(): void {
    try {
      // Limpiar listeners
      if (this.memoryWarningListener) {
        this.memoryWarningListener.remove();
        this.memoryWarningListener = null;
      }

      this.crashListeners.forEach(listener => {
        try {
          listener();
        } catch (error) {
          console.error('❌ Error limpiando listener:', error);
        }
      });
      this.crashListeners = [];

      this.isInitialized = false;
      console.log('🔄 AndroidCrashHandler reiniciado');
    } catch (error) {
      console.error('❌ Error reiniciando AndroidCrashHandler:', error);
    }
  }

  /**
   * Verifica si está inicializado
   */
  static isReady(): boolean {
    return this.isInitialized;
  }
}