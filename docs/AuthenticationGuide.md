# Guía de Autenticación para FiFintech

Este documento proporciona una guía completa sobre el sistema de autenticación implementado en la aplicación FiFintech.

## Estructura de Modelos

Los modelos de autenticación se encuentran en `src/models/auth.models.ts` y definen las interfaces y tipos utilizados en todo el sistema de autenticación:

### Enumeraciones

- `UserRole`: Define los roles de usuario disponibles en el sistema.
  ```typescript
  export enum UserRole {
    ADMIN = 'admin',
    ASESOR = 'asesor',
    CLIENTE = 'cliente'
  }
  ```

### Interfaces

- `User`: Representa la información de un usuario autenticado.
  ```typescript
  export interface User {
    id: string;
    name: string;
    email: string;
    role: UserRole;
  }
  ```

- `LoginCredentials`: Datos necesarios para iniciar sesión.
  ```typescript
  export interface LoginCredentials {
    email: string;
    password: string;
  }
  ```

- `AuthResponse`: Respuesta del servidor tras una autenticación exitosa.
  ```typescript
  export interface AuthResponse {
    user: User;
    token: string;
  }
  ```

- `AuthState`: Estado de autenticación gestionado por el contexto.
  ```typescript
  export interface AuthState {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    isLoggedIn: boolean;
    error: string | null;
  }
  ```

- `RegisterData`: Datos necesarios para registrar un nuevo usuario.
  ```typescript
  export interface RegisterData {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    role?: UserRole;
  }
  ```

- `RecoverPasswordData`: Datos para solicitar recuperación de contraseña.
  ```typescript
  export interface RecoverPasswordData {
    email: string;
  }
  ```

- `ChangePasswordData`: Datos para cambiar la contraseña.
  ```typescript
  export interface ChangePasswordData {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }
  ```

## Servicios de Autenticación

Los servicios de autenticación se encuentran en `src/services/auth.service.ts` y proporcionan métodos para interactuar con la API de autenticación:

### Métodos Disponibles

- `login(credentials: LoginCredentials): Promise<AuthResponse>`
  - Autentica al usuario con sus credenciales.
  - Almacena el token y la información del usuario en AsyncStorage.
  - Retorna los datos del usuario y el token de autenticación.

- `register(data: RegisterData): Promise<void>`
  - Registra un nuevo usuario en el sistema.
  - Valida que las contraseñas coincidan antes de enviar la solicitud.

- `logout(): Promise<void>`
  - Cierra la sesión del usuario actual.
  - Elimina el token y la información del usuario de AsyncStorage.

- `recoverPassword(data: RecoverPasswordData): Promise<void>`
  - Solicita un correo de recuperación de contraseña.

- `changePassword(data: ChangePasswordData): Promise<void>`
  - Cambia la contraseña del usuario autenticado.
  - Valida que la nueva contraseña y la confirmación coincidan.

- `getCurrentAuth(): Promise<AuthResponse | null>`
  - Recupera la información de autenticación almacenada localmente.
  - Utilizado para mantener la sesión entre reinicios de la aplicación.

## Contexto de Autenticación

El contexto de autenticación se encuentra en `src/contexts/AuthContext.tsx` y proporciona acceso global al estado de autenticación:

### Propiedades y Métodos

- `authState`: Objeto que contiene toda la información de autenticación.
  - `user`: Información del usuario autenticado.
  - `token`: Token de autenticación.
  - `isLoading`: Indica si hay una operación de autenticación en curso.
  - `isLoggedIn`: Indica si hay un usuario autenticado.
  - `error`: Mensaje de error si ocurrió algún problema.

- `login(credentials: LoginCredentials): Promise<void>`
  - Inicia sesión utilizando el servicio de autenticación.
  - Actualiza el estado del contexto con la información del usuario.

- `logout(): Promise<void>`
  - Cierra la sesión utilizando el servicio de autenticación.
  - Limpia el estado del contexto.

- `getUserRole(): UserRole | null`
  - Retorna el rol del usuario autenticado.

- `clearError(): void`
  - Limpia los mensajes de error en el estado.

## Uso en Componentes

### Iniciar Sesión

```typescript
import { useAuth } from '../contexts/AuthContext';
import { LoginCredentials } from '../models/auth.models';
import { useAlertUtils } from '../utils/alertUtils';

function LoginComponent() {
  const { login, authState } = useAuth();
  const { showSuccess, showError } = useAlertUtils();
  const [credentials, setCredentials] = useState<LoginCredentials>({
    email: '',
    password: ''
  });

  const handleLogin = async () => {
    try {
      await login(credentials);
      showSuccess('Inicio de sesión exitoso');
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Error al iniciar sesión');
    }
  };

  // Resto del componente...
}
```

### Registrar Usuario

```typescript
import { authService } from '../services/auth.service';
import { RegisterData } from '../models/auth.models';
import { useAlertUtils } from '../utils/alertUtils';

function RegisterComponent() {
  const { showSuccess, showError } = useAlertUtils();
  const [formData, setFormData] = useState<RegisterData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleRegister = async () => {
    try {
      await authService.register(formData);
      showSuccess('Registro exitoso. Por favor inicie sesión.');
      // Navegar a la pantalla de login...
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Error al registrar usuario');
    }
  };

  // Resto del componente...
}
```

### Proteger Rutas

En el navegador de la aplicación (`src/navigation/AppNavigator.tsx`), se utiliza el contexto de autenticación para mostrar diferentes pantallas según el estado de autenticación y el rol del usuario:

```typescript
import { useAuth } from '../contexts/AuthContext';

function AppNavigator() {
  const { authState, getUserRole } = useAuth();
  const userRole = getUserRole();

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {authState.isLoggedIn ? (
          // Rutas protegidas según el rol
          userRole === UserRole.ADMIN ? (
            <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
          ) : userRole === UserRole.ASESOR ? (
            <Stack.Screen name="AsesorDashboard" component={AsesorDashboardScreen} />
          ) : (
            <Stack.Screen name="ClienteDashboard" component={ClienteDashboardScreen} />
          )
        ) : (
          // Rutas públicas
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="RecoverPassword" component={RecoverPasswordScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
```

## Mejores Prácticas

1. **Validación de Formularios**: Siempre valide los datos del formulario antes de enviarlos al servidor.

2. **Manejo de Errores**: Utilice el sistema de alertas para mostrar mensajes de error claros al usuario.

3. **Seguridad**: Nunca almacene contraseñas en texto plano ni en el estado de la aplicación.

4. **Tokens**: Almacene los tokens de autenticación de forma segura y elimínelos al cerrar sesión.

5. **Roles de Usuario**: Verifique siempre el rol del usuario antes de mostrar contenido restringido.

6. **Sesiones**: Implemente un mecanismo para refrescar tokens expirados.

## Flujo de Autenticación

1. **Inicio de Sesión**:
   - Usuario ingresa credenciales
   - Aplicación envía solicitud al servidor
   - Servidor valida y retorna token + datos de usuario
   - Aplicación almacena token y actualiza estado
   - Navegación redirige a dashboard según rol

2. **Registro**:
   - Usuario completa formulario
   - Aplicación valida datos localmente
   - Aplicación envía solicitud al servidor
   - Servidor crea usuario y retorna confirmación
   - Aplicación muestra mensaje de éxito
   - Navegación redirige a pantalla de login

3. **Recuperación de Contraseña**:
   - Usuario ingresa email
   - Aplicación envía solicitud al servidor
   - Servidor envía email con instrucciones
   - Aplicación muestra mensaje de confirmación

4. **Cambio de Contraseña**:
   - Usuario ingresa contraseña actual y nueva
   - Aplicación valida datos localmente
   - Aplicación envía solicitud al servidor
   - Servidor actualiza contraseña
   - Aplicación muestra mensaje de éxito