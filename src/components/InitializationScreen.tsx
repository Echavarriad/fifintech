import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Image,
  Alert,
  TouchableOpacity,
  Platform,
  Dimensions,
} from 'react-native';
import { AppInitializer } from '../utils/appInitializer';
import { SafeAppLauncher } from '../utils/safeAppLauncher';

interface Props {
  onInitializationComplete: (success: boolean) => void;
  useSafeLauncher?: boolean;
}

export const InitializationScreen: React.FC<Props> = ({ onInitializationComplete, useSafeLauncher = false }) => {
  const [status, setStatus] = useState('Iniciando aplicación...');
  const [isError, setIsError] = useState(false);
  const [progress, setProgress] = useState(0);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      setIsError(false);
      setProgress(0);
      
      let success = false;
      
      if (useSafeLauncher) {
        // Usar SafeAppLauncher para inicialización robusta
        console.log('🛡️ Usando SafeAppLauncher para inicialización segura');
        
        const progressSteps = [
          { message: 'Verificando crashes recientes...', progress: 15 },
          { message: 'Comprobando integridad del sistema...', progress: 30 },
          { message: 'Inicializando manejador de crashes...', progress: 45 },
          { message: 'Configurando modo seguro si es necesario...', progress: 60 },
          { message: 'Ejecutando inicialización...', progress: 80 },
          { message: 'Finalizando configuración...', progress: 100 },
        ];

        for (const step of progressSteps) {
          setStatus(step.message);
          setProgress(step.progress);
          await new Promise(resolve => setTimeout(resolve, 400));
        }

        success = await SafeAppLauncher.launch();
        
        if (success) {
          const launcherStatus = SafeAppLauncher.getStatus();
          if (launcherStatus.safeMode) {
            setStatus('🛡️ Aplicación lista en modo seguro');
          } else {
            setStatus('¡Aplicación lista!');
          }
        }
      } else {
        // Usar AppInitializer tradicional
        const progressSteps = [
          { message: 'Verificando dispositivo...', progress: 20 },
          { message: 'Configurando seguridad...', progress: 40 },
          { message: 'Inicializando almacenamiento...', progress: 60 },
          { message: 'Optimizando rendimiento...', progress: 80 },
          { message: 'Finalizando configuración...', progress: 100 },
        ];

        for (const step of progressSteps) {
          setStatus(step.message);
          setProgress(step.progress);
          await new Promise(resolve => setTimeout(resolve, 500));
        }

        success = await AppInitializer.initialize();
        
        if (success) {
          setStatus('¡Aplicación lista!');
        }
      }
      
      if (success) {
        setTimeout(() => {
          onInitializationComplete(true);
        }, 500);
      } else {
        throw new Error('Fallo en la inicialización');
      }
      
    } catch (error) {
      console.error('🚨 Error en inicialización:', error);
      setIsError(true);
      setStatus('Error de inicialización');
      
      // Mostrar opciones de recuperación
      setTimeout(() => {
        showRecoveryOptions();
      }, 1000);
    }
  };

  const showRecoveryOptions = () => {
    Alert.alert(
      'Error de Inicialización',
      'La aplicación no pudo inicializarse correctamente. ¿Qué desea hacer?',
      [
        {
          text: 'Reintentar',
          onPress: () => {
            setRetryCount(prev => prev + 1);
            initializeApp();
          },
        },
        {
          text: 'Modo Seguro',
          onPress: () => {
            // Inicializar en modo seguro (sin optimizaciones)
            initializeSafeMode();
          },
        },
        {
          text: 'Continuar',
          onPress: () => {
            onInitializationComplete(false);
          },
          style: 'destructive',
        },
      ]
    );
  };

  const initializeSafeMode = async () => {
    try {
      setStatus('Iniciando en modo seguro...');
      setIsError(false);
      setProgress(50);
      
      if (useSafeLauncher) {
        // Forzar modo seguro en SafeAppLauncher
        SafeAppLauncher.forceSafeMode();
        const success = await SafeAppLauncher.launch();
        
        if (success) {
          setProgress(100);
          setStatus('🛡️ Modo seguro activado');
          
          setTimeout(() => {
            onInitializationComplete(true);
          }, 500);
        } else {
          throw new Error('Modo seguro falló');
        }
      } else {
        // Modo seguro tradicional
        AppInitializer.reset();
        
        // Esperar un momento
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setProgress(100);
        setStatus('Modo seguro activado');
        
        setTimeout(() => {
          onInitializationComplete(true);
        }, 500);
      }
      
    } catch (error) {
      console.error('🚨 Error en modo seguro:', error);
      setIsError(true);
      setStatus('Error crítico');
      
      Alert.alert(
        'Error Crítico',
        'No se pudo inicializar la aplicación. Por favor, reinstale la aplicación.',
        [{ text: 'OK', onPress: () => onInitializationComplete(false) }]
      );
    }
  };

  const handleManualRetry = () => {
    setRetryCount(prev => prev + 1);
    initializeApp();
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Logo */}
        <Image
          source={require('../../assets/FiFintech.Co.png')}
          style={[styles.logo, styles.pulsatingLogo]}
          resizeMode="contain"
        />
        
        {/* Indicador de progreso */}
        <View style={styles.progressContainer}>
          {!isError ? (
            <>
              <ActivityIndicator size="large" color="#48b783" style={styles.loader} />
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${progress}%` }]} />
              </View>
            </>
          ) : (
            <View style={styles.errorContainer}>
              <Text style={styles.errorIcon}>⚠️</Text>
              <TouchableOpacity style={styles.retryButton} onPress={handleManualRetry}>
                <Text style={styles.retryButtonText}>🔄 Reintentar</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
        
        {/* Estado */}
        <Text style={[styles.statusText, isError && styles.errorText]}>
          {status}
        </Text>
        
        {/* Información adicional */}
        {retryCount > 0 && (
          <Text style={styles.retryText}>
            Intento {retryCount + 1}
          </Text>
        )}
        
        {/* Información del dispositivo */}
        <View style={styles.deviceInfo}>
          <Text style={styles.deviceInfoText}>
            {Platform.OS === 'android' ? '🤖' : '🍎'} {Platform.OS} {Platform.Version}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  logo: {
    width: Math.min(Dimensions.get('window').width * 0.5, 200),
    height: Math.min(Dimensions.get('window').width * 0.5, 200),
    marginBottom: Dimensions.get('window').height * 0.05,
  },
  pulsatingLogo: {
    shadowColor: '#48b783',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 8,
  },
  progressContainer: {
    alignItems: 'center',
    marginBottom: 20,
    width: '100%',
  },
  loader: {
    marginBottom: 20,
  },
  progressBar: {
    width: '80%',
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#48b783',
    borderRadius: 2,
  },
  errorContainer: {
    alignItems: 'center',
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#48b783',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  statusText: {
    fontSize: 16,
    color: '#48b783',
    textAlign: 'center',
    marginBottom: 10,
    fontWeight: '500',
  },
  errorText: {
    color: '#e74c3c',
  },
  retryText: {
    fontSize: 14,
    color: '#95a5a6',
    textAlign: 'center',
    marginBottom: 20,
  },
  deviceInfo: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
  },
  deviceInfoText: {
    fontSize: 12,
    color: '#bdc3c7',
    textAlign: 'center',
  },
});