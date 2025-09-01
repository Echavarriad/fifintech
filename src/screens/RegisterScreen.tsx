import React, { useState, useEffect } from "react";
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import * as ImagePicker from 'expo-image-picker';
import { RootStackParamList } from "../navigation/AppNavigator";
import { RegisterData } from "../models/auth.models";
import { authService } from "../services/auth.service";
import { useAlertUtils } from "../utils/alertUtils";
import { useAlertContext } from "../contexts/AlertContext";

type Props = NativeStackScreenProps<RootStackParamList, "Register">;

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function RegisterScreen({ navigation }: Props) {
  const [activeTab, setActiveTab] = useState<"Solicitante" | "inversionista">("Solicitante");
  const [isLoading, setIsLoading] = useState(false);
  const { showSuccess, showError, showWarning } = useAlertUtils();
  const { showAlert } = useAlertContext();
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [formData, setFormData] = useState<RegisterData & {
    name: string;
    lastName: string;
    identification: string;
    phoneNumber: string;
    confirmPassword: string;
    profileImage: string | null;
    documentFront: string | null;
    documentBack: string | null;
    usuario: string;
    acceptTerms: boolean;
    rol: string;
    direccion: string;
  }>({
    email: "",
    password: "",
    name: "",
    lastName: "",
    identification: "",
    phoneNumber: "",
    confirmPassword: "",
    profileImage: null,
    documentFront: null,
    documentBack: null,
    usuario: "",
    acceptTerms: false,
    rol: "Prestatario",
    direccion: ""
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const pickImage = async () => {
    try {
      console.log('Solicitando permisos para galería...');
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      console.log('Permisos de galería:', permissionResult);
      if (permissionResult.granted === false) {
        Alert.alert("Permisos requeridos", "Se necesitan permisos para acceder a la galería de fotos.");
        return;
      }

      console.log('Abriendo galería de imágenes...');
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: false,
        exif: false,
      });

      console.log('Resultado de galería:', result);
      if (!result.canceled && result.assets && result.assets.length > 0) {
        console.log('Imagen seleccionada:', result.assets[0].uri);
        setFormData(prev => ({ ...prev, profileImage: result.assets[0].uri }));
        showSuccess("Imagen de perfil agregada correctamente");
      } else {
        console.log('Selección de imagen cancelada');
      }
    } catch (error) {
      console.error('Error al seleccionar imagen:', error);
      showError("Error al seleccionar imagen de la galería");
    }
  };

  const takePhoto = async () => {
    try {
      console.log('Solicitando permisos para cámara...');
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      
      console.log('Permisos de cámara:', permissionResult);
      if (permissionResult.granted === false) {
        Alert.alert("Permisos requeridos", "Se necesitan permisos para acceder a la cámara.");
        return;
      }

      console.log('Abriendo cámara para foto de perfil...');
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: false,
        exif: false,
      });

      console.log('Resultado de cámara:', result);
      if (!result.canceled && result.assets && result.assets.length > 0) {
        console.log('Foto de perfil tomada:', result.assets[0].uri);
        setFormData(prev => ({ ...prev, profileImage: result.assets[0].uri }));
        showSuccess("Foto de perfil tomada correctamente");
      } else {
        console.log('Toma de foto cancelada');
      }
    } catch (error) {
      console.error('Error al tomar foto:', error);
      showError("Error al tomar foto con la cámara");
    }
  };

  const pickDocument = async (documentType: 'front' | 'back') => {
    try {
      console.log(`Solicitando permisos para galería (documento ${documentType})...`);
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      console.log('Permisos de galería para documento:', permissionResult);
      if (permissionResult.granted === false) {
        Alert.alert("Permisos requeridos", "Se necesitan permisos para acceder a la galería de fotos.");
        return;
      }

      console.log(`Abriendo galería para documento ${documentType}...`);
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        base64: false,
        exif: false,
      });

      console.log(`Resultado de galería para documento ${documentType}:`, result);
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const field = documentType === 'front' ? 'documentFront' : 'documentBack';
        const documentName = documentType === 'front' ? 'frontal' : 'trasero';
        console.log(`Documento ${documentName} seleccionado:`, result.assets[0].uri);
        setFormData(prev => ({ ...prev, [field]: result.assets[0].uri }));
        showSuccess(`Documento ${documentName} agregado correctamente`);
      } else {
        console.log(`Selección de documento ${documentType} cancelada`);
      }
    } catch (error) {
      console.error(`Error al seleccionar documento ${documentType}:`, error);
      showError(`Error al seleccionar documento de la galería`);
    }
  };

  const takeDocumentPhoto = async (documentType: 'front' | 'back') => {
    try {
      console.log(`Solicitando permisos para cámara (documento ${documentType})...`);
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      
      console.log('Permisos de cámara para documento:', permissionResult);
      if (permissionResult.granted === false) {
        showAlert('warning', 'Permisos requeridos', 'Se necesitan permisos para acceder a la cámara.');
        return;
      }

      console.log(`Abriendo cámara para documento ${documentType}...`);
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        base64: false,
        exif: false,
      });

      console.log(`Resultado de cámara para documento ${documentType}:`, result);
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const field = documentType === 'front' ? 'documentFront' : 'documentBack';
        const documentName = documentType === 'front' ? 'frontal' : 'trasero';
        console.log(`Foto de documento ${documentName} tomada:`, result.assets[0].uri);
        setFormData(prev => ({ ...prev, [field]: result.assets[0].uri }));
        showSuccess(`Foto de documento ${documentName} tomada correctamente`);
      } else {
        console.log(`Toma de foto de documento ${documentType} cancelada`);
      }
    } catch (error) {
      console.error(`Error al tomar foto del documento ${documentType}:`, error);
      showError(`Error al tomar foto del documento con la cámara`);
    }
  };

  const showImageOptions = () => {
    console.log('Usuario seleccionó galería para imagen de perfil');
    pickImage();
  };

  const showDocumentOptions = (documentType: 'front' | 'back') => {
    console.log(`Usuario seleccionó galería para documento ${documentType}`);
    pickDocument(documentType);
  };

  const validateForm = (): boolean => {
    // Debug: Mostrar valores de los campos
    console.log('Validando formulario:', {
      name: formData.name,
      lastName: formData.lastName,
      email: formData.email,
      password: formData.password ? '***' : '',
      confirmPassword: formData.confirmPassword ? '***' : '',
      usuario: formData.usuario,
      direccion: formData.direccion,
      activeTab: activeTab,
      documentFront: formData.documentFront ? 'presente' : 'ausente',
      documentBack: formData.documentBack ? 'presente' : 'ausente',
      rol: formData.rol
    });

    // Validar campos obligatorios
    const missingFields = [];
    if (!formData.name) missingFields.push('nombre');
    if (!formData.lastName) missingFields.push('apellidos');
    if (!formData.email) missingFields.push('email');
    if (!formData.password) missingFields.push('contraseña');
    if (!formData.confirmPassword) missingFields.push('confirmar contraseña');
    if (!formData.usuario) missingFields.push('usuario');
    
    if (missingFields.length > 0) {
      console.log('Campos faltantes:', missingFields);
      showWarning(`Faltan los siguientes campos: ${missingFields.join(', ')}`, "Campos incompletos");
      return false;
    }

    // Validar términos y condiciones solo para solicitantes
    if (activeTab === "Solicitante" && !formData.acceptTerms) {
      showWarning("Debes aceptar los términos y condiciones para continuar", "Términos requeridos");
      return false;
    }

    // Validar documentos e imágenes solo para solicitantes
    if (activeTab === "Solicitante") {
      if (!formData.documentFront) {
        showWarning("El documento frontal es obligatorio para solicitantes", "Documento faltante");
        return false;
      }
      if (!formData.documentBack) {
        showWarning("El documento trasero es obligatorio para solicitantes", "Documento faltante");
        return false;
      }
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      showWarning("Por favor ingrese un correo electrónico válido", "Formato inválido");
      return false;
    }

    // Validar contraseña
    if (formData.password.length < 6) {
      showWarning("La contraseña debe tener al menos 6 caracteres", "Contraseña débil");
      return false;
    }

    // Validar que las contraseñas coincidan
    if (formData.password !== formData.confirmPassword) {
      showWarning("Las contraseñas no coinciden", "Error de verificación");
      return false;
    }

    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;
    
    try {
      setIsLoading(true);
      
      // Crear objeto de registro con el formato específico requerido
      // Intercambiar roles: Prestamista -> Solicitante, Prestatario -> Prestamista
      let mappedRole = formData.rol;
      if (formData.rol === 'Prestamista') {
        mappedRole = 'Solicitante';
      } else if (formData.rol === 'Prestatario') {
        mappedRole = 'Prestamista';
      }
      
      const registerData = {
        username: formData.usuario,
        name: formData.name,
        lastname: formData.lastName,
        "no.identiti": formData.identification,
        email: formData.email,
        phone: formData.phoneNumber,
        password: formData.password,
        password2: formData.confirmPassword,
        address: formData.direccion,
        photo: activeTab === "Solicitante" ? (formData.profileImage || "") : "",
        photo_document_front: activeTab === "Solicitante" ? (formData.documentFront || "") : "",
        photo_document_lat: activeTab === "Solicitante" ? (formData.documentBack || "") : "",
        role: mappedRole,
        tyc: formData.acceptTerms
      };
      
      console.log('Datos de registro a enviar:', registerData);
      
      // Llamar al servicio de registro
      await authService.register(registerData);
      
      showSuccess("Registro exitoso. Por favor inicie sesión con sus credenciales", "¡Registro Completado!");
      
      // Navegar a la pantalla de Login después del registro exitoso
      navigation.navigate("Login");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido en el registro';
      showError(errorMessage, "Error de registro");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        bounces={true}
        keyboardDismissMode="on-drag"
      >
        <View style={styles.container}>
          <View style={styles.contentLogo}>
            <Image
              source={require("../../assets/FiFintech.Co.png")}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>

          <View style={styles.tabs}>
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === "Solicitante" && styles.tabActive,
              ]}
              onPress={() => {
                setActiveTab("Solicitante");
                setFormData((prev) => ({ ...prev, rol: "Prestatario" }));
              }}
              disabled={isLoading}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === "Solicitante" && styles.tabTextActive,
                ]}
              >
                Solicitante
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === "inversionista" && styles.tabActive,
              ]}
              onPress={() => {
                setActiveTab("inversionista");
                setFormData((prev) => ({ ...prev, rol: "Prestamista" }));
              }}
              disabled={isLoading}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === "inversionista" && styles.tabTextActive,
                ]}
              >
                Inversionista
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.title}>Registro {activeTab}</Text>

          {/* Sección de foto de perfil - Solo para solicitantes */}
          {activeTab === "Solicitante" && (
            <View style={styles.profileImageSection}>
              <TouchableOpacity
                style={styles.profileImageContainer}
                onPress={showImageOptions}
                disabled={isLoading}
              >
                {formData.profileImage ? (
                  <Image
                    source={{ uri: formData.profileImage }}
                    style={styles.profileImage}
                  />
                ) : (
                  <View style={styles.profileImagePlaceholder}>
                    <Text style={styles.profileImageText}>📷</Text>
                    <Text style={styles.profileImageLabel}>Agregar foto</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          )}

          {/* Sección de documentos - Solo para solicitantes */}
          {activeTab === "Solicitante" && (
            <View style={styles.documentsSection}>
              <Text style={styles.documentsTitle}>
                Documentos de Identificación
              </Text>

              {/* Documento Frontal */}
              <View style={styles.documentContainer}>
                <Text style={styles.fieldLabel}>Documento Frontal *</Text>
                <TouchableOpacity
                  style={styles.documentImageContainer}
                  onPress={() => showDocumentOptions("front")}
                  disabled={isLoading}
                >
                  {formData.documentFront ? (
                    <Image
                      source={{ uri: formData.documentFront }}
                      style={styles.documentImage}
                    />
                  ) : (
                    <View style={styles.documentImagePlaceholder}>
                      <Text style={styles.documentImageText}>📄</Text>
                      <Text style={styles.documentImageLabel}>
                        Agregar documento frontal
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>

              {/* Documento Trasero */}
              <View style={styles.documentContainer}>
                <Text style={styles.fieldLabel}>Documento Trasero *</Text>
                <TouchableOpacity
                  style={styles.documentImageContainer}
                  onPress={() => showDocumentOptions("back")}
                  disabled={isLoading}
                >
                  {formData.documentBack ? (
                    <Image
                      source={{ uri: formData.documentBack }}
                      style={styles.documentImage}
                    />
                  ) : (
                    <View style={styles.documentImagePlaceholder}>
                      <Text style={styles.documentImageText}>📄</Text>
                      <Text style={styles.documentImageLabel}>
                        Agregar documento trasero
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}

          <View style={styles.formContainer}>
            {/* Fila de nombre y apellidos */}
            <View style={styles.rowContainer}>
              <View style={styles.halfFieldContainer}>
                <Text style={styles.fieldLabel}>Nombre *</Text>
                <TextInput
                  placeholder="Nombre"
                  placeholderTextColor="#666"
                  style={styles.inputHalf}
                  value={formData.name}
                  onChangeText={(text) => handleInputChange("name", text)}
                  editable={!isLoading}
                />
              </View>

              <View style={styles.halfFieldContainer}>
                <Text style={styles.fieldLabel}>Apellidos *</Text>
                <TextInput
                  placeholder="Apellidos"
                  placeholderTextColor="#666"
                  style={styles.inputHalf}
                  value={formData.lastName}
                  onChangeText={(text) => handleInputChange("lastName", text)}
                  editable={!isLoading}
                />
              </View>
            </View>

            {/* Campo de usuario completo */}
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Usuario *</Text>
              <TextInput
                placeholder="Nombre de usuario"
                placeholderTextColor="#666"
                style={styles.input}
                value={formData.usuario}
                onChangeText={(text) => handleInputChange("usuario", text)}
                autoCapitalize="none"
                editable={!isLoading}
              />
            </View>

            {/* Fila de identificación y teléfono */}
            <View style={styles.rowContainer}>
              <View style={styles.halfFieldContainer}>
                <Text style={styles.fieldLabel}>Identificación</Text>
                <TextInput
                  placeholder="No. ID"
                  placeholderTextColor="#666"
                  style={styles.inputHalf}
                  value={formData.identification}
                  onChangeText={(text) =>
                    handleInputChange("identification", text)
                  }
                  keyboardType="numeric"
                  editable={!isLoading}
                />
              </View>

              <View style={styles.halfFieldContainer}>
                <Text style={styles.fieldLabel}>Teléfono</Text>
                <TextInput
                  placeholder="No. teléfono"
                  placeholderTextColor="#666"
                  style={styles.inputHalf}
                  value={formData.phoneNumber}
                  onChangeText={(text) =>
                    handleInputChange("phoneNumber", text)
                  }
                  keyboardType="phone-pad"
                  editable={!isLoading}
                />
              </View>
            </View>

            {/* Campo de email completo */}
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Correo electrónico *</Text>
              <TextInput
                placeholder="ejemplo@correo.com"
                placeholderTextColor="#666"
                style={styles.input}
                value={formData.email}
                onChangeText={(text) => handleInputChange("email", text)}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!isLoading}
              />
            </View>

            {/* Campo de dirección completo */}
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Dirección</Text>
              <TextInput
                placeholder="Ingrese su dirección"
                placeholderTextColor="#666"
                style={styles.input}
                value={formData.direccion}
                onChangeText={(text) => handleInputChange("direccion", text)}
                editable={!isLoading}
                multiline={true}
                numberOfLines={2}
              />
            </View>

            {/* Fila de contraseñas */}
            <View style={styles.rowContainer}>
              <View style={styles.halfFieldContainer}>
                <Text style={styles.fieldLabel}>Contraseña *</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    placeholder="Contraseña"
                    placeholderTextColor="#666"
                    style={styles.passwordInput}
                    secureTextEntry={!showPassword}
                    value={formData.password}
                    onChangeText={(text) => handleInputChange("password", text)}
                    editable={!isLoading}
                    textContentType="newPassword"
                    autoComplete="password-new"
                    autoCorrect={false}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    style={styles.eyeIcon}
                    onPress={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={showPassword ? "eye-off-outline" : "eye-outline"}
                      size={22}
                      color="#666"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.halfFieldContainer}>
                <Text style={styles.fieldLabel}>Confirmar *</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    placeholder="Confirmar"
                    placeholderTextColor="#666"
                    style={styles.passwordInput}
                    secureTextEntry={!showConfirmPassword}
                    value={formData.confirmPassword}
                    onChangeText={(text) =>
                      handleInputChange("confirmPassword", text)
                    }
                    editable={!isLoading}
                    textContentType="newPassword"
                    autoComplete="password-new"
                    autoCorrect={false}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    style={styles.eyeIcon}
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={isLoading}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
                      size={22}
                      color="#666"
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>

          {/* Checkbox de términos y condiciones - solo para solicitantes */}
          {activeTab === "Solicitante" && (
            <View style={styles.termsContainer}>
              <TouchableOpacity
                style={styles.checkboxContainer}
                onPress={() =>
                  setFormData({ ...formData, acceptTerms: !formData.acceptTerms })
                }
              >
                <View
                  style={[
                    styles.checkbox,
                    formData.acceptTerms && styles.checkboxChecked,
                  ]}
                >
                  {formData.acceptTerms && (
                    <Ionicons name="checkmark" size={16} color="#fff" />
                  )}
                </View>
                <Text style={styles.termsText}>
                  Acepto los{" "}
                  <Text style={styles.termsLink}>términos y condiciones</Text>
                </Text>
              </TouchableOpacity>
            </View>
          )}

          <TouchableOpacity
            style={[styles.submit, isLoading && styles.submitDisabled]}
            onPress={handleRegister}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.submitText}>Registrarse</Text>
            )}
          </TouchableOpacity>

          <View style={styles.contentFooter}>
            <Text
              onPress={() => navigation.navigate("Login")}
              style={styles.link}
            >
              ¿Ya tienes cuenta? Iniciar sesión
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: "#ffffff",
    paddingBottom: 30, // Reducido para evitar espacios excesivos
  },
  container: {
    padding: 20,
    justifyContent: "flex-start",
    alignItems: "center",
    backgroundColor: "#ffffff",
  },
  formContainer: {
    width: "100%",
    marginBottom: 20,
  },
  fieldContainer: {
    width: "100%",
    marginBottom: 10,
  },
  fieldLabel: {
    color: "#48b783",
    marginBottom: 5,
    fontWeight: "bold",
    fontSize: 16,
  },
  // Estilos para distribución de campos en filas
  rowContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 10,
  },
  halfFieldContainer: {
    width: "48%",
  },
  inputHalf: {
    borderWidth: 1,
    padding: 15,
    borderRadius: 12,
    height: 60,
    backgroundColor: "#f9f9f9",
    color: "#333",
    borderColor: "#48b783",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    fontSize: 16,
  },
  // Estilos para la sección de imagen de perfil
  profileImageSection: {
    alignItems: "center",
    marginBottom: 20,
  },
  profileImageContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  profileImage: {
    width: 110,
    height: 110,
    borderRadius: 55,
  },
  profileImagePlaceholder: {
    justifyContent: "center",
    alignItems: "center",
  },
  profileImageText: {
    fontSize: 30,
    marginBottom: 5,
  },
  profileImageLabel: {
    fontSize: 12,
    color: "#666",
    fontWeight: "bold",
  },
  documentsSection: {
    width: "100%",
    marginBottom: 20,
    alignItems: "center",
  },
  documentsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#48b783",
    marginBottom: 15,
    textAlign: "center",
  },
  documentContainer: {
    width: "100%",
    marginBottom: 15,
    alignItems: "center",
  },
  documentImageContainer: {
    width: 200,
    height: 120,
    borderRadius: 12,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    borderWidth: 2,
    borderColor: "#48b783",
    borderStyle: "dashed",
  },
  documentImage: {
    width: 190,
    height: 110,
    borderRadius: 8,
  },
  documentImagePlaceholder: {
    justifyContent: "center",
    alignItems: "center",
  },
  documentImageText: {
    fontSize: 24,
    marginBottom: 5,
  },
  documentImageLabel: {
    fontSize: 12,
    color: "#666",
    fontWeight: "bold",
    textAlign: "center",
  },
  contentLogo: {
    alignItems: "center",
    marginBottom: 40,
  },
  logoImage: {
    width: Math.min(screenWidth * 0.5, 200),
    height: Math.min(screenWidth * 0.5, 200),
    marginVertical: 3,
  },
  tabs: {
    flexDirection: "row",
    marginBottom: 10,
    backgroundColor: "#fff",
    borderRadius: 10,
    overflow: "hidden",
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: "#ddd",
    alignItems: "center",
  },
  tabActive: {
    backgroundColor: "#0d2024",
  },
  tabText: {
    color: "#666",
    fontWeight: "bold",
  },
  tabTextActive: {
    color: "#fff",
    fontWeight: "bold",
  },
  title: {
    fontSize: Math.min(screenWidth * 0.055, 22),
    fontFamily: "Kanit",
    marginBottom: 30,
    textAlign: "center",
    color: "#48b783",
    fontWeight: "bold",
    textShadowColor: "rgba(0, 0, 0, 0.1)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  input: {
    borderWidth: 1,
    marginBottom: 20,
    padding: 15,
    borderRadius: 12,
    width: "95%",
    height: 60,
    backgroundColor: "#f9f9f9",
    color: "#333",
    borderColor: "#48b783",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    fontSize: 16,
  },
  submit: {
    backgroundColor: "#48b783",
    width: "90%",
    paddingVertical: 15,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  submitDisabled: {
    backgroundColor: "#a5d5bc",
    shadowOpacity: 0.1,
    elevation: 2,
  },
  submitText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  contentFooter: {
    marginTop: 30,
    marginBottom: 50,
    width: "100%",
    alignItems: "center",
  },
  link: {
    marginTop: 15,
    color: "#48b783",
    textDecorationLine: "none",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "bold",
  },
  passwordContainer: {
    position: "relative",
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
  },
  passwordInput: {
    flex: 1,
    borderWidth: 1,
    padding: 15,
    paddingRight: 45,
    borderRadius: 12,
    height: 60,
    backgroundColor: "#f9f9f9",
    color: "#333",
    borderColor: "#48b783",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    fontSize: 16,
  },
  eyeIcon: {
    position: "absolute",
    right: 8,
    top: 10,
    zIndex: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 40,
    minHeight: 40,
  },
  termsContainer: {
    width: "90%",
    marginTop: 15,
    marginBottom: 10,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: "#48b783",
    borderRadius: 4,
    marginRight: 10,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  checkboxChecked: {
    backgroundColor: "#48b783",
  },
  termsText: {
    fontSize: 14,
    color: "#333",
    flex: 1,
  },
  termsLink: {
    color: "#48b783",
    fontWeight: "bold",
    textDecorationLine: "underline",
  },
});
