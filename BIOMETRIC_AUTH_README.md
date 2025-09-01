# Autenticación Biométrica - FiFintech

## Descripción
Se ha implementado la funcionalidad de autenticación biométrica (Touch ID/Face ID) para dispositivos iOS en la aplicación FiFintech.

## Características Implementadas

### 1. Detección Automática
- Detecta automáticamente si el dispositivo soporta autenticación biométrica
- Identifica el tipo de biometría disponible (Face ID, Touch ID)
- Solo muestra la opción si está habilitada y configurada

### 2. Interfaz de Usuario
- Botón adicional en la pantalla de login para autenticación biométrica
- Iconos específicos según el tipo de biometría (cara para Face ID, huella para Touch ID)
- Diseño consistente con el tema de la aplicación

### 3. Gestión de Credenciales
- Almacenamiento seguro de email del usuario
- Opción para habilitar/deshabilitar login biométrico
- Prompt automático para configurar biometría después del primer login exitoso

## Archivos Modificados

### `src/screens/LoginScreen.tsx`
- Agregada funcionalidad de autenticación biométrica
- Integración con BiometricService
- UI actualizada con botón biométrico

### `src/services/biometricService.ts` (Nuevo)
- Servicio centralizado para manejo de autenticación biométrica
- Métodos para verificar disponibilidad, autenticar y gestionar credenciales

### `app.json`
- Configuración del plugin `expo-local-authentication`
- Agregada descripción de uso de Face ID para iOS (`NSFaceIDUsageDescription`)

## Configuración Requerida

### Para iOS
1. **Face ID**: Requiere `NSFaceIDUsageDescription` en `Info.plist` (ya configurado)
2. **Development Build**: Face ID no funciona en Expo Go, requiere development build

### Dependencias
- `expo-local-authentication`: Para la funcionalidad biométrica
- `@react-native-async-storage/async-storage`: Para almacenamiento de preferencias

## Uso

### Primera Vez
1. Usuario hace login normal con email/contraseña
2. Si el dispositivo soporta biometría, aparece un prompt preguntando si desea habilitarla
3. Si acepta, las credenciales se almacenan de forma segura

### Logins Posteriores
1. Aparece el botón de autenticación biométrica en la pantalla de login
2. Al presionarlo, se solicita la autenticación biométrica
3. Si es exitosa, se realiza el login automáticamente

## Seguridad

### Buenas Prácticas Implementadas
- No se almacena la contraseña del usuario
- Solo se guarda el email y un flag de credenciales almacenadas
- En producción, se debería usar un token biométrico en lugar de simular el login

### Recomendaciones para Producción
1. Implementar un sistema de tokens biométricos en el backend
2. Usar encriptación adicional para datos almacenados
3. Implementar expiración de tokens biométricos
4. Agregar logs de seguridad para intentos de autenticación

## Comandos de Desarrollo

```bash
# Para probar en iOS (requiere development build)
npx expo run:ios

# Para crear development build
npx expo build:ios
```

## Limitaciones Actuales

1. **Solo iOS**: La implementación está optimizada para iOS (Touch ID/Face ID)
2. **Development Build**: No funciona en Expo Go para Face ID
3. **Simulación**: El login biométrico actualmente simula el proceso, requiere integración con backend real

## Próximos Pasos

1. Integrar con el sistema de autenticación real del backend
2. Implementar tokens biométricos seguros
3. Agregar soporte completo para Android (Biometric Prompt)
4. Implementar configuraciones de seguridad adicionales
5. Agregar tests unitarios para la funcionalidad biométrica

## Troubleshooting

### Face ID no aparece
- Verificar que el dispositivo tenga Face ID configurado
- Asegurar que se esté usando un development build, no Expo Go
- Verificar que `NSFaceIDUsageDescription` esté en `Info.plist`

### Touch ID no funciona
- Verificar que el dispositivo tenga Touch ID configurado
- Asegurar que hay al menos una huella registrada

### Botón biométrico no aparece
- Verificar que el usuario haya habilitado la autenticación biométrica
- Comprobar que el dispositivo soporte biometría