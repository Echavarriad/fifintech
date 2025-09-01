# Guía de Subida de Imágenes en RegisterScreen

## Funcionalidad Implementada

La pantalla de registro (`RegisterScreen.tsx`) incluye funcionalidad completa para subir imágenes de perfil con las siguientes características:

### Características Principales

1. **Selección de Imagen desde Galería**
   - Solicita permisos automáticamente
   - Permite edición de imagen (recorte cuadrado)
   - Calidad optimizada (0.8)

2. **Captura de Foto con Cámara**
   - Solicita permisos de cámara
   - Permite edición inmediata
   - Misma calidad optimizada

3. **Interfaz de Usuario**
   - Botón circular para seleccionar imagen
   - Vista previa de imagen seleccionada
   - Placeholder con ícono cuando no hay imagen

### Implementación Técnica

#### Dependencias Requeridas
```bash
npm install expo-image-picker
```

#### Funciones Principales

- `pickImage()`: Selecciona imagen desde galería
- `takePhoto()`: Captura foto con cámara
- `showImageOptions()`: Muestra opciones de selección

#### Manejo de Permisos

La aplicación solicita automáticamente:
- Permisos de galería (`requestMediaLibraryPermissionsAsync`)
- Permisos de cámara (`requestCameraPermissionsAsync`)

#### Almacenamiento

La imagen se almacena temporalmente como URI en el estado del componente:
```typescript
profileImage: string | null
```

### Mejoras en el Layout

#### Distribución de Campos

1. **Campos en Filas**
   - Nombre y Apellidos en una fila
   - Identificación y Teléfono en una fila
   - Contraseña y Confirmación en una fila

2. **Estilos Responsivos**
   - `rowContainer`: Contenedor flex para filas
   - `halfFieldContainer`: 48% de ancho para cada campo
   - `inputHalf`: Estilos específicos para campos de media anchura

3. **Sección de Imagen de Perfil**
   - Contenedor circular de 120x120px
   - Sombras y elevación para mejor apariencia
   - Placeholder con ícono y texto descriptivo

#### Mejoras en Tabs

- Texto gris (#666) para tabs inactivos
- Texto blanco (#fff) para tab activo
- Mejor contraste y legibilidad

### Próximos Pasos Recomendados

1. **Integración con Backend**
   - Implementar subida real de imágenes
   - Manejar compresión y redimensionamiento
   - Almacenar URLs de imágenes en perfil de usuario

2. **Validaciones Adicionales**
   - Validar tamaño máximo de archivo
   - Validar tipos de archivo permitidos
   - Mostrar progreso de subida

3. **Mejoras de UX**
   - Opción para eliminar imagen seleccionada
   - Vista previa más grande
   - Indicador de carga durante subida

### Estructura de Archivos Relacionados

```
src/
├── screens/
│   └── RegisterScreen.tsx     # Pantalla principal con funcionalidad
├── models/
│   └── auth.models.ts         # Modelos de datos (actualizar para incluir imagen)
└── services/
    └── auth.service.ts        # Servicio de autenticación (actualizar para manejar imágenes)
```

### Consideraciones de Seguridad

- Las imágenes se manejan localmente hasta la subida
- Se requieren permisos explícitos del usuario
- Validación de tipos de archivo en el cliente
- Compresión automática para optimizar tamaño