import { Platform, Dimensions, NativeModules } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { reportError } from './errorHandler';

/**
 * Utilidades de diagnóstico para dispositivos
 */
export class DeviceDiagnostics {
  /**
   * Obtiene información detallada del dispositivo
   */
  static async getDeviceInfo(): Promise<any> {
    try {
      const { width, height } = Dimensions.get('window');
      const { width: screenWidth, height: screenHeight } = Dimensions.get('screen');
      
      const deviceInfo = {
        platform: Platform.OS,
        version: Platform.Version,
        dimensions: {
          window: { width, height },
          screen: { width: screenWidth, height: screenHeight }
        },
        constants: Platform.constants,
        timestamp: new Date().toISOString()
      };
      
      console.log('📱 Información del dispositivo:', JSON.stringify(deviceInfo, null, 2));
      return deviceInfo;
    } catch (error) {
      console.error('🚨 Error al obtener información del dispositivo:', error);
      reportError(error as Error, 'DeviceDiagnostics.getDeviceInfo');
      return null;
    }
  }
  
  /**
   * Verifica el estado de AsyncStorage
   */
  static async checkAsyncStorageHealth(): Promise<boolean> {
    try {
      console.log('🔍 Verificando salud de AsyncStorage...');
      
      // Test básico de escritura/lectura
      const testKey = 'health_check_test';
      const testValue = JSON.stringify({ test: true, timestamp: Date.now() });
      
      await AsyncStorage.setItem(testKey, testValue);
      const retrievedValue = await AsyncStorage.getItem(testKey);
      
      if (retrievedValue !== testValue) {
        console.error('🚨 AsyncStorage health check failed: valores no coinciden');
        return false;
      }
      
      await AsyncStorage.removeItem(testKey);
      console.log('✅ AsyncStorage health check passed');
      return true;
    } catch (error) {
      console.error('🚨 AsyncStorage health check failed:', error);
      reportError(error as Error, 'DeviceDiagnostics.checkAsyncStorageHealth');
      return false;
    }
  }
  
  /**
   * Limpia datos corruptos de AsyncStorage
   */
  static async cleanCorruptedData(): Promise<void> {
    try {
      console.log('🧹 Iniciando limpieza de datos corruptos...');
      
      const keys = await AsyncStorage.getAllKeys();
      console.log('🔍 Claves encontradas en AsyncStorage:', keys);
      
      for (const key of keys) {
        try {
          const value = await AsyncStorage.getItem(key);
          if (value) {
            // Intentar parsear si parece ser JSON
            if (value.startsWith('{') || value.startsWith('[')) {
              JSON.parse(value);
            }
          }
        } catch (parseError) {
          console.warn(`🚨 Dato corrupto encontrado en clave '${key}', eliminando...`);
          await AsyncStorage.removeItem(key);
        }
      }
      
      console.log('✅ Limpieza de datos corruptos completada');
    } catch (error) {
      console.error('🚨 Error durante limpieza de datos corruptos:', error);
      reportError(error as Error, 'DeviceDiagnostics.cleanCorruptedData');
    }
  }
  
  /**
   * Ejecuta diagnóstico completo del dispositivo
   */
  static async runFullDiagnostic(): Promise<void> {
    try {
      console.log('🔍 Iniciando diagnóstico completo del dispositivo...');
      
      // 1. Información del dispositivo
      await this.getDeviceInfo();
      
      // 2. Verificar AsyncStorage
      const asyncStorageHealthy = await this.checkAsyncStorageHealth();
      if (!asyncStorageHealthy) {
        await this.cleanCorruptedData();
      }
      
      // 3. Verificar memoria disponible (si es posible)
      if (Platform.OS === 'android') {
        try {
          const memoryInfo = await this.getAndroidMemoryInfo();
          console.log('📊 Información de memoria Android:', memoryInfo);
        } catch (memError) {
          console.warn('⚠️ No se pudo obtener información de memoria:', memError);
        }
      }
      
      console.log('✅ Diagnóstico completo finalizado');
    } catch (error) {
      console.error('🚨 Error durante diagnóstico completo:', error);
      reportError(error as Error, 'DeviceDiagnostics.runFullDiagnostic');
    }
  }

  /**
   * Ejecuta diagnósticos y retorna información de compatibilidad
   */
  static async runDiagnostics(): Promise<{ isCompatible: boolean; issues: string[] }> {
    try {
      console.log('🔍 Ejecutando diagnósticos de compatibilidad...');
      
      const issues: string[] = [];
      
      // Verificar AsyncStorage
      const asyncStorageHealthy = await this.checkAsyncStorageHealth();
      if (!asyncStorageHealthy) {
        issues.push('Problemas con el almacenamiento local');
      }
      
      // Verificar información del dispositivo
      try {
        await this.getDeviceInfo();
      } catch (error) {
        issues.push('No se pudo obtener información del dispositivo');
      }
      
      // Verificar memoria en Android
      if (Platform.OS === 'android') {
        try {
          await this.getAndroidMemoryInfo();
        } catch (memError) {
          console.warn('⚠️ Advertencia de memoria:', memError);
          // No agregamos esto como un issue crítico
        }
      }
      
      const isCompatible = issues.length === 0;
      
      console.log(`✅ Diagnósticos completados. Compatible: ${isCompatible}`);
      if (issues.length > 0) {
        console.warn('⚠️ Issues encontrados:', issues);
      }
      
      return { isCompatible, issues };
    } catch (error) {
      console.error('🚨 Error durante diagnósticos:', error);
      reportError(error as Error, 'DeviceDiagnostics.runDiagnostics');
      return { isCompatible: false, issues: ['Error durante el diagnóstico'] };
    }
  }
  
  /**
   * Obtiene información de memoria en Android (si está disponible)
   */
  private static async getAndroidMemoryInfo(): Promise<any> {
    try {
      // Intentar obtener información de memoria si hay módulos nativos disponibles
      if (NativeModules.DeviceInfo) {
        return await NativeModules.DeviceInfo.getMemoryInfo();
      }
      return { message: 'Información de memoria no disponible' };
    } catch (error) {
      console.warn('⚠️ No se pudo obtener información de memoria nativa:', error);
      return { error: 'No disponible' };
    }
  }
  
  /**
   * Configura listeners para eventos de memoria baja
   */
  static setupMemoryWarningListeners(): void {
    try {
      // En React Native, podemos escuchar eventos de memoria baja
      if (Platform.OS === 'android') {
        console.log('📱 Configurando listeners de memoria para Android');
        // Los listeners de memoria se configurarían aquí si estuvieran disponibles
      }
    } catch (error) {
      console.error('🚨 Error al configurar listeners de memoria:', error);
      reportError(error as Error, 'DeviceDiagnostics.setupMemoryWarningListeners');
    }
  }
}

/**
 * Hook para usar diagnósticos en componentes
 */
export const useDiagnostics = () => {
  const runDiagnostic = async () => {
    await DeviceDiagnostics.runFullDiagnostic();
  };
  
  const checkHealth = async () => {
    return await DeviceDiagnostics.checkAsyncStorageHealth();
  };
  
  const cleanData = async () => {
    await DeviceDiagnostics.cleanCorruptedData();
  };
  
  return {
    runDiagnostic,
    checkHealth,
    cleanData
  };
};