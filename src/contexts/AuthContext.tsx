import React, { createContext, useState, useContext, useEffect } from 'react';
import { User, UserRole, LoginCredentials, AuthState } from '../models/auth.models';
import { authService } from '../services/auth.service';

// Definir el contexto de autenticación
type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  isLoggedIn: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<boolean>;
  logout: () => Promise<void>;
  getUserRole: () => UserRole | null;
  clearError: () => void;
};

// Crear el contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hook personalizado para usar el contexto
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

// Proveedor del contexto
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    isLoading: true,
    isLoggedIn: false,
    error: null
  });

  // Función para limpiar errores
  const clearError = () => {
    setAuthState(prev => ({ ...prev, error: null }));
  };

  // Función para iniciar sesión
  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const response = await authService.login(credentials);
      
      console.log('🔍 AuthContext - Respuesta del servicio:', JSON.stringify(response, null, 2));
      console.log('🔍 AuthContext - Usuario recibido:', JSON.stringify(response.user, null, 2));
      console.log('🔍 AuthContext - Roles del usuario:', response.user?.roles);
      
      setAuthState({
        user: response.user,
        token: response.token,
        isLoading: false,
        isLoggedIn: true,
        error: null
      });
      
      console.log('🔍 AuthContext - Estado actualizado con usuario:', JSON.stringify(response.user, null, 2));
      
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido en login';
      console.error('Error en login:', errorMessage);
      
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }));
      
      return false;
    }
  };

  // Función para cerrar sesión
  const logout = async (): Promise<void> => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      await authService.logout();
      
      setAuthState({
        user: null,
        token: null,
        isLoading: false,
        isLoggedIn: false,
        error: null
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido en logout';
      console.error('Error en logout:', errorMessage);
      
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }));
    }
  };

  // Función para obtener el rol del usuario
  const getUserRole = (): UserRole | null => {
    if (!authState.user || !authState.user.roles || authState.user.roles.length === 0) {
      return null;
    }
    
    // Convertir el primer rol del array a UserRole
    const role = authState.user.roles[0];
    switch (role.toLowerCase()) {
      case 'admin':
      case 'administrator':
      case 'empresa':
        return UserRole.ADMIN;
      case 'cliente':
        return UserRole.CLIENTE;
      case 'asesor':
        return UserRole.ASESOR;
      case 'prestatario':
        return UserRole.ASESOR; // Mapear prestatario a asesor
      default:
        return null;
    }
  };

  // Efecto para verificar si el usuario ya está autenticado al cargar la app
  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log('🔍 AuthContext useEffect - Iniciando verificación de autenticación');
        setAuthState(prev => ({ ...prev, isLoading: true }));
        
        const authData = await authService.getCurrentAuth();
        
        console.log('🔍 AuthContext useEffect - Datos de autenticación recuperados:', JSON.stringify(authData, null, 2));
        console.log('🔍 AuthContext useEffect - Usuario recuperado:', JSON.stringify(authData?.user, null, 2));
        console.log('🔍 AuthContext useEffect - Roles recuperados:', authData?.user?.roles);
        
        if (authData && authData.user && authData.token) {
          // Validar que los datos del usuario sean válidos
          console.log('🔍 AuthContext - Validando datos del usuario:', {
            hasId: !!authData.user.id,
            idValue: authData.user.id,
            idType: typeof authData.user.id,
            hasName: !!authData.user.name,
            nameValue: authData.user.name,
            nameType: typeof authData.user.name,
            userKeys: Object.keys(authData.user)
          });
          
          if (!authData.user.id || !authData.user.name) {
            console.warn('🔍 AuthContext useEffect - Datos de usuario incompletos:', {
              id: authData.user.id,
              name: authData.user.name,
              fullUser: authData.user
            });
            console.warn('🔍 AuthContext useEffect - Limpiando sesión por datos incompletos');
            await authService.logout();
            setAuthState(prev => ({ ...prev, isLoading: false, isLoggedIn: false }));
            return;
          }
          
          setAuthState({
            user: authData.user,
            token: authData.token,
            isLoading: false,
            isLoggedIn: true,
            error: null
          });
          
          console.log('🔍 AuthContext useEffect - Estado actualizado con usuario recuperado:', JSON.stringify(authData.user, null, 2));
        } else {
          console.log('🔍 AuthContext useEffect - No hay datos de autenticación válidos');
          setAuthState(prev => ({ ...prev, isLoading: false, isLoggedIn: false }));
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error al verificar autenticación';
        console.error('🚨 Error crítico en AuthContext useEffect:', {
          error: errorMessage,
          stack: error instanceof Error ? error.stack : 'No stack available',
          timestamp: new Date().toISOString()
        });
        
        // En caso de error crítico, limpiar cualquier dato corrupto
        try {
          await authService.logout();
        } catch (logoutError) {
          console.error('🚨 Error al limpiar datos después de error crítico:', logoutError);
        }
        
        setAuthState({
          user: null,
          token: null,
          isLoading: false,
          isLoggedIn: false,
          error: errorMessage
        });
      }
    };
    
    // Envolver en setTimeout para evitar bloqueos en la inicialización
    const timeoutId = setTimeout(() => {
      checkAuth();
    }, 100);
    
    return () => clearTimeout(timeoutId);
  }, []);

  // Proporcionar el contexto
  return (
    <AuthContext.Provider
      value={{
        user: authState.user,
        isLoading: authState.isLoading,
        isLoggedIn: authState.isLoggedIn,
        error: authState.error,
        login,
        logout,
        getUserRole,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};