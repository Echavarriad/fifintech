import React, { useState, useEffect } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Text, View, Modal, TextInput, TouchableOpacity, StyleSheet, Dimensions, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
import AdminDashboardScreen from "../screens/AdminDashboardScreen";
import ClienteDashboardScreen from "../screens/ClienteDashboardScreen";
import AsesorDashboardScreen from "../screens/AsesorDashboardScreen";
import SolicitanteDashboardScreen from "../screens/SolicitanteDashboardScreen";
import PrestamistaDashboardScreen from "../screens/PrestamistaDashboardScreen";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import { useAlertContext } from "../contexts/AlertContext";

export type DashboardTabParamList = {
  Dashboard: undefined;
  Perfil: undefined;
};



const Tab = createBottomTabNavigator<DashboardTabParamList>();

// Componente de icono personalizado
const TabIcon = ({ name, focused }: { name: string; focused: boolean }) => {
  const getIconName = () => {
    switch (name) {
      case 'Dashboard':
        return focused ? 'home' : 'home-outline';
      case 'NuevaSolicitud':
        return focused ? 'add-circle' : 'add-circle-outline';
      case 'Perfil':
        return focused ? 'person' : 'person-outline';
      default:
        return 'apps-outline';
    }
  };

  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      <Ionicons 
        name={getIconName() as any} 
        size={focused ? 26 : 22} 
        color={focused ? '#48b783' : '#666'}
      />
    </View>
  );
};

// Pantalla de perfil temporal
const PerfilScreen = () => {
  const { user, logout } = useAuth();
  const { t, currentLanguage, availableLanguages, changeLanguage } = useLanguage();
  const { showAlert } = useAlertContext();
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [editForm, setEditForm] = useState({
    name: user?.name || '',
    username: user?.username || '',
    email: user?.email || ''
  });
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  
  // Log para depuración
  console.log('🔍 PerfilScreen - Usuario actual:', JSON.stringify(user, null, 2));
  console.log('🔍 PerfilScreen - Roles disponibles:', user?.roles);
  console.log('🔍 PerfilScreen - Username:', user?.username);
  console.log('🔍 PerfilScreen - EditForm username:', editForm.username);

  // Actualizar editForm cuando el usuario cambie
  useEffect(() => {
    if (user) {
      setEditForm({
        name: user.name || '',
        username: user.username || '',
        email: user.email || ''
      });
    }
  }, [user]);

  // Estilos para el modal
  const modalStyles = StyleSheet.create({
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContainer: {
      backgroundColor: '#fff',
      borderRadius: 20,
      padding: Math.min(screenWidth * 0.05, 20),
      width: '90%',
      maxHeight: '80%',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: Math.min(screenHeight * 0.024, 20),
      paddingBottom: Math.min(screenHeight * 0.018, 15),
      borderBottomWidth: 1,
      borderBottomColor: '#e0e0e0',
    },
    modalTitle: {
      fontSize: Math.min(screenWidth * 0.05, 20),
      fontWeight: 'bold',
      color: '#333',
    },
    closeButton: {
      fontSize: Math.min(screenWidth * 0.06, 24),
      color: '#666',
      fontWeight: 'bold',
    },
    formContainer: {
      marginBottom: Math.min(screenHeight * 0.024, 20),
    },
    label: {
      fontSize: Math.min(screenWidth * 0.04, 16),
      fontWeight: 'bold',
      color: '#333',
      marginBottom: Math.min(screenHeight * 0.01, 8),
      marginTop: Math.min(screenHeight * 0.018, 15),
    },
    input: {
      borderWidth: 1,
      borderColor: '#ddd',
      borderRadius: 8,
      padding: Math.min(screenWidth * 0.03, 12),
      fontSize: Math.min(screenWidth * 0.04, 16),
      backgroundColor: '#fff',
    },
    disabledInput: {
      backgroundColor: '#f5f5f5',
      color: '#666',
    },
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: Math.min(screenHeight * 0.024, 20),
    },
    cancelButton: {
      flex: 1,
      backgroundColor: '#f0f0f0',
      padding: Math.min(screenWidth * 0.038, 15),
      borderRadius: 8,
      marginRight: Math.min(screenWidth * 0.025, 10),
      alignItems: 'center',
    },
    cancelButtonText: {
      color: '#666',
      fontSize: Math.min(screenWidth * 0.04, 16),
      fontWeight: 'bold',
    },
    saveButton: {
      flex: 1,
      backgroundColor: '#48b783',
      padding: Math.min(screenWidth * 0.038, 15),
      borderRadius: 8,
      marginLeft: Math.min(screenWidth * 0.025, 10),
      alignItems: 'center',
    },
    saveButtonText: {
      color: '#fff',
      fontSize: Math.min(screenWidth * 0.04, 16),
      fontWeight: 'bold',
    },
    languageOption: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: Math.min(screenWidth * 0.04, 16),
      borderWidth: 1,
      borderColor: '#ddd',
      borderRadius: 8,
      marginBottom: Math.min(screenHeight * 0.012, 10),
      backgroundColor: '#fff',
    },
    selectedLanguageOption: {
      borderColor: '#48b783',
      backgroundColor: '#f0f9f4',
    },
    languageOptionText: {
      fontSize: Math.min(screenWidth * 0.04, 16),
      color: '#333',
    },
    selectedLanguageOptionText: {
      color: '#48b783',
      fontWeight: 'bold',
    },
    checkmark: {
      fontSize: Math.min(screenWidth * 0.045, 18),
      color: '#48b783',
      fontWeight: 'bold',
    },
  });

  const handleOpenAccountModal = () => {
    setEditForm({
      name: user?.name || '',
      username: user?.username || '',
      email: user?.email || ''
    });
    setShowAccountModal(true);
  };

  const handleSaveAccount = () => {
    // Aquí se implementaría la lógica para actualizar los datos del usuario
    showAlert('success', 'Éxito', 'Información actualizada correctamente');
    setShowAccountModal(false);
  };

  const handleCloseModal = () => {
    setShowAccountModal(false);
  };

  const handleOpenPasswordModal = () => {
    setPasswordForm({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setShowPasswordModal(true);
  };

  const handleSavePassword = () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showAlert('error', 'Error', 'Las contraseñas no coinciden');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      showAlert('error', 'Error', 'La nueva contraseña debe tener al menos 6 caracteres');
      return;
    }
    // Aquí se implementaría la lógica para cambiar la contraseña
    showAlert('success', 'Éxito', 'Contraseña actualizada correctamente');
    setShowPasswordModal(false);
  };

  const handleClosePasswordModal = () => {
    setShowPasswordModal(false);
  };

  const handleOpenPrivacyModal = () => {
    setShowPrivacyModal(true);
  };

  const handleClosePrivacyModal = () => {
    setShowPrivacyModal(false);
  };

  const handleOpenLanguageModal = () => {
    setShowLanguageModal(true);
  };

  const handleCloseLanguageModal = () => {
    setShowLanguageModal(false);
  };

  const handleLanguageChange = async (languageCode: string) => {
    try {
      await changeLanguage(languageCode);
      setShowLanguageModal(false);
      showAlert('success', t('profile.language'), t('profile.languageChanged'));
    } catch (error) {
      showAlert('error', t('common.error'), 'Error al cambiar idioma');
    }
  };
  
  return (
    <View style={{ flex: 1, backgroundColor: '#f8f9fa' }}>
      <View style={{
        backgroundColor: '#48b783',
        padding: Math.min(screenWidth * 0.05, 20),
        paddingTop: Math.min(screenHeight * 0.06, 50),
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
      }}>
        <Text style={{ fontSize: Math.min(screenWidth * 0.06, 24), fontWeight: 'bold', color: '#fff', marginBottom: Math.min(screenHeight * 0.006, 5) }}>
          {t('profile.myProfile')}
        </Text>
        <Text style={{ fontSize: Math.min(screenWidth * 0.04, 16), color: '#fff', opacity: 0.9 }}>
          {t('profile.accountInfo')}
        </Text>
      </View>
      
      <View style={{ padding: Math.min(screenWidth * 0.05, 20) }}>
        <View style={{
          backgroundColor: '#fff',
          borderRadius: 10,
          padding: Math.min(screenWidth * 0.05, 20),
          marginBottom: Math.min(screenHeight * 0.024, 20),
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        }}>
          <Text style={{ fontSize: Math.min(screenWidth * 0.045, 18), fontWeight: 'bold', color: '#333', marginBottom: Math.min(screenHeight * 0.012, 10) }}>
            {t('profile.personalInfo')}
          </Text>
          <Text style={{ fontSize: Math.min(screenWidth * 0.04, 16), color: '#666', marginBottom: Math.min(screenHeight * 0.006, 5) }}>
            {t('profile.name')}: {user?.name || t('profile.notAvailable')}
          </Text>
          <Text style={{ fontSize: Math.min(screenWidth * 0.04, 16), color: '#666', marginBottom: Math.min(screenHeight * 0.006, 5) }}>
            {t('auth.email')}: {user?.email || t('profile.notAvailable')}
          </Text>
          <Text style={{ fontSize: Math.min(screenWidth * 0.04, 16), color: '#666' }}>
            {t('profile.role')}: {user?.roles && user.roles.length > 0 ? user.roles[0] : t('roles.client')}
          </Text>
        </View>
        
        <View style={{
          backgroundColor: '#fff',
          borderRadius: 10,
          padding: Math.min(screenWidth * 0.038, 15),
          marginBottom: Math.min(screenHeight * 0.024, 20),
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.1,
          shadowRadius: 2,
          elevation: 2,
        }}>
          <TouchableOpacity onPress={handleOpenAccountModal}>
            <Text style={{ fontSize: Math.min(screenWidth * 0.04, 16), color: '#48b783', padding: Math.min(screenWidth * 0.025, 10), fontWeight: 'bold' }}>{t('profile.editProfile')}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleOpenPasswordModal}>
            <Text style={{ fontSize: Math.min(screenWidth * 0.04, 16), color: '#48b783', padding: Math.min(screenWidth * 0.025, 10), fontWeight: 'bold' }}>{t('profile.changePassword')}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleOpenLanguageModal}>
            <Text style={{ fontSize: Math.min(screenWidth * 0.04, 16), color: '#48b783', padding: Math.min(screenWidth * 0.025, 10), fontWeight: 'bold' }}>{t('profile.language')}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleOpenPrivacyModal}>
            <Text style={{ fontSize: Math.min(screenWidth * 0.04, 16), color: '#48b783', padding: Math.min(screenWidth * 0.025, 10), fontWeight: 'bold' }}>{t('profile.privacy')}</Text>
          </TouchableOpacity>
        </View>
        
        <View style={{
          backgroundColor: '#48b783',
          borderRadius: 10,
          padding: Math.min(screenWidth * 0.038, 15),
          alignItems: 'center',
        }}>
          <Text 
            style={{ color: '#fff', fontSize: Math.min(screenWidth * 0.04, 16), fontWeight: 'bold' }}
            onPress={logout}
          >
            {t('common.logout')}
          </Text>
        </View>
      </View>

      {/* Modal de Configuración de Cuenta */}
      <Modal
        visible={showAccountModal}
        animationType="slide"
        transparent={true}
        onRequestClose={handleCloseModal}
      >
        <View style={modalStyles.modalOverlay}>
          <View style={modalStyles.modalContainer}>
            <View style={modalStyles.modalHeader}>
              <Text style={modalStyles.modalTitle}>{t('profile.editProfile')}</Text>
              <TouchableOpacity onPress={handleCloseModal}>
                <Text style={modalStyles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={modalStyles.formContainer}>
              <Text style={modalStyles.label}>{t('profile.name')}:</Text>
              <TextInput
                style={modalStyles.input}
                value={editForm.name}
                onChangeText={(text) => setEditForm({...editForm, name: text})}
                placeholder={t('forms.enterName')}
                placeholderTextColor="#666"
              />

              <Text style={modalStyles.label}>{t('profile.email')}:</Text>
              <TextInput
                style={modalStyles.input}
                value={editForm.email}
                onChangeText={(text) => setEditForm({...editForm, email: text})}
                placeholder={t('forms.enterEmail')}
                placeholderTextColor="#666"
                keyboardType="email-address"
              />

              <Text style={modalStyles.label}>{t('auth.username')}:</Text>
              <TextInput
                style={[modalStyles.input, modalStyles.disabledInput]}
                value={editForm.username}
                editable={false}
                placeholder={t('forms.usernameNotEditable')}
                placeholderTextColor="#666"
              />
            </View>

            <View style={modalStyles.buttonContainer}>
              <TouchableOpacity style={modalStyles.cancelButton} onPress={handleCloseModal}>
                <Text style={modalStyles.cancelButtonText}>{t('common.cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={modalStyles.saveButton} onPress={handleSaveAccount}>
                <Text style={modalStyles.saveButtonText}>{t('common.save')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal de Cambio de Contraseña */}
      <Modal
        visible={showPasswordModal}
        animationType="slide"
        transparent={true}
        onRequestClose={handleClosePasswordModal}
      >
        <View style={modalStyles.modalOverlay}>
          <View style={modalStyles.modalContainer}>
            <View style={modalStyles.modalHeader}>
              <Text style={modalStyles.modalTitle}>{t('profile.changePassword')}</Text>
              <TouchableOpacity onPress={handleClosePasswordModal}>
                <Text style={modalStyles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={modalStyles.formContainer}>
              <Text style={modalStyles.label}>{t('auth.currentPassword')}:</Text>
              <TextInput
                style={modalStyles.input}
                value={passwordForm.currentPassword}
                onChangeText={(text) => setPasswordForm({...passwordForm, currentPassword: text})}
                placeholder={t('forms.enterCurrentPassword')}
                placeholderTextColor="#666"
                secureTextEntry={true}
                textContentType="password"
                autoComplete="current-password"
                autoCorrect={false}
                autoCapitalize="none"
              />

              <Text style={modalStyles.label}>{t('auth.newPassword')}:</Text>
              <TextInput
                style={modalStyles.input}
                value={passwordForm.newPassword}
                onChangeText={(text) => setPasswordForm({...passwordForm, newPassword: text})}
                placeholder={t('forms.enterNewPassword')}
                placeholderTextColor="#666"
                secureTextEntry={true}
                textContentType="newPassword"
                autoComplete="password-new"
                autoCorrect={false}
                autoCapitalize="none"
              />

              <Text style={modalStyles.label}>{t('auth.confirmPassword')}:</Text>
              <TextInput
                style={modalStyles.input}
                value={passwordForm.confirmPassword}
                onChangeText={(text) => setPasswordForm({...passwordForm, confirmPassword: text})}
                placeholder={t('forms.confirmNewPassword')}
                placeholderTextColor="#666"
                secureTextEntry={true}
                textContentType="newPassword"
                autoComplete="password-new"
                autoCorrect={false}
                autoCapitalize="none"
              />
            </View>

            <View style={modalStyles.buttonContainer}>
              <TouchableOpacity style={modalStyles.cancelButton} onPress={handleClosePasswordModal}>
                <Text style={modalStyles.cancelButtonText}>{t('common.cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={modalStyles.saveButton} onPress={handleSavePassword}>
                <Text style={modalStyles.saveButtonText}>{t('common.change')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal de Privacidad y Términos y Condiciones */}
      <Modal
        visible={showPrivacyModal}
        animationType="slide"
        transparent={true}
        onRequestClose={handleClosePrivacyModal}
      >
        <View style={modalStyles.modalOverlay}>
          <View style={modalStyles.modalContainer}>
            <View style={modalStyles.modalHeader}>
              <Text style={modalStyles.modalTitle}>{t('profile.privacy')}</Text>
              <TouchableOpacity onPress={handleClosePrivacyModal}>
                <Text style={modalStyles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={{ flex: 1, maxHeight: '70%' }} showsVerticalScrollIndicator={true}>
               <Text style={{
                 fontSize: Math.min(screenWidth * 0.035, 14),
                 color: '#333',
                 lineHeight: 20,
                 textAlign: 'justify',
                 paddingBottom: 10
               }}>
                 <Text style={{ fontWeight: 'bold' }}>1. Aceptación de los Términos{"\n\n"}</Text>
                 Al utilizar nuestra aplicación, usted acepta estar sujeto a estos términos y condiciones de uso.
                 {"\n\n"}
                 <Text style={{ fontWeight: 'bold' }}>2. Privacidad y Protección de Datos{"\n\n"}</Text>
                 Nos comprometemos a proteger su información personal y financiera. Todos los datos son encriptados y almacenados de forma segura.
                 {"\n\n"}
                 <Text style={{ fontWeight: 'bold' }}>3. Uso de la Información{"\n\n"}</Text>
                 La información proporcionada será utilizada únicamente para los servicios financieros solicitados y no será compartida con terceros sin su consentimiento.
                 {"\n\n"}
                 <Text style={{ fontWeight: 'bold' }}>4. Seguridad{"\n\n"}</Text>
                 Implementamos medidas de seguridad avanzadas para proteger sus transacciones y datos personales.
                 {"\n\n"}
                 <Text style={{ fontWeight: 'bold' }}>5. Responsabilidades del Usuario{"\n\n"}</Text>
                 El usuario se compromete a proporcionar información veraz y mantener la confidencialidad de sus credenciales de acceso.
                 {"\n\n"}
                 <Text style={{ fontWeight: 'bold' }}>6. Modificaciones{"\n\n"}</Text>
                 Nos reservamos el derecho de modificar estos términos en cualquier momento. Los cambios serán notificados a través de la aplicación.
               </Text>
             </ScrollView>

            <View style={{
              marginTop: Math.min(screenHeight * 0.024, 20),
              alignItems: 'center'
            }}>
              <TouchableOpacity 
                style={{
                  backgroundColor: '#48b783',
                  padding: Math.min(screenWidth * 0.038, 15),
                  borderRadius: 8,
                  width: '100%',
                  alignItems: 'center'
                }}
                onPress={handleClosePrivacyModal}
              >
                <Text style={{
                  color: '#fff',
                  fontSize: Math.min(screenWidth * 0.04, 16),
                  fontWeight: 'bold'
                }}>{t('common.understood')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal de Selección de Idioma */}
      <Modal
        visible={showLanguageModal}
        animationType="slide"
        transparent={true}
        onRequestClose={handleCloseLanguageModal}
      >
        <View style={modalStyles.modalOverlay}>
          <View style={modalStyles.modalContainer}>
            <View style={modalStyles.modalHeader}>
              <Text style={modalStyles.modalTitle}>{t('profile.selectLanguage')}</Text>
              <TouchableOpacity onPress={handleCloseLanguageModal}>
                <Text style={modalStyles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={modalStyles.formContainer}>
              <Text style={modalStyles.label}>{t('profile.currentLanguage')}: {currentLanguage === 'es' ? 'Español' : 'English'}</Text>
              
              {availableLanguages.map((lang) => (
                <TouchableOpacity
                  key={lang.code}
                  style={[
                    modalStyles.languageOption,
                    currentLanguage === lang.code && modalStyles.selectedLanguageOption
                  ]}
                  onPress={() => handleLanguageChange(lang.code)}
                >
                  <Text style={[
                    modalStyles.languageOptionText,
                    currentLanguage === lang.code && modalStyles.selectedLanguageOptionText
                  ]}>
                    {lang.name}
                  </Text>
                  {currentLanguage === lang.code && (
                    <Text style={modalStyles.checkmark}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>

            <View style={modalStyles.buttonContainer}>
              <TouchableOpacity style={modalStyles.cancelButton} onPress={handleCloseLanguageModal}>
                <Text style={modalStyles.cancelButtonText}>{t('common.cancel')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default function DashboardTabNavigator() {
  const { getUserRole, user } = useAuth();
  const userRole = getUserRole();
  
  // Obtener el primer rol del usuario si existe
  const firstRole = user?.roles && user.roles.length > 0 ? user.roles[0].toLowerCase() : null;
  
  // Logs de depuración
  console.log('🔍 DashboardTabNavigator - Usuario:', JSON.stringify(user, null, 2));
  console.log('🔍 DashboardTabNavigator - UserRole (función):', userRole);
  console.log('🔍 DashboardTabNavigator - FirstRole (array):', firstRole);
  console.log('🔍 DashboardTabNavigator - Roles completos:', user?.roles);
  
  // Función utilitaria para determinar el rol principal del usuario
  const getUserPrimaryRole = () => {
    const userRoles = user?.roles || [];
    const roleHierarchy = ['admin', 'administrator', 'empresa', 'prestamista', 'solicitante'];
    
    // Encontrar el rol de mayor prioridad
    for (const hierarchyRole of roleHierarchy) {
      if (userRoles.some(role => role.toLowerCase() === hierarchyRole)) {
        return hierarchyRole;
      }
    }
    
    // Fallback al primer rol o rol de función
    return firstRole || userRole || 'solicitante';
  };
  
  const primaryRole = getUserPrimaryRole();
  console.log('🔍 DashboardTabNavigator - Rol principal determinado:', primaryRole);

  // Función para obtener el componente de dashboard basado en el rol principal
  const getDashboardComponent = () => {
    switch (primaryRole) {
      case 'admin':
      case 'administrator':
      case 'empresa':
        return AdminDashboardScreen;
      case 'prestamista':
        return SolicitanteDashboardScreen; // prestamista ve dashboard de solicitante
      case 'solicitante':
      default:
        return PrestamistaDashboardScreen; // solicitante ve dashboard de prestamista
    }
  };

  const DashboardComponent = getDashboardComponent();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused }) => (
          <TabIcon name={route.name} focused={focused} />
        ),
        tabBarActiveTintColor: '#48b783',
        tabBarInactiveTintColor: '#666',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#e0e0e0',
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardComponent}
        options={{
          tabBarLabel: 'Inicio',
        }}
      />
      <Tab.Screen 
        name="Perfil" 
        component={PerfilScreen}
        options={{
          tabBarLabel: 'Perfil',
        }}
      />
    </Tab.Navigator>
  );
}