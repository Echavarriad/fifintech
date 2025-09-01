import React, { useState } from "react";
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import { ChangePasswordData } from "../models/auth.models";
import { authService } from "../services/auth.service";
import { useAlertUtils } from "../utils/alertUtils";
import { useAuth } from "../contexts/AuthContext";

type Props = NativeStackScreenProps<RootStackParamList, "ChangePassword">;

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function ChangePasswordScreen({ navigation }: Props) {

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [formData, setFormData] = useState<ChangePasswordData>({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const { showSuccess, showError } = useAlertUtils();
  const { user } = useAuth();

  const handleInputChange = (field: keyof ChangePasswordData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.newPassword) {
      showError("Por favor ingrese su nueva contraseña");
      return false;
    }

    if (formData.newPassword.length < 6) {
      showError("La nueva contraseña debe tener al menos 6 caracteres");
      return false;
    }
    
    if (formData.newPassword !== formData.confirmPassword) {
      showError("Las contraseñas no coinciden");
      return false;
    }
    
    return true;
  };

  const handleChangePassword = async () => {
    if (!validateForm()) return;
    
    setIsLoading(true);
    try {
      await authService.changePassword(formData);
      showSuccess("Contraseña actualizada correctamente");
      navigation.goBack();
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

        <Text style={styles.title}>Cambiar contraseña</Text>
        
        <View style={styles.formContainer}>


          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Nueva contraseña</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                placeholder="Ingrese su nueva contraseña"
                placeholderTextColor="#666"
                style={styles.passwordInput}
                value={formData.newPassword}
                onChangeText={(value) => handleInputChange("newPassword", value)}
                secureTextEntry={!showNewPassword}
                editable={!isLoading}
                textContentType="newPassword"
                autoComplete="password-new"
                autoCorrect={false}
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowNewPassword(!showNewPassword)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={showNewPassword ? "eye-off-outline" : "eye-outline"}
                  size={22}
                  color="#666"
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Confirmar contraseña</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                placeholder="Confirme su nueva contraseña"
                placeholderTextColor="#666"
                style={styles.passwordInput}
                value={formData.confirmPassword}
                onChangeText={(value) => handleInputChange("confirmPassword", value)}
                secureTextEntry={!showConfirmPassword}
                editable={!isLoading}
                textContentType="newPassword"
                autoComplete="password-new"
                autoCorrect={false}
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
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
        
        <TouchableOpacity 
          style={[styles.submit, isLoading && styles.submitDisabled]} 
          onPress={handleChangePassword}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.submitText}>Actualizar contraseña</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.cancelButton} 
          onPress={() => navigation.goBack()}
          disabled={isLoading}
        >
          <Text style={styles.cancelButtonText}>Cancelar</Text>
        </TouchableOpacity>

        <View style={styles.contentFooter}>
          <Text
            onPress={() => navigation.navigate("Register")}
            style={styles.link}
          >
            ¿No tienes cuenta? Regístrate
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
  contentLogo: {
    alignItems: "center",
    marginBottom: 40,
  },
  logoImage: {
    width: Math.min(screenWidth * 0.5, 200),
    height: Math.min(screenWidth * 0.5, 200),
    marginVertical: 3,
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
  },
  cancelButton: {
    width: "90%",
    paddingVertical: 15,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#48b783",
    backgroundColor: "transparent",
  },
  cancelButtonText: {
    color: "#48b783",
    fontSize: 18,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    marginBottom: 20,
    borderRadius: 12,
    width: "100%",
    minHeight: 60,
    backgroundColor: "#f9f9f9",
    borderColor: "#48b783",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  passwordInput: {
    flex: 1,
    padding: 15,
    color: "#333",
    fontSize: 16,
  },
  eyeIcon: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 40,
    minHeight: 40,
  },
  contentFooter: {
    position: "absolute",
    bottom: 40,
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
});