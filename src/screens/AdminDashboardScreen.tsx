import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, RefreshControl, Modal, TextInput, FlatList, Dimensions } from "react-native";
import { ScrollView } from "react-native-gesture-handler";

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from "../contexts/AuthContext";
import { useNotificationContext } from '../contexts/NotificationContext';
import { useAlertContext } from '../contexts/AlertContext';
import { requestsService, Solicitud, Postulacion, AbonoCapital } from '../services/requests.service';
import { API_BASE_URL } from '../config/api.config';

const { width: screenWidth } = Dimensions.get('window');

interface Usuario {
  ID: number;
  username: string;
  email: string;
  display_name: string;
  roles: string[];
  meta: {
    nickname?: string[];
    first_name?: string[];
    last_name?: string[];
    identity_number?: string[];
    phone?: string[];
    address?: string[];
    account_status?: string[];
    [key: string]: any;
  };
}

interface Pago {
  ID: string;
  post_author: string;
  post_date: string;
  post_date_gmt: string;
  post_content: string;
  post_title: string;
  post_excerpt: string;
  post_status: string;
  comment_status: string;
  ping_status: string;
  post_password: string;
  post_name: string;
  to_ping: string;
  pinged: string;
  post_modified: string;
  post_modified_gmt: string;
  post_content_filtered: string;
  post_parent: string;
  guid: string;
  menu_order: string;
  post_type: string;
  post_mime_type: string;
  comment_count: string;
  meta: {
    numero_cuota?: string;
    cuota_pagada?: string;
    usuario_solicitante?: string;
    solicitud_relacionada?: string;
    [key: string]: any;
  };
  // Campos calculados para compatibilidad
  id?: number;
  solicitudId?: number;
  monto?: number;
  abonoCapital?: number;
  interes?: number;
  fechaPago?: string;
  estado?: string;
  clienteNombre?: string;
  tipo?: 'mensual' | 'abono_capital';
}

interface Aplicacion {
  id: number;
  solicitudId: number;
  prestamistaId: number;
  prestamistaNombre: string;
  montoOfrecido: number;
  tasaInteres: number;
  plazoOfrecido: number;
  estado: string;
  fechaAplicacion: string;
}

export default function AdminDashboardScreen({ navigation }: { navigation: any }) {
  const { logout, user } = useAuth();
  const { unreadCount } = useNotificationContext();
  const { showAlert } = useAlertContext();
  
  // Estados principales
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  // Estados para datos
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [aplicaciones, setAplicaciones] = useState<Postulacion[]>([]);
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [abonosCapital, setAbonosCapital] = useState<AbonoCapital[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  
  // Estados para modales
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState('');
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [confirmDeleteModal, setConfirmDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<Usuario | null>(null);
  const [editUserModal, setEditUserModal] = useState(false);
  const [userToEdit, setUserToEdit] = useState<Usuario | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    role: '',
    status: ''
  });
  
  // Estados para filtros
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [searchText, setSearchText] = useState('');
  
  // Estados para el desplegable de cambio de estado
  const [selectedSolicitudId, setSelectedSolicitudId] = useState<number | null>(null);
  const [showEstadoPicker, setShowEstadoPicker] = useState(false);
  const [tempEstado, setTempEstado] = useState('pendiente');
  
  // Estados para filtros de aplicaciones
  const [filtroEstadoAplicaciones, setFiltroEstadoAplicaciones] = useState('todos');
  const [searchTextAplicaciones, setSearchTextAplicaciones] = useState('');
  
  // Estados para cambio de estado de postulaciones
  const [showEstadoPostulacionModal, setShowEstadoPostulacionModal] = useState(false);
  const [selectedPostulacion, setSelectedPostulacion] = useState<Postulacion | null>(null);
  const [nuevoEstadoPostulacion, setNuevoEstadoPostulacion] = useState('Aceptada');
  
  // Estados para filtros de pagos mensuales
  const [filtroEstadoPagos, setFiltroEstadoPagos] = useState('todos');
  const [searchTextPagos, setSearchTextPagos] = useState('');
  
  // Estados para filtros de abonos a capital
  const [filtroEstadoAbonosCapital, setFiltroEstadoAbonosCapital] = useState('todos');
  const [searchTextAbonosCapital, setSearchTextAbonosCapital] = useState('');
  
  // Estados para edición de solicitudes
  const [editSolicitudModal, setEditSolicitudModal] = useState(false);
  const [solicitudToEdit, setSolicitudToEdit] = useState<Solicitud | null>(null);
  const [editSolicitudForm, setEditSolicitudForm] = useState({
    titulo: '',
    descripcion: '',
    monto: '',
    plazo: '',
    tasa_interes: '',
    tipo: '',
    estado: '',
    desembolsado: false
  });

  // Datos de ejemplo para usuarios (temporales)
  const ejemploUsuarios: Usuario[] = [];

  // Función para cargar usuarios desde el API
  const cargarUsuarios = async () => {
    try {
      console.log('🔄 Cargando usuarios desde el API...');
      
      // Hacer la llamada al API real (sin autenticación)
      const response = await fetch(`${API_BASE_URL}users`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      const usuariosData = await response.json();
      
      // Mapear los datos del API al formato esperado por la interfaz Usuario
      const usuariosMapeados = usuariosData.map((apiUser: any) => {
        const firstName = apiUser.meta?.first_name?.[0] || '';
        const lastName = apiUser.meta?.last_name?.[0] || '';
        const fullName = firstName && lastName ? `${firstName} ${lastName}` : apiUser.display_name || apiUser.username;
        const accountStatus = apiUser.meta?.account_status?.[0] || 'pending';
        const role = apiUser.roles?.[0] || 'cliente';
        
        return {
          ID: apiUser.ID,
          username: apiUser.username,
          email: apiUser.email,
          display_name: apiUser.display_name,
          roles: apiUser.roles,
          meta: apiUser.meta,
          // Campos mapeados para compatibilidad con la interfaz existente
          id: apiUser.ID,
          name: fullName,
          role: role,
          status: accountStatus,
          fechaRegistro: new Date().toISOString()
        };
      });
      
      console.log('✅ Usuarios cargados desde el API:', usuariosMapeados.length);
      setUsuarios(usuariosMapeados);
      
    } catch (error) {
      console.error('❌ Error al cargar usuarios:', error);
      // En caso de error, usar array vacío
      setUsuarios([]);
    }
  };

  // Función para cargar pagos mensuales desde el API
  const cargarPagosMensuales = async () => {
    try {
      console.log('🔄 Cargando pagos mensuales desde el API...');
      
      // Obtener pagos mensuales usando el servicio
      const pagosMensualesData = await requestsService.getPagosMensuales();
      
      console.log('📥 Pagos mensuales recibidos:', pagosMensualesData.length);
      console.log('📋 Datos de pagos:', JSON.stringify(pagosMensualesData, null, 2));
      
      // Mapear los datos del API al formato esperado por la interfaz
      const pagosMapeados = pagosMensualesData.map((apiPago: any) => {
        // Obtener información del usuario solicitante
        const usuarioSolicitante = apiPago.meta?.usuario_solicitante || '';
        const numeroCuota = apiPago.meta?.numero_cuota || '1';
        const cuotaPagada = apiPago.meta?.cuota_pagada === '1';
        
        // Extraer nombre del cliente del título del post
        const clienteNombre = apiPago.post_title || 'Cliente desconocido';
        
        return {
          ...apiPago,
          // Campos calculados para compatibilidad
          id: parseInt(apiPago.ID),
          solicitudId: parseInt(apiPago.meta?.solicitud_relacionada || '0'),
          monto: 0, // Se puede calcular si hay más información
          abonoCapital: 0, // Se puede calcular si hay más información
          interes: 0, // Se puede calcular si hay más información
          fechaPago: apiPago.post_date,
          estado: cuotaPagada ? 'pagado' : 'pendiente',
          clienteNombre: clienteNombre,
          tipo: 'mensual' as const
        };
      });
      
      console.log('✅ Pagos mensuales procesados:', pagosMapeados.length);
      setPagos(pagosMapeados);
      
    } catch (error) {
      console.error('❌ Error al cargar pagos mensuales:', error);
      // En caso de error, usar array vacío
      setPagos([]);
    }
  };

  // Función para cargar abonos a capital desde el API
  const cargarAbonosCapital = async () => {
    try {
      console.log('🔄 Cargando abonos a capital desde el API...');
      
      // Obtener abonos a capital usando el servicio
      const abonosCapitalData = await requestsService.getAbonosCapital();
      
      console.log('📥 Abonos a capital recibidos:', abonosCapitalData.length);
      console.log('📋 Datos de abonos:', JSON.stringify(abonosCapitalData, null, 2));
      
      console.log('✅ Abonos a capital procesados:', abonosCapitalData.length);
      setAbonosCapital(abonosCapitalData);
      
    } catch (error) {
      console.error('❌ Error al cargar abonos a capital:', error);
      // En caso de error, usar array vacío
      setAbonosCapital([]);
    }
  };

  // Cargar datos iniciales
  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    console.log('🔄 Iniciando carga de datos del dashboard...');
    setIsLoading(true);
    try {
      // Cargar solicitudes activas
      console.log('📋 Cargando solicitudes activas...');
      const solicitudesData = await requestsService.getActiveSolicitudes();
      setSolicitudes(solicitudesData);
      console.log('✅ Solicitudes cargadas:', solicitudesData.length);
      
      // Cargar todas las postulaciones
      console.log('📋 Cargando postulaciones...');
      const postulacionesData = await requestsService.getAllPostulaciones();
      
      if (postulacionesData && Array.isArray(postulacionesData) && postulacionesData.length > 0) {
        setAplicaciones(postulacionesData);
        console.log('✅ Postulaciones cargadas:', postulacionesData.length);
      } else {
        setAplicaciones([]);
        console.log('ℹ️ No se encontraron postulaciones');
      }
      
      // Cargar usuarios desde el API
      console.log('👥 Cargando usuarios...');
      await cargarUsuarios();
      
      // Cargar pagos mensuales desde el API
      console.log('💰 Cargando pagos mensuales...');
      await cargarPagosMensuales();
      
      // Cargar abonos a capital desde el API
      console.log('💰 Cargando abonos a capital...');
      await cargarAbonosCapital();
      
      console.log('✅ Carga de datos completada exitosamente');
    } catch (error) {
      console.error('❌ Error al cargar datos del dashboard:', error);
      console.error('🔍 Detalles del error:', JSON.stringify(error, null, 2));
      // En caso de error, mantener arrays vacíos
      setSolicitudes([]);
      setAplicaciones([]);
      setPagos([]);
      setAbonosCapital([]);
      setUsuarios([]);
    } finally {
      setIsLoading(false);
      console.log('🏁 Estado isLoading establecido a false');
    }
  };

  const onRefresh = async () => {
    console.log('🔄 Iniciando refresh del dashboard admin...');
    setRefreshing(true);
    try {
      await cargarDatos();
      console.log('✅ Refresh completado exitosamente');
    } catch (error) {
      console.error('❌ Error durante el refresh:', error);
    } finally {
      setRefreshing(false);
      console.log('🏁 Estado refreshing establecido a false');
    }
  };

  // Función para cambiar estado de solicitud
  const cambiarEstadoSolicitud = async (solicitudId: number, nuevoEstado: string) => {
    try {
      // Actualizar en el backend
      await requestsService.updateSolicitud(solicitudId, { estado: nuevoEstado });
      
      // Actualizar en el estado local
      setSolicitudes(prev => 
        prev.map(s => s.id === solicitudId ? { ...s, estado: nuevoEstado } : s)
      );
      
      showAlert('success', 'Éxito', `Estado cambiado a ${nuevoEstado}`);
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      showAlert('error', 'Error', 'No se pudo actualizar el estado de la solicitud');
    }
  };

  // Función para abrir modal de cambio de estado de postulación
  const abrirModalEstadoPostulacion = (postulacion: Postulacion) => {
    setSelectedPostulacion(postulacion);
    // Establecer el estado actual como valor por defecto
    const estadoActual = postulacion.estado_postulacion || 'Pendiente';
    setNuevoEstadoPostulacion(estadoActual);
    setShowEstadoPostulacionModal(true);
  };

  // Función para actualizar estado de postulación
  const actualizarEstadoPostulacion = async () => {
    if (!selectedPostulacion) return;
    
    try {
      // Obtener el ID del préstamo desde los metadatos o el objeto prestamo
      const prestamoId = selectedPostulacion.meta?.id_prestamo?.[0] || selectedPostulacion.prestamo?.ID;
      
      // Debug: Verificar los valores antes de enviar
      console.log('🔍 DEBUG - selectedPostulacion:', selectedPostulacion);
      console.log('🔍 DEBUG - selectedPostulacion.ID:', selectedPostulacion.ID);
      console.log('🔍 DEBUG - prestamoId:', prestamoId);
      console.log('🔍 DEBUG - nuevoEstadoPostulacion:', nuevoEstadoPostulacion);
      console.log('🔍 DEBUG - Tipo de prestamoId:', typeof prestamoId);
      
      // Verificar que el ID del préstamo existe y es válido
      if (!prestamoId) {
        throw new Error('ID del préstamo no encontrado en la postulación');
      }
      
      // Actualizar en el backend - usar el ID del préstamo
      await requestsService.updateEstadoPostulacion(prestamoId, nuevoEstadoPostulacion);
      
      // Actualizar en el estado local
      setAplicaciones(prev => 
        prev.map(app => {
          const appPrestamoId = app.meta?.id_prestamo?.[0] || app.prestamo?.ID;
          return appPrestamoId === prestamoId 
            ? { ...app, estado_postulacion: nuevoEstadoPostulacion }
            : app;
        })
      );
      
      showAlert('success', 'Éxito', `Estado de postulación actualizado a ${nuevoEstadoPostulacion}`);
      setShowEstadoPostulacionModal(false);
      setSelectedPostulacion(null);
      
    } catch (error) {
      console.error('Error al actualizar estado de postulación:', error);
      showAlert(
        'error', 
        'Error', 
        error instanceof Error ? error.message : 'No se pudo actualizar el estado de la postulación'
      );
    }
  };

  // Función para cancelar cambio de estado de postulación
  const cancelarCambioEstadoPostulacion = () => {
    setShowEstadoPostulacionModal(false);
    setSelectedPostulacion(null);
    setNuevoEstadoPostulacion('Aceptada');
  };
  

  
  // Función para manejar el cambio de estado desde el desplegable
  const handleEstadoChange = () => {
    if (selectedSolicitudId && tempEstado) {
      cambiarEstadoSolicitud(selectedSolicitudId, tempEstado);
      setShowEstadoPicker(false);
      setSelectedSolicitudId(null);
    }
  };
  
  // Función para abrir el desplegable de estado
  const openEstadoPicker = (solicitudId: number, estadoActual: string) => {
    setSelectedSolicitudId(solicitudId);
    setTempEstado(estadoActual);
    setShowEstadoPicker(true);
  };
  
  // Funciones para editar solicitudes
  const abrirEditarSolicitud = (solicitud: Solicitud) => {
    setSolicitudToEdit(solicitud);
    
    console.log('🔍 Datos de la solicitud a editar:', {
      solicitud,
      meta: solicitud.meta,
      monto_meta: solicitud.meta?.monto_solicitado || solicitud.meta?._monto_solicitado,
      plazo_meta: solicitud.meta?.plazo_en_meses || solicitud.meta?._plazo_en_meses,
      descripcion_meta: solicitud.meta?.destino_o_descripcion_del_prestamo || solicitud.meta?._destino_o_descripcion_del_prestamo
    });
    
    const formData = {
      titulo: solicitud.post_title || solicitud.titulo || '',
      descripcion: solicitud.meta?.destino_o_descripcion_del_prestamo || solicitud.meta?._destino_o_descripcion_del_prestamo || solicitud.destino_o_descripcion_del_prestamo || '',
      monto: (solicitud.meta?.monto_solicitado || solicitud.meta?._monto_solicitado || solicitud.monto?.toString() || ''),
      plazo: (solicitud.meta?.plazo_en_meses || solicitud.meta?._plazo_en_meses || solicitud.plazo?.toString() || ''),
      tasa_interes: (solicitud.meta?.tasa_mensual || solicitud.meta?._tasa_mensual || solicitud.tasa_interes?.toString() || ''),
      tipo: solicitud.tipo || solicitud.post_type || '',
      estado: solicitud.estado || solicitud.post_status || 'pendiente',
      desembolsado: (solicitud.meta?.desembolsado || solicitud.meta?._desembolsado || solicitud.desembolsado) === "1"
    };
    
    console.log('📝 Datos del formulario configurados:', formData);
    
    setEditSolicitudForm(formData);
    setEditSolicitudModal(true);
  };
  
  const guardarCambiosSolicitud = async () => {
    if (!solicitudToEdit) return;
    
    // Validar campos requeridos
    if (!editSolicitudForm.titulo.trim()) {
      showAlert('error', 'Error', 'El título de la solicitud es requerido');
      return;
    }
    
    if (!editSolicitudForm.monto.trim() || isNaN(parseFloat(editSolicitudForm.monto))) {
      showAlert('error', 'Error', 'El monto debe ser un número válido');
      return;
    }
    
    if (!editSolicitudForm.plazo.trim() || isNaN(parseInt(editSolicitudForm.plazo))) {
      showAlert('error', 'Error', 'El plazo debe ser un número válido');
      return;
    }
    
    try {
      const solicitudActualizada = {
        id: parseInt(solicitudToEdit.id.toString()),
        post_title: editSolicitudForm.titulo.trim(),
        meta: {
          monto_solicitado: editSolicitudForm.monto.trim(),
          plazo_en_meses: editSolicitudForm.plazo.trim(),
          destino_o_descripcion_del_prestamo: editSolicitudForm.descripcion.trim(),
          desembolsado: editSolicitudForm.desembolsado ? "1" : "0"
        }
      };
      
      console.log('📝 Datos a enviar para actualización:', {
        solicitudId: solicitudToEdit.id,
        solicitudActualizada,
        formData: editSolicitudForm
      });
      
      console.log('🔍 Validación de datos antes del envío:', {
        tituloValido: !!solicitudActualizada.post_title,
        montoValido: !!solicitudActualizada.meta.monto_solicitado && !isNaN(parseFloat(solicitudActualizada.meta.monto_solicitado)),
        plazoValido: !!solicitudActualizada.meta.plazo_en_meses && !isNaN(parseInt(solicitudActualizada.meta.plazo_en_meses)),
        descripcionPresente: !!solicitudActualizada.meta.destino_o_descripcion_del_prestamo
      });
      
      const solicitudId = parseInt(solicitudToEdit.id.toString());
      console.log('🚀 Iniciando actualización de solicitud ID:', solicitudId);
      
      const resultado = await requestsService.updateSolicitud(solicitudId, solicitudActualizada);
      console.log('✅ Respuesta del servidor:', resultado);
      
      // Actualizar la lista local manteniendo todos los campos existentes
      setSolicitudes(prev => prev.map(s => 
        s.id === solicitudId ? {
          ...s,
          post_title: solicitudActualizada.post_title,
          titulo: solicitudActualizada.post_title,
          monto: parseFloat(solicitudActualizada.meta.monto_solicitado),
          plazo: solicitudActualizada.meta.plazo_en_meses,
          destino_o_descripcion_del_prestamo: solicitudActualizada.meta.destino_o_descripcion_del_prestamo,
          desembolsado: solicitudActualizada.meta.desembolsado,
          meta: {
            ...s.meta,
            monto_solicitado: solicitudActualizada.meta.monto_solicitado,
            plazo_en_meses: solicitudActualizada.meta.plazo_en_meses,
            destino_o_descripcion_del_prestamo: solicitudActualizada.meta.destino_o_descripcion_del_prestamo,
            desembolsado: solicitudActualizada.meta.desembolsado
          }
        } : s
      ));
      
      showAlert('success', 'Éxito', 'Solicitud actualizada correctamente');
      setEditSolicitudModal(false);
      setSolicitudToEdit(null);
    } catch (error) {
      console.error('❌ Error detallado al actualizar solicitud:', {
        error,
        message: error.message,
        stack: error.stack,
        solicitudId: solicitudToEdit?.id,
        formData: editSolicitudForm
      });
      
      // Mostrar el error específico al usuario
      const errorMessage = error.message || 'Error desconocido al actualizar la solicitud';
      showAlert('error', 'Error al actualizar', `No se pudo actualizar la solicitud: ${errorMessage}`);
    }
  };
  
  const cerrarEditarSolicitud = () => {
    setEditSolicitudModal(false);
    setSolicitudToEdit(null);
    setEditSolicitudForm({
      titulo: '',
      descripcion: '',
      monto: '',
      plazo: '',
      tasa_interes: '',
      tipo: '',
      estado: '',
      desembolsado: false
    });
  };

  // Función para eliminar usuario con confirmación
  const confirmarEliminarUsuario = (usuario: Usuario) => {
    setUserToDelete(usuario);
    setConfirmDeleteModal(true);
  };

  const eliminarUsuario = () => {
    if (userToDelete) {
      setUsuarios(prev => prev.filter(u => u.ID !== userToDelete.ID));
      const firstName = userToDelete.meta?.first_name?.[0] || '';
      const lastName = userToDelete.meta?.last_name?.[0] || '';
      const fullName = `${firstName} ${lastName}`.trim() || userToDelete.display_name;
      showAlert('success', 'Usuario Eliminado', `${fullName} ha sido eliminado del sistema`);
      setConfirmDeleteModal(false);
      setUserToDelete(null);
    }
  };

  // Función para abrir modal de edición
  const abrirEditarUsuario = (usuario: Usuario) => {
    setUserToEdit(usuario);
    const firstName = usuario.meta?.first_name?.[0] || '';
    const lastName = usuario.meta?.last_name?.[0] || '';
    const fullName = `${firstName} ${lastName}`.trim() || usuario.display_name;
    const accountStatus = usuario.meta?.account_status?.[0] || 'approved';
    const role = usuario.roles?.[0] || 'usuario';
    
    setEditForm({
      name: fullName,
      email: usuario.email,
      role: role,
      status: accountStatus
    });
    setEditUserModal(true);
  };

  // Función para guardar cambios del usuario
  const guardarCambiosUsuario = () => {
    if (userToEdit) {
      const [firstName, lastName] = editForm.name.split(' ');
      const usuariosActualizados = usuarios.map(u => 
        u.ID === userToEdit.ID 
          ? { 
              ...u, 
              email: editForm.email,
              roles: [editForm.role],
              meta: { 
                ...u.meta, 
                first_name: [firstName || ''],
                last_name: [lastName || ''],
                account_status: [editForm.status]
              }
            }
          : u
      );
      setUsuarios(usuariosActualizados);
      setEditUserModal(false);
      setUserToEdit(null);
      showAlert('success', 'Éxito', 'Usuario actualizado correctamente');
    }
  };

  // Función para cambiar estado rápido del usuario
  const cambiarEstadoUsuario = (usuarioId: number, nuevoEstado: string) => {
    const usuariosActualizados = usuarios.map(u => 
      u.ID === usuarioId 
        ? { ...u, meta: { ...u.meta, account_status: [nuevoEstado] } }
        : u
    );
    setUsuarios(usuariosActualizados);
    showAlert('success', 'Éxito', `Estado del usuario cambiado a ${nuevoEstado}`);
  };

  // Función para normalizar estado
  const normalizeEstado = (estado: string | null | undefined) => {
    if (!estado || estado === 'null' || estado.trim() === '') return 'pendientes';
    const estadoLower = estado.toLowerCase().trim();
    
    // Mapear valores del campo estado_postulacion
    if (estadoLower === 'aceptada' || estadoLower === 'aceptado') {
      return 'aceptadas';
    }
    if (estadoLower === 'rechazada' || estadoLower === 'rechazado') {
      return 'rechazadas';
    }
    if (estadoLower === 'pendiente') {
      return 'pendientes';
    }
    
    // Mapear valores de WordPress post_status como fallback
    if (estadoLower === 'publish') {
      return 'aceptadas'; // publish = postulación aceptada/activa
    }
    if (estadoLower === 'trash') {
      return 'rechazadas'; // trash = postulación rechazada
    }
    if (estadoLower === 'draft') {
      return 'pendientes'; // draft = postulación pendiente
    }
    
    // Mapear variaciones de estados a valores estándar
    if (['aprobado', 'aprobada', 'activo', 'pagado', 'accepted', 'approved', 'active'].includes(estadoLower)) {
      return 'aceptadas';
    }
    if (['vencido', 'inactivo', 'rejected', 'denied', 'cancelled', 'canceled'].includes(estadoLower)) {
      return 'rechazadas';
    }
    if (['en_revision', 'pending', 'review', 'waiting'].includes(estadoLower)) {
      return 'pendientes';
    }
    
    // Log para estados no reconocidos
    console.log(`Estado no reconocido: "${estado}" -> usando pendientes`);
    return 'pendientes';
  };

  // Función para obtener color del estado
  const getEstadoColor = (estadoNormalizado: string) => {
    switch (estadoNormalizado) {
      case 'aceptadas':
        return '#28a745'; // Verde
      case 'pendientes':
        return '#ffc107'; // Amarillo
      case 'rechazadas':
        return '#dc3545'; // Rojo
      default:
        return '#6c757d'; // Gris
    }
  };

  // Función para formatear moneda
  const formatearMonto = (monto: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(monto);
  };

  // Renderizar contenido según la pestaña activa
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return renderDashboard();
      case 'solicitudes':
        return renderSolicitudes();
      case 'aplicaciones':
        return renderAplicaciones();
      case 'pagos':
        return renderPagos();
      case 'abonos_capital':
        return renderAbonosCapital();
      case 'usuarios':
        return renderUsuarios();
      default:
        return renderDashboard();
    }
  };

  // Dashboard principal
  const renderDashboard = () => (
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
      <View style={styles.statsContainer}>
        <TouchableOpacity 
          style={styles.statCard}
          onPress={() => setActiveTab('usuarios')}
        >
          <Text style={styles.statNumber}>{usuarios.length}</Text>
          <Text style={styles.statLabel}>Usuarios</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.statCard}
          onPress={() => setActiveTab('solicitudes')}
        >
          <Text style={styles.statNumber}>{solicitudes.length}</Text>
          <Text style={styles.statLabel}>Solicitudes</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.statCard}
          onPress={() => setActiveTab('aplicaciones')}
        >
          <Text style={styles.statNumber}>{aplicaciones.length}</Text>
          <Text style={styles.statLabel}>Postulaciones</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.statCard}
          onPress={() => setActiveTab('pagos')}
        >
          <Text style={styles.statNumber}>{pagos.filter(p => p.estado === 'pendiente').length}</Text>
          <Text style={styles.statLabel}>Pagos Pendientes</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Resumen de Actividad</Text>
      <View style={styles.activityContainer}>
        <TouchableOpacity 
          style={styles.activityItem}
          onPress={() => setActiveTab('solicitudes')}
        >
          <Ionicons name="document-text" size={24} color="#48b783" />
          <Text style={styles.activityText}>Solicitudes Pendientes: {solicitudes.filter(s => s.post_status === 'draft').length}</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.activityItem}
          onPress={() => setActiveTab('solicitudes')}
        >
          <Ionicons name="checkmark-circle" size={24} color="#28a745" />
          <Text style={styles.activityText}>Solicitudes Aprobadas: {solicitudes.filter(s => s.post_status === 'publish').length}</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.activityItem}
          onPress={() => setActiveTab('pagos')}
        >
          <Ionicons name="cash" size={24} color="#ffc107" />
          <Text style={styles.activityText}>Pagos Mensuales: {pagos.length}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  // Gestión de solicitudes
  const renderSolicitudes = () => (
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
      <View style={styles.filterContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar solicitudes..."
          value={searchText}
          onChangeText={setSearchText}
        />
        <View style={styles.filterButtons}>
          {['todos', 'draft', 'publish', 'trash'].map(estado => (
            <TouchableOpacity
              key={estado}
              style={[styles.filterButton, filtroEstado === estado && styles.filterButtonActive]}
              onPress={() => setFiltroEstado(estado)}
            >
              <Text style={[styles.filterButtonText, filtroEstado === estado && styles.filterButtonTextActive]}>
                {estado === 'todos' ? 'Todos' : 
                 estado === 'draft' ? 'Pendientes' : 
                 estado === 'publish' ? 'Aceptadas' : 
                 estado === 'trash' ? 'Rechazadas' : estado}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {solicitudes
        .filter(s => filtroEstado === 'todos' || s.post_status === filtroEstado)
        .filter(s => (s.clienteNombre?.toLowerCase() || '').includes(searchText.toLowerCase()) || (s.tipo?.toLowerCase() || '').includes(searchText.toLowerCase()))
        .map((solicitud) => (
          <View key={solicitud.id} style={styles.solicitudCard}>
            <View style={styles.solicitudHeader}>
              <Text style={styles.clienteNombre}>{solicitud.clienteNombre}</Text>
              <Text style={styles.montoSolicitud}>{formatearMonto(solicitud.monto)}</Text>
            </View>
            {solicitud.titulo && (
              <Text style={styles.tituloSolicitud}>{solicitud.titulo}</Text>
            )}
            <Text style={styles.tipoSolicitud}>{solicitud.tipo}</Text>
            {solicitud.plazo && (
              <Text style={styles.plazoSolicitud}>Plazo: {solicitud.plazo} meses</Text>
            )}
            {solicitud.destino_o_descripcion_del_prestamo && (
              <Text style={styles.descripcionSolicitud}>Destino: {solicitud.destino_o_descripcion_del_prestamo}</Text>
            )}
            <Text style={styles.fechaSolicitud}>
              {new Date(solicitud.fechaCreacion).toLocaleDateString('es-ES')}
            </Text>
            <View style={styles.estadoContainer}>
              <View style={[styles.estadoBadge, { backgroundColor: getEstadoColor(normalizeEstado(solicitud.estado || 'pendiente')) }]}>
                <Text style={styles.estadoTexto}>{solicitud.estado ? solicitud.estado.toUpperCase() : 'PENDIENTE'}</Text>
              </View>
            </View>
            <View style={styles.actionButtons}>
              <TouchableOpacity 
                style={[styles.actionButton, { backgroundColor: '#007bff' }]}
                onPress={() => abrirEditarSolicitud(solicitud)}
              >
                <Text style={styles.actionButtonText}>✏️ Editar</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.actionButton, { backgroundColor: '#6c757d' }]}
                onPress={() => openEstadoPicker(solicitud.id, solicitud.estado || 'pendiente')}
              >
                <Text style={styles.actionButtonText}>📋 Cambiar Estado</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
    </ScrollView>
  );

  // Gestión de aplicaciones
  const renderAplicaciones = () => {
    
    return (
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
         <Text style={styles.sectionTitle}>Postulaciones a Solicitudes</Text>
         
         <View style={styles.filterContainer}>
           <TextInput
             style={styles.searchInput}
             placeholder="Buscar postulaciones..."
             value={searchTextAplicaciones}
             onChangeText={setSearchTextAplicaciones}
           />
           <View style={styles.filterButtons}>
             {['todos', 'pendientes', 'aceptadas', 'rechazadas'].map(estado => (
               <TouchableOpacity
                 key={estado}
                 style={[styles.filterButton, filtroEstadoAplicaciones === estado && styles.filterButtonActive]}
                 onPress={() => setFiltroEstadoAplicaciones(estado)}
               >
                 <Text style={[styles.filterButtonText, filtroEstadoAplicaciones === estado && styles.filterButtonTextActive]}>
                   {estado === 'todos' ? 'Todos' : estado === 'pendientes' ? 'Pendientes' : estado === 'aceptadas' ? 'Aceptadas' : 'Rechazadas'}
                 </Text>
               </TouchableOpacity>
             ))}
           </View>
         </View>

         {(() => {
           const filteredByStatus = aplicaciones.filter(a => {
              // Usar estado_postulacion como campo principal
               const estadoOriginal = a.estado_postulacion ?? a.meta?.estado_postulacion?.[0] ?? a.post_status ?? 'pendiente';
               
               // Debug: verificar si estado_postulacion es null
               if (a.estado_postulacion === null) {
                 console.log('⚠️ estado_postulacion es null para aplicación ID:', a.ID);
               }
              const estadoNormalizado = normalizeEstado(estadoOriginal);
              
              // Debug logs detallados
              console.log('🔍 Debug aplicación ID:', a.ID);
              console.log('📊 estado_postulacion:', a.estado_postulacion);
              console.log('📊 meta.estado_postulacion:', a.meta?.estado_postulacion);
              console.log('📊 post_status:', a.post_status);
              console.log('📊 estadoOriginal usado:', estadoOriginal);
              console.log('📊 estadoNormalizado:', estadoNormalizado);
              console.log('📊 filtroEstadoAplicaciones:', filtroEstadoAplicaciones);
              console.log('✅ Pasa filtro:', filtroEstadoAplicaciones === 'todos' || estadoNormalizado === filtroEstadoAplicaciones);
              console.log('---');
              
              return filtroEstadoAplicaciones === 'todos' || estadoNormalizado === filtroEstadoAplicaciones;
            });
           
           const finalFiltered = filteredByStatus.filter(a => 
             (a.author_name?.toLowerCase() || '').includes(searchTextAplicaciones.toLowerCase()) ||
             (a.prestamo?.meta?.destino_o_descripcion_del_prestamo?.[0]?.toLowerCase() || '').includes(searchTextAplicaciones.toLowerCase())
           );
           
           return finalFiltered.length === 0;
         })() ? (
           <View style={styles.emptyContainer}>
             <Text style={styles.emptyText}>Sin postulaciones</Text>
             <Text style={styles.emptySubtext}>No hay postulaciones que coincidan con los filtros seleccionados.</Text>
           </View>
         ) : (
          (() => {
            // Debug temporal para ver los datos reales
            console.log('=== DEBUG FILTROS ===');
            console.log('Total aplicaciones:', aplicaciones.length);
            console.log('Filtro seleccionado:', filtroEstadoAplicaciones);
            aplicaciones.forEach((app, idx) => {
              const estadoOriginal = app.post_status;
              const estadoNormalizado = normalizeEstado(estadoOriginal || 'pendiente');
              console.log(`App ${idx}: ID=${app.ID}, estado_original="${estadoOriginal}", normalizado="${estadoNormalizado}"`);
            });
            
            const filteredByStatus = aplicaciones.filter(a => {
              const estadoOriginal = a.estado_postulacion ?? a.meta?.estado_postulacion?.[0] ?? a.post_status ?? 'pendiente';
              const estadoNormalizado = normalizeEstado(estadoOriginal);
              const matches = filtroEstadoAplicaciones === 'todos' || estadoNormalizado === filtroEstadoAplicaciones;
              console.log(`Filtro ${a.ID}: "${estadoNormalizado}" === "${filtroEstadoAplicaciones}" = ${matches}`);
              return matches;
            });
            
            console.log('Después del filtro:', filteredByStatus.length);
            console.log('=== FIN DEBUG ===');
            
            const finalFiltered = filteredByStatus.filter(a => 
              (a.author_name?.toLowerCase() || '').includes(searchTextAplicaciones.toLowerCase()) ||
              (a.prestamo?.meta?.destino_o_descripcion_del_prestamo?.[0]?.toLowerCase() || '').includes(searchTextAplicaciones.toLowerCase())
            );
            
            return finalFiltered;
          })()
            .map((aplicacion, index) => {
            const montoSolicitado = aplicacion.prestamo?.meta?.monto_solicitado?.[0] || '0';
            const plazoMeses = aplicacion.prestamo?.meta?.plazo_en_meses?.[0] || '0';
            const descripcion = aplicacion.prestamo?.meta?.destino_o_descripcion_del_prestamo?.[0] || 'Sin descripción';
            const estadoOriginal = aplicacion.estado_postulacion ?? aplicacion.meta?.estado_postulacion?.[0] ?? aplicacion.post_status ?? 'pendiente';
            const estadoNormalizado = normalizeEstado(estadoOriginal);
            const estadoColor = getEstadoColor(estadoNormalizado);
            
            // Función para obtener texto del badge
            const getBadgeText = (estado: string) => {
              switch (estado) {
                case 'aceptadas': return 'ACEPTADO';
                case 'rechazadas': return 'RECHAZADO';
                case 'pendientes': return 'PENDIENTE';
                default: return estado.toUpperCase();
              }
            };
            
            return (
              <View key={aplicacion.ID || index} style={styles.aplicacionCard}>
                <View style={styles.aplicacionHeader}>
                  <Text style={styles.prestamistaNombre}>{aplicacion.author_name || 'Autor'}</Text>
                  <View style={[styles.estadoBadge, { backgroundColor: estadoColor }]}>
                    <Text style={styles.estadoTexto}>{getBadgeText(estadoNormalizado)}</Text>
                  </View>
                </View>
                <Text style={styles.aplicacionMonto}>Monto Solicitado: {formatearMonto(parseInt(montoSolicitado))}</Text>
                <Text style={styles.aplicacionPlazo}>Plazo: {plazoMeses} meses</Text>
                <Text style={styles.aplicacionTasa}>Descripción: {descripcion}</Text>
                <Text style={styles.aplicacionFecha}>
                  Postulación: {new Date(aplicacion.post_date).toLocaleDateString('es-ES')}
                </Text>
                <Text style={styles.aplicacionFecha}>
                  Préstamo ID: #{aplicacion.meta?.id_prestamo?.[0] || aplicacion.prestamo?.ID || 'N/A'}
                </Text>
                <View style={styles.actionButtons}>
                  <TouchableOpacity 
                    style={[styles.actionButton, { backgroundColor: '#007bff' }]}
                    onPress={() => {
                      console.log('🔍 DEBUG - Objeto aplicacion completo:', aplicacion);
                      console.log('🔍 DEBUG - aplicacion.ID:', aplicacion.ID);
                      console.log('🔍 DEBUG - aplicacion.id:', aplicacion.id);
                      console.log('🔍 DEBUG - Todas las propiedades del objeto:', Object.keys(aplicacion));
                      abrirModalEstadoPostulacion(aplicacion);
                    }}
                  >
                    <Text style={styles.actionButtonText}>Cambiar Estado</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    );
  };

  // Gestión de pagos mensuales
  const renderPagos = () => {
    // Filtrar solo pagos mensuales
    const pagosMensualesFiltrados = pagos
      .filter(pago => pago.tipo === 'mensual')
      .filter(pago => {
        // Filtro por estado
        if (filtroEstadoPagos === 'todos') return true;
        const estadoPago = pago.estado || 'pendiente';
        return estadoPago === filtroEstadoPagos;
      })
      .filter(pago => {
        // Filtro por búsqueda de texto
        if (!searchTextPagos.trim()) return true;
        const searchLower = searchTextPagos.toLowerCase();
        const clienteNombre = (pago.clienteNombre || '').toLowerCase();
        const numeroCuota = (pago.meta?.numero_cuota || '').toLowerCase();
        const solicitudId = (pago.meta?.solicitud_relacionada || '').toLowerCase();
        const usuarioSolicitante = (pago.meta?.usuario_solicitante || '').toLowerCase();
        
        return clienteNombre.includes(searchLower) ||
               numeroCuota.includes(searchLower) ||
               solicitudId.includes(searchLower) ||
               usuarioSolicitante.includes(searchLower);
      });

    return (
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
        {/* Sección de Pagos Mensuales */}
        <View style={styles.pagoSection}>
          <View style={styles.pagoSectionHeader}>
            <Ionicons name="calendar" size={24} color="#007bff" />
            <Text style={[styles.sectionTitle, { color: '#007bff', marginLeft: 10, marginTop: 0 }]}>Pagos Mensuales</Text>
          </View>
          
          {/* Filtros para Pagos Mensuales */}
          <View style={styles.filterContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar por cliente, cuota, solicitud o usuario..."
              value={searchTextPagos}
              onChangeText={setSearchTextPagos}
            />
            <View style={styles.filterButtons}>
              <TouchableOpacity
                style={[styles.filterButton, filtroEstadoPagos === 'todos' && styles.filterButtonActive]}
                onPress={() => setFiltroEstadoPagos('todos')}
              >
                <Text style={[styles.filterButtonText, filtroEstadoPagos === 'todos' && styles.filterButtonTextActive]}>Todos</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.filterButton, filtroEstadoPagos === 'pendiente' && styles.filterButtonActive]}
                onPress={() => setFiltroEstadoPagos('pendiente')}
              >
                <Text style={[styles.filterButtonText, filtroEstadoPagos === 'pendiente' && styles.filterButtonTextActive]}>Pendientes</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.filterButton, filtroEstadoPagos === 'pagado' && styles.filterButtonActive]}
                onPress={() => setFiltroEstadoPagos('pagado')}
              >
                <Text style={[styles.filterButtonText, filtroEstadoPagos === 'pagado' && styles.filterButtonTextActive]}>Pagados</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          {pagosMensualesFiltrados.length > 0 ? (
             pagosMensualesFiltrados.map((pago) => (
              <View key={pago.id} style={[styles.pagoCard, styles.pagoMensualCard]}>
                <View style={styles.pagoHeader}>
                  <Text style={styles.clienteNombre}>{pago.clienteNombre}</Text>
                  <View style={[styles.estadoBadge, { backgroundColor: getEstadoColor(normalizeEstado(pago.estado || 'pendiente')) }]}>
                    <Text style={styles.estadoTexto}>{pago.estado ? pago.estado.toUpperCase() : 'PENDIENTE'}</Text>
                  </View>
                </View>
                <View style={styles.pagoDetails}>
                  <View style={styles.pagoRow}>
                    <Text style={styles.pagoLabel}>Número de Cuota:</Text>
                    <Text style={styles.pagoValue}>#{pago.meta?.numero_cuota || 'N/A'}</Text>
                  </View>
                  <View style={styles.pagoRow}>
                    <Text style={styles.pagoLabel}>Solicitud ID:</Text>
                    <Text style={styles.pagoValue}>#{pago.meta?.solicitud_relacionada || 'N/A'}</Text>
                  </View>
                  <View style={styles.pagoRow}>
                    <Text style={styles.pagoLabel}>Usuario Solicitante:</Text>
                    <Text style={styles.pagoValue}>ID: {pago.meta?.usuario_solicitante || 'N/A'}</Text>
                  </View>
                  <View style={styles.pagoRow}>
                    <Text style={styles.pagoLabel}>Fecha de Registro:</Text>
                    <Text style={styles.pagoValue}>{new Date(pago.post_date).toLocaleDateString('es-ES')}</Text>
                  </View>
                  <View style={styles.pagoRow}>
                    <Text style={styles.pagoLabel}>Última Modificación:</Text>
                    <Text style={styles.pagoValue}>{new Date(pago.post_modified).toLocaleDateString('es-ES')}</Text>
                  </View>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyStateCard}>
              <Ionicons name="card" size={48} color="#6c757d" style={{ marginBottom: 12 }} />
              <Text style={[styles.emptyStateText, { fontSize: 16, fontWeight: 'bold', marginBottom: 4 }]}>
                {pagos.filter(p => p.tipo === 'mensual').length === 0 
                  ? 'Sin pagos aún' 
                  : 'No se encontraron pagos'}
              </Text>
              <Text style={styles.emptyStateText}>
                {pagos.filter(p => p.tipo === 'mensual').length === 0 
                  ? 'Los pagos mensuales aparecerán aquí cuando se registren'
                  : 'Intenta ajustar los filtros de búsqueda'}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    );
  };

  // Gestión de abonos a capital
  const renderAbonosCapital = () => {
    // Filtrar abonos a capital
    const abonosCapitalFiltrados = abonosCapital
      .filter(abono => {
        // Filtro por estado
        if (filtroEstadoAbonosCapital === 'todos') return true;
        const estadoAbono = abono.post_status || 'pendiente';
        return estadoAbono === filtroEstadoAbonosCapital;
      })
      .filter(abono => {
        // Filtro por búsqueda de texto
        if (!searchTextAbonosCapital.trim()) return true;
        const searchLower = searchTextAbonosCapital.toLowerCase();
        const titulo = (abono.post_title || '').toLowerCase();
        const id = abono.ID.toString().toLowerCase();
        const autor = abono.post_author.toString().toLowerCase();
        const tipo = (abono.post_type || '').toLowerCase();
        
        return titulo.includes(searchLower) ||
               id.includes(searchLower) ||
               autor.includes(searchLower) ||
               tipo.includes(searchLower);
      });

    return (
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
        {/* Sección de Abonos a Capital */}
        <View style={styles.pagoSection}>
          <View style={styles.pagoSectionHeader}>
            <Ionicons name="trending-up" size={24} color="#28a745" />
            <Text style={[styles.sectionTitle, { color: '#28a745', marginLeft: 10, marginTop: 0 }]}>Abonos a Capital</Text>
          </View>
          
          {/* Filtros para Abonos a Capital */}
          <View style={styles.filterContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar por título, ID, autor o tipo..."
              value={searchTextAbonosCapital}
              onChangeText={setSearchTextAbonosCapital}
            />
            <View style={styles.filterButtons}>
              <TouchableOpacity
                style={[styles.filterButton, filtroEstadoAbonosCapital === 'todos' && styles.filterButtonActive]}
                onPress={() => setFiltroEstadoAbonosCapital('todos')}
              >
                <Text style={[styles.filterButtonText, filtroEstadoAbonosCapital === 'todos' && styles.filterButtonTextActive]}>Todos</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.filterButton, filtroEstadoAbonosCapital === 'draft' && styles.filterButtonActive]}
                onPress={() => setFiltroEstadoAbonosCapital('draft')}
              >
                <Text style={[styles.filterButtonText, filtroEstadoAbonosCapital === 'draft' && styles.filterButtonTextActive]}>Borrador</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.filterButton, filtroEstadoAbonosCapital === 'publish' && styles.filterButtonActive]}
                onPress={() => setFiltroEstadoAbonosCapital('publish')}
              >
                <Text style={[styles.filterButtonText, filtroEstadoAbonosCapital === 'publish' && styles.filterButtonTextActive]}>Publicado</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.filterButton, filtroEstadoAbonosCapital === 'pending' && styles.filterButtonActive]}
                onPress={() => setFiltroEstadoAbonosCapital('pending')}
              >
                <Text style={[styles.filterButtonText, filtroEstadoAbonosCapital === 'pending' && styles.filterButtonTextActive]}>Pendiente</Text>
              </TouchableOpacity>
            </View>
          </View>
          {abonosCapitalFiltrados.length > 0 ? (
            abonosCapitalFiltrados.map((abono) => (
              <View key={abono.ID} style={[styles.pagoCard, styles.abonoCapitalCard]}>
                <View style={styles.pagoHeader}>
                  <Text style={styles.clienteNombre}>{abono.post_title || 'Cliente desconocido'}</Text>
                  <View style={[styles.estadoBadge, { backgroundColor: getEstadoColor(normalizeEstado(abono.post_status || 'pendiente')) }]}>
                    <Text style={styles.estadoTexto}>{abono.post_status ? abono.post_status.toUpperCase() : 'PENDIENTE'}</Text>
                  </View>
                </View>
                <View style={styles.pagoDetails}>
                  <View style={styles.pagoRow}>
                    <Text style={styles.pagoLabel}>ID del Abono:</Text>
                    <Text style={[styles.pagoValue, { color: '#28a745', fontSize: 16, fontWeight: 'bold' }]}>#{abono.ID}</Text>
                  </View>
                  <View style={styles.pagoRow}>
                    <Text style={styles.pagoLabel}>Fecha de Abono:</Text>
                    <Text style={styles.pagoValue}>{new Date(abono.post_date).toLocaleDateString('es-ES')}</Text>
                  </View>
                  <View style={styles.pagoRow}>
                    <Text style={styles.pagoLabel}>Autor:</Text>
                    <Text style={styles.pagoValue}>ID: {abono.post_author}</Text>
                  </View>
                  <View style={styles.pagoRow}>
                    <Text style={styles.pagoLabel}>Tipo:</Text>
                    <Text style={styles.pagoValue}>{abono.post_type}</Text>
                  </View>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyStateCard}>
              <Ionicons name="trending-up" size={48} color="#6c757d" style={{ marginBottom: 12 }} />
              <Text style={[styles.emptyStateText, { fontSize: 16, fontWeight: 'bold', marginBottom: 4 }]}>
                {abonosCapital.length === 0 
                  ? 'Sin abonos aún' 
                  : 'No se encontraron abonos'}
              </Text>
              <Text style={styles.emptyStateText}>
                {abonosCapital.length === 0 
                  ? 'Los abonos a capital aparecerán aquí cuando se registren'
                  : 'Intenta ajustar los filtros de búsqueda'}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    );
  };

  // Gestión de usuarios
  const renderUsuarios = () => (
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
      <View style={styles.filterContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar usuarios..."
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>
      
      {usuarios
        .filter(u => (u.display_name?.toLowerCase() || '').includes(searchText.toLowerCase()) || (u.email?.toLowerCase() || '').includes(searchText.toLowerCase()))
        .map((usuario) => {
          const firstName = usuario.meta?.first_name?.[0] || '';
          const lastName = usuario.meta?.last_name?.[0] || '';
          const fullName = `${firstName} ${lastName}`.trim() || usuario.display_name;
          const accountStatus = usuario.meta?.account_status?.[0] || 'approved';
          const role = usuario.roles?.[0] || 'usuario';
          
          return (
            <View key={usuario.ID} style={styles.usuarioCard}>
              <View style={styles.usuarioHeader}>
                <View>
                  <Text style={styles.usuarioNombre}>{fullName}</Text>
                  <Text style={styles.usuarioEmail}>{usuario.email}</Text>
                </View>
                <View style={[styles.estadoBadge, { backgroundColor: getEstadoColor(normalizeEstado(accountStatus)) }]}>
                  <Text style={styles.estadoTexto}>{accountStatus.toUpperCase()}</Text>
                </View>
              </View>
              <View style={styles.usuarioDetails}>
                <Text style={styles.usuarioRole}>Rol: {role}</Text>
                <Text style={styles.usuarioFecha}>
                  Usuario: {usuario.username}
                </Text>
                {usuario.meta?.identity_number?.[0] && (
                  <Text style={styles.usuarioFecha}>
                    Cédula: {usuario.meta.identity_number[0]}
                  </Text>
                )}
                {usuario.meta?.phone?.[0] && (
                  <Text style={styles.usuarioFecha}>
                    Teléfono: {usuario.meta.phone[0]}
                  </Text>
                )}
              </View>
              <View style={styles.actionButtons}>
                <TouchableOpacity 
                  style={[styles.actionButton, { backgroundColor: '#007bff' }]}
                  onPress={() => abrirEditarUsuario(usuario)}
                >
                  <Text style={styles.actionButtonText}>Editar</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.actionButton, { backgroundColor: accountStatus === 'approved' ? '#ffc107' : '#28a745' }]}
                  onPress={() => cambiarEstadoUsuario(usuario.ID, accountStatus === 'approved' ? 'pending' : 'approved')}
                >
                  <Text style={styles.actionButtonText}>
                    {accountStatus === 'approved' ? 'Suspender' : 'Aprobar'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.actionButton, { backgroundColor: '#dc3545' }]}
                  onPress={() => confirmarEliminarUsuario(usuario)}
                >
                  <Text style={styles.actionButtonText}>Eliminar</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>Panel de Administración</Text>
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
                <Text style={styles.notificationCount}>{unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
        <Text style={styles.welcomeText}>Bienvenido, {user?.name}</Text>
      </View>

      {/* Navegación por pestañas */}
      <View style={styles.tabContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {[
            { key: 'dashboard', label: 'Dashboard', icon: 'home' },
            { key: 'solicitudes', label: 'Solicitudes', icon: 'document-text' },
            { key: 'aplicaciones', label: 'Postulaciones', icon: 'list' },
            { key: 'pagos', label: 'Pagos', icon: 'cash' },
            { key: 'abonos_capital', label: 'Abonos a Capital', icon: 'trending-up' },
            { key: 'usuarios', label: 'Usuarios', icon: 'people' },
          ].map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, activeTab === tab.key && styles.activeTab]}
              onPress={() => setActiveTab(tab.key)}
            >
              <Ionicons 
                name={tab.icon as any} 
                size={20} 
                color={activeTab === tab.key ? '#48b783' : '#666'} 
              />
              <Text style={[styles.tabText, activeTab === tab.key && styles.activeTabText]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Contenido */}
      {renderContent()}

      {/* Modal de confirmación para eliminar usuario */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={confirmDeleteModal}
        onRequestClose={() => setConfirmDeleteModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Confirmar Eliminación</Text>
            <Text style={styles.modalText}>
              ¿Está seguro de que desea eliminar al usuario {(() => {
                if (userToDelete) {
                  const firstName = userToDelete.meta?.first_name?.[0] || '';
                  const lastName = userToDelete.meta?.last_name?.[0] || '';
                  return `${firstName} ${lastName}`.trim() || userToDelete.display_name;
                }
                return '';
              })()}?
            </Text>
            <Text style={styles.modalWarning}>
              Esta acción no se puede deshacer.
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setConfirmDeleteModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.deleteButton]}
                onPress={eliminarUsuario}
              >
                <Text style={styles.deleteButtonText}>Eliminar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal de edición de usuario */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={editUserModal}
        onRequestClose={() => setEditUserModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.editModalContent}>
            <Text style={styles.modalTitle}>Editar Usuario</Text>
            
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Nombre:</Text>
              <TextInput
                style={styles.formInput}
                value={editForm.name}
                onChangeText={(text) => setEditForm({...editForm, name: text})}
                placeholder="Nombre del usuario"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Email:</Text>
              <TextInput
                style={styles.formInput}
                value={editForm.email}
                onChangeText={(text) => setEditForm({...editForm, email: text})}
                placeholder="Email del usuario"
                keyboardType="email-address"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Rol:</Text>
              <View style={styles.roleButtons}>
                {['prestatario', 'prestamista', 'asesor', 'admin'].map(role => (
                  <TouchableOpacity
                    key={role}
                    style={[styles.roleButton, editForm.role === role && styles.roleButtonActive]}
                    onPress={() => setEditForm({...editForm, role})}
                  >
                    <Text style={[styles.roleButtonText, editForm.role === role && styles.roleButtonTextActive]}>
                      {role.charAt(0).toUpperCase() + role.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Estado:</Text>
              <View style={styles.statusButtons}>
                {['activo', 'inactivo', 'suspendido'].map(status => (
                  <TouchableOpacity
                    key={status}
                    style={[styles.statusButton, editForm.status === status && styles.statusButtonActive]}
                    onPress={() => setEditForm({...editForm, status})}
                  >
                    <Text style={[styles.statusButtonText, editForm.status === status && styles.statusButtonTextActive]}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setEditUserModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.saveButton]}
                onPress={guardarCambiosUsuario}
              >
                <Text style={styles.saveButtonText}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal para cambiar estado de solicitud */}
      <Modal
        visible={showEstadoPicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowEstadoPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Cambiar Estado de Solicitud</Text>
            <Text style={styles.modalText}>Seleccione el nuevo estado:</Text>
            
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Estado:</Text>
              <View style={styles.statusButtons}>
                <TouchableOpacity 
                  style={[styles.statusButton, tempEstado === 'pendiente' && styles.statusButtonActive]}
                  onPress={() => setTempEstado('pendiente')}
                >
                  <Text style={[styles.statusButtonText, tempEstado === 'pendiente' && styles.statusButtonTextActive]}>Pendiente</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.statusButton, tempEstado === 'aprobada' && styles.statusButtonActive]}
                  onPress={() => setTempEstado('aprobada')}
                >
                  <Text style={[styles.statusButtonText, tempEstado === 'aprobada' && styles.statusButtonTextActive]}>Aprobada</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.statusButton, tempEstado === 'en_revision' && styles.statusButtonActive]}
                  onPress={() => setTempEstado('en_revision')}
                >
                  <Text style={[styles.statusButtonText, tempEstado === 'en_revision' && styles.statusButtonTextActive]}>En Revisión</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.statusButton, tempEstado === 'rechazada' && styles.statusButtonActive]}
                  onPress={() => setTempEstado('rechazada')}
                >
                  <Text style={[styles.statusButtonText, tempEstado === 'rechazada' && styles.statusButtonTextActive]}>Rechazada</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowEstadoPicker(false)}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleEstadoChange}
              >
                <Text style={styles.saveButtonText}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal para editar solicitud */}
      <Modal
          visible={editSolicitudModal}
          transparent={true}
          animationType="slide"
          onRequestClose={cerrarEditarSolicitud}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.editModalContent}>
              <Text style={styles.modalTitle}>Editar Solicitud</Text>
              
              <ScrollView style={{maxHeight: '70%'}}>
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Título de la Solicitud</Text>
                  <TextInput
                    style={styles.formInput}
                    value={editSolicitudForm.titulo}
                    onChangeText={(text) => setEditSolicitudForm({...editSolicitudForm, titulo: text})}
                    placeholder="Título de la solicitud"
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Monto Solicitado</Text>
                  <TextInput
                    style={styles.formInput}
                    value={editSolicitudForm.monto}
                    onChangeText={(text) => setEditSolicitudForm({...editSolicitudForm, monto: text})}
                    placeholder="Monto solicitado"
                    keyboardType="numeric"
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Plazo en Meses</Text>
                  <TextInput
                    style={styles.formInput}
                    value={editSolicitudForm.plazo}
                    onChangeText={(text) => setEditSolicitudForm({...editSolicitudForm, plazo: text})}
                    placeholder="Plazo en meses"
                    keyboardType="numeric"
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Destino/Descripción del Préstamo</Text>
                  <TextInput
                    style={[styles.formInput, styles.textAreaInput]}
                    value={editSolicitudForm.descripcion}
                    onChangeText={(text) => setEditSolicitudForm({...editSolicitudForm, descripcion: text})}
                    placeholder="Descripción del destino del préstamo"
                    multiline={true}
                    numberOfLines={4}
                  />
                </View>

                <View style={styles.formGroup}>
                  <View style={styles.checkboxContainer}>
                    <TouchableOpacity
                      style={[styles.checkbox, editSolicitudForm.desembolsado && styles.checkboxChecked]}
                      onPress={() => setEditSolicitudForm({...editSolicitudForm, desembolsado: !editSolicitudForm.desembolsado})}
                    >
                      {editSolicitudForm.desembolsado && (
                        <Ionicons name="checkmark" size={16} color="#fff" />
                      )}
                    </TouchableOpacity>
                    <Text style={styles.checkboxLabel}>Desembolsado</Text>
                  </View>
                </View>
              </ScrollView>

              <View style={styles.editModalButtons}>
                <TouchableOpacity 
                  style={[styles.editModalButton, styles.editCancelButton]}
                  onPress={cerrarEditarSolicitud}
                >
                  <Ionicons name="close-outline" size={20} color="#6c757d" style={{marginRight: 8}} />
                  <Text style={styles.editCancelButtonText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.editModalButton, styles.editSaveButton]}
                  onPress={guardarCambiosSolicitud}
                >
                  <Ionicons name="checkmark-outline" size={20} color="#fff" style={{marginRight: 8}} />
                  <Text style={styles.editSaveButtonText}>Actualizar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
      </Modal>

      {/* Modal para cambiar estado de postulación */}
      <Modal
        visible={showEstadoPostulacionModal}
        transparent={true}
        animationType="fade"
        onRequestClose={cancelarCambioEstadoPostulacion}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Cambiar Estado de Postulación</Text>
            
            {selectedPostulacion && (
              <Text style={styles.modalText}>
                Postulación de: {selectedPostulacion.prestamistaNombre}
              </Text>
            )}
            
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Nuevo Estado</Text>
              <View style={styles.statusButtons}>
                {['Pendiente', 'Aceptada', 'Rechazada'].map((estado) => (
                  <TouchableOpacity
                    key={estado}
                    style={[
                      styles.statusButton,
                      nuevoEstadoPostulacion === estado && styles.statusButtonActive
                    ]}
                    onPress={() => setNuevoEstadoPostulacion(estado)}
                  >
                    <Text style={[
                      styles.statusButtonText,
                      nuevoEstadoPostulacion === estado && styles.statusButtonTextActive
                    ]}>
                      {estado}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={cancelarCambioEstadoPostulacion}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.saveButton]}
                onPress={actualizarEstadoPostulacion}
              >
                <Text style={styles.saveButtonText}>Actualizar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  // Navegación por pestañas
  tabContainer: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    marginRight: 10,
  },
  activeTab: {
    borderBottomWidth: 3,
    borderBottomColor: '#48b783',
  },
  tabText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#48b783',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 15,
  },
  // Estadísticas
  statsContainer: {
    flexDirection: "row",
    flexWrap: 'wrap',
    justifyContent: "space-between",
    marginVertical: 15,
  },
  statCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    width: "48%",
    alignItems: "center",
    marginBottom: 10,
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
  // Actividad
  activityContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  activityText: {
    marginLeft: 15,
    fontSize: 14,
    color: '#333',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginTop: 20,
    marginBottom: 10,
  },
  // Filtros y búsqueda
  filterContainer: {
    marginBottom: 20,
  },
  searchInput: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginBottom: 15,
  },
  filterButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  filterButton: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    marginBottom: 10,
  },
  filterButtonActive: {
    backgroundColor: '#48b783',
  },
  filterButtonText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  // Tarjetas de solicitudes
  solicitudCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  solicitudHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  clienteNombre: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  montoSolicitud: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#48b783',
  },
  tituloSolicitud: {
    fontSize: 15,
    color: '#333',
    fontWeight: '600',
    marginBottom: 4,
    marginTop: 0,
    fontStyle: 'italic',
  },
  tipoSolicitud: {
    fontSize: 14,
    color: '#48b783',
    fontWeight: '600',
    marginBottom: 4,
  },
  plazoSolicitud: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
    marginBottom: 4,
  },
  descripcionSolicitud: {
    fontSize: 14,
    color: '#333',
    fontStyle: 'italic',
    marginBottom: 4,
    lineHeight: 18,
  },
  fechaSolicitud: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  estadoContainer: {
    marginBottom: 15,
  },
  estadoBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 15,
    alignSelf: 'flex-start',
  },
  estadoTexto: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
  },
  // Botones de acción
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginHorizontal: 2,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  // Tarjetas de aplicaciones
  aplicacionCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  aplicacionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  prestamistaNombre: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  aplicacionMonto: {
    fontSize: 14,
    color: '#48b783',
    fontWeight: '600',
    marginBottom: 5,
  },
  aplicacionTasa: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  aplicacionPlazo: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  aplicacionFecha: {
    fontSize: 12,
    color: '#999',
    marginBottom: 10,
  },
  // Tarjetas de pagos
  pagoSection: {
    marginBottom: 24,
  },
  pagoSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  pagoCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  pagoMensualCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#007bff',
  },
  abonoCapitalCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#28a745',
  },
  emptyStateCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 12,
  },
  emptyStateText: {
    color: '#6c757d',
    fontSize: 14,
    fontStyle: 'italic',
  },
  pagoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  pagoDetails: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 15,
  },
  pagoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  pagoLabel: {
    fontSize: 14,
    color: '#666',
  },
  pagoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  // Tarjetas de usuarios
  usuarioCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  usuarioHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  usuarioNombre: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  usuarioEmail: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  usuarioDetails: {
    marginBottom: 15,
  },
  usuarioRole: {
    fontSize: 14,
    color: '#48b783',
    fontWeight: '600',
    marginBottom: 5,
  },
  usuarioFecha: {
    fontSize: 12,
    color: '#999',
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 25,
    margin: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalWarning: {
    fontSize: 14,
    color: '#dc3545',
    marginBottom: 20,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  deleteButton: {
    backgroundColor: '#dc3545',
  },
  cancelButtonText: {
    color: '#6c757d',
    fontSize: 14,
    fontWeight: '600',
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  // Modal de edición
  editModalContent: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 25,
    margin: 20,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  editSolicitudModalContainer: {
    backgroundColor: '#fff',
    borderRadius: 15,
    margin: 20,
    maxHeight: '90%',
    width: '90%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    overflow: 'hidden',
  },
  editSolicitudModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  editSolicitudScrollView: {
    flex: 1,
    maxHeight: '70%',
  },
  editSolicitudScrollContent: {
    padding: 20,
    paddingTop: 10,
  },
  editSolicitudModalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    backgroundColor: '#fafafa',
  },
  closeButton: {
    padding: 5,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
  },
  textAreaInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  formRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  formGroupHalf: {
    width: '48%',
  },
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  formInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
  },
  roleButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  roleButton: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  roleButtonActive: {
    backgroundColor: '#48b783',
  },
  roleButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  roleButtonTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  statusButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statusButton: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  statusButtonActive: {
    backgroundColor: '#007bff',
  },
  statusButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  statusButtonTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  saveButton: {
    backgroundColor: '#48b783',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
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
  verMasButton: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  verMasText: {
    fontSize: 14,
    color: '#48b783',
    fontWeight: '600',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderRadius: 4,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  checkboxChecked: {
    backgroundColor: '#48b783',
    borderColor: '#48b783',
  },
  checkboxLabel: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  editModalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 25,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  editModalButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  editCancelButton: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1.5,
    borderColor: '#dee2e6',
  },
  editSaveButton: {
    backgroundColor: '#48b783',
  },
  editCancelButtonText: {
    color: '#6c757d',
    fontSize: 16,
    fontWeight: '600',
  },
  editSaveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});