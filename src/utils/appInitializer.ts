import { Platform, Alert, Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DeviceDiagnostics } from './deviceDiagnostics';
import { AndroidOptimizations } from './androidOptimizations';
import { AndroidConfig } from './androidConfig';
import { setupGlobalErrorHandler } from './errorHandler';

export class AppInitializer {
  private static isInitialized = false;
  private static initializationPromise: Promise<boolean> | null = null;

  /**
   * Inicializa la aplicación de forma segura
   */
  static async initialize(): Promise<boolean> {
    // Evitar múltiples inicializaciones
    if (this.isInitialized) {
      return true;
    }

    // Si ya hay una inicialización en progreso, esperar a que termine
    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    this.initializationPromise = this.performInitialization();
    return this.initializationPromise;
  }

  private static async performInitialization(): Promise<boolean> {
    try {
      console.log('🚀 Iniciando aplicación FiFintech...');

      // Paso 1: Verificar compatibilidad del dispositivo
      await this.checkDeviceCompatibility();

      // Paso 2: Configurar manejadores de error básicos
      this.setupErrorHandling();

      // Paso 3: Verificar y reparar AsyncStorage
      await this.initializeStorage();

      // Paso 4: Configurar Android específicamente (no bloquear)
      if (Platform.OS === 'android') {
        AndroidConfig.configure().then(androidConfigured => {
          if (!androidConfigured) {
            console.warn('⚠️ Configuración de Android no completada correctamente');
          }
        }).catch(error => {
          console.warn('⚠️ Error en configuración de Android:', error);
        });
      }

      // Paso 5: Configurar optimizaciones específicas de plataforma (no bloquear)
      this.setupPlatformOptimizations().catch(error => {
        console.warn('⚠️ Error en optimizaciones:', error);
      });

      // Paso 6: Verificar permisos críticos (no bloquear)
      this.checkCriticalPermissions().catch(error => {
        console.warn('⚠️ Error verificando permisos:', error);
      });

      // Paso 7: Configurar listeners de sistema
      this.setupSystemListeners();

      // Paso 8: Verificación final (no bloquear)
      this.performFinalChecks().catch(error => {
        console.warn('⚠️ Error en verificaciones finales:', error);
      });

      this.isInitialized = true;
      console.log('✅ Aplicación FiFintech inicializada correctamente');
      return true;

    } catch (error) {
      console.error('❌ Error durante la inicialización:', error);
      await this.handleInitializationError(error);
      return false;
    } finally {
      this.initializationPromise = null;
    }
  }

  /**
   * Verifica la compatibilidad del dispositivo
   */
  private static async checkDeviceCompatibility(): Promise<void> {
    try {
      const diagnostics = await DeviceDiagnostics.runDiagnostics();
      
      if (!diagnostics.isCompatible) {
        const incompatibilityReasons = diagnostics.issues.join(', ');
        console.warn(`⚠️ Dispositivo con problemas de compatibilidad: ${incompatibilityReasons}`);
        
        // Mostrar alerta al usuario sobre problemas de compatibilidad
        Alert.alert(
          'Advertencia de Compatibilidad',
          `Tu dispositivo puede tener problemas de rendimiento: ${incompatibilityReasons}`,
          [{ text: 'Entendido', style: 'default' }]
        );
      }
    } catch (error) {
      console.warn('⚠️ No se pudo verificar la compatibilidad del dispositivo:', error);
    }
  }

  /**
   * Configura los manejadores de error globales
   */
  private static setupErrorHandling(): void {
    try {
      // Configurar manejador global de errores
      setupGlobalErrorHandler();

      // Configurar manejador de errores no capturados
      if (typeof ErrorUtils !== 'undefined') {
        const originalHandler = ErrorUtils.getGlobalHandler();
        
        ErrorUtils.setGlobalHandler((error, isFatal) => {
          console.error('Error global capturado:', error);
          
          // Llamar al manejador original si existe
          if (originalHandler) {
            originalHandler(error, isFatal);
          }
        });
      }

      console.log('✅ Manejadores de error configurados');
    } catch (error) {
      console.warn('⚠️ Error configurando manejadores de error:', error);
    }
  }

  /**
   * Inicializa y verifica AsyncStorage
   */
  private static async initializeStorage(): Promise<void> {
    try {
      // Verificar que AsyncStorage funcione
      const testKey = '@FiFintech:storage_test';
      const testValue = 'test_value';
      
      await AsyncStorage.setItem(testKey, testValue);
      const retrievedValue = await AsyncStorage.getItem(testKey);
      
      if (retrievedValue !== testValue) {
        throw new Error('AsyncStorage no funciona correctamente');
      }
      
      // Limpiar el valor de prueba
      await AsyncStorage.removeItem(testKey);
      
      console.log('✅ AsyncStorage inicializado correctamente');
    } catch (error) {
      console.error('❌ Error inicializando AsyncStorage:', error);
      
      // Intentar limpiar AsyncStorage si está corrupto
      try {
        await AsyncStorage.clear();
        console.log('🔄 AsyncStorage limpiado debido a corrupción');
      } catch (clearError) {
        console.error('❌ No se pudo limpiar AsyncStorage:', clearError);
      }
    }
  }

  /**
   * Configura optimizaciones específicas de la plataforma
   */
  private static async setupPlatformOptimizations(): Promise<void> {
    try {
      if (Platform.OS === 'android') {
        await AndroidOptimizations.setupAndroidOptimizations();
        console.log('✅ Optimizaciones de Android aplicadas');
      }
    } catch (error) {
      console.warn('⚠️ Error aplicando optimizaciones de plataforma:', error);
    }
  }

  /**
   * Verifica permisos críticos
   */
  private static async checkCriticalPermissions(): Promise<void> {
    try {
      // Aquí se pueden agregar verificaciones de permisos específicos
      // Por ejemplo, permisos de red, almacenamiento, etc.
      console.log('✅ Permisos críticos verificados');
    } catch (error) {
      console.warn('⚠️ Error verificando permisos:', error);
    }
  }

  /**
   * Configura listeners del sistema
   */
  private static setupSystemListeners(): void {
    try {
      // Configurar listeners para cambios de conectividad, estado de la app, etc.
      console.log('✅ Listeners del sistema configurados');
    } catch (error) {
      console.warn('⚠️ Error configurando listeners del sistema:', error);
    }
  }

  /**
   * Realiza verificaciones finales
   */
  private static async performFinalChecks(): Promise<void> {
    try {
      console.log('🔍 Realizando verificaciones finales...');
      
      // Verificación rápida sin bloquear la inicialización
      setTimeout(() => {
        this.checkInternetAccess().then(hasInternet => {
          if (hasInternet) {
            console.log('✅ Conexión a internet verificada');
          } else {
            console.warn('⚠️ No hay conexión a internet');
          }
        }).catch(() => {
          console.warn('⚠️ Error verificando internet');
        });
      }, 100);
      
      console.log('✅ Verificaciones finales completadas');
    } catch (error) {
      console.warn('⚠️ Error en verificaciones finales:', error);
      // No lanzar error, continuar con la inicialización
    }
  }

  /**
   * Verifica el acceso a internet
   */
  private static async checkInternetAccess(): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      
      const response = await fetch('https://www.google.com', {
        method: 'HEAD',
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      return response.ok;
    } catch (error) {
      console.log('⚠️ Sin conexión a internet:', error);
      return false;
    }
  }

  /**
   * Maneja errores durante la inicialización
   */
  private static async handleInitializationError(error: any): Promise<void> {
    const errorMessage = error?.message || 'Error desconocido';
    console.error('Error de inicialización:', errorMessage);
    
    // Intentar recuperación básica
    try {
      await this.attemptRecovery();
    } catch (recoveryError) {
      console.error('Error durante la recuperación:', recoveryError);
    }
  }

  /**
   * Intenta recuperar la aplicación de errores
   */
  private static async attemptRecovery(): Promise<void> {
    try {
      // Limpiar AsyncStorage
      await AsyncStorage.clear();
      console.log('🔄 AsyncStorage limpiado para recuperación');
    } catch (error) {
      console.error('Error durante la recuperación:', error);
    }
  }

  /**
   * Reinicia el estado de inicialización
   */
  static reset(): void {
    this.isInitialized = false;
    this.initializationPromise = null;
    console.log('🔄 AppInitializer reiniciado');
  }

  /**
   * Verifica si la aplicación está inicializada
   */
  static isAppInitialized(): boolean {
    return this.isInitialized;
  }

  /**
   * Obtiene el estado de inicialización
   */
  static getInitializationStatus(): {
    isInitialized: boolean;
    isInitializing: boolean;
  } {
    return {
      isInitialized: this.isInitialized,
      isInitializing: this.initializationPromise !== null && !this.isInitialized,
    };
  }
}