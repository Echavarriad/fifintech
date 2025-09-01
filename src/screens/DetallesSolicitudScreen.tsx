import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Modal,
  TextInput,
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { requestsService, Solicitud } from '../services/requests.service';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface DetallesSolicitudScreenProps {
  navigation: any;
  route: {
    params: {
      solicitudId: string | number;
    };
  };
}

const DetallesSolicitudScreen: React.FC<DetallesSolicitudScreenProps> = ({ navigation, route }) => {
  const { solicitudId } = route.params;
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [comprobante, setComprobante] = useState<string | null>(null);
  const [referencia, setReferencia] = useState('');
  
  // Estados para los datos de la solicitud
  const [solicitud, setSolicitud] = useState<Solicitud | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar datos de la solicitud
  useEffect(() => {
    const cargarSolicitud = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const solicitudData = await requestsService.getSolicitudById(solicitudId);
        
        if (solicitudData) {
          setSolicitud(solicitudData);
        } else {
          setError('No se encontró la solicitud');
        }
      } catch (err) {
        console.error('Error al cargar solicitud:', err);
        setError('Error al cargar los datos de la solicitud');
      } finally {
        setLoading(false);
      }
    };

    if (solicitudId) {
      cargarSolicitud();
    }
  }, [solicitudId]);

  // Datos por defecto si no se encuentra la solicitud
  const montoSolicitud = parseInt(solicitud?.meta?.monto_solicitado || solicitud?.meta?._monto_solicitado || '1000000');
  const plazoMeses = parseInt(solicitud?.meta?.plazo_en_meses || solicitud?.meta?._plazo_en_meses || '12');
  const tasaAnual = 0.30; // 30% anual
  const tasaMensual = tasaAnual / 12; // 2.5% mensual
  
  // Calcular cuota fija usando la fórmula de anualidad
  // Cuota = P × i / (1 - (1 + i)^(-n))
  const calcularCuotaFija = (principal: number, tasaMensual: number, meses: number) => {
    const numerador = principal * tasaMensual;
    const denominador = 1 - Math.pow(1 + tasaMensual, -meses);
    return numerador / denominador;
  };
  
  const cuotaFija = calcularCuotaFija(montoSolicitud, tasaMensual, plazoMeses);
  const cuotaMensual = cuotaFija;

  // Generar tabla de amortización
  const generarTablaAmortizacion = () => {
    const tabla = [];
    let saldoPendiente = montoSolicitud;
    
    // Obtener fecha de desembolso desde post_modified de la solicitud
    let fechaDesembolso = new Date();
    if (solicitud?.post_modified) {
      fechaDesembolso = new Date(solicitud.post_modified);
    }
    
    for (let i = 1; i <= plazoMeses; i++) {
      // Calcular interés sobre el saldo pendiente
      const interes = saldoPendiente * tasaMensual;
      
      // Capital es la cuota fija menos el interés
      const capital = cuotaFija - interes;
      
      // Calcular fecha de cada cuota
      const fechaCuota = new Date(fechaDesembolso);
      if (i === 1) {
        // La primera cuota tiene la fecha de desembolso
        fechaCuota.setTime(fechaDesembolso.getTime());
      } else {
        // Las siguientes cuotas son mes a mes desde la fecha de desembolso
        fechaCuota.setMonth(fechaDesembolso.getMonth() + (i - 1));
      }
      
      // Calcular mora basada en días de atraso
      const fechaActual = new Date();
      const diasAtraso = Math.max(0, Math.floor((fechaActual.getTime() - fechaCuota.getTime()) / (1000 * 60 * 60 * 24)));
      const tasaMoraDiaria = 0.0005; // 0.05% diario
      const mora = diasAtraso > 0 ? cuotaFija * tasaMoraDiaria * diasAtraso : 0;
      
      // Actualizar saldo pendiente después de descontar el capital
      saldoPendiente -= capital;
      
      // Formatear fecha en formato YYYY-MM-DD
      const fechaFormateada = fechaCuota.getFullYear() + '-' + 
        String(fechaCuota.getMonth() + 1).padStart(2, '0') + '-' + 
        String(fechaCuota.getDate()).padStart(2, '0');
      
      // Determinar estado basado en días de atraso
      let estado = 'Pendiente';
      if (diasAtraso > 0) {
        estado = `Atrasada (${diasAtraso} días)`;
      }
      
      tabla.push({
        numero: i,
        fecha: fechaFormateada,
        cuota: Math.round(cuotaFija),
        capital: Math.round(capital),
        interes: Math.round(interes),
        mora: Math.round(mora),
        saldo: Math.max(0, Math.round(saldoPendiente)),
        estado: estado
      });
    }
    
    return tabla;
  };

  const tablaAmortizacion = generarTablaAmortizacion();

  const formatearMonto = (monto: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(monto);
  };

  const seleccionarImagen = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert('Error', 'Se requieren permisos para acceder a la galería');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setComprobante(result.assets[0].uri);
    }
  };

  const procesarPago = () => {
    if (!comprobante || !referencia.trim()) {
      Alert.alert('Error', 'Por favor complete todos los campos');
      return;
    }

    Alert.alert(
      'Pago Enviado',
      'Su comprobante de pago ha sido enviado para verificación. Recibirá una notificación cuando sea procesado.',
      [{ text: 'OK', onPress: () => {
        setModalVisible(false);
        setComprobante(null);
        setReferencia('');
        setSelectedPayment(null);
      }}]
    );
  };

  const abrirModalPago = (pago: any) => {
    setSelectedPayment(pago);
    setModalVisible(true);
  };

  // Mostrar loading
  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Tabla de Amortización</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#48b783" />
          <Text style={styles.comingSoonText}>Cargando datos de la solicitud...</Text>
        </View>
      </View>
    );
  }

  // Mostrar error
  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Tabla de Amortización</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.centerContainer}>
          <Ionicons name="alert-circle" size={48} color="#FF3B30" />
          <Text style={styles.comingSoonTitle}>Error</Text>
          <Text style={styles.comingSoonText}>{error}</Text>
          <TouchableOpacity
            style={styles.submitButton}
            onPress={() => {
              setError(null);
              setLoading(true);
              // Recargar datos
            }}
          >
            <Text style={styles.submitButtonText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tabla de Amortización</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Content */}
      <ScrollView style={styles.content}>
        {/* Información del préstamo */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Información del Préstamo</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Monto:</Text>
            <Text style={styles.infoValue}>{formatearMonto(montoSolicitud)}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Plazo:</Text>
            <Text style={styles.infoValue}>{plazoMeses} meses</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Tasa de Interés:</Text>
            <Text style={styles.infoValue}>30%</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Cuota Mensual:</Text>
            <Text style={styles.infoValue}>{formatearMonto(cuotaMensual)}</Text>
          </View>
        </View>

        {/* Tabla de amortización */}
        <View style={styles.tableContainer}>
          <Text style={styles.tableTitle}>Cronograma de Pagos</Text>
          
          {/* Header de la tabla */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableHeaderText, styles.colNumero]}>#</Text>
                <Text style={[styles.tableHeaderText, styles.colFecha]}>Fecha</Text>
                <Text style={[styles.tableHeaderText, styles.colCuota]}>Cuota</Text>
                <Text style={[styles.tableHeaderText, styles.colCapital]}>Capital</Text>
                <Text style={[styles.tableHeaderText, styles.colInteres]}>Interés</Text>
                <Text style={[styles.tableHeaderText, styles.colMora]}>Mora</Text>
                <Text style={[styles.tableHeaderText, styles.colSaldo]}>Saldo</Text>
                <Text style={[styles.tableHeaderText, styles.colEstado]}>Estado</Text>
                <Text style={[styles.tableHeaderText, styles.colAccion]}>Acción</Text>
              </View>
              
              {/* Filas de la tabla */}
              {tablaAmortizacion.map((pago, index) => (
                <View key={index} style={[styles.tableRow, index % 2 === 0 && styles.tableRowEven]}>
                  <Text style={[styles.tableCellText, styles.colNumero]}>{pago.numero}</Text>
                  <Text style={[styles.tableCellText, styles.colFecha]}>{pago.fecha}</Text>
                  <Text style={[styles.tableCellText, styles.colCuota]}>{formatearMonto(pago.cuota)}</Text>
                  <Text style={[styles.tableCellText, styles.colCapital]}>{formatearMonto(pago.capital)}</Text>
                  <Text style={[styles.tableCellText, styles.colInteres]}>{formatearMonto(pago.interes)}</Text>
                  <Text style={[styles.tableCellText, styles.colMora, pago.mora > 0 && styles.moraText]}>
                    {pago.mora > 0 ? formatearMonto(pago.mora) : '$0'}
                  </Text>
                  <Text style={[styles.tableCellText, styles.colSaldo]}>{formatearMonto(pago.saldo)}</Text>
                  <Text style={[styles.tableCellText, styles.colEstado, 
                    pago.estado.includes('Atrasada') && styles.estadoAtrasado,
                    pago.estado === 'Pendiente' && styles.estadoPendiente
                  ]}>
                    {pago.estado}
                  </Text>
                  <TouchableOpacity 
                    style={styles.pagarButton}
                    onPress={() => abrirModalPago(pago)}
                  >
                    <Text style={styles.pagarButtonText}>Pagar</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
      </ScrollView>

      {/* Modal de Pago */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Realizar Pago</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {selectedPayment && (
                <View style={styles.paymentInfo}>
                  <Text style={styles.paymentInfoTitle}>Detalles del Pago</Text>
                  <View style={styles.paymentInfoRow}>
                    <Text style={styles.paymentInfoLabel}>Cuota #:</Text>
                    <Text style={styles.paymentInfoValue}>{selectedPayment.numero}</Text>
                  </View>
                  <View style={styles.paymentInfoRow}>
                    <Text style={styles.paymentInfoLabel}>Monto:</Text>
                    <Text style={styles.paymentInfoValue}>{formatearMonto(selectedPayment.cuota + selectedPayment.mora)}</Text>
                  </View>
                  <View style={styles.paymentInfoRow}>
                    <Text style={styles.paymentInfoLabel}>Fecha Vencimiento:</Text>
                    <Text style={styles.paymentInfoValue}>{selectedPayment.fecha}</Text>
                  </View>
                </View>
              )}

              <View style={styles.accountInfo}>
                <Text style={styles.accountInfoTitle}>Datos de Cuenta</Text>
                <Text style={styles.accountInfoText}>Banco: Banco de Prueba</Text>
                <Text style={styles.accountInfoText}>Cuenta: 1234567890</Text>
                <Text style={styles.accountInfoText}>Tipo: Ahorros</Text>
                <Text style={styles.accountInfoText}>Titular: FiFintech S.A.S</Text>
              </View>

              <View style={styles.uploadSection}>
                <Text style={styles.uploadTitle}>Comprobante de Pago</Text>
                <TouchableOpacity style={styles.uploadButton} onPress={seleccionarImagen}>
                  <Ionicons name="cloud-upload-outline" size={24} color="#48b783" />
                  <Text style={styles.uploadButtonText}>Seleccionar Imagen</Text>
                </TouchableOpacity>
                
                {comprobante && (
                  <View style={styles.imagePreview}>
                    <Image source={{ uri: comprobante }} style={styles.previewImage} />
                    <TouchableOpacity 
                      style={styles.removeImageButton}
                      onPress={() => setComprobante(null)}
                    >
                      <Ionicons name="close-circle" size={20} color="#ff4444" />
                    </TouchableOpacity>
                  </View>
                )}
              </View>

              <View style={styles.referenceSection}>
                <Text style={styles.referenceTitle}>Número de Referencia</Text>
                <TextInput
                  style={styles.referenceInput}
                  placeholder="Ingrese el número de referencia del pago"
                  value={referencia}
                  onChangeText={setReferencia}
                />
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.submitButton}
                onPress={procesarPago}
              >
                <Text style={styles.submitButtonText}>Enviar Pago</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#48b783',
    padding: Math.min(screenWidth * 0.05, 20),
    paddingTop: Math.min(screenHeight * 0.06, 50),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: Math.min(screenWidth * 0.05, 20),
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: Math.min(screenWidth * 0.05, 20),
  },
  // Información del préstamo
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  infoLabel: {
    fontSize: 16,
    color: '#666',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  // Tabla de amortización
  tableContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tableTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#48b783',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  tableHeaderText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    alignItems: 'center',
  },
  tableRowEven: {
    backgroundColor: '#f9f9f9',
  },
  tableCellText: {
    fontSize: 11,
    color: '#333',
    textAlign: 'center',
  },
  // Columnas de la tabla
  colNumero: { width: 40 },
  colFecha: { width: 80 },
  colCuota: { width: 80 },
  colCapital: { width: 80 },
  colInteres: { width: 70 },
  colMora: { width: 60 },
  colSaldo: { width: 80 },
  colEstado: { width: 100 },
  colAccion: { width: 70 },
  // Estilos especiales
  moraText: {
    color: '#ff4444',
    fontWeight: 'bold',
  },
  estadoAtrasado: {
    color: '#ff4444',
    fontWeight: 'bold',
  },
  estadoPendiente: {
    color: '#ff9500',
  },
  pagarButton: {
    backgroundColor: '#48b783',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    width: 60,
    alignItems: 'center',
  },
  pagarButtonText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  // Modal de pago
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    width: '90%',
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  modalBody: {
    padding: 20,
  },
  paymentInfo: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
  },
  paymentInfoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  paymentInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  paymentInfoLabel: {
    fontSize: 14,
    color: '#666',
  },
  paymentInfoValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  accountInfo: {
    backgroundColor: '#e8f5e8',
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
  },
  accountInfoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#48b783',
    marginBottom: 10,
  },
  accountInfoText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 3,
  },
  uploadSection: {
    marginBottom: 20,
  },
  uploadTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  uploadButton: {
    borderWidth: 2,
    borderColor: '#48b783',
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#f8fff8',
  },
  uploadButtonText: {
    color: '#48b783',
    fontSize: 14,
    fontWeight: '500',
    marginTop: 5,
  },
  imagePreview: {
    marginTop: 15,
    position: 'relative',
    alignItems: 'center',
  },
  previewImage: {
    width: 200,
    height: 150,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  removeImageButton: {
    position: 'absolute',
    top: -5,
    right: 70,
    backgroundColor: '#fff',
    borderRadius: 10,
  },
  referenceSection: {
    marginBottom: 20,
  },
  referenceTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  referenceInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    backgroundColor: '#fff',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingVertical: 12,
    borderRadius: 8,
    marginRight: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },
  submitButton: {
    flex: 1,
    backgroundColor: '#48b783',
    paddingVertical: 12,
    borderRadius: 8,
    marginLeft: 10,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: '#FF3B30',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default DetallesSolicitudScreen;