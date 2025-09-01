# Actualización del Formato de Datos - RegisterScreen

## Descripción
Se ha actualizado el `RegisterScreen.tsx` para enviar los datos de registro en el formato específico requerido por la API backend.

## Cambios Realizados

### Formato de Datos Anterior
```javascript
const registerData: RegisterData = {
  email: formData.email,
  password: formData.password,
  name: `${formData.name} ${formData.lastName}`,
  phoneNumber: formData.phoneNumber,
  rol: formData.rol,
  direccion: formData.direccion,
  tyc: formData.acceptTerms
};
```

### Nuevo Formato de Datos
```javascript
const registerData = {
  username: formData.usuario,
  name: formData.name,
  lastname: formData.lastName,
  "no.identiti": formData.identification,
  email: formData.email,
  phone: formData.phoneNumber,
  password: formData.password,
  password2: formData.confirmPassword,
  address: formData.direccion,
  photo: formData.profileImage || "",
  photo_document_front: formData.documentFront || "",
  photo_document_lat: formData.documentBack || "",
  role: formData.rol,
  tyc: formData.acceptTerms
};
```

## Mapeo de Campos

| Campo del Formulario | Campo de la API | Descripción |
|---------------------|-----------------|-------------|
| `formData.usuario` | `username` | Nombre de usuario |
| `formData.name` | `name` | Nombre |
| `formData.lastName` | `lastname` | Apellidos |
| `formData.identification` | `no.identiti` | Número de identificación |
| `formData.email` | `email` | Correo electrónico |
| `formData.phoneNumber` | `phone` | Número de teléfono |
| `formData.password` | `password` | Contraseña |
| `formData.confirmPassword` | `password2` | Confirmación de contraseña |
| `formData.direccion` | `address` | Dirección |
| `formData.profileImage` | `photo` | URL de la foto de perfil |
| `formData.documentFront` | `photo_document_front` | URL del documento frontal |
| `formData.documentBack` | `photo_document_lat` | URL del documento trasero |
| `formData.rol` | `role` | Rol del usuario |
| `formData.acceptTerms` | `tyc` | Aceptación de términos y condiciones |

## Características del Nuevo Formato

### 1. **Campos Separados**
- **Nombre y Apellidos**: Ahora se envían como campos separados (`name` y `lastname`) en lugar de concatenados
- **Contraseñas**: Se incluyen tanto `password` como `password2` para validación en el backend

### 2. **Campos de Imagen**
- **Foto de Perfil**: Campo `photo` para la imagen de perfil del usuario
- **Documentos**: Campos separados para documento frontal (`photo_document_front`) y trasero (`photo_document_lat`)
- **Valores por Defecto**: Se asigna cadena vacía ("") si no hay imagen seleccionada

### 3. **Campos Específicos**
- **Username**: Campo dedicado para el nombre de usuario
- **Identificación**: Campo `no.identiti` para el número de identificación
- **Teléfono**: Campo `phone` en lugar de `phoneNumber`
- **Dirección**: Campo `address` en lugar de `direccion`
- **Rol**: Campo `role` en lugar de `rol`

### 4. **Logging de Debug**
- Se agregó `console.log` para mostrar los datos que se envían a la API
- Facilita el debugging durante el desarrollo

## Ejemplo de Datos Enviados

```javascript
{
  "username": "carlos1234",
  "name": "Carlos",
  "lastname": "Mendez",
  "no.identiti": "123456789",
  "email": "carlos123@example.com",
  "phone": "3001234567",
  "password": "123456",
  "password2": "123456",
  "address": "Cra 45 # 10-20",
  "photo": "https://example.com/fotos/carlos.jpg",
  "photo_document_front": "https://example.com/docs/front.jpg",
  "photo_document_lat": "https://example.com/docs/lat.jpg",
  "role": "Prestamista",
  "tyc": true
}
```

## Compatibilidad

### **Mantenida**
- La interfaz de usuario permanece igual
- La validación del formulario no se ve afectada
- El flujo de registro sigue siendo el mismo

### **Actualizada**
- El formato de datos enviados a la API
- Los nombres de los campos para coincidir con el backend
- La estructura del objeto de registro

## Consideraciones Técnicas

### **Validación**
- Todas las validaciones existentes siguen funcionando
- Se mantiene la validación de campos obligatorios
- Se conserva la validación de formato de email y contraseñas

### **Manejo de Imágenes**
- Las imágenes se envían como URIs (cadenas de texto)
- Se asignan cadenas vacías si no hay imagen seleccionada
- Compatible con el sistema de selección de imágenes mejorado

### **Tipos de Usuario**
- Compatible con todos los roles: Solicitante, Inversionista, Prestamista
- El campo `role` se mapea correctamente desde `formData.rol`

## Archivos Modificados

- `src/screens/RegisterScreen.tsx`: Función `handleRegister` actualizada

## Próximos Pasos Recomendados

1. **Verificar Backend**: Confirmar que la API acepta este formato
2. **Probar Registro**: Validar el flujo completo de registro
3. **Manejo de Imágenes**: Implementar subida de archivos si es necesario
4. **Validación Backend**: Asegurar que el backend valide todos los campos
5. **Manejo de Errores**: Verificar respuestas de error de la API

## Notas de Desarrollo

- El log de debug puede ser removido en producción
- Se recomienda probar con diferentes tipos de usuario
- Validar que las imágenes se manejen correctamente en el backend
- Considerar implementar indicadores de progreso para la subida de imágenes