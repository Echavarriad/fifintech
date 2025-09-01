import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { useAuth } from "../contexts/AuthContext";
import { useNotificationContext } from '../contexts/NotificationContext';

export default function ClienteDashboardScreen({ navigation }: { navigation: any }) {
  const { logout, user } = useAuth();
  const { unreadCount } = useNotificationContext();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>Mi Portal Financiero</Text>
          <TouchableOpacity 
            style={styles.notificationButton}
            onPress={() => navigation.navigate('Notifications')}
          >
            <Text style={styles.notificationIcon}>🔔</Text>
            {unreadCount > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationCount}>{unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
        <Text style={styles.welcomeText}>Bienvenido, {user?.name}</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Balance Total</Text>
          <Text style={styles.balanceAmount}>$12,450.00</Text>
          <View style={styles.balanceActions}>
            <TouchableOpacity style={styles.balanceButton}>
              <Text style={styles.balanceButtonText}>Depositar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.balanceButton}>
              <Text style={styles.balanceButtonText}>Retirar</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Mis Inversiones</Text>
        <View style={styles.investmentContainer}>
          <View style={styles.investmentCard}>
            <Text style={styles.investmentName}>Fondo Crecimiento</Text>
            <Text style={styles.investmentAmount}>$5,000.00</Text>
            <Text style={styles.investmentReturn}>+8.2% <Text style={styles.investmentPeriod}>este mes</Text></Text>
          </View>
          <View style={styles.investmentCard}>
            <Text style={styles.investmentName}>Acciones Tecnología</Text>
            <Text style={styles.investmentAmount}>$3,200.00</Text>
            <Text style={styles.investmentReturn}>+4.5% <Text style={styles.investmentPeriod}>este mes</Text></Text>
          </View>
        </View>

        <TouchableOpacity style={styles.newInvestmentButton}>
          <Text style={styles.newInvestmentText}>Nueva Inversión</Text>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Servicios</Text>
        <View style={styles.menuContainer}>
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuText}>Historial de Transacciones</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuText}>Asesoría Financiera</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuText}>Reportes Personalizados</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuText}>Configuración de Cuenta</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Educación Financiera</Text>
        <View style={styles.educationContainer}>
          <TouchableOpacity style={styles.educationCard}>
            <Text style={styles.educationTitle}>Introducción a Inversiones</Text>
            <Text style={styles.educationDesc}>Aprende los conceptos básicos para comenzar a invertir</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.educationCard}>
            <Text style={styles.educationTitle}>Estrategias de Ahorro</Text>
            <Text style={styles.educationDesc}>Técnicas efectivas para maximizar tus ahorros</Text>
          </TouchableOpacity>
        </View>
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
    padding: 20,
    paddingTop: 50,
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
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  notificationButton: {
    position: 'relative',
    padding: 5,
  },
  notificationIcon: {
    fontSize: 24,
    color: '#fff',
  },
  notificationBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#ff4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationCount: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },

  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 5,
  },
  welcomeText: {
    fontSize: 16,
    color: "#fff",
    opacity: 0.9,
  },
  content: {
    flex: 1,
    padding: 15,
  },
  balanceCard: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    marginVertical: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  balanceLabel: {
    fontSize: 14,
    color: "#666",
  },
  balanceAmount: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginVertical: 10,
  },
  balanceActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  balanceButton: {
    backgroundColor: "#48b783",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    width: "48%",
    alignItems: "center",
  },
  balanceButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginTop: 20,
    marginBottom: 10,
  },
  investmentContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  investmentCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    width: "48%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  investmentName: {
    fontSize: 14,
    color: "#333",
    fontWeight: "bold",
  },
  investmentAmount: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginVertical: 5,
  },
  investmentReturn: {
    fontSize: 14,
    color: "#4CAF50",
    fontWeight: "bold",
  },
  investmentPeriod: {
    fontSize: 12,
    color: "#666",
    fontWeight: "normal",
  },
  newInvestmentButton: {
    backgroundColor: "#f0f0f0",
    borderRadius: 10,
    padding: 15,
    alignItems: "center",
    marginTop: 15,
    borderWidth: 1,
    borderColor: "#ddd",
    borderStyle: "dashed",
  },
  newInvestmentText: {
    color: "#48b783",
    fontWeight: "bold",
  },
  menuContainer: {
    backgroundColor: "#fff",
    borderRadius: 10,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  menuItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  menuText: {
    fontSize: 16,
    color: "#333",
  },
  educationContainer: {
    marginVertical: 10,
  },
  educationCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  educationTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  educationDesc: {
    fontSize: 14,
    color: "#666",
  },

});