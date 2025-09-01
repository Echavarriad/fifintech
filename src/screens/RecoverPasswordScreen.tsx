import React, { useState, useEffect } from "react";
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Dimensions,
} from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import { ChangePasswordData, RecoverPasswordData } from "../models/auth.models";
import { authService } from "../services/auth.service";
import { useAlertUtils } from "../utils/alertUtils";

type Props = NativeStackScreenProps<RootStackParamList, "RecoverPassword">;

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function RecoverPasswordScreen({ navigation }: Props) {
  const [step, setStep] = useState<'email' | 'password'>('email');
  const [emailData, setEmailData] = useState<RecoverPasswordData>({
    email: ""
  });
  const [formData, setFormData] = useState<ChangePasswordData>({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const { showSuccess, showError, showInfo } = useAlertUtils();

  const handleEmailChange = (value: string) => {
    setEmailData(prev => ({
      ...prev,
      email: value
    }));
  };

  const handleInputChange = (field: keyof ChangePasswordData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateEmail = (): boolean => {
    if (!emailData.email) {
      showError("Por favor ingrese su correo electrónico");
      return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailData.email)) {
      showError("Por favor ingrese un correo electrónico válido");
      return false;
    }
    
    return true;
  };

  const validateForm = (): boolean => {
    if (!formData.newPassword) {
      showError("Por favor ingrese la nueva contraseña");
      return false;
    }
    
    if (formData.newPassword.length < 6) {
      showError("La contraseña debe tener al menos 6 caracteres");
      return false;
    }
    
    if (!formData.confirmPassword) {
      showError("Por favor confirme la nueva contraseña");
      return false;
    }
    
    if (formData.newPassword !== formData.confirmPassword) {
      showError("Las contraseñas no coinciden");
      return false;
    }
    
    return true;
  };

  const handleSendEmail = async () => {
    if (!validateEmail()) return;
    
    setIsLoading(true);
    try {
      // Aquí se implementaría la lógica para enviar el correo de recuperación
      // await authService.recoverPassword(emailData);
      showSuccess("Se ha enviado un enlace de recuperación a su correo electrónico");
      setStep('password');
    } catch (error) {
      showError(error instanceof Error ? error.message : "Error al enviar el correo de recuperación");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecoverPassword = async () => {
    if (!validateForm()) return;
    
    setIsLoading(true);
    try {
      // Aquí se implementaría la lógica para cambiar la contraseña
      // await authService.changePassword(formData);
      showSuccess("Contraseña actualizada exitosamente");
      navigation.navigate("Login");
    } catch (error) {
      showError(error instanceof Error ? error.message : "Error al cambiar la contraseña");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <View style={styles.contentLogo}>
          <Image 
            source={require('../../assets/FiFintech.Co.png')} 
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>

        {/* Indicador de progreso */}
        <View style={styles.progressContainer}>
          <View style={styles.progressStep}>
            <View style={[styles.progressCircle, step === 'email' ? styles.progressCircleActive : styles.progressCircleCompleted]}>
              <Text style={[styles.progressNumber, step === 'email' ? styles.progressNumberActive : styles.progressNumberCompleted]}>1</Text>
            </View>
            <Text style={[styles.progressLabel, step === 'email' && styles.progressLabelActive]}>Correo</Text>
          </View>
          
          <View style={styles.progressLine} />
          
          <View style={styles.progressStep}>
            <View style={[styles.progressCircle, step === 'password' ? styles.progressCircleActive : styles.progressCircleInactive]}>
              <Text style={[styles.progressNumber, step === 'password' ? styles.progressNumberActive : styles.progressNumberInactive]}>2</Text>
            </View>
            <Text style={[styles.progressLabel, step === 'password' && styles.progressLabelActive]}>Contraseña</Text>
          </View>
        </View>

        {step === 'email' ? (
          <>
            <Text style={styles.title}>Recuperar contraseña</Text>
            
            <View style={styles.formContainer}>
              <View style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>Correo electrónico</Text>
                <TextInput
                  placeholder="Ingrese su correo electrónico"
                  placeholderTextColor="#666"
                  style={styles.input}
                  value={emailData.email}
                  onChangeText={handleEmailChange}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={!isLoading}
                />
              </View>
            </View>
            
            <TouchableOpacity 
              style={[styles.submit, isLoading && styles.submitDisabled]} 
              onPress={handleSendEmail}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.submitText}>Enviar enlace</Text>
              )}
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={styles.title}>Establecer nueva contraseña</Text>
            
            <View style={styles.formContainer}>
              <View style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>Nueva contraseña</Text>
                <TextInput
                  placeholder="Ingrese su nueva contraseña"
                  placeholderTextColor="#666"
                  style={styles.input}
                  value={formData.newPassword}
                  onChangeText={(value) => handleInputChange("newPassword", value)}
                  secureTextEntry
                  autoCapitalize="none"
                  editable={!isLoading}
                  textContentType="newPassword"
                  autoComplete="password-new"
                  autoCorrect={false}
                />
              </View>
              
              <View style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>Confirmar nueva contraseña</Text>
                <TextInput
                  placeholder="Confirme su nueva contraseña"
                  placeholderTextColor="#666"
                  style={styles.input}
                  value={formData.confirmPassword}
                  onChangeText={(value) => handleInputChange("confirmPassword", value)}
                  secureTextEntry
                  autoCapitalize="none"
                  editable={!isLoading}
                  textContentType="newPassword"
                  autoComplete="password-new"
                  autoCorrect={false}
                />
              </View>
            </View>
            
            <TouchableOpacity 
               style={[styles.submit, isLoading && styles.submitDisabled]} 
               onPress={handleRecoverPassword}
               disabled={isLoading}
             >
               {isLoading ? (
                 <ActivityIndicator color="#fff" size="small" />
               ) : (
                 <Text style={styles.submitText}>Establecer contraseña</Text>
               )}
             </TouchableOpacity>
             
             <TouchableOpacity 
               style={styles.backButton}
               onPress={() => setStep('email')}
               disabled={isLoading}
             >
               <Text style={styles.backButtonText}>← Volver al paso anterior</Text>
             </TouchableOpacity>
          </>
        )}

        <View style={styles.contentFooter}>
          <Text onPress={() => navigation.navigate("Register")} style={styles.link}>
            ¿No tienes una cuenta? Crear cuenta
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: "#ffffff",
  },
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
  },
  formContainer: {
    width: "100%",
    marginVertical: 10,
  },
  fieldContainer: {
    width: "100%",
    marginBottom: 15,
  },
  fieldLabel: {
    color: "#48b783",
    fontSize: 16,
    marginBottom: 5,
    fontWeight: "bold",
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
    width: "100%",
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
    textAlign: "center",
  },
  contentFooter: {
    position: "absolute",
    bottom: 30,
    width: "100%",
    alignItems: "center",
  },
  link: {
    color: "#48b783",
    fontSize: 16,
    marginTop: 15,
    fontWeight: "600",
    textAlign: "center",
  },
  backButton: {
    marginTop: 15,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  backButtonText: {
    color: "#48b783",
    fontSize: 16,
    fontWeight: "600",
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  progressStep: {
    alignItems: "center",
  },
  progressCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  progressCircleActive: {
    backgroundColor: "#48b783",
  },
  progressCircleCompleted: {
    backgroundColor: "#48b783",
  },
  progressCircleInactive: {
    backgroundColor: "#e0e0e0",
  },
  progressNumber: {
    fontSize: 16,
    fontWeight: "bold",
  },
  progressNumberActive: {
    color: "#fff",
  },
  progressNumberCompleted: {
    color: "#fff",
  },
  progressNumberInactive: {
    color: "#999",
  },
  progressLabel: {
    fontSize: 12,
    color: "#999",
    fontWeight: "500",
  },
  progressLabelActive: {
    color: "#48b783",
    fontWeight: "bold",
  },
  progressLine: {
    width: 60,
    height: 2,
    backgroundColor: "#e0e0e0",
    marginHorizontal: 10,
  },
});