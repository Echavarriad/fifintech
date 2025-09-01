import React, { useState, useEffect } from "react";
import { View, TextInput, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Image, ScrollView, KeyboardAvoidingView, Platform, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as LocalAuthentication from "expo-local-authentication";
import { BiometricService } from "../services/biometricService";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import { useAuth } from "../contexts/AuthContext";
import { useAlertUtils } from "../utils/alertUtils";
import { useAlertContext } from "../contexts/AlertContext";
import { LoginCredentials } from "../models/auth.models";


type Props = NativeStackScreenProps<RootStackParamList, "Login">;

export default function LoginScreen({ navigation }: Props) {
  const [credentials, setCredentials] = useState<LoginCredentials>({
    email: "",
    password: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isBiometricSupported, setIsBiometricSupported] = useState(false);
  const [biometricType, setBiometricType] = useState<string>("");
  const { login, error, isLoading, clearError } = useAuth();
  const { showError, showWarning, showInfo } = useAlertUtils();
  const { showAlert } = useAlertContext();
  
  // Efecto para verificar soporte biométrico
  useEffect(() => {
    checkBiometricSupport();
  }, []);

  // Efecto para mostrar errores del contexto de autenticación
  useEffect(() => {
    if (error) {
      showError(error);
      clearError();
    }
  }, [error, clearError, showError]);

  const checkBiometricSupport = async () => {
    try {
      const isAvailable = await BiometricService.isBiometricAvailable();
      const isEnabled = await BiometricService.isBiometricEnabled();
      
      if (isAvailable && isEnabled) {
        setIsBiometricSupported(true);
        const type = await BiometricService.getBiometricType();
        setBiometricType(type);
      }
    } catch (error) {
      console.log("Error checking biometric support:", error);
    }
  };

  const handleBiometricLogin = async () => {
    try {
      const success = await BiometricService.authenticateWithBiometrics(biometricType);
      
      if (success) {
        const storedCredentials = await BiometricService.getStoredCredentials();
        
        if (storedCredentials && storedCredentials.hasStoredCredentials) {
          // Usar las credenciales almacenadas para hacer login real
          const loginCredentials = {
            email: storedCredentials.email,
            password: storedCredentials.password
          };
          
          const loginSuccess = await login(loginCredentials);
          if (loginSuccess) {
            showInfo("Autenticación biométrica exitosa", "Bienvenido");
          }
        } else {
          showWarning("No hay credenciales almacenadas", "Configure primero el login biométrico");
        }
      } else {
        showWarning("Autenticación biométrica cancelada o falló", "Intente nuevamente");
      }
    } catch (error) {
      showError("Error al intentar autenticación biométrica");
    }
  };

  const handleSuccessfulLogin = async (email: string, password: string) => {
    try {
      // Preguntar si quiere habilitar login biométrico
      const biometricAvailable = await BiometricService.isBiometricAvailable();
      const biometricEnabled = await BiometricService.isBiometricEnabled();
      
      if (biometricAvailable && !biometricEnabled) {
        const biometricType = await BiometricService.getBiometricType();
        showAlert(
          'info',
          "Login Biométrico",
          `¿Desea habilitar el login con ${biometricType} para futuros accesos?`
        );
      }
    } catch (error) {
      // Error silencioso para no interrumpir el flujo de login exitoso
      console.error('Error in handleSuccessfulLogin:', error);
    }
  };

  const handleLogin = async () => {
    if (credentials.email && credentials.password) {
      try {
        const success = await login(credentials);
        if (success) {
          // La navegación se manejará en el AppNavigator basado en el rol
          // Preguntar si quiere habilitar login biométrico
          await handleSuccessfulLogin(credentials.email, credentials.password);
        }
        // No necesitamos manejar el caso de error aquí, ya que lo manejamos en el efecto
      } catch (error) {
        // Este catch es por si hay algún error no controlado
        showError("Ocurrió un error inesperado al iniciar sesión");
      }
    } else {
      showWarning("Por favor ingrese email y contraseña", "Atención");
    }
  };
  
  const handleEmailChange = (text: string) => {
    setCredentials(prev => ({ ...prev, email: text }));
  };
  
  const handlePasswordChange = (text: string) => {
    setCredentials(prev => ({ ...prev, password: text }));
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
              source={require('../../assets/FiFintech.Co.png')} 
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>
          
          <View style={styles.content}>
            <Text style={styles.title}>Inicio de sesión</Text>
            
            <TextInput
              placeholder="Correo electrónico"
              placeholderTextColor="#666"
              style={styles.input}
              onChangeText={handleEmailChange}
              value={credentials.email}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!isLoading}
            />
            
            <View style={styles.passwordContainer}>
              <TextInput
                placeholder="Contraseña"
                placeholderTextColor="#666"
                style={styles.passwordInput}
                secureTextEntry={!showPassword}
                onChangeText={handlePasswordChange}
                value={credentials.password}
                editable={!isLoading}
                textContentType="password"
                autoComplete="password"
                autoCorrect={false}
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowPassword(!showPassword)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={22}
                  color="#666"
                />
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity
              style={[styles.submit, isLoading && styles.submitDisabled]}
              onPress={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.submitText}>Ingresar</Text>
              )}
            </TouchableOpacity>
            
            {isBiometricSupported && (
              <TouchableOpacity
                style={styles.biometricButton}
                onPress={handleBiometricLogin}
                disabled={isLoading}
              >
                <Ionicons
                  name={biometricType === "Face ID" ? "scan" : "finger-print"}
                  size={24}
                  color="#48b783"
              style={styles.biometricIcon}
            />
            <Text style={styles.biometricText}>
              Ingresar con {biometricType}
            </Text>
          </TouchableOpacity>
        )}
        
        <View style={styles.linkPassword}>
          <Text
            onPress={() => navigation.navigate("RecoverPassword")}
            style={styles.link}
          >
            Recuperar contraseña
          </Text>
        </View>
      </View>
      
      <View style={styles.contentFooter}>
        <Text
          onPress={() => navigation.navigate("Register")}
          style={styles.link}
        >
          ¿No tienes cuenta? Regístrate
        </Text>
      </View>

          {/* Ya no necesitamos incluir el componente AlertMessage aquí */}
          {/* El AlertProvider en App.tsx ya lo incluye */}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: "#ffffff",
  },
  container: {
    flex: 1,
    padding: Math.min(screenWidth * 0.04, 16),
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
  },
  content: {
    width: "100%",
    maxWidth: 380,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: Math.min(screenWidth * 0.045, 18),
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: Math.min(screenHeight * 0.02, 15),
  },
  contentLogo: {
    alignItems: "center",
    marginBottom: Math.min(screenHeight * 0.02, 15),
    marginTop: Math.min(screenHeight * 0.015, 10),
  },
  logoImage: {
    width: Math.min(screenWidth * 0.5, 200),
    height: Math.min(screenWidth * 0.5, 200),
    marginVertical: 3,
  },
  title: {
    fontSize: Math.min(screenWidth * 0.055, 22),
    fontFamily: "Kanit",
    marginBottom: Math.min(screenHeight * 0.025, 20),
    textAlign: "center",
    color: "#48b783",
    fontWeight: "bold",
    textShadowColor: "rgba(0, 0, 0, 0.1)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  input: {
    borderWidth: 1,
    marginBottom: Math.min(screenHeight * 0.02, 15),
    padding: Math.min(screenWidth * 0.035, 14),
    borderRadius: 10,
    width: "100%",
    height: Math.min(Math.max(screenHeight * 0.055, 45), 52),
    backgroundColor: "#f9f9f9",
    color: "#333",
    borderColor: "#48b783",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
    fontSize: Math.min(screenWidth * 0.038, 15),
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    marginBottom: Math.min(screenHeight * 0.02, 15),
    borderRadius: 10,
    width: "100%",
    minHeight: Math.min(Math.max(screenHeight * 0.055, 50), 56),
    backgroundColor: "#f9f9f9",
    borderColor: "#48b783",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  passwordInput: {
    flex: 1,
    padding: Math.min(screenWidth * 0.035, 14),
    color: "#333",
    fontSize: Math.min(screenWidth * 0.038, 15),
  },
  eyeIcon: {
    paddingHorizontal: Math.min(screenWidth * 0.035, 14),
    paddingVertical: Math.min(screenHeight * 0.015, 12),
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 40,
    minHeight: 40,
  },
  submit: {
    backgroundColor: "#48b783",
    width: "100%",
    paddingVertical: Math.min(screenHeight * 0.018, 14),
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: "center",
    marginTop: Math.min(screenHeight * 0.02, 16),
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  submitDisabled: {
    backgroundColor: "#a5d5bc",
    shadowOpacity: 0.1,
    elevation: 2,
  },
  submitText: {
    color: "#fff",
    fontSize: Math.min(screenWidth * 0.042, 17),
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
  linkPassword: {
    flexDirection: "row",
    justifyContent: "flex-end",
    width: "100%",
    marginTop: Math.min(screenHeight * 0.015, 12),
    paddingRight: 8,
  },
  contentFooter: {
    width: "100%",
    alignItems: "center",
    marginTop: Math.min(screenHeight * 0.025, 20),
    marginBottom: Math.min(screenHeight * 0.03, 25),
    paddingHorizontal: Math.min(screenWidth * 0.04, 16),
  },
  link: {
    marginTop: Math.min(screenHeight * 0.015, 12),
    color: "#48b783",
    textDecorationLine: "none",
    textAlign: "center",
    fontSize: Math.min(screenWidth * 0.038, 15),
    fontWeight: "bold",
  },
  biometricButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderColor: "#48b783",
    width: "100%",
    paddingVertical: Math.min(screenHeight * 0.018, 14),
    paddingHorizontal: 20,
    borderRadius: 10,
    marginTop: Math.min(screenHeight * 0.015, 12),
  },
  biometricIcon: {
    marginRight: Math.min(screenWidth * 0.02, 8),
  },
  biometricText: {
    color: "#48b783",
    fontSize: Math.min(screenWidth * 0.038, 15),
    fontWeight: "bold",
  },
});
