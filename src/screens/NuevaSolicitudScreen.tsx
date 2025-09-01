import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Image, Dimensions } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from "../contexts/AuthContext";
import { requestsService } from "../services/requests.service";
import { useAlertUtils } from "../utils/alertUtils";
import { useAlertContext } from "../contexts/AlertContext";

type TipoSolicitud = 'prestamo' | 'inversion' | 'asesoria' | 'tarjeta';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface FormularioSolicitud {
  tipo: TipoSolicitud;
  monto: string;
  descripcion: string;
  tiempoPrestamo: string; // Tiempo de préstamo en meses
  fotoSolicitante: string | null; // URI de la foto del solicitante
}

export default function NuevaSolicitudScreen({ navigation }: { navigation: any }) {
  const { user } = useAuth();
  const { showSuccess, showError, showWarning } = useAlertUtils();
  const { showAlert } = useAlertContext();
  const [formulario, setFormulario] = useState<FormularioSolicitud>({
    tipo: 'prestamo',
    monto: '',
    descripcion: '',
    tiempoPrestamo: '',
    fotoSolicitante: null
  });

  const tiposSolicitud = [
    { id: 'prestamo', label: 'Préstamo Personal', icon: '💰' },
    { id: 'inversion', label: 'Nueva Inversión', icon: '📈' },
    { id: 'asesoria', label: 'Asesoría Financiera', icon: '👨‍💼' },
    { id: 'tarjeta', label: 'Tarjeta de Crédito', icon: '💳' }
  ];

  const seleccionarFoto = async () => {
    try {
      // Solicitar permisos
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        showWarning('Necesitamos acceso a tu galería para seleccionar una foto.', 'Permisos requeridos');
        return;
      }

      // Mostrar opciones usando el componente personalizado
      showAlert(
        'info',
        'Seleccionar foto',
        'Elige una opción: Cámara o Galería'
      );
      
      // Por ahora, usar directamente la galería como opción predeterminada
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      if (!result.canceled) {
        setFormulario({ ...formulario, fotoSolicitante: result.assets[0].uri });
      }
    } catch (error) {
      showError('No se pudo seleccionar la imagen');
    }
  };

  const handleSubmit = async () => {
    // Validaciones
    if (!formulario.monto || parseFloat(formulario.monto) <= 0) {
      showError('Por favor ingresa un monto válido');
      return;
    }

    if (!formulario.tiempoPrestamo || parseFloat(formulario.tiempoPrestamo) <= 0) {
      showError('Por favor ingresa un plazo válido en meses');
      return;
    }

    if (!formulario.descripcion.trim()) {
      showError('Por favor ingresa el destino o descripción del préstamo');
      return;
    }

    if (!formulario.fotoSolicitante) {
      showError('Por favor selecciona una foto del solicitante');
      return;
    }

    try {
      // Crear objeto de solicitud con la estructura exacta que requiere el endpoint publicar_solicitud
      const nuevaSolicitud = {
        post_author: user?.id?.toString() || '1',
        title: 'Solicitud de préstamo',
        content: 'Detalles generales de la solicitud',
        status: 'draft',
        post_type: 'solicitud_prestamo',
        monto_solicitado: formulario.monto.toString(),
        plazo_en_meses: formulario.tiempoPrestamo.toString(),
        destino_o_descripcion_del_prestamo: formulario.descripcion,
        foto_usuario: formulario.fotoSolicitante || 'https://example.com/uploads/foto.jpg'
      };

      console.log('🔄 Enviando nueva solicitud:', nuevaSolicitud);
      
      // Llamar al servicio para crear la solicitud
      const solicitudCreada = await requestsService.createSolicitud(nuevaSolicitud);
      
      console.log('✅ Solicitud creada exitosamente:', solicitudCreada);
      
      showSuccess('Tu solicitud ha sido enviada correctamente y está siendo revisada.', 'Éxito');
      
      // Limpiar formulario después del éxito
      setFormulario({
        tipo: 'prestamo',
        monto: '',
        descripcion: '',
        tiempoPrestamo: '',
        fotoSolicitante: null
      });
      
      // Navegar al dashboard después de un breve delay
      setTimeout(() => {
        navigation.navigate('Dashboard');
      }, 2000);
      
    } catch (error) {
      console.error('❌ Error al crear solicitud:', error);
      
      // Obtener mensaje de error específico
      const errorMessage = error instanceof Error ? error.message : 'No se pudo enviar tu solicitud. Por favor verifica tu conexión e intenta nuevamente.';
      
      showError(errorMessage);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Nueva Solicitud</Text>
          <View style={styles.headerSpacer} />
        </View>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>📋 Información Importante</Text>
          <Text style={styles.infoText}>
            • Tu solicitud será revisada en un plazo de 24-48 horas{"\n"}• Un
            asesor se pondrá en contacto contigo{"\n"}• Asegúrate de tener tu
            documentación lista
          </Text>
        </View>
        <Text style={styles.sectionTitle}>Detalles de la Solicitud</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Monto Solicitado *</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej: 50000"
            placeholderTextColor="#666"
            value={formulario.monto}
            onChangeText={(text) =>
              setFormulario({ ...formulario, monto: text })
            }
            keyboardType="numeric"
          />
          <Text style={styles.helpText}>
            Ingresa el monto que necesitas solicitar
          </Text>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Plazo en Meses *</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej: 12"
            placeholderTextColor="#666"
            value={formulario.tiempoPrestamo}
            onChangeText={(text) =>
              setFormulario({ ...formulario, tiempoPrestamo: text })
            }
            keyboardType="numeric"
          />
          <Text style={styles.helpText}>
            Especifica en cuántos meses planeas pagar el préstamo
          </Text>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>
            Destino o Descripción del Préstamo *
          </Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Describe para qué necesitas el préstamo..."
            placeholderTextColor="#666"
            value={formulario.descripcion}
            onChangeText={(text) =>
              setFormulario({ ...formulario, descripcion: text })
            }
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
          <Text style={styles.helpText}>
            Explica detalladamente el uso que le darás al préstamo
          </Text>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Foto del Solicitante *</Text>
          <TouchableOpacity
            style={styles.photoButton}
            onPress={seleccionarFoto}
          >
            {formulario.fotoSolicitante ? (
              <View style={styles.photoContainer}>
                <Image
                  source={{ uri: formulario.fotoSolicitante }}
                  style={styles.photoPreview}
                />
                <Text style={styles.photoButtonText}>Cambiar Foto</Text>
              </View>
            ) : (
              <View style={styles.photoPlaceholder}>
                <Text style={styles.photoIcon}>📷</Text>
                <Text style={styles.photoButtonText}>Seleccionar Foto</Text>
                <Text style={styles.photoHelpText}>
                  Toca para agregar tu foto
                </Text>
              </View>
            )}
          </TouchableOpacity>
          <Text style={styles.helpText}>
            Sube una foto clara de tu rostro para verificación de identidad
          </Text>
        </View>

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Enviar Solicitud</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    backgroundColor: "#48b783",
    padding: Math.min(screenWidth * 0.05, 20),
    paddingTop: Math.min(screenHeight * 0.06, 50),
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: Math.min(screenWidth * 0.02, 8),
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  headerTitle: {
    fontSize: Math.min(screenWidth * 0.055, 22),
    fontWeight: "bold",
    color: "#fff",
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  welcomeText: {
    fontSize: Math.min(screenWidth * 0.04, 16),
    color: "#fff",
    opacity: 0.9,
  },
  content: {
    flex: 1,
    padding: Math.min(screenWidth * 0.038, 15),
  },
  sectionTitle: {
    fontSize: Math.min(screenWidth * 0.045, 18),
    fontWeight: "bold",
    color: "#333",
    marginTop: Math.min(screenHeight * 0.012, 10),
    marginBottom: Math.min(screenHeight * 0.018, 15),
  },
  tiposContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: Math.min(screenHeight * 0.024, 20),
  },
  tipoCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: Math.min(screenWidth * 0.038, 15),
    width: "48%",
    alignItems: "center",
    marginBottom: Math.min(screenHeight * 0.012, 10),
    borderWidth: 2,
    borderColor: "#f0f0f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tipoCardSelected: {
    borderColor: "#48b783",
    backgroundColor: "#f0f8f4",
  },
  tipoIcon: {
    fontSize: Math.min(screenWidth * 0.06, 24),
    marginBottom: Math.min(screenHeight * 0.01, 8),
  },
  tipoLabel: {
    fontSize: Math.min(screenWidth * 0.035, 14),
    color: "#333",
    textAlign: "center",
    fontWeight: "500",
  },
  tipoLabelSelected: {
    color: "#48b783",
    fontWeight: "bold",
  },
  inputContainer: {
    marginBottom: Math.min(screenHeight * 0.024, 20),
  },
  inputLabel: {
    fontSize: Math.min(screenWidth * 0.04, 16),
    fontWeight: "bold",
    color: "#333",
    marginBottom: Math.min(screenHeight * 0.01, 8),
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: Math.min(screenWidth * 0.038, 15),
    fontSize: Math.min(screenWidth * 0.04, 16),
    borderWidth: 1,
    borderColor: "#e0e0e0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  textArea: {
    height: Math.min(screenHeight * 0.12, 100),
    textAlignVertical: "top",
  },
  helpText: {
    fontSize: Math.min(screenWidth * 0.03, 12),
    color: "#666",
    marginTop: Math.min(screenHeight * 0.006, 5),
    fontStyle: "italic",
  },
  infoCard: {
    backgroundColor: "#e3f2fd",
    borderRadius: 10,
    padding: Math.min(screenWidth * 0.038, 15),
    marginBottom: Math.min(screenHeight * 0.024, 20),
    borderLeftWidth: 4,
    borderLeftColor: "#2196f3",
  },
  infoTitle: {
    fontSize: Math.min(screenWidth * 0.04, 16),
    fontWeight: "bold",
    color: "#1976d2",
    marginBottom: Math.min(screenHeight * 0.01, 8),
  },
  infoText: {
    fontSize: Math.min(screenWidth * 0.035, 14),
    color: "#1976d2",
    lineHeight: Math.min(screenHeight * 0.024, 20),
  },
  submitButton: {
    backgroundColor: "#48b783",
    borderRadius: 10,
    padding: Math.min(screenWidth * 0.045, 18),
    alignItems: "center",
    marginBottom: Math.min(screenHeight * 0.036, 30),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: Math.min(screenWidth * 0.045, 18),
    fontWeight: "bold",
  },
  photoButton: {
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#e0e0e0",
    borderStyle: "dashed",
    padding: Math.min(screenWidth * 0.05, 20),
    alignItems: "center",
    justifyContent: "center",
    minHeight: Math.min(screenHeight * 0.14, 120),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  photoContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  photoPreview: {
    width: Math.min(screenWidth * 0.2, 80),
    height: Math.min(screenWidth * 0.2, 80),
    borderRadius: Math.min(screenWidth * 0.1, 40),
    marginBottom: Math.min(screenHeight * 0.012, 10),
  },
  photoPlaceholder: {
    alignItems: "center",
    justifyContent: "center",
  },
  photoIcon: {
    fontSize: Math.min(screenWidth * 0.08, 32),
    marginBottom: Math.min(screenHeight * 0.01, 8),
  },
  photoButtonText: {
    fontSize: Math.min(screenWidth * 0.04, 16),
    fontWeight: "600",
    color: "#48b783",
    marginBottom: Math.min(screenHeight * 0.005, 4),
  },
  photoHelpText: {
    fontSize: Math.min(screenWidth * 0.03, 12),
    color: "#666",
    textAlign: "center",
  },
});