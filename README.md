# FiFintech - Aplicación de Inteligencia Financiera

FiFintech es una aplicación móvil desarrollada con React Native que proporciona servicios de inteligencia financiera para diferentes tipos de usuarios: administradores, asesores y clientes.

## Características

- **Sistema de autenticación completo**: Registro, inicio de sesión, recuperación de contraseña y gestión de perfiles.
- **Roles de usuario**: Diferentes interfaces y funcionalidades según el rol del usuario (administrador, asesor, cliente).
- **Sistema de alertas**: Notificaciones visuales para informar al usuario sobre eventos importantes.
- **Interfaz intuitiva**: Diseño moderno y fácil de usar adaptado a cada tipo de usuario.

## Tecnologías

- React Native
- TypeScript
- React Navigation
- AsyncStorage
- Context API

## Estructura del Proyecto

```
fifintech/
├── src/
│   ├── components/     # Componentes reutilizables
│   ├── contexts/       # Contextos de React para estado global
│   ├── models/         # Interfaces y tipos de TypeScript
│   ├── navigation/     # Configuración de navegación
│   ├── screens/        # Pantallas de la aplicación
│   ├── services/       # Servicios para comunicación con APIs
│   └── utils/          # Utilidades y helpers
├── docs/               # Documentación técnica
└── assets/             # Recursos estáticos
```

## Modelos y Servicios

### Modelos de Autenticación

Los modelos de autenticación se encuentran en `src/models/auth.models.ts` y definen las interfaces y tipos utilizados en el sistema:

- `UserRole`: Enum que define los roles disponibles (admin, asesor, cliente).
- `User`: Interface que representa la información de un usuario autenticado.
- `LoginCredentials`: Datos necesarios para iniciar sesión.
- `AuthResponse`: Respuesta del servidor tras una autenticación exitosa.
- `AuthState`: Estado de autenticación gestionado por el contexto.
- `RegisterData`: Datos para registrar un nuevo usuario.
- `RecoverPasswordData`: Datos para solicitar recuperación de contraseña.
- `ChangePasswordData`: Datos para cambiar la contraseña.

### Servicios de Autenticación

Los servicios de autenticación se encuentran en `src/services/auth.service.ts` y proporcionan métodos para interactuar con la API:

- `login`: Autentica al usuario con sus credenciales.
- `register`: Registra un nuevo usuario en el sistema.
- `logout`: Cierra la sesión del usuario actual.
- `recoverPassword`: Solicita un correo de recuperación de contraseña.
- `changePassword`: Cambia la contraseña del usuario autenticado.
- `getCurrentAuth`: Recupera la información de autenticación almacenada localmente.

## Sistema de Alertas

El sistema de alertas proporciona una forma consistente de mostrar mensajes al usuario:

- `AlertContext`: Contexto global para gestionar alertas.
- `AlertMessage`: Componente visual para mostrar alertas.
- `useAlert`: Hook para gestionar alertas locales.
- `useAlertContext`: Hook para acceder al contexto global de alertas.
- `useAlertUtils`: Utilidades para mostrar diferentes tipos de alertas (éxito, error, advertencia, información).

## Documentación

Para más información, consulte la documentación detallada en la carpeta `docs/`:

- [Sistema de Alertas](./docs/AlertSystem.md)
- [Sistema de Autenticación](./docs/AuthenticationGuide.md)

## Instalación

1. Clonar el repositorio
   ```
   git clone https://github.com/tu-usuario/fifintech.git
   cd fifintech
   ```

2. Instalar dependencias
   ```
   npm install
   ```

3. Ejecutar la aplicación
   ```
   npm start
   ```

## Contribución

1. Hacer fork del repositorio
2. Crear una rama para tu característica (`git checkout -b feature/amazing-feature`)
3. Hacer commit de tus cambios (`git commit -m 'Add some amazing feature'`)
4. Push a la rama (`git push origin feature/amazing-feature`)
5. Abrir un Pull Request

## Licencia

Este proyecto está licenciado bajo la Licencia MIT - ver el archivo LICENSE para más detalles.# fifintech
