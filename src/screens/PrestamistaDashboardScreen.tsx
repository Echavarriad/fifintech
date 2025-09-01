import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, RefreshControl, Alert } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from "../contexts/AuthContext";
import { useNotificationContext } from '../contexts/NotificationContext';
import { requestsService, Solicitud, Postulacion } from '../services/requests.service';
import ConfirmationAlert from '../components/ConfirmationAlert';
import AlertMessage from '../components/AlertMessage';
import { useAlertContext } from '../contexts/AlertContext';

export default function PrestamistaDashboardScreen({ navigation }: { navigation: any }) {
  const { logout, user } = useAuth();
  const { unreadCount } = useNotificationContext();
  const { showAlert } = useAlertContext();
  const [solicitudesActivas, setSolicitudesActivas] = useState<Solicitud[]>([]);
  const [postulaciones, setPostulaciones] = useState<Postulacion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingPostulaciones, setIsLoadingPostulaciones] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'solicitudes' | 'postulaciones'>('solicitudes');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [selectedSolicitud, setSelectedSolicitud] = useState<Solicitud | null>(null);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  // Función para cargar solicitudes activas de la plataforma
  const cargarSolicitudesActivas = async () => {
    try {
      setIsLoading(true);
      
      // Obtener todas las solicitudes activas de la plataforma
      const solicitudes = await requestsService.getActiveSolicitudes();
      
      // Filtrar solo las solicitudes con estado 'publish' (activas)
      const solicitudesActivasFiltradas = solicitudes.filter(
        solicitud => (solicitud.post_status || solicitud.estado) === 'publish' || (solicitud.post_status || solicitud.estado) === 'activa'
      );
      
      console.log('🔍 Total solicitudes recibidas:', solicitudes.length);
      console.log('✅ Solicitudes activas filtradas:', solicitudesActivasFiltradas.length);
      console.log('📊 Estados encontrados:', solicitudes.map(s => s.post_status || s.estado));
      
      setSolicitudesActivas(solicitudesActivasFiltradas);
      
    } catch (error) {
      console.error('❌ Error al cargar solicitudes activas:', error);
      
      // En caso de error, usar datos de ejemplo
      console.log('📝 Usando datos de ejemplo debido a error en API');
      const ejemploSolicitudes: Solicitud[] = [
        {
          id: 1,
          tipo: 'Préstamo Personal',
          monto: 25000,
          estado: 'activa',
          fechaCreacion: '2024-01-15',
          tiempoPrestamo: 12,
          usuarioId: 2,
          clienteNombre: 'Juan Pérez',
        },
        {
          id: 2,
          tipo: 'Préstamo Vehicular',
          monto: 40000,
          estado: 'activa',
          fechaCreacion: '2024-01-12',
          tiempoPrestamo: 24,
          usuarioId: 3,
          clienteNombre: 'María García',
        },
        {
          id: 3,
          tipo: 'Préstamo Empresarial',
          monto: 15000,
          estado: 'activa',
          fechaCreacion: '2024-01-10',
          tiempoPrestamo: 18,
          usuarioId: 4,
          clienteNombre: 'Carlos López',
        },
      ];
      
      setSolicitudesActivas(ejemploSolicitudes);
      
      // Mostrar alerta informativa
      Alert.alert(
        'Información',
        'Mostrando datos de ejemplo. Verifique su conexión a internet.',
        [{ text: 'Entendido' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Función para cargar las postulaciones del prestamista
  const cargarPostulaciones = async () => {
    try {
      setIsLoadingPostulaciones(true);
      
      // Validar que el usuario esté logueado y tenga ID
      if (!user?.id) {
        console.warn('⚠️ No se puede cargar postulaciones: usuario no logueado o sin ID');
        setPostulaciones([]);
        return;
      }
      
      console.log('🔄 Iniciando carga de postulaciones para usuario:', user.id);
      
      // Obtener las postulaciones del prestamista actual usando su ID
      const postulacionesData = await requestsService.getPrestamistaPostulaciones(user.id);
      
      console.log('🔍 Total postulaciones recibidas:', postulacionesData.length);
      console.log('👤 ID del usuario logueado:', user.id);
      
      // Debug detallado de cada postulación
      postulacionesData.forEach((postulacion, index) => {
        console.log(`📋 Postulación ${index + 1}:`);
        console.log('  - ID:', postulacion.ID);
        console.log('  - post_status:', postulacion.post_status);
        console.log('  - estado:', postulacion.estado);
        console.log('  - estado_postulacion:', postulacion.estado_postulacion);
        console.log('  - post_modified:', postulacion.post_modified);
        console.log('  - post_date:', postulacion.post_date);
        console.log('  - post_title:', postulacion.post_title);
        console.log('  - meta:', postulacion.meta);
        
        // Probar la función getPostulacionData para ver el estado procesado
        const dataProcessed = getPostulacionData(postulacion);
        console.log('  - Estado procesado:', dataProcessed.estado);
      });
      
      setPostulaciones(postulacionesData);
      console.log('✅ Postulaciones cargadas y estado actualizado');
      
    } catch (error) {
      console.error('❌ Error al cargar postulaciones:', error);
      
      // En caso de error, usar datos de ejemplo
      console.log('📝 Usando datos de ejemplo para postulaciones debido a error en API');
      const ejemploPostulaciones: Postulacion[] = [
        {
          ID: '1',
          solicitud_id: '123',
          prestamista_id: user?.id?.toString() || '1',
          monto_ofrecido: 25000,
          tasa_interes: 2.5,
          plazo_meses: 12,
          estado: 'pendiente',
          fecha_postulacion: '2024-01-15',
          comentarios: 'Oferta competitiva con tasa preferencial',
          solicitud: {
            titulo: 'Préstamo Personal',
            monto_solicitado: 25000,
            autor_nombre: 'Juan Pérez',
            fecha_solicitud: '2024-01-14'
          }
        },
        {
          ID: '2',
          solicitud_id: '124',
          prestamista_id: user?.id?.toString() || '1',
          monto_ofrecido: 40000,
          tasa_interes: 3.0,
          plazo_meses: 24,
          estado: 'aceptada',
          fecha_postulacion: '2024-01-10',
          comentarios: 'Excelente perfil crediticio',
          solicitud: {
            titulo: 'Préstamo Vehicular',
            monto_solicitado: 40000,
            autor_nombre: 'María García',
            fecha_solicitud: '2024-01-09'
          }
        },
        {
          ID: '3',
          solicitud_id: '125',
          prestamista_id: user?.id?.toString() || '1',
          monto_ofrecido: 15000,
          tasa_interes: 2.8,
          plazo_meses: 18,
          estado: 'rechazada',
          fecha_postulacion: '2024-01-08',
          comentarios: 'Oferta inicial',
          solicitud: {
            titulo: 'Préstamo Empresarial',
            monto_solicitado: 15000,
            autor_nombre: 'Carlos López',
            fecha_solicitud: '2024-01-07'
          }
        }
      ];
      
      setPostulaciones(ejemploPostulaciones);
    } finally {
      setIsLoadingPostulaciones(false);
    }
  };

  // Función para manejar el refresh
  const onRefresh = async () => {
    console.log('🔄 Iniciando refresh manual de datos...');
    setRefreshing(true);
    
    try {
      await Promise.all([
        cargarSolicitudesActivas(),
        cargarPostulaciones()
      ]);
      
      // Actualizar timestamp de última actualización
      setLastUpdate(new Date());
      console.log('✅ Refresh completado exitosamente');
      
    } catch (error) {
      console.error('❌ Error durante el refresh:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Función para manejar la postulación a una solicitud
  const handlePostularse = (solicitud: Solicitud) => {
    setSelectedSolicitud(solicitud);
    setShowConfirmation(true);
  };

  // Función para confirmar la postulación
  const confirmarPostulacion = async () => {
    setShowConfirmation(false);
    
    if (!selectedSolicitud || !user?.id) {
      showAlert('error', 'Error', 'No se pudo procesar la postulación. Intenta nuevamente.');
      return;
    }

    try {
      // Preparar los datos para la postulación
      const postulacionData = {
        id_prestamo: parseInt(selectedSolicitud.ID),
        author_id: user.id
      };

      console.log('📤 Enviando postulación:', postulacionData);
      
      // Enviar la postulación al servidor
      await requestsService.createPostulacion(postulacionData);
      
      // Mostrar mensaje de éxito
      setShowSuccessAlert(true);
      
      // Recargar las postulaciones para mostrar la nueva
      await cargarPostulaciones();
      
    } catch (error) {
      console.error('❌ Error al enviar postulación:', error);
      showAlert(
        'error',
        'Error',
        error instanceof Error ? error.message : 'No se pudo enviar la postulación. Intenta nuevamente.'
      );
    } finally {
      setSelectedSolicitud(null);
    }
  };

  // Función para cancelar la postulación
  const cancelarPostulacion = () => {
    setShowConfirmation(false);
    setSelectedSolicitud(null);
  };

  // Función para obtener el color del estado de postulación
  const getEstadoPostulacionColor = (estado: string | undefined) => {
    switch (estado) {
      case 'aceptada':
        return '#4CAF50';
      case 'rechazada':
        return '#F44336';
      case 'retirada':
        return '#9E9E9E';
      case 'pendiente':
      default:
        return '#FF9800';
    }
  };

  // Función helper para extraer datos de la postulación
  const getPostulacionData = (postulacion: Postulacion) => {
    // Obtener el estado real de la postulación
    let estado = 'pendiente'; // valor por defecto
    
    // Priorizar estado_postulacion del API (campo dinámico del backend)
    // El campo puede estar en postulacion.estado_postulacion o en postulacion.meta.estado_postulacion
    const estadoPostulacionAPI = postulacion.estado_postulacion || postulacion.meta?.estado_postulacion;
    
    if (estadoPostulacionAPI) {
      const estadoLower = estadoPostulacionAPI.toLowerCase().trim();
      if (estadoLower === 'aceptada' || estadoLower === 'aceptado' || estadoLower === 'aprobada' || estadoLower === 'aprobado') {
        estado = 'aceptada';
      } else if (estadoLower === 'rechazada' || estadoLower === 'rechazado' || estadoLower === 'denegada' || estadoLower === 'denegado') {
        estado = 'rechazada';
      } else if (estadoLower === 'retirada' || estadoLower === 'retirado' || estadoLower === 'cancelada' || estadoLower === 'cancelado') {
        estado = 'retirada';
      } else if (estadoLower === 'pendiente' || estadoLower === 'en revisión' || estadoLower === 'en revision') {
        estado = 'pendiente';
      } else {
        // Para cualquier otro valor, mantener como pendiente
        console.log('⚠️ Estado desconocido recibido del API:', estadoPostulacionAPI);
        estado = 'pendiente';
      }
    } else if (postulacion.estado) {
      // Usar campo estado como fallback
      estado = postulacion.estado;
    } else {
      // Si no hay estado_postulacion ni estado, mantener como pendiente
      // No usar post_status para determinar el estado de la postulación
      // ya que post_status se refiere al estado del post, no de la postulación
      estado = 'pendiente';
    }
    
    // Log para debugging del estado final
    console.log(`📊 Estado procesado para postulación ${postulacion.ID}:`, {
      estado_postulacion_directo: postulacion.estado_postulacion,
      estado_postulacion_meta: postulacion.meta?.estado_postulacion,
      estado_postulacion_usado: estadoPostulacionAPI,
      estado_fallback: postulacion.estado,
      estado_final: estado
    });
    
    return {
      titulo: postulacion.prestamo?.title || 'Préstamo',
      clienteNombre: postulacion.post_title || 'Cliente desconocido',
      montoSolicitado: postulacion.prestamo?.meta?.monto_solicitado?.[0] ? 
        parseInt(postulacion.prestamo.meta.monto_solicitado[0]) : 0,
      plazoMeses: postulacion.prestamo?.meta?.plazo_en_meses?.[0] ? 
        parseInt(postulacion.prestamo.meta.plazo_en_meses[0]) : 0,
      descripcion: postulacion.prestamo?.meta?.destino_o_descripcion_del_prestamo?.[0] || 'Préstamo',
      fechaPostulacion: postulacion.post_date,
      estado: estado,
      prestamoId: postulacion.meta?.id_prestamo || postulacion.prestamo?.ID?.toString() || ''
    };
  };

  // Cargar datos al montar el componente
  useEffect(() => {
    const cargarDatosIniciales = async () => {
      console.log('🚀 Cargando datos iniciales...');
      try {
        await Promise.all([
          cargarSolicitudesActivas(),
          cargarPostulaciones()
        ]);
        setLastUpdate(new Date());
        console.log('✅ Datos iniciales cargados');
      } catch (error) {
        console.error('❌ Error al cargar datos iniciales:', error);
      }
    };
    
    cargarDatosIniciales();
  }, [user]);

  // Efecto para refrescar datos cuando la pantalla recibe foco
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      console.log('🔄 Pantalla de prestamista recibió foco, refrescando datos...');
      Promise.all([
        cargarSolicitudesActivas(), // Refrescar solicitudes activas para ver nuevas solicitudes
        cargarPostulaciones() // Refrescar postulaciones para mostrar cambios del admin
      ]).then(() => {
        setLastUpdate(new Date());
        console.log('✅ Datos refrescados al recibir foco');
      }).catch(error => {
        console.error('❌ Error al refrescar datos:', error);
      });
    });

    return unsubscribe;
  }, [navigation]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Panel de Prestamista</Text>
            <Text style={styles.welcomeText}>Bienvenido, {user?.name}</Text>
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

      {/* Pestañas de navegación */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'solicitudes' && styles.activeTab]}
          onPress={() => setActiveTab('solicitudes')}
        >
          <Text style={[styles.tabText, activeTab === 'solicitudes' && styles.activeTabText]}>
            Solicitudes ({solicitudesActivas.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'postulaciones' && styles.activeTab]}
          onPress={() => setActiveTab('postulaciones')}
        >
          <Text style={[styles.tabText, activeTab === 'postulaciones' && styles.activeTabText]}>
            Mis Postulaciones ({postulaciones.length})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#48b783']}
            tintColor="#48b783"
          />
        }
      >
        {activeTab === 'solicitudes' ? (
          // Sección de Solicitudes Activas
          <>
            <View style={styles.sectionHeader}>
              <View style={styles.titleRow}>
                <Text style={styles.sectionTitle}>Solicitudes Activas ({solicitudesActivas.length})</Text>
                <TouchableOpacity 
                  style={[styles.refreshButton, isLoading && styles.refreshButtonDisabled]}
                  onPress={() => {
                    if (!isLoading) {
                      console.log('🔄 Recargando solicitudes activas manualmente...');
                      cargarSolicitudesActivas();
                    }
                  }}
                  disabled={isLoading}
                >
                  <Text style={styles.refreshButtonText}>
                    {isLoading ? 'Cargando...' : 'Recargar'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Cargando solicitudes...</Text>
              </View>
            ) : solicitudesActivas.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No hay solicitudes activas</Text>
                <Text style={styles.emptySubtext}>Las nuevas solicitudes aparecerán aquí</Text>
              </View>
            ) : (
              <View style={styles.solicitudesContainer}>
                {solicitudesActivas.map((solicitud) => (
                  <View key={solicitud.ID || solicitud.id} style={styles.solicitudItem}>
                    <View style={styles.solicitudHeader}>
                      <Text style={styles.clienteNombre}>
                        {solicitud.post_title || solicitud.titulo || `Usuario ${solicitud.author_id || solicitud.usuarioId}`}
                      </Text>
                      <Text style={styles.montoSolicitud}>
                        ${(solicitud.meta?.monto_solicitado ? parseInt(solicitud.meta.monto_solicitado) : solicitud.monto).toLocaleString()}
                      </Text>
                    </View>
                    <Text style={styles.tipoSolicitud}>{solicitud.post_type || solicitud.tipo}</Text>
                    <Text style={styles.fechaSolicitud}>
                      Iniciado: {new Date(solicitud.post_date || solicitud.fechaCreacion).toLocaleDateString('es-ES', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </Text>
                    <Text style={styles.tiempoTexto}>
                      Plazo: {solicitud.meta?.plazo_en_meses || solicitud.tiempoPrestamo} meses
                    </Text>
                    <View style={styles.solicitudFooter}>
                      <View style={styles.estadoBadge}>
                        <Text style={styles.estadoTexto}>{(solicitud.post_status || 'ACTIVO').toUpperCase()}</Text>
                      </View>
                      <TouchableOpacity 
                        style={styles.postularseButton}
                        onPress={() => handlePostularse(solicitud)}
                      >
                        <Ionicons name="hand-right-outline" size={16} color="#fff" />
                        <Text style={styles.postularseButtonText}>Postularse</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </>
        ) : (
          // Sección de Postulaciones
          <>
            <View style={styles.sectionHeader}>
              <View style={styles.titleRow}>
                <Text style={styles.sectionTitle}>Mis Postulaciones ({postulaciones.length})</Text>
                <TouchableOpacity 
                  style={[styles.refreshButton, refreshing && styles.refreshButtonDisabled]}
                  onPress={onRefresh}
                  disabled={refreshing}
                >
                  <Text style={styles.refreshButtonText}>
                    {refreshing ? 'Cargando...' : 'Recargar'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            
            {isLoadingPostulaciones ? (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Cargando postulaciones...</Text>
              </View>
            ) : postulaciones.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No tienes postulaciones aún</Text>
                <Text style={styles.emptySubtext}>Tus ofertas a solicitudes aparecerán aquí</Text>
              </View>
            ) : (
              <View style={styles.solicitudesContainer}>
                {postulaciones.map((postulacion) => {
                  const data = getPostulacionData(postulacion);
                  return (
                    <View key={postulacion.ID} style={styles.postulacionItem}>
                      <View style={styles.solicitudHeader}>
                        <Text style={styles.clienteNombre}>
                          {data.clienteNombre}
                        </Text>
                        <View style={[styles.estadoBadgePostulacion, { backgroundColor: getEstadoPostulacionColor(data.estado) }]}>
                          <Text style={styles.estadoTextoPostulacion}>{data.estado.toUpperCase()}</Text>
                        </View>
                      </View>
                      <Text style={styles.tipoSolicitud}>{data.titulo}</Text>
                      <View style={styles.postulacionDetails}>
                        <Text style={styles.montoOfrecido}>
                          Monto solicitado: ${data.montoSolicitado.toLocaleString()}
                        </Text>
                        <Text style={styles.plazoMeses}>
                          Plazo: {data.plazoMeses} meses
                        </Text>
                        <Text style={styles.tipoSolicitud}>
                          Destino: {data.descripcion}
                        </Text>
                      </View>
                      <Text style={styles.fechaSolicitud}>
                        Postulado: {new Date(data.fechaPostulacion).toLocaleDateString('es-ES', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </Text>
                      <Text style={styles.fechaSolicitud}>
                        ID Préstamo: #{data.prestamoId}
                      </Text>
                    </View>
                  );
                })}
              </View>
            )}
          </>        )}      </ScrollView>

      {/* Modal de confirmación para postulación */}
      <ConfirmationAlert
        visible={showConfirmation}
        title="Postularse a Solicitud"
        message={selectedSolicitud ? 
          `¿Deseas postularte a la solicitud de ${selectedSolicitud.author_name || selectedSolicitud.clienteNombre || 'este cliente'}?\n\nMonto: $${(selectedSolicitud.meta?.monto_solicitado ? parseInt(selectedSolicitud.meta.monto_solicitado) : selectedSolicitud.monto).toLocaleString()}\nPlazo: ${selectedSolicitud.meta?.plazo_en_meses || selectedSolicitud.tiempoPrestamo} meses\nTipo: ${selectedSolicitud.post_type || selectedSolicitud.tipo}` 
          : ''
        }
        confirmText="Postularse"
        cancelText="Cancelar"
        onConfirm={confirmarPostulacion}
        onCancel={cancelarPostulacion}
      />

      {/* Alert de éxito */}
      <AlertMessage
        visible={showSuccessAlert}
        type="success"
        title="¡Postulación Enviada!"
        message="Tu postulación ha sido enviada exitosamente. El solicitante será notificado y podrá revisar tu propuesta."
        onClose={() => setShowSuccessAlert(false)}
      />
    </View>  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
     backgroundColor: '#48b783',
     paddingTop: 50,
     paddingBottom: 20,
     paddingHorizontal: 20,
     borderBottomLeftRadius: 25,
     borderBottomRightRadius: 25,
     shadowColor: '#000',
     shadowOffset: {
       width: 0,
       height: 4,
     },
     shadowOpacity: 0.15,
     shadowRadius: 8,
     elevation: 10,
   },
  headerTitle: {
     fontSize: 24,
     fontWeight: 'bold',
     color: '#fff',
     marginBottom: 10,
   },
  welcomeText: {
     fontSize: 18,
     color: '#fff',
     opacity: 0.9,
   },
   headerTop: {
     flexDirection: 'row',
     justifyContent: 'space-between',
     alignItems: 'flex-start',
   },
   headerContent: {
     flex: 1,
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
     backgroundColor: '#FF4444',
     borderRadius: 10,
     minWidth: 20,
     height: 20,
     justifyContent: 'center',
     alignItems: 'center',
     borderWidth: 2,
     borderColor: '#fff',
   },
   badgeText: {
     color: '#fff',
     fontSize: 12,
     fontWeight: 'bold',
   },
  content: {
    flex: 1,
    padding: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#48b783',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    marginTop: 10,
  },
  sectionHeader: {
    marginBottom: 15,
    marginTop: 10,
  },
  lastUpdateText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 5,
  },
  refreshingText: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '500',
    marginTop: 5,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  refreshButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    opacity: 1,
  },
  refreshButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  refreshButtonDisabled: {
    opacity: 0.6,
  },
  menuContainer: {
    marginBottom: 20,
  },
  menuItem: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  menuText: {
       fontSize: 16,
       color: '#333',
       fontWeight: '500',
     },
     solicitudesContainer: {
       marginBottom: 20,
     },
     solicitudItem: {
       backgroundColor: '#fff',
       borderRadius: 12,
       padding: 15,
       marginBottom: 12,
       shadowColor: '#000',
       shadowOffset: {
         width: 0,
         height: 2,
       },
       shadowOpacity: 0.08,
       shadowRadius: 4,
       elevation: 3,
       borderLeftWidth: 4,
       borderLeftColor: '#48b783',
     },
     solicitudHeader: {
       flexDirection: 'row',
       justifyContent: 'space-between',
       alignItems: 'center',
       marginBottom: 8,
     },
     clienteNombre: {
       fontSize: 16,
       fontWeight: 'bold',
       color: '#333',
     },
     montoSolicitud: {
       fontSize: 16,
       fontWeight: 'bold',
       color: '#48b783',
     },
     fechaSolicitud: {
       fontSize: 14,
       color: '#666',
       marginBottom: 10,
     },
     estadoBadge: {
       backgroundColor: '#e8f5e8',
       paddingHorizontal: 12,
       paddingVertical: 4,
       borderRadius: 15,
       alignSelf: 'flex-start',
     },
     estadoTexto: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#48b783',
      },
      loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
      },
      loadingText: {
        fontSize: 16,
        color: '#666',
      },
      emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
      },
      emptyText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
        textAlign: 'center',
      },
      emptySubtext: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        lineHeight: 20,
      },
      tipoSolicitud: {
        fontSize: 14,
        color: '#48b783',
        fontWeight: '600',
        marginBottom: 4,
      },
      tiempoTexto: {
         fontSize: 13,
         color: '#666',
         marginBottom: 8,
       },
       solicitudFooter: {
         flexDirection: 'row',
         justifyContent: 'space-between',
         alignItems: 'center',
         marginTop: 8,
       },
       postularseButton: {
         backgroundColor: '#48b783',
         flexDirection: 'row',
         alignItems: 'center',
         paddingHorizontal: 12,
         paddingVertical: 8,
         borderRadius: 20,
         shadowColor: '#000',
         shadowOffset: {
           width: 0,
           height: 2,
         },
         shadowOpacity: 0.1,
         shadowRadius: 3,
         elevation: 3,
       },
       postularseButtonText: {
         color: '#fff',
         fontSize: 12,
         fontWeight: 'bold',
         marginLeft: 4,
       },
       // Estilos para las pestañas
       tabContainer: {
         flexDirection: 'row',
         backgroundColor: '#fff',
         marginHorizontal: 20,
         marginTop: 10,
         borderRadius: 10,
         shadowColor: '#000',
         shadowOffset: {
           width: 0,
           height: 2,
         },
         shadowOpacity: 0.1,
         shadowRadius: 3.84,
         elevation: 5,
       },
       tab: {
         flex: 1,
         paddingVertical: 15,
         paddingHorizontal: 10,
         alignItems: 'center',
         borderRadius: 10,
       },
       activeTab: {
         backgroundColor: '#48b783',
       },
       tabText: {
         fontSize: 14,
         fontWeight: '600',
         color: '#666',
       },
       activeTabText: {
         color: '#fff',
       },
       // Estilos para postulaciones
       postulacionItem: {
         backgroundColor: '#fff',
         borderRadius: 12,
         padding: 15,
         marginBottom: 12,
         shadowColor: '#000',
         shadowOffset: {
           width: 0,
           height: 2,
         },
         shadowOpacity: 0.08,
         shadowRadius: 4,
         elevation: 3,
         borderLeftWidth: 4,
         borderLeftColor: '#2196F3',
       },
       estadoBadgePostulacion: {
         paddingHorizontal: 12,
         paddingVertical: 4,
         borderRadius: 15,
         alignSelf: 'flex-start',
       },
       estadoTextoPostulacion: {
         fontSize: 12,
         fontWeight: 'bold',
         color: '#fff',
       },
       postulacionDetails: {
         marginVertical: 8,
       },
       montoOfrecido: {
         fontSize: 16,
         fontWeight: 'bold',
         color: '#2196F3',
         marginBottom: 4,
       },
       tasaInteres: {
         fontSize: 14,
         color: '#FF9800',
         fontWeight: '600',
         marginBottom: 2,
       },
       plazoMeses: {
         fontSize: 14,
         color: '#666',
         marginBottom: 2,
       },
       comentarios: {
           fontSize: 13,
           color: '#666',
           fontStyle: 'italic',
           marginTop: 8,
           backgroundColor: '#f8f9fa',
           padding: 8,
           borderRadius: 6,
         },
        });