import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { useAuth } from "../contexts/AuthContext";
import { useNotificationContext } from '../contexts/NotificationContext';

// Datos de ejemplo para clientes
const CLIENTES_EJEMPLO = [
  { id: '1', nombre: 'Ana García', balance: 8450, ultimaActividad: '2023-05-15' },
  { id: '2', nombre: 'Carlos Pérez', balance: 12300, ultimaActividad: '2023-05-18' },
  { id: '3', nombre: 'Laura Martínez', balance: 5200, ultimaActividad: '2023-05-10' },
  { id: '4', nombre: 'Miguel Rodríguez', balance: 9800, ultimaActividad: '2023-05-20' },
];

export default function AsesorDashboardScreen({ navigation }: { navigation: any }) {
  const { logout, user } = useAuth();
  const { unreadCount } = useNotificationContext();

  // Renderizar cada cliente en la lista
  const renderCliente = ({ item }: { item: { id: string; nombre: string; balance: number; ultimaActividad: string } }) => (
    <TouchableOpacity style={styles.clienteCard}>
      <View style={styles.clienteInfo}>
        <Text style={styles.clienteNombre}>{item.nombre}</Text>
        <Text style={styles.clienteBalance}>${item.balance.toLocaleString()}</Text>
      </View>
      <Text style={styles.clienteActividad}>Última actividad: {formatDate(item.ultimaActividad)}</Text>
      <View style={styles.clienteActions}>
        <TouchableOpacity style={styles.clienteButton}>
          <Text style={styles.clienteButtonText}>Ver Perfil</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.clienteButton}>
          <Text style={styles.clienteButtonText}>Contactar</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  // Formatear fecha para mostrar
  const formatDate = (dateString: string) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>Panel de Asesor</Text>
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
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>24</Text>
            <Text style={styles.statLabel}>Clientes</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>8</Text>
            <Text style={styles.statLabel}>Pendientes</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>$320K</Text>
            <Text style={styles.statLabel}>Gestionado</Text>
          </View>
        </View>

        <View style={styles.agendaContainer}>
          <Text style={styles.sectionTitle}>Agenda del Día</Text>
          <View style={styles.agendaCard}>
            <Text style={styles.agendaTime}>10:00 AM</Text>
            <Text style={styles.agendaEvent}>Reunión con Carlos Pérez</Text>
          </View>
          <View style={styles.agendaCard}>
            <Text style={styles.agendaTime}>2:30 PM</Text>
            <Text style={styles.agendaEvent}>Revisión de cartera de Laura Martínez</Text>
          </View>
          <TouchableOpacity style={styles.agendaButton}>
            <Text style={styles.agendaButtonText}>Ver Agenda Completa</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Mis Clientes</Text>
        <FlatList
          data={CLIENTES_EJEMPLO}
          renderItem={renderCliente}
          keyExtractor={item => item.id}
          scrollEnabled={false}
        />

        <TouchableOpacity style={styles.newClientButton}>
          <Text style={styles.newClientText}>Agregar Nuevo Cliente</Text>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Herramientas</Text>
        <View style={styles.menuContainer}>
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuText}>Calculadora de Inversiones</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuText}>Análisis de Mercado</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuText}>Reportes de Desempeño</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuText}>Recursos Educativos</Text>
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
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 15,
  },
  statCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    width: "31%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#48b783",
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    marginTop: 5,
  },
  agendaContainer: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  agendaCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  agendaTime: {
    width: 80,
    fontSize: 14,
    fontWeight: "bold",
    color: "#48b783",
  },
  agendaEvent: {
    flex: 1,
    fontSize: 14,
    color: "#333",
  },
  agendaButton: {
    marginTop: 15,
    alignItems: "center",
  },
  agendaButtonText: {
    color: "#48b783",
    fontWeight: "bold",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginTop: 10,
    marginBottom: 15,
  },
  clienteCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  clienteInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },
  clienteNombre: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  clienteBalance: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#48b783",
  },
  clienteActividad: {
    fontSize: 12,
    color: "#666",
    marginBottom: 10,
  },
  clienteActions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  clienteButton: {
    backgroundColor: "#f0f0f0",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
    width: "48%",
    alignItems: "center",
  },
  clienteButtonText: {
    fontSize: 14,
    color: "#333",
  },
  newClientButton: {
    backgroundColor: "#f0f0f0",
    borderRadius: 10,
    padding: 15,
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#ddd",
    borderStyle: "dashed",
  },
  newClientText: {
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
    marginBottom: 20,
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

});