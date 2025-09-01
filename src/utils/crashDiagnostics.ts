import { Platform, NativeModules, DeviceEventEmitter } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DeviceDiagnostics } from './deviceDiagnostics';

export class CrashDiagnostics {
  private static diagnosticData: any = {};
  private static isMonitoring = false;

  /**
   * Inicia el monitoreo de crashes y diagnósticos
   */
  static async startMonitoring(): Promise<void> {
    if (this.isMonitoring) {
      console.log('✅ Monitoreo de crashes ya iniciado');
      return;
    }

    try {
      console.log('🔍 Iniciando monitoreo de crashes...');

      // Recopilar información inicial del dispositivo
      await this.collectInitialDiagnostics();

      // Configurar listeners de crash
      this.setupCrashListeners();

      // Configurar monitoreo de rendimiento
      this.setupPerformanceMonitoring();

      // Verificar crashes anteriores
      await this.checkPreviousCrashes();

      this.isMonitoring = true;
      console.log('✅ Monitoreo de crashes iniciado');

    } catch (error) {
      console.error('🚨 Error iniciando monitoreo de crashes:', error);
    }
  }

  /**
   * Recopila información inicial de diagnóstico
   */
  private static async collectInitialDiagnostics(): Promise<void> {
    try {
      console.log('📊 Recopilando diagnósticos iniciales...');

      this.diagnosticData = {
        timestamp: new Date().toISOString(),
        platform: Platform.OS,
        platformVersion: Platform.Version,
        deviceInfo: await DeviceDiagnostics.getDeviceInfo(),
        memoryInfo: await this.getMemoryInfo(),
        storageInfo: await this.getStorageInfo(),
        networkInfo: await this.getNetworkInfo(),
        appInfo: this.getAppInfo(),
        systemInfo: await this.getSystemInfo(),
      };

      // Guardar diagnósticos iniciales
      await AsyncStorage.setItem(
        '@FiFintech:initial_diagnostics',
        JSON.stringify(this.diagnosticData)
      );

      console.log('✅ Diagnósticos iniciales recopilados');

    } catch (error) {
      console.error('🚨 Error recopilando diagnósticos:', error);
    }
  }

  /**
   * Configura listeners para detectar crashes
   */
  private static setupCrashListeners(): void {
    try {
      console.log('👂 Configurando listeners de crash...');

      // Listener para errores de JavaScript
      const originalErrorHandler = global.ErrorUtils?.getGlobalHandler();
      global.ErrorUtils?.setGlobalHandler(async (error, isFatal) => {
        console.log('🚨 Crash detectado:', error, 'Fatal:', isFatal);
        
        await this.recordCrash({
          type: 'JS_ERROR',
          error: error.message || String(error),
          stack: error.stack,
          isFatal,
          timestamp: new Date().toISOString(),
        });

        // Llamar al handler original
        if (originalErrorHandler) {
          originalErrorHandler(error, isFatal);
        }
      });

      // Listener para promesas rechazadas
      global.onunhandledrejection = async (event) => {
        console.log('🚨 Promesa rechazada detectada:', event.reason);
        
        await this.recordCrash({
          type: 'UNHANDLED_REJECTION',
          error: String(event.reason),
          timestamp: new Date().toISOString(),
        });
      };

      // Listener para advertencias de memoria
      DeviceEventEmitter.addListener('memoryWarning', async () => {
        console.warn('⚠️ Advertencia de memoria');
        
        await this.recordCrash({
          type: 'MEMORY_WARNING',
          memoryInfo: await this.getMemoryInfo(),
          timestamp: new Date().toISOString(),
        });
      });

      console.log('✅ Listeners de crash configurados');

    } catch (error) {
      console.error('🚨 Error configurando listeners:', error);
    }
  }

  /**
   * Configura monitoreo de rendimiento
   */
  private static setupPerformanceMonitoring(): void {
    try {
      console.log('📈 Configurando monitoreo de rendimiento...');

      // Monitorear cada 30 segundos
      setInterval(async () => {
        try {
          const performanceData = {
            timestamp: new Date().toISOString(),
            memory: await this.getMemoryInfo(),
            storage: await this.getStorageInfo(),
          };

          // Guardar datos de rendimiento
          await AsyncStorage.setItem(
            `@FiFintech:performance_${Date.now()}`,
            JSON.stringify(performanceData)
          );

          // Limpiar datos antiguos (mantener solo los últimos 10)
          await this.cleanupOldPerformanceData();

        } catch (error) {
          console.warn('⚠️ Error en monitoreo de rendimiento:', error);
        }
      }, 30000);

      console.log('✅ Monitoreo de rendimiento configurado');

    } catch (error) {
      console.error('🚨 Error configurando monitoreo de rendimiento:', error);
    }
  }

  /**
   * Verifica crashes anteriores
   */
  private static async checkPreviousCrashes(): Promise<void> {
    try {
      console.log('🔍 Verificando crashes anteriores...');

      const keys = await AsyncStorage.getAllKeys();
      const crashKeys = keys.filter(key => key.startsWith('@FiFintech:crash_'));

      if (crashKeys.length > 0) {
        console.log(`⚠️ Se encontraron ${crashKeys.length} crashes anteriores`);
        
        // Obtener información de crashes
        const crashes = await AsyncStorage.multiGet(crashKeys);
        const crashData = crashes.map(([key, value]) => {
          try {
            return JSON.parse(value || '{}');
          } catch {
            return { error: 'Invalid crash data', key };
          }
        });

        console.log('📊 Crashes anteriores:', crashData);

        // Generar reporte de crashes
        await this.generateCrashReport(crashData);
      } else {
        console.log('✅ No se encontraron crashes anteriores');
      }

    } catch (error) {
      console.error('🚨 Error verificando crashes anteriores:', error);
    }
  }

  /**
   * Registra un crash
   */
  private static async recordCrash(crashData: any): Promise<void> {
    try {
      const crashId = `crash_${Date.now()}`;
      const fullCrashData = {
        ...crashData,
        id: crashId,
        diagnostics: this.diagnosticData,
        currentMemory: await this.getMemoryInfo(),
        currentStorage: await this.getStorageInfo(),
      };

      await AsyncStorage.setItem(
        `@FiFintech:${crashId}`,
        JSON.stringify(fullCrashData)
      );

      console.log('💾 Crash registrado:', crashId);

    } catch (error) {
      console.error('🚨 Error registrando crash:', error);
    }
  }

  /**
   * Obtiene información de memoria
   */
  private static async getMemoryInfo(): Promise<any> {
    try {
      const memoryInfo: any = {
        timestamp: new Date().toISOString(),
      };

      // Información básica de memoria
      if (global.performance && global.performance.memory) {
        memoryInfo.jsHeapSizeLimit = global.performance.memory.jsHeapSizeLimit;
        memoryInfo.totalJSHeapSize = global.performance.memory.totalJSHeapSize;
        memoryInfo.usedJSHeapSize = global.performance.memory.usedJSHeapSize;
      }

      // Información nativa de memoria (si está disponible)
      if (NativeModules.DeviceInfo) {
        try {
          memoryInfo.totalMemory = await NativeModules.DeviceInfo.getTotalMemory();
          memoryInfo.freeMemory = await NativeModules.DeviceInfo.getFreeDiskStorage();
        } catch (error) {
          console.warn('⚠️ No se pudo obtener información nativa de memoria');
        }
      }

      return memoryInfo;

    } catch (error) {
      console.error('🚨 Error obteniendo información de memoria:', error);
      return { error: String(error) };
    }
  }

  /**
   * Obtiene información de almacenamiento
   */
  private static async getStorageInfo(): Promise<any> {
    try {
      const storageInfo: any = {
        timestamp: new Date().toISOString(),
      };

      // Verificar AsyncStorage
      try {
        const testKey = '@FiFintech:storage_test';
        const testValue = 'test_' + Date.now();
        
        await AsyncStorage.setItem(testKey, testValue);
        const retrieved = await AsyncStorage.getItem(testKey);
        await AsyncStorage.removeItem(testKey);
        
        storageInfo.asyncStorageWorking = retrieved === testValue;
      } catch (error) {
        storageInfo.asyncStorageWorking = false;
        storageInfo.asyncStorageError = String(error);
      }

      // Contar claves en AsyncStorage
      try {
        const keys = await AsyncStorage.getAllKeys();
        storageInfo.totalKeys = keys.length;
        storageInfo.fifinTechKeys = keys.filter(key => key.startsWith('@FiFintech:')).length;
      } catch (error) {
        storageInfo.keyCountError = String(error);
      }

      return storageInfo;

    } catch (error) {
      console.error('🚨 Error obteniendo información de almacenamiento:', error);
      return { error: String(error) };
    }
  }

  /**
   * Obtiene información de red
   */
  private static async getNetworkInfo(): Promise<any> {
    try {
      const networkInfo: any = {
        timestamp: new Date().toISOString(),
      };

      // Verificar conectividad básica
      try {
        const response = await fetch('https://www.google.com', {
          method: 'HEAD',
          timeout: 5000,
        });
        networkInfo.internetConnected = response.ok;
      } catch (error) {
        networkInfo.internetConnected = false;
        networkInfo.connectionError = String(error);
      }

      return networkInfo;

    } catch (error) {
      console.error('🚨 Error obteniendo información de red:', error);
      return { error: String(error) };
    }
  }

  /**
   * Obtiene información de la aplicación
   */
  private static getAppInfo(): any {
    try {
      return {
        timestamp: new Date().toISOString(),
        platform: Platform.OS,
        platformVersion: Platform.Version,
        isHermes: typeof HermesInternal === 'object' && HermesInternal !== null,
        reactNativeVersion: require('react-native/package.json').version,
      };
    } catch (error) {
      console.error('🚨 Error obteniendo información de la app:', error);
      return { error: String(error) };
    }
  }

  /**
   * Obtiene información del sistema
   */
  private static async getSystemInfo(): Promise<any> {
    try {
      const systemInfo: any = {
        timestamp: new Date().toISOString(),
      };

      // Información del dispositivo
      if (NativeModules.DeviceInfo) {
        try {
          systemInfo.deviceId = await NativeModules.DeviceInfo.getDeviceId();
          systemInfo.systemName = await NativeModules.DeviceInfo.getSystemName();
          systemInfo.systemVersion = await NativeModules.DeviceInfo.getSystemVersion();
          systemInfo.model = await NativeModules.DeviceInfo.getModel();
          systemInfo.brand = await NativeModules.DeviceInfo.getBrand();
        } catch (error) {
          systemInfo.deviceInfoError = String(error);
        }
      }

      return systemInfo;

    } catch (error) {
      console.error('🚨 Error obteniendo información del sistema:', error);
      return { error: String(error) };
    }
  }

  /**
   * Genera un reporte de crashes
   */
  private static async generateCrashReport(crashes: any[]): Promise<void> {
    try {
      const report = {
        timestamp: new Date().toISOString(),
        totalCrashes: crashes.length,
        crashes,
        diagnostics: this.diagnosticData,
        summary: this.analyzeCrashes(crashes),
      };

      await AsyncStorage.setItem(
        '@FiFintech:crash_report',
        JSON.stringify(report)
      );

      console.log('📊 Reporte de crashes generado');

    } catch (error) {
      console.error('🚨 Error generando reporte de crashes:', error);
    }
  }

  /**
   * Analiza los crashes para encontrar patrones
   */
  private static analyzeCrashes(crashes: any[]): any {
    try {
      const analysis = {
        mostCommonType: '',
        mostCommonError: '',
        memoryRelated: 0,
        jsErrors: 0,
        nativeErrors: 0,
      };

      const types: { [key: string]: number } = {};
      const errors: { [key: string]: number } = {};

      crashes.forEach(crash => {
        // Contar tipos
        const type = crash.type || 'UNKNOWN';
        types[type] = (types[type] || 0) + 1;

        // Contar errores
        const error = crash.error || 'UNKNOWN';
        errors[error] = (errors[error] || 0) + 1;

        // Categorizar
        if (type.includes('MEMORY')) {
          analysis.memoryRelated++;
        } else if (type.includes('JS')) {
          analysis.jsErrors++;
        } else {
          analysis.nativeErrors++;
        }
      });

      // Encontrar más comunes
      analysis.mostCommonType = Object.keys(types).reduce((a, b) => types[a] > types[b] ? a : b, '');
      analysis.mostCommonError = Object.keys(errors).reduce((a, b) => errors[a] > errors[b] ? a : b, '');

      return analysis;

    } catch (error) {
      console.error('🚨 Error analizando crashes:', error);
      return { error: String(error) };
    }
  }

  /**
   * Limpia datos antiguos de rendimiento
   */
  private static async cleanupOldPerformanceData(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const performanceKeys = keys
        .filter(key => key.startsWith('@FiFintech:performance_'))
        .sort()
        .reverse();

      // Mantener solo los últimos 10
      if (performanceKeys.length > 10) {
        const keysToRemove = performanceKeys.slice(10);
        await AsyncStorage.multiRemove(keysToRemove);
      }

    } catch (error) {
      console.warn('⚠️ Error limpiando datos de rendimiento:', error);
    }
  }

  /**
   * Obtiene el reporte completo de diagnósticos
   */
  static async getFullDiagnosticReport(): Promise<any> {
    try {
      console.log('📊 Generando reporte completo de diagnósticos...');

      const keys = await AsyncStorage.getAllKeys();
      const diagnosticKeys = keys.filter(key => key.startsWith('@FiFintech:'));
      
      const diagnosticData = await AsyncStorage.multiGet(diagnosticKeys);
      const parsedData: { [key: string]: any } = {};

      diagnosticData.forEach(([key, value]) => {
        try {
          parsedData[key] = JSON.parse(value || '{}');
        } catch {
          parsedData[key] = { error: 'Invalid data', raw: value };
        }
      });

      const report = {
        timestamp: new Date().toISOString(),
        currentDiagnostics: this.diagnosticData,
        storedDiagnostics: parsedData,
        summary: {
          totalKeys: diagnosticKeys.length,
          crashKeys: diagnosticKeys.filter(key => key.includes('crash')).length,
          performanceKeys: diagnosticKeys.filter(key => key.includes('performance')).length,
          errorKeys: diagnosticKeys.filter(key => key.includes('error')).length,
        },
      };

      console.log('✅ Reporte completo generado');
      return report;

    } catch (error) {
      console.error('🚨 Error generando reporte completo:', error);
      return { error: String(error) };
    }
  }

  /**
   * Limpia todos los datos de diagnóstico
   */
  static async clearAllDiagnostics(): Promise<void> {
    try {
      console.log('🧹 Limpiando todos los diagnósticos...');

      const keys = await AsyncStorage.getAllKeys();
      const diagnosticKeys = keys.filter(key => key.startsWith('@FiFintech:'));
      
      await AsyncStorage.multiRemove(diagnosticKeys);
      
      console.log(`✅ ${diagnosticKeys.length} claves de diagnóstico eliminadas`);

    } catch (error) {
      console.error('🚨 Error limpiando diagnósticos:', error);
    }
  }

  /**
   * Detiene el monitoreo
   */
  static stopMonitoring(): void {
    this.isMonitoring = false;
    console.log('🛑 Monitoreo de crashes detenido');
  }
}