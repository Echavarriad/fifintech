import { Platform, DeviceEventEmitter, NativeModules } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export class AndroidOptimizations {
  private static memoryWarningCount = 0;
  private static isOptimized = false;

  /**
   * Configura optimizaciones específicas para Android
   */
  static async setupAndroidOptimizations(): Promise<void> {
    if (Platform.OS !== 'android' || this.isOptimized) {
      return;
    }

    try {
      console.log('🔧 Configurando optimizaciones para Android...');

      // Configurar manejo de memoria
      this.setupMemoryManagement();

      // Configurar optimizaciones de red
      this.setupNetworkOptimizations();

      // Configurar optimizaciones de almacenamiento
      await this.setupStorageOptimizations();

      // Configurar optimizaciones de UI
      this.setupUIOptimizations();

      this.isOptimized = true;
      console.log('✅ Optimizaciones de Android configuradas');
    } catch (error) {
      console.error('❌ Error configurando optimizaciones de Android:', error);
    }
  }

  /**
   * Configura el manejo de memoria para Android
   */
  private static setupMemoryManagement(): void {
    // Listener para advertencias de memoria baja
    DeviceEventEmitter.addListener('memoryWarning', () => {
      this.memoryWarningCount++;
      console.warn(`⚠️ Advertencia de memoria baja (${this.memoryWarningCount})`);
      
      // Ejecutar limpieza de memoria
      this.performMemoryCleanup();
    });

    // Configurar garbage collection más agresivo
    if (global.gc) {
      setInterval(() => {
        try {
          global.gc();
        } catch (error) {
          // Ignorar errores de GC
        }
      }, 30000); // Cada 30 segundos
    }
  }

  /**
   * Realiza limpieza de memoria
   */
  private static performMemoryCleanup(): void {
    try {
      // Limpiar caché de imágenes si está disponible
      if (NativeModules.ImageCacheManager) {
        NativeModules.ImageCacheManager.clearCache();
      }

      // Forzar garbage collection
      if (global.gc) {
        global.gc();
      }

      console.log('🧹 Limpieza de memoria completada');
    } catch (error) {
      console.error('❌ Error en limpieza de memoria:', error);
    }
  }

  /**
   * Configura optimizaciones de red
   */
  private static setupNetworkOptimizations(): void {
    // Configurar timeouts más largos para conexiones lentas
    const originalFetch = global.fetch;
    global.fetch = (input: RequestInfo | URL, init?: RequestInit) => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 segundos

      const modifiedInit = {
        ...init,
        signal: controller.signal,
      };

      return originalFetch(input, modifiedInit)
        .finally(() => clearTimeout(timeoutId));
    };
  }

  /**
   * Configura optimizaciones de almacenamiento
   */
  private static async setupStorageOptimizations(): Promise<void> {
    try {
      // Verificar y limpiar datos corruptos en AsyncStorage
      const keys = await AsyncStorage.getAllKeys();
      const corruptedKeys: string[] = [];

      for (const key of keys) {
        try {
          const value = await AsyncStorage.getItem(key);
          if (value) {
            JSON.parse(value); // Verificar que sea JSON válido
          }
        } catch (error) {
          console.warn(`🗑️ Clave corrupta encontrada: ${key}`);
          corruptedKeys.push(key);
        }
      }

      // Eliminar claves corruptas
      if (corruptedKeys.length > 0) {
        await AsyncStorage.multiRemove(corruptedKeys);
        console.log(`🧹 Eliminadas ${corruptedKeys.length} claves corruptas`);
      }
    } catch (error) {
      console.error('❌ Error en optimizaciones de almacenamiento:', error);
    }
  }

  /**
   * Configura optimizaciones de UI
   */
  private static setupUIOptimizations(): void {
    // Configurar InteractionManager para operaciones pesadas
    const InteractionManager = require('react-native').InteractionManager;
    
    // Envolver operaciones pesadas
    const originalSetTimeout = global.setTimeout;
    global.setTimeout = (callback: () => void, delay?: number) => {
      return originalSetTimeout(() => {
        InteractionManager.runAfterInteractions(callback);
      }, delay);
    };
  }

  /**
   * Obtiene estadísticas de rendimiento
   */
  static getPerformanceStats(): object {
    return {
      memoryWarnings: this.memoryWarningCount,
      isOptimized: this.isOptimized,
      platform: Platform.OS,
      version: Platform.Version,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Reinicia las optimizaciones
   */
  static reset(): void {
    this.memoryWarningCount = 0;
    this.isOptimized = false;
  }

  /**
   * Verifica si el dispositivo tiene recursos limitados
   */
  static isLowEndDevice(): boolean {
    // Heurística simple basada en la versión de Android
    if (Platform.OS === 'android') {
      const androidVersion = parseInt(Platform.Version.toString(), 10);
      return androidVersion < 24; // Android 7.0 o inferior
    }
    return false;
  }

  /**
   * Configura optimizaciones específicas para dispositivos de gama baja
   */
  static setupLowEndOptimizations(): void {
    if (!this.isLowEndDevice()) {
      return;
    }

    console.log('📱 Configurando optimizaciones para dispositivo de gama baja...');

    // Reducir frecuencia de animaciones
    const LayoutAnimation = require('react-native').LayoutAnimation;
    LayoutAnimation.configureNext = () => {}; // Deshabilitar animaciones de layout

    // Configurar garbage collection más frecuente
    if (global.gc) {
      setInterval(() => {
        try {
          global.gc();
        } catch (error) {
          // Ignorar errores
        }
      }, 15000); // Cada 15 segundos para dispositivos de gama baja
    }
  }
}