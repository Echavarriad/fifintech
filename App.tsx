import React, { useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AppNavigator from './src/navigation/AppNavigator';
import { AuthProvider } from './src/contexts/AuthContext';
import { AlertProvider } from './src/contexts/AlertContext';
import { NotificationProvider } from './src/contexts/NotificationContext';
import { LanguageProvider } from './src/contexts/LanguageContext';
import { StyleSheet } from 'react-native';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import { InitializationScreen } from './src/components/InitializationScreen';
import { SafeAppLauncher } from './src/utils/safeAppLauncher';

// El ErrorBoundary personalizado maneja su propio fallback

export default function App() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isSafeMode, setIsSafeMode] = useState(false);

  const handleInitializationComplete = (success: boolean) => {
    console.log(success ? '✅ Inicialización completada' : '⚠️ Inicialización con errores');
    setIsInitialized(true);
    setIsSafeMode(SafeAppLauncher.isSafeMode());
  };

  if (!isInitialized) {
    return (
      <ErrorBoundary>
        <InitializationScreen 
          onInitializationComplete={handleInitializationComplete}
          useSafeLauncher={true}
        />
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={styles.container}>
        <LanguageProvider>
          <AuthProvider>
            <AlertProvider>
              <NotificationProvider>
                <AppNavigator />
              </NotificationProvider>
            </AlertProvider>
          </AuthProvider>
        </LanguageProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

