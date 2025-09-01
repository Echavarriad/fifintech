import React, { useRef, useEffect } from "react";
import { View, Text, Button, StyleSheet, TouchableOpacity, Dimensions } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import { useAuth } from "../contexts/AuthContext";
import { useAlertUtils } from "../utils/alertUtils";

type Props = NativeStackScreenProps<RootStackParamList, "Dashboard">;

const { width: screenWidth } = Dimensions.get('window');

export default function DashboardScreen({ navigation }: Props) {
  const { logout } = useAuth();
  const { showSuccess, showError, showWarning, showInfo } = useAlertUtils();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
  
  const handleLogout = () => {
    showInfo("¿Estás seguro que deseas cerrar sesión?", "Cerrando sesión");
    // En un caso real, aquí se podría agregar lógica para confirmar el cierre de sesión
    // Por ahora, simplemente cerramos sesión después de mostrar la alerta
    timeoutRef.current = setTimeout(() => {
      logout();
    }, 2000);
  };
  
  const showSuccessAlert = () => {
    showSuccess("La operación se ha completado correctamente.", "Operación exitosa");
  };
  
  const showWarningAlert = () => {
    showWarning("Esta acción podría tener consecuencias.", "Advertencia");
  };
  
  const showErrorAlert = () => {
    showError("Ha ocurrido un error al procesar la solicitud.", "Error");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Bienvenido al Dashboard</Text>
      
      <Text style={styles.subtitle}>Ejemplos de alertas:</Text>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={[styles.alertButton, styles.successButton]} onPress={showSuccessAlert}>
          <Text style={styles.buttonText}>Alerta de Éxito</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.alertButton, styles.warningButton]} onPress={showWarningAlert}>
          <Text style={styles.buttonText}>Alerta de Advertencia</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.alertButton, styles.errorButton]} onPress={showErrorAlert}>
          <Text style={styles.buttonText}>Alerta de Error</Text>
        </TouchableOpacity>
      </View>
      
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Cerrar sesión</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
  },
  text: { 
    fontSize: Math.min(screenWidth * 0.055, 22), 
    marginBottom: 30,
    fontWeight: "bold",
    color: "#48b783",
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 20,
    color: "#333",
  },
  buttonContainer: {
    width: "100%",
    marginBottom: 40,
  },
  alertButton: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  successButton: {
    backgroundColor: "#48b783",
  },
  warningButton: {
    backgroundColor: "#f39c12",
  },
  errorButton: {
    backgroundColor: "#e74c3c",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  logoutButton: {
    backgroundColor: "#48b783",
    padding: 15,
    borderRadius: 10,
    width: "100%",
    alignItems: "center",
  },
  logoutText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});
