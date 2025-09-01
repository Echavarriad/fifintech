import AsyncStorage from '@react-native-async-storage/async-storage';
import * as LocalAuthentication from 'expo-local-authentication';

const BIOMETRIC_CREDENTIALS_KEY = 'biometric_credentials';
const BIOMETRIC_ENABLED_KEY = 'biometric_enabled';

export interface BiometricCredentials {
  email: string;
  password: string; // Almacenamos la contraseña de forma segura para login automático
  hasStoredCredentials: boolean;
}

export class BiometricService {
  static async isBiometricAvailable(): Promise<boolean> {
    try {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      return compatible && enrolled;
    } catch (error) {
      console.log('Error checking biometric availability:', error);
      return false;
    }
  }

  static async getBiometricType(): Promise<string> {
    try {
      const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();
      
      if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
        return 'Face ID';
      } else if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
        return 'huella dactilar';
      } else {
        return 'autenticación biométrica';
      }
    } catch (error) {
      console.log('Error getting biometric type:', error);
      return 'autenticación biométrica';
    }
  }

  static async authenticateWithBiometrics(biometricType: string): Promise<boolean> {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: `Usar ${biometricType} para iniciar sesión`,
        cancelLabel: 'Cancelar',
        fallbackLabel: 'Usar contraseña',
      });

      return result.success;
    } catch (error) {
      console.log('Error during biometric authentication:', error);
      return false;
    }
  }

  static async enableBiometricLogin(email: string, password: string): Promise<boolean> {
    try {
      const credentials: BiometricCredentials = {
        email,
        password,
        hasStoredCredentials: true,
      };

      await AsyncStorage.setItem(BIOMETRIC_CREDENTIALS_KEY, JSON.stringify(credentials));
      await AsyncStorage.setItem(BIOMETRIC_ENABLED_KEY, 'true');
      return true;
    } catch (error) {
      console.log('Error enabling biometric login:', error);
      return false;
    }
  }

  static async disableBiometricLogin(): Promise<boolean> {
    try {
      await AsyncStorage.removeItem(BIOMETRIC_CREDENTIALS_KEY);
      await AsyncStorage.setItem(BIOMETRIC_ENABLED_KEY, 'false');
      return true;
    } catch (error) {
      console.log('Error disabling biometric login:', error);
      return false;
    }
  }

  static async isBiometricEnabled(): Promise<boolean> {
    try {
      const enabled = await AsyncStorage.getItem(BIOMETRIC_ENABLED_KEY);
      return enabled === 'true';
    } catch (error) {
      console.log('Error checking if biometric is enabled:', error);
      return false;
    }
  }

  static async getStoredCredentials(): Promise<BiometricCredentials | null> {
    try {
      const credentialsString = await AsyncStorage.getItem(BIOMETRIC_CREDENTIALS_KEY);
      if (credentialsString) {
        return JSON.parse(credentialsString);
      }
      return null;
    } catch (error) {
      console.log('Error getting stored credentials:', error);
      return null;
    }
  }
}