# Configuración de la API

## Configuración de la URL de la API

Para conectar la aplicación con tu API real, necesitas configurar la URL base en el archivo de configuración.

### Opción 1: Variable de entorno (Recomendado)

1. Crea un archivo `.env` en la raíz del proyecto:
```bash
EXPO_PUBLIC_API_URL=https://tu-api-url.com/api
```

2. La aplicación automáticamente usará esta URL.

### Opción 2: Modificar directamente el archivo de configuración

1. Abre el archivo `src/config/api.config.ts`
2. Cambia la línea:
```typescript
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://your-api-url.com/api';
```

Por:
```typescript
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://tu-api-real.com/api';
```

## Endpoints esperados por la aplicación

Tu API debe implementar los siguientes endpoints:

### Autenticación

#### POST /auth/login
**Request:**
```json
{
  "email": "usuario@ejemplo.com",
  "password": "contraseña123"
}
```

**Response (200):**
```json
{
  "user": {
    "id": "1",
    "email": "usuario@ejemplo.com",
    "name": "Nombre Usuario",
    "role": "cliente", // "admin", "cliente", "asesor"
    "profilePicture": "url_opcional",
    "phoneNumber": "telefono_opcional"
  },
  "token": "jwt_token_aqui",
  "refreshToken": "refresh_token_opcional",
  "expiresIn": 3600
}
```

#### POST /auth/register
**Request:**
```json
{
  "email": "nuevo@ejemplo.com",
  "password": "contraseña123",
  "name": "Nombre Completo",
  "phoneNumber": "123456789" // opcional
}
```

**Response:** Mismo formato que login

#### POST /auth/logout
**Request:** (Con token de autorización)
```json
{}
```

**Response (200):**
```json
{
  "message": "Logout exitoso"
}
```

#### POST /auth/recover-password
**Request:**
```json
{
  "email": "usuario@ejemplo.com"
}
```

**Response (200):**
```json
{
  "message": "Se ha enviado un correo con instrucciones"
}
```

#### POST /auth/change-password
**Request:** (Con token de autorización)
```json
{
  "oldPassword": "contraseña_actual",
  "newPassword": "nueva_contraseña",
  "confirmPassword": "nueva_contraseña"
}
```

**Response (200):**
```json
{
  "message": "Contraseña actualizada correctamente"
}
```

## Manejo de errores

Todos los endpoints deben devolver errores en el siguiente formato:

**Response (4xx/5xx):**
```json
{
  "message": "Descripción del error",
  "error": "Código de error opcional"
}
```

## Autenticación

Los endpoints que requieren autenticación esperan el token en el header:
```
Authorization: Bearer <token>
```

## Roles de usuario

La aplicación maneja tres roles:
- `admin`: Administrador del sistema
- `asesor`: Asesor financiero
- `cliente`: Cliente final

Cada rol tiene acceso a diferentes pantallas y funcionalidades en la aplicación.