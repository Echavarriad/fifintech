import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { useNotificationContext } from '../contexts/NotificationContext';
import { requestsService, Solicitud } from '../services/requests.service';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// La interfaz Solicitud ahora se importa del servicio

const SolicitanteDashboardScreen = ({ navigation }: { navigation: any }) => {
  const { user } = useAuth();
  const { unreadCount } = useNotificationContext();
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filtroActivo, setFiltroActivo] = useState<string>('todos'); // 'todos', 'pendiente', 'desembolsado', 'rechazada'

  // Función para cargar las solicitudes del usuario
  const cargarSolicitudes = async () => {
    try {
      setIsLoading(true);
      
      // Verificar que el usuario esté logueado
      if (!user?.id) {
        console.log('❌ Usuario no logueado, no se pueden cargar solicitudes');
        setIsLoading(false);
        return;
      }
      
      // Obtener solicitudes del usuario actual desde la API
      const solicitudesUsuario = await requestsService.getUserSolicitudes(user.id);
      
      console.log('🔍 Total solicitudes del usuario recibidas:', solicitudesUsuario.length);
      console.log('👤 ID del usuario actual:', user?.id);
      console.log('📋 Datos de solicitudes recibidas:', JSON.stringify(solicitudesUsuario, null, 2));
      
      // Si hay solicitudes de la API, mapearlas al formato esperado
      if (solicitudesUsuario && solicitudesUsuario.length > 0) {
        const solicitudesMapeadas = solicitudesUsuario.map((item: any) => {
          // Mapear el estado basado en post_status y meta fields
          let estado = 'pendiente'; // Estado por defecto
          
          if (item.post_status === 'publish') {
            // Verificar si está desembolsado
            if (item.meta?.desembolsado === '1') {
              estado = 'desembolsado';
            } else {
              estado = 'pendiente'; // Publicado pero no desembolsado
            }
          } else if (item.post_status === 'draft') {
            estado = 'en_revision';
          } else if (item.post_status === 'trash') {
            estado = 'rechazada';
          }
          
          return {
            id: parseInt(item.ID),
            tipo: item.meta?.destino_o_descripcion_del_prestamo || 'Préstamo General',
            monto: parseInt(item.meta?.monto_solicitado) || 0,
            estado: estado,
            fechaCreacion: item.post_date?.split(' ')[0] || '',
            fechaActualizacion: item.post_modified?.split(' ')[0] || '',
            tiempoPrestamo: parseInt(item.meta?.plazo_en_meses) || 0,
            usuarioId: item.author_id,
            // Campos adicionales de la API
            post_title: item.post_title,
            author_name: item.author_name,
            guid: item.guid,
            desembolsado: item.meta?.desembolsado === '1',
          };
        });
        
        setSolicitudes(solicitudesMapeadas);
        console.log('✅ Usando solicitudes de la API mapeadas:', solicitudesMapeadas.length);
        console.log('📊 Estados de solicitudes:', solicitudesMapeadas.map(s => ({ id: s.id, estado: s.estado, desembolsado: s.desembolsado })));
        
        // Log del conteo por estados
        const pendientes = solicitudesMapeadas.filter(s => s.estado === 'pendiente').length;
        const aprobadas = solicitudesMapeadas.filter(s => s.estado === 'aprobada').length;
        const enRevision = solicitudesMapeadas.filter(s => s.estado === 'en_revision').length;
        const rechazadas = solicitudesMapeadas.filter(s => s.estado === 'rechazada').length;
        
        console.log('📈 Conteo de estados:');
        console.log('  - Pendientes:', pendientes);
        console.log('  - Aprobadas:', aprobadas);
        console.log('  - En Revisión:', enRevision);
        console.log('  - Rechazadas:', rechazadas);
      } else {
        // Si no hay solicitudes de la API, mostrar lista vacía
        console.log('📝 No hay solicitudes de la API');
        setSolicitudes([]);
      }
      
    } catch (error) {
      console.error('❌ Error al cargar solicitudes desde API:', error);
      setSolicitudes([]);
    } finally {
      setIsLoading(false);
    }
  };



  // Función para manejar el refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await cargarSolicitudes();
    setRefreshing(false);
  };

  // Función para obtener el color del estado
  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'desembolsado':
      case 'aprobada':
      case 'procesado':
        return '#4CAF50';
      case 'rechazada':
        return '#F44336';
      case 'pendiente':
        return '#FF9800';
      case 'en_revision':
        return '#2196F3';
      default:
        return '#9E9E9E';
    }
  };

  // Función para obtener el color del estado de abonos
  const getEstadoAbonoColor = (estado: string) => {
    switch (estado) {
      case 'procesado':
        return '#4CAF50';
      case 'pendiente':
        return '#FF9800';
      case 'rechazado':
        return '#F44336';
      default:
        return '#9E9E9E';
    }
  };

  // Función para obtener el texto del estado
  const getEstadoTexto = (estado: string) => {
    switch (estado) {
      case 'desembolsado':
        return 'Desembolsado';
      case 'aprobada':
        return 'Aprobada';
      case 'rechazada':
        return 'Rechazada';
      case 'en_revision':
        return 'En Revisión';
      case 'pendiente':
      default:
        return 'Pendiente';
    }
  };

  // Función para formatear el monto
  const formatearMonto = (monto: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(monto);
  };

  useEffect(() => {
    cargarSolicitudes();
  }, []);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Panel de Solicitante</Text>
            <Text style={styles.headerSubtitle}>
              Bienvenido, {user?.name || 'Usuario'}
            </Text>
          </View>
          <TouchableOpacity 
            style={styles.notificationButton}
            onPress={() => navigation.navigate('Notifications')}
          >
            <Ionicons 
              name="notifications-outline" 
              size={24} 
              color="#fff" 
            />
            {unreadCount > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.badgeText}>{unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Filtros */}
      <View style={styles.resumenContainer}>
        <TouchableOpacity 
          style={[styles.resumenCard, filtroActivo === 'todos' && styles.filtroActivo]}
          onPress={() => setFiltroActivo('todos')}
        >
          <Text style={[styles.resumenNumero, filtroActivo === 'todos' && styles.numeroActivo]}>{solicitudes.length}</Text>
          <Text style={[styles.resumenTexto, filtroActivo === 'todos' && styles.textoActivo]}>Total Solicitudes</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.resumenCard, filtroActivo === 'pendiente' && styles.filtroActivo]}
          onPress={() => setFiltroActivo('pendiente')}
        >
          <Text style={[styles.resumenNumero, filtroActivo === 'pendiente' && styles.numeroActivo]}>
            {solicitudes.filter(s => s.estado === 'pendiente').length}
          </Text>
          <Text style={[styles.resumenTexto, filtroActivo === 'pendiente' && styles.textoActivo]}>Pendientes</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.resumenCard, filtroActivo === 'desembolsado' && styles.filtroActivo]}
          onPress={() => setFiltroActivo('desembolsado')}
        >
          <Text style={[styles.resumenNumero, filtroActivo === 'desembolsado' && styles.numeroActivo]}>
            {solicitudes.filter(s => s.estado === 'desembolsado').length}
          </Text>
          <Text style={[styles.resumenTexto, filtroActivo === 'desembolsado' && styles.textoActivo]}>Desembolsadas</Text>
        </TouchableOpacity>

      </View>

      {/* Contenido de solicitudes */}
        <ScrollView
          style={styles.solicitudesContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <Text style={styles.sectionTitle}>Historial de Solicitudes</Text>
          
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Cargando solicitudes...</Text>
            </View>
          ) : solicitudes.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Sin solicitudes</Text>
              <Text style={styles.emptySubtext}>
                No tienes solicitudes registradas
              </Text>
            </View>
          ) : (() => {
            const solicitudesFiltradas = solicitudes.filter(solicitud => {
              if (filtroActivo === 'todos') return true;
              return solicitud.estado === filtroActivo;
            });
            
            if (solicitudesFiltradas.length === 0) {
              const filtroTexto = filtroActivo === 'pendiente' ? 'pendientes' : 
                                filtroActivo === 'desembolsado' ? 'desembolsadas' : 
                                'rechazadas';
              return (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>Sin solicitudes {filtroTexto}</Text>
                  <Text style={styles.emptySubtext}>
                    No tienes solicitudes con este estado
                  </Text>
                </View>
              );
            }
            
            return solicitudesFiltradas.map((solicitud) => (
              <View key={solicitud.ID || solicitud.id} style={styles.solicitudCard}>
                <View style={styles.solicitudHeader}>
                  <Text style={styles.solicitudTipo}>{solicitud.post_type || solicitud.tipo}</Text>
                  <View
                    style={[
                      styles.estadoBadge,
                      { backgroundColor: getEstadoColor(solicitud.estado) },
                    ]}
                  >
                    <Text style={styles.estadoTexto}>
                      {getEstadoTexto(solicitud.estado)}
                    </Text>
                  </View>
                </View>
                
                <Text style={styles.solicitudMonto}>
                  {formatearMonto(solicitud.meta?.monto_solicitado ? parseFloat(solicitud.meta.monto_solicitado) : solicitud.monto)}
                </Text>
                
                {(solicitud.meta?.plazo_en_meses || solicitud.tiempoPrestamo) && (
                  <View>
                    <Text style={styles.tiempoPrestamoTexto}>
                      Plazo: {solicitud.meta?.plazo_en_meses || solicitud.tiempoPrestamo} meses
                    </Text>
                    {solicitud.desembolsado && (
                      <Text style={styles.desembolsadaTexto}>
                        Desembolsada
                      </Text>
                    )}
                  </View>
                )}
                
                <View style={styles.solicitudFooter}>
                  <Text style={styles.fechaTexto}>
                    Creada: {new Date(solicitud.post_date || solicitud.fechaCreacion).toLocaleDateString('es-ES', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </Text>
                  {(solicitud.post_modified || solicitud.fechaActualizacion) && (
                    <Text style={styles.fechaTexto}>
                      Actualizada: {new Date(solicitud.post_modified || solicitud.fechaActualizacion).toLocaleDateString('es-ES', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </Text>
                  )}
                  
                  {solicitud.desembolsado && (
                    <TouchableOpacity 
                      style={styles.verDetallesButton}
                      onPress={() => navigation.navigate('DetallesSolicitud', { solicitudId: solicitud.ID || solicitud.id })}
                    >
                      <Text style={styles.verDetallesButtonText}>Ver Detalles</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ));
          })()}
        </ScrollView>
      )}
      
      {/* Botón flotante para nueva solicitud */}
      <TouchableOpacity 
        style={styles.floatingButton}
        onPress={() => navigation.navigate('NuevaSolicitud')}
      >
        <Text style={styles.floatingButtonText}>+</Text>
      </TouchableOpacity>
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
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: Math.min(screenWidth * 0.06, 24),
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: Math.min(screenHeight * 0.006, 5),
  },
  headerSubtitle: {
    fontSize: Math.min(screenWidth * 0.04, 16),
    color: '#fff',
    opacity: 0.9,
  },
  notificationButton: {
    position: 'relative',
    padding: 8,
    marginTop: 5,
  },
  notificationBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: '#ff4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  resumenContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    padding: Math.min(screenWidth * 0.05, 20),
    marginTop: Math.min(screenHeight * -0.012, -10),
    gap: Math.min(screenWidth * 0.02, 8),
  },
  resumenCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: Math.min(screenWidth * 0.038, 15),
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    minWidth: Math.min(screenWidth * 0.28, 100),
    flex: 1,
    maxWidth: screenWidth * 0.32,
  },
  filtroActivo: {
    backgroundColor: '#48b783',
    transform: [{ scale: 1.05 }],
  },
  numeroActivo: {
    color: '#fff',
  },
  textoActivo: {
    color: '#fff',
  },
  resumenNumero: {
    fontSize: Math.min(screenWidth * 0.06, 24),
    fontWeight: 'bold',
    color: '#48b783',
    marginBottom: Math.min(screenHeight * 0.006, 5),
  },
  resumenTexto: {
    fontSize: Math.min(screenWidth * 0.03, 12),
    color: '#666',
    textAlign: 'center',
  },
  solicitudesContainer: {
    flex: 1,
    padding: Math.min(screenWidth * 0.05, 20),
  },
  sectionTitle: {
    fontSize: Math.min(screenWidth * 0.045, 18),
    fontWeight: 'bold',
    color: '#333',
    marginBottom: Math.min(screenHeight * 0.018, 15),
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Math.min(screenWidth * 0.1, 40),
  },
  loadingText: {
    fontSize: Math.min(screenWidth * 0.04, 16),
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Math.min(screenWidth * 0.1, 40),
  },
  emptyText: {
    fontSize: Math.min(screenWidth * 0.045, 18),
    fontWeight: 'bold',
    color: '#333',
    marginBottom: Math.min(screenHeight * 0.012, 10),
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: Math.min(screenWidth * 0.035, 14),
    color: '#666',
    textAlign: 'center',
    lineHeight: Math.min(screenHeight * 0.024, 20),
  },
  solicitudCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: Math.min(screenWidth * 0.038, 15),
    marginBottom: Math.min(screenHeight * 0.018, 15),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  solicitudHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Math.min(screenHeight * 0.012, 10),
  },
  solicitudTipo: {
    fontSize: Math.min(screenWidth * 0.04, 16),
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  estadoBadge: {
    paddingHorizontal: Math.min(screenWidth * 0.02, 8),
    paddingVertical: Math.min(screenHeight * 0.005, 4),
    borderRadius: 12,
  },
  estadoTexto: {
    fontSize: Math.min(screenWidth * 0.03, 12),
    fontWeight: 'bold',
    color: '#fff',
  },
  solicitudMonto: {
    fontSize: Math.min(screenWidth * 0.05, 20),
    fontWeight: 'bold',
    color: '#48b783',
    marginBottom: Math.min(screenHeight * 0.006, 5),
  },
  tiempoPrestamoTexto: {
    fontSize: Math.min(screenWidth * 0.035, 14),
    color: '#666',
    fontWeight: '500',
    marginBottom: Math.min(screenHeight * 0.006, 5),
  },
  desembolsadaTexto: {
    fontSize: Math.min(screenWidth * 0.032, 13),
    color: '#48b783',
    fontWeight: 'bold',
    marginBottom: Math.min(screenHeight * 0.012, 10),
  },
  solicitudFooter: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: Math.min(screenHeight * 0.012, 10),
  },
  fechaTexto: {
    fontSize: Math.min(screenWidth * 0.03, 12),
    color: '#666',
    marginBottom: Math.min(screenHeight * 0.002, 2),
  },
  verDetallesButton: {
    backgroundColor: '#48b783',
    paddingHorizontal: Math.min(screenWidth * 0.04, 16),
    paddingVertical: Math.min(screenHeight * 0.008, 8),
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: Math.min(screenHeight * 0.012, 10),
  },
  verDetallesButtonText: {
    color: '#fff',
    fontSize: Math.min(screenWidth * 0.032, 13),
    fontWeight: 'bold',
  },
  floatingButton: {
    position: 'absolute',
    bottom: Math.min(screenHeight * 0.024, 20),
    right: Math.min(screenWidth * 0.05, 20),
    width: Math.min(screenWidth * 0.15, 60),
    height: Math.min(screenWidth * 0.15, 60),
    borderRadius: Math.min(screenWidth * 0.075, 30),
    backgroundColor: '#48b783',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  floatingButtonText: {
    fontSize: Math.min(screenWidth * 0.06, 24),
    color: '#fff',
    fontWeight: 'bold',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: 10,
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  activeTab: {
     backgroundColor: '#007AFF',
   },
  tabText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  activeTabText: {
    color: '#fff',
  },
  debugContainer: {
    padding: 10,
    alignItems: 'center',
  },
  debugButton: {
    backgroundColor: '#FF9800',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  debugButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  debugInfo: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    marginBottom: 15,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  debugInfoText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
    fontFamily: 'monospace',
  },
});

export default SolicitanteDashboardScreen;