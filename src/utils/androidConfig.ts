import { Platform, PermissionsAndroid, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export class AndroidConfig {
  private static isConfigured = false;
  private static requiredPermissions = [
    PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
    PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
  ];

  /**
   * Configura la aplicación específicamente para Android
   */
  static async configure(): Promise<boolean> {
    if (Platform.OS !== 'android') {
      console.log('📱 No es Android, saltando configuración específica');
      return true;
    }

    if (this.isConfigured) {
      console.log('✅ Android ya configurado');
      return true;
    }

    try {
      console.log('🤖 Configurando Android...');

      // 1. Verificar y solicitar permisos críticos
      const permissionsGranted = await this.requestCriticalPermissions();
      if (!permissionsGranted) {
        console.warn('⚠️ Algunos permisos no fueron otorgados');
      }

      // 2. Configurar AsyncStorage para Android
      await this.configureAsyncStorage();

      // 3. Configurar manejo de memoria
      this.configureMemoryManagement();

      // 4. Configurar configuraciones de red
      this.configureNetworkSettings();

      // 5. Verificar compatibilidad del dispositivo
      const isCompatible = await this.checkDeviceCompatibility();
      if (!isCompatible) {
        console.warn('⚠️ Dispositivo puede tener problemas de compatibilidad');
      }

      this.isConfigured = true;
      console.log('✅ Configuración de Android completada');
      return true;

    } catch (error) {
      console.error('🚨 Error configurando Android:', error);
      return false;
    }
  }

  /**
   * Solicita permisos críticos para el funcionamiento de la app
   */
  private static async requestCriticalPermissions(): Promise<boolean> {
    try {
      console.log('🔐 Verificando permisos...');

      // Verificar permisos uno por uno
      const permissionResults: { [key: string]: boolean } = {};

      for (const permission of this.requiredPermissions) {
        try {
          const hasPermission = await PermissionsAndroid.check(permission);
          
          if (!hasPermission) {
            const granted = await PermissionsAndroid.request(permission, {
              title: 'Permiso Requerido',
              message: 'FiFintech necesita este permiso para funcionar correctamente.',
              buttonNeutral: 'Preguntar Después',
              buttonNegative: 'Cancelar',
              buttonPositive: 'OK',
            });
            
            permissionResults[permission] = granted === PermissionsAndroid.RESULTS.GRANTED;
          } else {
            permissionResults[permission] = true;
          }
        } catch (permError) {
          console.warn(`⚠️ Error solicitando permiso ${permission}:`, permError);
          permissionResults[permission] = false;
        }
      }

      const allGranted = Object.values(permissionResults).every(granted => granted);
      console.log('🔐 Resultado de permisos:', permissionResults);
      
      return allGranted;

    } catch (error) {
      console.error('🚨 Error en permisos:', error);
      return false;
    }
  }

  /**
   * Configura AsyncStorage específicamente para Android
   */
  private static async configureAsyncStorage(): Promise<void> {
    try {
      console.log('💾 Configurando AsyncStorage para Android...');

      // Verificar si AsyncStorage está funcionando
      const testKey = '@FiFintech:test';
      const testValue = 'test_value_' + Date.now();
      
      await AsyncStorage.setItem(testKey, testValue);
      const retrievedValue = await AsyncStorage.getItem(testKey);
      
      if (retrievedValue !== testValue) {
        throw new Error('AsyncStorage no está funcionando correctamente');
      }
      
      await AsyncStorage.removeItem(testKey);
      console.log('✅ AsyncStorage configurado correctamente');

    } catch (error) {
      console.error('🚨 Error configurando AsyncStorage:', error);
      throw error;
    }
  }

  /**
   * Configura el manejo de memoria para Android
   */
  private static configureMemoryManagement(): void {
    try {
      console.log('🧠 Configurando manejo de memoria...');

      // Configurar límites de memoria más conservadores
      if (global.gc) {
        // Ejecutar garbage collection inicial
        global.gc();
        console.log('🗑️ Garbage collection inicial ejecutado');
      }

      console.log('✅ Manejo de memoria configurado');

    } catch (error) {
      console.error('🚨 Error configurando memoria:', error);
    }
  }

  /**
   * Configura las configuraciones de red
   */
  private static configureNetworkSettings(): void {
    try {
      console.log('🌐 Configurando red...');

      // Configurar timeouts más largos para dispositivos lentos
      const originalFetch = global.fetch;
      global.fetch = (input: RequestInfo | URL, init?: RequestInit) => {
        const timeoutInit = {
          ...init,
          timeout: init?.timeout || 30000, // 30 segundos
        };
        return originalFetch(input, timeoutInit);
      };

      console.log('✅ Configuraciones de red aplicadas');

    } catch (error) {
      console.error('🚨 Error configurando red:', error);
    }
  }

  /**
   * Verifica la compatibilidad del dispositivo
   */
  private static async checkDeviceCompatibility(): Promise<boolean> {
    try {
      console.log('📱 Verificando compatibilidad del dispositivo...');

      const androidVersion = Platform.Version;
      const isCompatible = typeof androidVersion === 'number' ? androidVersion >= 21 : true;

      if (!isCompatible) {
        console.warn(`⚠️ Android ${androidVersion} puede no ser compatible`);
      }

      console.log(`📱 Android ${androidVersion} - Compatible: ${isCompatible}`);
      return isCompatible;

    } catch (error) {
      console.error('🚨 Error verificando compatibilidad:', error);
      return false;
    }
  }

  /**
   * Reinicia la configuración
   */
  static reset(): void {
    this.isConfigured = false;
    console.log('🔄 Configuración de Android reiniciada');
  }

  /**
   * Verifica si la configuración está completa
   */
  static isReady(): boolean {
    return this.isConfigured;
  }

  /**
   * Maneja errores críticos específicos de Android
   */
  static handleCriticalError(error: Error): void {
    console.error('🚨 Error crítico en Android:', error);
    
    Alert.alert(
      'Error del Sistema',
      'Se ha producido un error en el sistema Android. La aplicación intentará recuperarse.',
      [
        {
          text: 'Reiniciar App',
          onPress: () => {
            // Reiniciar configuración
            this.reset();
          },
        },
        {
          text: 'Continuar',
          style: 'cancel',
        },
      ]
    );
  }

  /**
   * Obtiene información de diagnóstico del sistema Android
   */
  static getDiagnosticInfo(): object {
    return {
      platform: Platform.OS,
      version: Platform.Version,
      isConfigured: this.isConfigured,
      timestamp: new Date().toISOString(),
    };
  }
}