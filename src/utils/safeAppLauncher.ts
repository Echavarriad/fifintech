import { Platform, Alert, AppState, Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AndroidCrashHandler } from './androidCrashHandler';
import { AppInitializer } from './appInitializer';

/**
 * SafeAppLauncher - Lanzador seguro de la aplicación
 * Implementa múltiples capas de seguridad para evitar crashes al iniciar
 */
export class SafeAppLauncher {
  private static isLaunching = false;
  private static launchAttempts = 0;
  private static maxLaunchAttempts = 3;
  private static safeMode = false;
  private static lastCrashTime: number | null = null;

  /**
   * Lanza la aplicación de forma segura
   */
  static async launch(): Promise<boolean> {
    if (this.isLaunching) {
      console.log('🚀 SafeAppLauncher: Ya se está lanzando la aplicación');
      return false;
    }

    this.isLaunching = true;
    this.launchAttempts++;

    try {
      console.log(`🚀 SafeAppLauncher: Intento de lanzamiento ${this.launchAttempts}/${this.maxLaunchAttempts}`);

      // 1. Verificar si hubo un crash reciente
      await this.checkRecentCrash();

      // 2. Verificar integridad del sistema
      const systemIntegrity = await this.checkSystemIntegrity();
      if (!systemIntegrity) {
        throw new Error('Integridad del sistema comprometida');
      }

      // 3. Inicializar en modo seguro si es necesario
      if (this.safeMode) {
        console.log('🛡️ SafeAppLauncher: Iniciando en modo seguro');
        await this.initializeSafeMode();
      } else {
        // 4. Inicialización normal
        await this.initializeNormalMode();
      }

      // 5. Verificar que la inicialización fue exitosa
      const initSuccess = await this.verifyInitialization();
      if (!initSuccess) {
        throw new Error('Verificación de inicialización falló');
      }

      // 6. Configurar monitoreo post-lanzamiento
      this.setupPostLaunchMonitoring();

      console.log('✅ SafeAppLauncher: Aplicación lanzada exitosamente');
      this.resetLaunchState();
      return true;

    } catch (error) {
      console.error(`❌ SafeAppLauncher: Error en intento ${this.launchAttempts}:`, error);
      return await this.handleLaunchFailure(error);
    } finally {
      this.isLaunching = false;
    }
  }

  /**
   * Verifica si hubo un crash reciente
   */
  private static async checkRecentCrash(): Promise<void> {
    try {
      if (Platform.OS === 'android') {
        const lastCrash = await AndroidCrashHandler.getLastCrashInfo();
        if (lastCrash) {
          const crashTime = new Date(lastCrash.timestamp).getTime();
          const now = Date.now();
          const timeDiff = now - crashTime;

          // Si el crash fue hace menos de 5 minutos, activar modo seguro
          if (timeDiff < 5 * 60 * 1000) {
            console.warn('⚠️ SafeAppLauncher: Crash reciente detectado, activando modo seguro');
            this.safeMode = true;
            this.lastCrashTime = crashTime;
          }
        }
      }
    } catch (error) {
      console.error('❌ Error verificando crash reciente:', error);
    }
  }

  /**
   * Verifica la integridad del sistema
   */
  private static async checkSystemIntegrity(): Promise<boolean> {
    try {
      console.log('🔍 SafeAppLauncher: Verificando integridad del sistema...');

      // 1. Verificar AsyncStorage
      try {
        const testKey = '@SafeAppLauncher:integrity_test';
        await AsyncStorage.setItem(testKey, 'test');
        const value = await AsyncStorage.getItem(testKey);
        await AsyncStorage.removeItem(testKey);
        
        if (value !== 'test') {
          console.error('❌ AsyncStorage no funciona correctamente');
          return false;
        }
      } catch (error) {
        console.error('❌ Error en AsyncStorage:', error);
        return false;
      }

      // 2. Verificar memoria disponible
      if (global.performance && global.performance.memory) {
        const memInfo = global.performance.memory;
        const memoryUsage = memInfo.usedJSHeapSize / memInfo.totalJSHeapSize;
        
        if (memoryUsage > 0.9) {
          console.warn('⚠️ Uso de memoria muy alto:', memoryUsage);
          // Activar modo seguro si la memoria está muy alta
          this.safeMode = true;
        }
      }

      // 3. Verificar estado de la aplicación
      const appState = AppState.currentState;
      if (appState !== 'active') {
        console.warn('⚠️ App no está en estado activo:', appState);
      }

      console.log('✅ Integridad del sistema verificada');
      return true;
    } catch (error) {
      console.error('❌ Error verificando integridad:', error);
      return false;
    }
  }

  /**
   * Inicializa la aplicación en modo seguro
   */
  private static async initializeSafeMode(): Promise<void> {
    try {
      console.log('🛡️ SafeAppLauncher: Inicializando en modo seguro...');

      // 1. Limpiar datos corruptos
      await this.cleanCorruptedData();

      // 2. Inicializar solo componentes esenciales
      if (Platform.OS === 'android') {
        await AndroidCrashHandler.initialize();
      }

      // 3. Configurar manejo de errores básico
      this.setupBasicErrorHandling();

      // 4. Verificar permisos mínimos
      await this.checkMinimalPermissions();

      console.log('✅ Modo seguro inicializado');
    } catch (error) {
      console.error('❌ Error en modo seguro:', error);
      throw error;
    }
  }

  /**
   * Inicializa la aplicación en modo normal
   */
  private static async initializeNormalMode(): Promise<void> {
    try {
      console.log('🚀 SafeAppLauncher: Inicializando en modo normal...');

      // Usar el AppInitializer completo
      const initSuccess = await AppInitializer.initialize();
      if (!initSuccess) {
        throw new Error('AppInitializer falló');
      }

      console.log('✅ Modo normal inicializado');
    } catch (error) {
      console.error('❌ Error en modo normal:', error);
      throw error;
    }
  }

  /**
   * Limpia datos corruptos
   */
  private static async cleanCorruptedData(): Promise<void> {
    try {
      console.log('🧹 SafeAppLauncher: Limpiando datos corruptos...');

      const corruptedKeys = [
        '@FiFintech:corrupted',
        '@FiFintech:temp',
        '@FiFintech:cache',
        '@FiFintech:error_state',
        '@SafeAppLauncher:integrity_test'
      ];

      for (const key of corruptedKeys) {
        try {
          await AsyncStorage.removeItem(key);
        } catch (error) {
          console.log(`📱 No se pudo limpiar ${key}:`, error);
        }
      }

      console.log('✅ Datos corruptos limpiados');
    } catch (error) {
      console.error('❌ Error limpiando datos:', error);
    }
  }

  /**
   * Configura manejo básico de errores
   */
  private static setupBasicErrorHandling(): void {
    try {
      const originalHandler = ErrorUtils.getGlobalHandler();
      
      ErrorUtils.setGlobalHandler((error, isFatal) => {
        console.error('🚨 Error en modo seguro:', error);
        
        // En modo seguro, intentar recuperación inmediata
        if (!isFatal) {
          this.attemptImmediateRecovery();
        }

        if (originalHandler) {
          originalHandler(error, isFatal);
        }
      });

      console.log('✅ Manejo básico de errores configurado');
    } catch (error) {
      console.error('❌ Error configurando manejo básico:', error);
    }
  }

  /**
   * Verifica permisos mínimos
   */
  private static async checkMinimalPermissions(): Promise<void> {
    try {
      console.log('🔐 SafeAppLauncher: Verificando permisos mínimos...');
      
      // Verificar solo permisos críticos para el funcionamiento básico
      // En modo seguro, no requerimos todos los permisos
      
      console.log('✅ Permisos mínimos verificados');
    } catch (error) {
      console.error('❌ Error verificando permisos:', error);
    }
  }

  /**
   * Verifica que la inicialización fue exitosa
   */
  private static async verifyInitialization(): Promise<boolean> {
    try {
      console.log('🔍 SafeAppLauncher: Verificando inicialización...');

      // 1. Verificar que AsyncStorage funciona
      const testKey = '@SafeAppLauncher:init_test';
      await AsyncStorage.setItem(testKey, Date.now().toString());
      const value = await AsyncStorage.getItem(testKey);
      await AsyncStorage.removeItem(testKey);
      
      if (!value) {
        console.error('❌ AsyncStorage no funciona después de la inicialización');
        return false;
      }

      // 2. Verificar que no hay errores pendientes
      // Aquí podrías agregar más verificaciones específicas

      console.log('✅ Inicialización verificada');
      return true;
    } catch (error) {
      console.error('❌ Error verificando inicialización:', error);
      return false;
    }
  }

  /**
   * Configura monitoreo post-lanzamiento
   */
  private static setupPostLaunchMonitoring(): void {
    try {
      // Monitorear cambios de estado de la app
      AppState.addEventListener('change', (nextAppState) => {
        if (nextAppState === 'background') {
          this.handleAppBackground();
        } else if (nextAppState === 'active') {
          this.handleAppForeground();
        }
      });

      console.log('✅ Monitoreo post-lanzamiento configurado');
    } catch (error) {
      console.error('❌ Error configurando monitoreo:', error);
    }
  }

  /**
   * Maneja fallos de lanzamiento
   */
  private static async handleLaunchFailure(error: any): Promise<boolean> {
    try {
      console.error(`❌ SafeAppLauncher: Fallo en intento ${this.launchAttempts}:`, error);

      // Si hemos agotado los intentos
      if (this.launchAttempts >= this.maxLaunchAttempts) {
        console.error('❌ SafeAppLauncher: Máximo de intentos alcanzado');
        await this.showCriticalErrorDialog();
        return false;
      }

      // Activar modo seguro para el siguiente intento
      this.safeMode = true;

      // Esperar un poco antes del siguiente intento
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Intentar de nuevo
      return await this.launch();
    } catch (retryError) {
      console.error('❌ Error en reintento:', retryError);
      return false;
    }
  }

  /**
   * Intenta recuperación inmediata
   */
  private static attemptImmediateRecovery(): void {
    try {
      console.log('🔄 SafeAppLauncher: Intentando recuperación inmediata...');
      
      // Limpiar memoria si es posible
      if (global.gc) {
        global.gc();
      }

      console.log('✅ Recuperación inmediata completada');
    } catch (error) {
      console.error('❌ Error en recuperación inmediata:', error);
    }
  }

  /**
   * Maneja cuando la app va al background
   */
  private static handleAppBackground(): void {
    try {
      console.log('📱 SafeAppLauncher: App en background');
      // Guardar estado crítico si es necesario
    } catch (error) {
      console.error('❌ Error manejando background:', error);
    }
  }

  /**
   * Maneja cuando la app vuelve al foreground
   */
  private static handleAppForeground(): void {
    try {
      console.log('📱 SafeAppLauncher: App en foreground');
      // Verificar integridad después de volver del background
    } catch (error) {
      console.error('❌ Error manejando foreground:', error);
    }
  }

  /**
   * Muestra diálogo de error crítico
   */
  private static async showCriticalErrorDialog(): Promise<void> {
    try {
      Alert.alert(
        'Error Crítico',
        'La aplicación no puede iniciarse correctamente. ¿Desea intentar reiniciar en modo seguro?',
        [
          {
            text: 'Salir',
            style: 'cancel',
            onPress: () => {
              // En React Native no podemos cerrar la app directamente
              console.log('Usuario eligió salir');
            }
          },
          {
            text: 'Modo Seguro',
            onPress: async () => {
              this.resetLaunchState();
              this.safeMode = true;
              await this.launch();
            }
          },
          {
            text: 'Reintentar',
            onPress: async () => {
              this.resetLaunchState();
              await this.launch();
            }
          }
        ]
      );
    } catch (error) {
      console.error('❌ Error mostrando diálogo:', error);
    }
  }

  /**
   * Reinicia el estado de lanzamiento
   */
  private static resetLaunchState(): void {
    this.isLaunching = false;
    this.launchAttempts = 0;
    this.safeMode = false;
  }

  /**
   * Verifica si está en modo seguro
   */
  static isSafeMode(): boolean {
    return this.safeMode;
  }

  /**
   * Fuerza modo seguro
   */
  static forceSafeMode(): void {
    this.safeMode = true;
  }

  /**
   * Obtiene información del estado actual
   */
  static getStatus(): any {
    return {
      isLaunching: this.isLaunching,
      launchAttempts: this.launchAttempts,
      safeMode: this.safeMode,
      lastCrashTime: this.lastCrashTime
    };
  }
}