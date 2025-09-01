import { Alert } from 'react-native';

// Declarar ErrorUtils globalmente
declare global {
  var ErrorUtils: {
    getGlobalHandler(): ((error: Error, isFatal?: boolean) => void) | undefined;
    setGlobalHandler(handler: (error: Error, isFatal?: boolean) => void): void;
  };
}

// Configurar manejador global de errores no capturados
export const setupGlobalErrorHandler = () => {
  // Verificar si ErrorUtils está disponible
  if (typeof ErrorUtils === 'undefined') {
    console.warn('⚠️ ErrorUtils no está disponible en este entorno');
    return;
  }
  
  // Manejar errores de JavaScript no capturados
  const originalHandler = ErrorUtils.getGlobalHandler();
  
  ErrorUtils.setGlobalHandler((error: Error, isFatal?: boolean) => {
    const errorInfo = {
      message: error.message,
      stack: error.stack,
      name: error.name,
      isFatal,
      timestamp: new Date().toISOString(),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'N/A'
    };
    
    console.error('🚨 Error global capturado:', errorInfo);
    
    // Log adicional para errores específicos comunes
    if (error.message.includes('AsyncStorage')) {
      console.error('🔍 Error relacionado con AsyncStorage detectado');
    }
    if (error.message.includes('JSON')) {
      console.error('🔍 Error de parsing JSON detectado');
    }
    if (error.message.includes('Network')) {
      console.error('🔍 Error de red detectado');
    }

    // Si es un error fatal, mostrar alerta al usuario
    if (isFatal) {
      Alert.alert(
        'Error Crítico',
        `La aplicación ha encontrado un error crítico: ${error.message}. Por favor, reinicia la aplicación.`,
        [
          {
            text: 'Reiniciar',
            onPress: () => {
              // En React Native, no hay forma directa de reiniciar la app
              // El usuario tendrá que cerrar y abrir manualmente
            }
          }
        ]
      );
    }

    // Llamar al manejador original si existe
    if (originalHandler) {
      originalHandler(error, isFatal);
    }
  });

  // Manejar promesas rechazadas no capturadas
  const handleUnhandledRejection = (event: any) => {
    console.error('🚨 Promise rechazada no capturada:', {
      reason: event.reason,
      promise: event.promise,
      timestamp: new Date().toISOString()
    });

    // Prevenir el comportamiento por defecto que podría causar crash
    event.preventDefault();
  };

  // En React Native, las promesas rechazadas se manejan diferente
  if (typeof window !== 'undefined' && window.addEventListener) {
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
  }
};

// Función para reportar errores de manera controlada
export const reportError = (error: Error, context?: string) => {
  console.error(`🔍 Error reportado${context ? ` en ${context}` : ''}:`, {
    message: error.message,
    stack: error.stack,
    context,
    timestamp: new Date().toISOString()
  });
};

// Función para envolver funciones async con manejo de errores
export const withErrorHandling = <T extends (...args: any[]) => Promise<any>>(
  fn: T,
  context?: string
): T => {
  return ((...args: any[]) => {
    return fn(...args).catch((error: Error) => {
      reportError(error, context);
      throw error; // Re-lanzar para que el código que llama pueda manejarlo
    });
  }) as T;
};

// Función para envolver funciones síncronas con manejo de errores
export const withSyncErrorHandling = <T extends (...args: any[]) => any>(
  fn: T,
  context?: string
): T => {
  return ((...args: any[]) => {
    try {
      return fn(...args);
    } catch (error) {
      reportError(error as Error, context);
      throw error; // Re-lanzar para que el código que llama pueda manejarlo
    }
  }) as T;
};

// Declaración global para ErrorUtils (específico de React Native)
declare global {
  const ErrorUtils: {
    setGlobalHandler: (handler: (error: Error, isFatal?: boolean) => void) => void;
    getGlobalHandler: () => ((error: Error, isFatal?: boolean) => void) | undefined;
  };
}