# Proceso de Recuperación de Contraseña - FiFintech

## Descripción
Se ha implementado un proceso de recuperación de contraseña de dos pasos que incluye la validación del correo electrónico antes de permitir el cambio de contraseña.

## Flujo Implementado

### Paso 1: Validación de Correo Electrónico
- El usuario ingresa su correo electrónico
- Se valida el formato del email
- Se simula el envío de un enlace de recuperación
- Se muestra un mensaje de confirmación

### Paso 2: Establecer Nueva Contraseña
- El usuario ingresa su nueva contraseña
- Confirma la nueva contraseña
- Se valida que las contraseñas coincidan y cumplan los requisitos mínimos
- Se actualiza la contraseña y redirige al login

## Características Implementadas

### 🔄 **Flujo de Dos Pasos**
- **Paso 1**: Solicitud de correo electrónico
- **Paso 2**: Establecimiento de nueva contraseña
- Navegación fluida entre pasos

### 📧 **Validación de Email**
- Verificación de formato de correo electrónico
- Validación de campos requeridos
- Mensajes de error específicos

### 🔒 **Validación de Contraseña**
- Longitud mínima de 6 caracteres
- Confirmación de contraseña
- Verificación de coincidencia entre contraseñas

### 🎨 **Indicador de Progreso Visual**
- Círculos numerados para cada paso
- Estados visuales: activo, completado, inactivo
- Línea de conexión entre pasos
- Etiquetas descriptivas

### 🔙 **Navegación Mejorada**
- Botón para volver al paso anterior
- Navegación condicional según el estado
- Prevención de navegación durante carga

## Archivos Modificados

### `src/screens/RecoverPasswordScreen.tsx`
- **Estado de pasos**: Manejo de `step` para controlar el flujo
- **Datos separados**: `emailData` para el correo y `formData` para contraseñas
- **Validaciones específicas**: `validateEmail()` y `validateForm()`
- **Funciones de manejo**: `handleSendEmail()` y `handleRecoverPassword()`
- **UI condicional**: Renderizado según el paso actual
- **Indicador de progreso**: Componente visual para mostrar el avance

### `src/models/auth.models.ts`
- Uso del modelo `RecoverPasswordData` existente para el paso de email
- Mantenimiento del modelo `ChangePasswordData` para el paso de contraseña

## Estructura de Estados

```typescript
// Estado del paso actual
const [step, setStep] = useState<'email' | 'password'>('email');

// Datos del correo electrónico
const [emailData, setEmailData] = useState<RecoverPasswordData>({
  email: ""
});

// Datos de la nueva contraseña
const [formData, setFormData] = useState<ChangePasswordData>({
  oldPassword: "",
  newPassword: "",
  confirmPassword: "",
});
```

## Funciones Principales

### `handleSendEmail()`
- Valida el formato del correo electrónico
- Simula el envío del enlace de recuperación
- Avanza al siguiente paso

### `handleRecoverPassword()`
- Valida la nueva contraseña y su confirmación
- Simula el cambio de contraseña
- Redirige al login tras éxito

### `validateEmail()`
- Verifica que el campo no esté vacío
- Valida el formato usando regex
- Muestra mensajes de error específicos

### `validateForm()`
- Verifica longitud mínima de contraseña
- Confirma que las contraseñas coincidan
- Valida campos requeridos

## Estilos Agregados

### Indicador de Progreso
- `progressContainer`: Contenedor principal
- `progressStep`: Cada paso individual
- `progressCircle`: Círculos numerados
- `progressLine`: Línea conectora
- Estados: `Active`, `Completed`, `Inactive`

### Navegación
- `backButton`: Botón para volver
- `backButtonText`: Texto del botón de retroceso

## Experiencia de Usuario

### Flujo Típico
1. **Inicio**: Usuario ve formulario de correo electrónico
2. **Validación**: Ingresa email válido y presiona "Enviar enlace"
3. **Confirmación**: Ve mensaje de éxito y avanza automáticamente
4. **Nueva contraseña**: Ingresa y confirma nueva contraseña
5. **Finalización**: Recibe confirmación y es redirigido al login

### Navegación Alternativa
- En el paso 2, puede volver al paso 1 usando el botón "← Volver al paso anterior"
- Puede cancelar en cualquier momento usando "¿Ya tienes cuenta? Iniciar sesión"

## Consideraciones de Seguridad

### Implementación Actual (Simulada)
- El envío de email está simulado
- El cambio de contraseña está simulado
- No hay verificación real de tokens

### Recomendaciones para Producción
1. **Integrar con backend real** para envío de emails
2. **Implementar tokens de recuperación** con expiración
3. **Agregar rate limiting** para prevenir spam
4. **Validar tokens** antes de permitir cambio de contraseña
5. **Logs de seguridad** para intentos de recuperación

## Próximos Pasos

1. **Integración con API**: Conectar con endpoints reales
2. **Gestión de tokens**: Implementar sistema de tokens seguros
3. **Notificaciones**: Mejorar sistema de notificaciones
4. **Tests**: Agregar pruebas unitarias y de integración
5. **Accesibilidad**: Mejorar soporte para lectores de pantalla

## Uso en Desarrollo

```bash
# Para probar el flujo completo
1. Navegar a la pantalla de recuperación desde login
2. Ingresar cualquier email válido
3. Verificar transición automática al paso 2
4. Ingresar nueva contraseña y confirmación
5. Verificar redirección al login
```

## Troubleshooting

### Email no válido
- Verificar formato: debe contener @ y dominio válido
- Revisar que no esté vacío

### Contraseñas no coinciden
- Verificar que ambos campos tengan el mismo valor
- Revisar longitud mínima de 6 caracteres

### Navegación no funciona
- Verificar que no haya procesos de carga activos
- Comprobar estado del botón (disabled)