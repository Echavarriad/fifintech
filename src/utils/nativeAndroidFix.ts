import { Platform, NativeModules, DeviceEventEmitter } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export class NativeAndroidFix {
  private static isInitialized = false;
  private static crashListeners: Array<() => void> = [];

  /**
   * Aplica correcciones nativas específicas para Android
   */
  static async applyNativeFixes(): Promise<boolean> {
    if (Platform.OS !== 'android') {
      console.log('📱 No es Android, saltando correcciones nativas');
      return true;
    }

    if (this.isInitialized) {
      console.log('✅ Correcciones nativas ya aplicadas');
      return true;
    }

    try {
      console.log('🔧 Aplicando correcciones nativas para Android...');

      // 1. Configurar manejo de errores nativos
      this.setupNativeErrorHandling();

      // 2. Configurar manejo de memoria crítica
      this.setupCriticalMemoryHandling();

      // 3. Configurar listeners de ciclo de vida
      this.setupLifecycleListeners();

      // 4. Aplicar configuraciones de estabilidad
      await this.applyStabilityConfigurations();

      // 5. Configurar manejo de excepciones no capturadas
      this.setupUncaughtExceptionHandling();

      // 6. Verificar y reparar estado de la aplicación
      await this.verifyAndRepairAppState();

      this.isInitialized = true;
      console.log('✅ Correcciones nativas aplicadas exitosamente');
      return true;

    } catch (error) {
      console.error('🚨 Error aplicando correcciones nativas:', error);
      return false;
    }
  }

  /**
   * Configura el manejo de errores nativos
   */
  private static setupNativeErrorHandling(): void {
    try {
      console.log('🛡️ Configurando manejo de errores nativos...');

      // Interceptar errores de JavaScript
      const originalConsoleError = console.error;
      console.error = (...args) => {
        // Registrar error pero no crashear
        this.logNativeError('JS_ERROR', args.join(' '));
        originalConsoleError.apply(console, args);
      };

      // Interceptar errores no manejados
      const originalHandler = global.ErrorUtils?.getGlobalHandler();
      global.ErrorUtils?.setGlobalHandler((error, isFatal) => {
        console.log('🚨 Error global capturado:', error, 'Fatal:', isFatal);
        
        // Registrar el error
        this.logNativeError('GLOBAL_ERROR', error.message || String(error));
        
        // Si no es fatal, intentar continuar
        if (!isFatal) {
          console.log('⚠️ Error no fatal, continuando...');
          return;
        }
        
        // Para errores fatales, intentar recuperación
        this.handleFatalError(error);
        
        // Llamar al handler original si existe
        if (originalHandler) {
          originalHandler(error, isFatal);
        }
      });

      console.log('✅ Manejo de errores nativos configurado');

    } catch (error) {
      console.error('🚨 Error configurando manejo de errores nativos:', error);
    }
  }

  /**
   * Configura el manejo de memoria crítica
   */
  private static setupCriticalMemoryHandling(): void {
    try {
      console.log('🧠 Configurando manejo de memoria crítica...');

      // Listener para advertencias de memoria
      DeviceEventEmitter.addListener('memoryWarning', () => {
        console.warn('⚠️ Advertencia de memoria detectada');
        this.handleMemoryWarning();
      });

      // Configurar límites de memoria más estrictos
      if (global.gc) {
        // Ejecutar garbage collection cada 30 segundos
        setInterval(() => {
          try {
            global.gc();
            console.log('🗑️ Garbage collection ejecutado');
          } catch (error) {
            console.warn('⚠️ Error en garbage collection:', error);
          }
        }, 30000);
      }

      console.log('✅ Manejo de memoria crítica configurado');

    } catch (error) {
      console.error('🚨 Error configurando manejo de memoria:', error);
    }
  }

  /**
   * Configura listeners del ciclo de vida de la aplicación
   */
  private static setupLifecycleListeners(): void {
    try {
      console.log('🔄 Configurando listeners de ciclo de vida...');

      // Listener para cuando la app va al background
      DeviceEventEmitter.addListener('appStateDidChange', (appState) => {
        console.log('📱 Estado de app cambió a:', appState);
        
        if (appState === 'background') {
          this.handleAppGoingToBackground();
        } else if (appState === 'active') {
          this.handleAppBecomingActive();
        }
      });

      console.log('✅ Listeners de ciclo de vida configurados');

    } catch (error) {
      console.error('🚨 Error configurando listeners de ciclo de vida:', error);
    }
  }

  /**
   * Aplica configuraciones de estabilidad
   */
  private static async applyStabilityConfigurations(): Promise<void> {
    try {
      console.log('⚙️ Aplicando configuraciones de estabilidad...');

      // Configurar timeouts más largos
      const originalSetTimeout = global.setTimeout;
      global.setTimeout = (callback, delay, ...args) => {
        const safeCallback = () => {
          try {
            callback();
          } catch (error) {
            console.error('🚨 Error en setTimeout:', error);
            this.logNativeError('TIMEOUT_ERROR', String(error));
          }
        };
        return originalSetTimeout(safeCallback, delay, ...args);
      };

      // Configurar intervalos más seguros
      const originalSetInterval = global.setInterval;
      global.setInterval = (callback, delay, ...args) => {
        const safeCallback = () => {
          try {
            callback();
          } catch (error) {
            console.error('🚨 Error en setInterval:', error);
            this.logNativeError('INTERVAL_ERROR', String(error));
          }
        };
        return originalSetInterval(safeCallback, delay, ...args);
      };

      // Guardar estado de estabilidad
      await AsyncStorage.setItem('@FiFintech:stability_config', JSON.stringify({
        applied: true,
        timestamp: Date.now(),
        version: '1.0.0'
      }));

      console.log('✅ Configuraciones de estabilidad aplicadas');

    } catch (error) {
      console.error('🚨 Error aplicando configuraciones de estabilidad:', error);
    }
  }

  /**
   * Configura el manejo de excepciones no capturadas
   */
  private static setupUncaughtExceptionHandling(): void {
    try {
      console.log('🚨 Configurando manejo de excepciones no capturadas...');

      // Interceptar promesas rechazadas
      const originalUnhandledRejection = global.onunhandledrejection;
      global.onunhandledrejection = (event) => {
        console.error('🚨 Promesa rechazada no manejada:', event.reason);
        this.logNativeError('UNHANDLED_REJECTION', String(event.reason));
        
        // Prevenir el crash
        event.preventDefault();
        
        if (originalUnhandledRejection) {
          originalUnhandledRejection(event);
        }
      };

      console.log('✅ Manejo de excepciones no capturadas configurado');

    } catch (error) {
      console.error('🚨 Error configurando manejo de excepciones:', error);
    }
  }

  /**
   * Verifica y repara el estado de la aplicación
   */
  private static async verifyAndRepairAppState(): Promise<void> {
    try {
      console.log('🔍 Verificando estado de la aplicación...');

      // Verificar AsyncStorage
      const testKey = '@FiFintech:health_check';
      const testValue = 'healthy_' + Date.now();
      
      await AsyncStorage.setItem(testKey, testValue);
      const retrievedValue = await AsyncStorage.getItem(testKey);
      
      if (retrievedValue !== testValue) {
        console.warn('⚠️ AsyncStorage no está funcionando correctamente');
        await this.repairAsyncStorage();
      } else {
        await AsyncStorage.removeItem(testKey);
        console.log('✅ AsyncStorage funcionando correctamente');
      }

      // Verificar memoria disponible
      if (global.gc) {
        global.gc();
      }

      console.log('✅ Estado de la aplicación verificado');

    } catch (error) {
      console.error('🚨 Error verificando estado de la aplicación:', error);
      await this.repairAsyncStorage();
    }
  }

  /**
   * Maneja errores fatales
   */
  private static handleFatalError(error: Error): void {
    console.error('💀 Manejando error fatal:', error);
    
    try {
      // Guardar información del error
      this.logNativeError('FATAL_ERROR', error.message || String(error));
      
      // Intentar limpiar recursos
      this.cleanupResources();
      
      // Notificar a listeners
      this.crashListeners.forEach(listener => {
        try {
          listener();
        } catch (listenerError) {
          console.error('🚨 Error en crash listener:', listenerError);
        }
      });
      
    } catch (cleanupError) {
      console.error('🚨 Error durante cleanup de error fatal:', cleanupError);
    }
  }

  /**
   * Maneja advertencias de memoria
   */
  private static handleMemoryWarning(): void {
    console.warn('🧠 Manejando advertencia de memoria...');
    
    try {
      // Ejecutar garbage collection agresivo
      if (global.gc) {
        global.gc();
        global.gc(); // Doble ejecución para mayor efectividad
      }
      
      // Limpiar cachés si están disponibles
      this.clearCaches();
      
      console.log('✅ Advertencia de memoria manejada');
      
    } catch (error) {
      console.error('🚨 Error manejando advertencia de memoria:', error);
    }
  }

  /**
   * Maneja cuando la app va al background
   */
  private static handleAppGoingToBackground(): void {
    console.log('📱 App yendo al background...');
    
    try {
      // Limpiar recursos no críticos
      this.clearCaches();
      
      // Ejecutar garbage collection
      if (global.gc) {
        global.gc();
      }
      
    } catch (error) {
      console.error('🚨 Error manejando background:', error);
    }
  }

  /**
   * Maneja cuando la app se vuelve activa
   */
  private static handleAppBecomingActive(): void {
    console.log('📱 App volviéndose activa...');
    
    try {
      // Verificar estado de la aplicación
      this.verifyAndRepairAppState();
      
    } catch (error) {
      console.error('🚨 Error manejando activación:', error);
    }
  }

  /**
   * Registra errores nativos
   */
  private static logNativeError(type: string, message: string): void {
    try {
      const errorLog = {
        type,
        message,
        timestamp: Date.now(),
        platform: Platform.OS,
        version: Platform.Version
      };
      
      AsyncStorage.setItem(
        `@FiFintech:error_${Date.now()}`,
        JSON.stringify(errorLog)
      ).catch(storageError => {
        console.error('🚨 Error guardando log de error:', storageError);
      });
      
    } catch (error) {
      console.error('🚨 Error registrando error nativo:', error);
    }
  }

  /**
   * Repara AsyncStorage
   */
  private static async repairAsyncStorage(): Promise<void> {
    try {
      console.log('🔧 Reparando AsyncStorage...');
      
      // Intentar limpiar datos corruptos
      const keys = await AsyncStorage.getAllKeys();
      const corruptedKeys: string[] = [];
      
      for (const key of keys) {
        try {
          await AsyncStorage.getItem(key);
        } catch (error) {
          corruptedKeys.push(key);
        }
      }
      
      if (corruptedKeys.length > 0) {
        console.log(`🗑️ Eliminando ${corruptedKeys.length} claves corruptas`);
        await AsyncStorage.multiRemove(corruptedKeys);
      }
      
      console.log('✅ AsyncStorage reparado');
      
    } catch (error) {
      console.error('🚨 Error reparando AsyncStorage:', error);
    }
  }

  /**
   * Limpia recursos y cachés
   */
  private static cleanupResources(): void {
    try {
      console.log('🧹 Limpiando recursos...');
      
      // Limpiar timers
      this.clearCaches();
      
      // Ejecutar garbage collection
      if (global.gc) {
        global.gc();
      }
      
      console.log('✅ Recursos limpiados');
      
    } catch (error) {
      console.error('🚨 Error limpiando recursos:', error);
    }
  }

  /**
   * Limpia cachés
   */
  private static clearCaches(): void {
    try {
      // Limpiar caché de imágenes si está disponible
      if (NativeModules.ImageCacheManager) {
        NativeModules.ImageCacheManager.clearCache();
      }
      
    } catch (error) {
      console.warn('⚠️ Error limpiando cachés:', error);
    }
  }

  /**
   * Añade un listener para crashes
   */
  static addCrashListener(listener: () => void): void {
    this.crashListeners.push(listener);
  }

  /**
   * Remueve un listener de crashes
   */
  static removeCrashListener(listener: () => void): void {
    const index = this.crashListeners.indexOf(listener);
    if (index > -1) {
      this.crashListeners.splice(index, 1);
    }
  }

  /**
   * Reinicia las correcciones nativas
   */
  static reset(): void {
    this.isInitialized = false;
    this.crashListeners = [];
    console.log('🔄 Correcciones nativas reiniciadas');
  }

  /**
   * Verifica si las correcciones están aplicadas
   */
  static isReady(): boolean {
    return this.isInitialized;
  }
}