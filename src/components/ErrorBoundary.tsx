import React, { Component, ReactNode } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { DeviceDiagnostics } from '../utils/deviceDiagnostics';
import { AndroidOptimizations } from '../utils/androidOptimizations';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Props {
  children: ReactNode;
  fallback?: (error: Error, errorInfo: any) => ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: any;
  deviceInfo: any;
  performanceStats: any;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      deviceInfo: null,
      performanceStats: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    };
  }

  async componentDidCatch(error: Error, errorInfo: any) {
    console.error('🚨 Error capturado por ErrorBoundary:', error);
    console.error('📋 Información del error:', errorInfo);

    try {
      // Recopilar información del dispositivo
      const deviceInfo = await DeviceDiagnostics.getDeviceInfo();
      const performanceStats = AndroidOptimizations.getPerformanceStats();

      this.setState({
        errorInfo,
        deviceInfo,
        performanceStats,
      });

      // Guardar información del error para análisis posterior
      await this.saveErrorReport(error, errorInfo, deviceInfo, performanceStats);
    } catch (reportError) {
      console.error('❌ Error al generar reporte de error:', reportError);
    }
  }

  private async saveErrorReport(
    error: Error,
    errorInfo: any,
    deviceInfo: any,
    performanceStats: any
  ): Promise<void> {
    try {
      const errorReport = {
        timestamp: new Date().toISOString(),
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack,
        },
        errorInfo,
        deviceInfo,
        performanceStats,
        appVersion: '1.0.0', // Debería venir de package.json
      };

      const reportKey = `error_report_${Date.now()}`;
      await AsyncStorage.setItem(reportKey, JSON.stringify(errorReport));
      console.log(`💾 Reporte de error guardado: ${reportKey}`);
    } catch (saveError) {
      console.error('❌ Error al guardar reporte:', saveError);
    }
  }

  private async handleRestart(): Promise<void> {
    try {
      // Limpiar estado de error
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        deviceInfo: null,
        performanceStats: null,
      });

      // Reiniciar optimizaciones
      AndroidOptimizations.reset();
      await AndroidOptimizations.setupAndroidOptimizations();

      console.log('🔄 Aplicación reiniciada');
    } catch (restartError) {
      console.error('❌ Error al reiniciar:', restartError);
      Alert.alert(
        'Error de Reinicio',
        'No se pudo reiniciar la aplicación. Por favor, cierre y abra la aplicación manualmente.'
      );
    }
  }

  private handleSendReport(): void {
    const { error, deviceInfo, performanceStats } = this.state;
    
    const reportText = `
Error: ${error?.name}
Mensaje: ${error?.message}
Dispositivo: ${deviceInfo?.model || 'Desconocido'}
Android: ${deviceInfo?.systemVersion || 'Desconocido'}
Memoria: ${performanceStats?.memoryWarnings || 0} advertencias
`;

    Alert.alert(
      'Reporte de Error',
      `Se ha generado un reporte de error:${reportText}\n¿Desea enviarlo al equipo de desarrollo?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Enviar', onPress: () => console.log('📧 Reporte enviado') },
      ]
    );
  }

  render() {
    if (this.state.hasError) {
      // Si se proporciona un fallback personalizado, usarlo
      if (this.props.fallback) {
        return this.props.fallback(this.state.error!, this.state.errorInfo);
      }

      // Fallback por defecto
      return (
        <View style={styles.container}>
          <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
            <Text style={styles.title}>🚨 Error de Aplicación</Text>
            <Text style={styles.subtitle}>
              La aplicación ha encontrado un error inesperado.
            </Text>

            <View style={styles.errorContainer}>
              <Text style={styles.errorTitle}>Detalles del Error:</Text>
              <Text style={styles.errorText}>
                {this.state.error?.name}: {this.state.error?.message}
              </Text>
            </View>

            {this.state.deviceInfo && (
              <View style={styles.infoContainer}>
                <Text style={styles.infoTitle}>Información del Dispositivo:</Text>
                <Text style={styles.infoText}>
                  Modelo: {this.state.deviceInfo.model}\n
                  Sistema: Android {this.state.deviceInfo.systemVersion}\n
                  Memoria: {this.state.performanceStats?.memoryWarnings || 0} advertencias
                </Text>
              </View>
            )}

            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.restartButton} onPress={() => this.handleRestart()}>
                <Text style={styles.buttonText}>🔄 Reintentar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.reportButton} onPress={() => this.handleSendReport()}>
                <Text style={styles.buttonText}>📧 Enviar Reporte</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100%',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#e74c3c',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  errorContainer: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#e74c3c',
    marginBottom: 20,
    width: '100%',
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#e74c3c',
    fontFamily: 'monospace',
  },
  infoContainer: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#3498db',
    marginBottom: 30,
    width: '100%',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#7f8c8d',
    lineHeight: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 15,
  },
  restartButton: {
    backgroundColor: '#27ae60',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    flex: 1,
  },
  reportButton: {
    backgroundColor: '#3498db',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    flex: 1,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});