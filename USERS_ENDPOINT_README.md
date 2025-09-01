# Endpoint de Usuarios - Configuración Pendiente

## Problema Actual

El AdminDashboardScreen está configurado para cargar usuarios desde un endpoint `/users` que actualmente **no está disponible** en la API de FiFintech.

### Error Observado
```
ERROR ❌ Error al cargar usuarios: [TypeError: Network request failed]
```

## Solución Temporal

Se ha implementado una solución temporal que utiliza datos de ejemplo para mostrar la funcionalidad de gestión de usuarios:

```typescript
// Datos de ejemplo en AdminDashboardScreen.tsx
const usuariosEjemplo = [
  {
    ID: 1,
    username: 'admin',
    email: 'admin@fifintech.co',
    display_name: 'Administrador',
    roles: ['admin'],
    meta: {
      first_name: ['Admin'],
      last_name: ['Sistema'],
      account_status: ['active'],
      identity_number: ['12345678'],
      phone: ['3001234567'],
      address: ['Bogotá, Colombia']
    }
  },
  // ... más usuarios de ejemplo
];
```

## Configuración Requerida en el Backend

Para implementar la funcionalidad completa de gestión de usuarios, el backend debe proporcionar:

### 1. Endpoint GET /users

**URL:** `https://fifintech.co/wp-json/custom-api/v1/users`

**Método:** GET

**Headers requeridos:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Respuesta esperada:**
```json
[
  {
    "ID": 1,
    "username": "usuario1",
    "email": "usuario@ejemplo.com",
    "display_name": "Nombre Usuario",
    "roles": ["cliente"],
    "meta": {
      "first_name": ["Nombre"],
      "last_name": ["Apellido"],
      "account_status": ["active"],
      "identity_number": ["12345678"],
      "phone": ["3001234567"],
      "address": ["Dirección completa"]
    }
  }
]
```

### 2. Endpoint PUT /users/{id}

**URL:** `https://fifintech.co/wp-json/custom-api/v1/users/{id}`

**Método:** PUT

**Body de ejemplo:**
```json
{
  "email": "nuevo@email.com",
  "roles": ["prestatario"],
  "meta": {
    "first_name": ["Nuevo"],
    "last_name": ["Nombre"],
    "account_status": ["active"]
  }
}
```

### 3. Endpoint DELETE /users/{id}

**URL:** `https://fifintech.co/wp-json/custom-api/v1/users/{id}`

**Método:** DELETE

## Implementación una vez disponible el endpoint

Cuando el endpoint esté disponible, reemplazar la función `cargarUsuarios` en `AdminDashboardScreen.tsx`:

```typescript
const cargarUsuarios = async () => {
  try {
    console.log('🔄 Cargando usuarios desde el API...');
    
    const response = await fetch(`${API_BASE_URL}/users`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${await AsyncStorage.getItem('auth_token')}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }
    
    const usuariosData = await response.json();
    console.log('📦 Usuarios recibidos del API:', usuariosData);
    
    // Mapear los datos del API al formato esperado
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
        // Campos mapeados para compatibilidad
        id: apiUser.ID,
        name: fullName,
        role: role,
        status: accountStatus,
        fechaRegistro: new Date().toISOString()
      };
    });
    
    console.log('✅ Usuarios mapeados:', usuariosMapeados.length);
    setUsuarios(usuariosMapeados);
    
  } catch (error) {
    console.error('❌ Error al cargar usuarios:', error);
    setUsuarios([]);
  }
};
```

## Funcionalidades Implementadas

A pesar de usar datos de ejemplo, todas las funcionalidades de gestión de usuarios están implementadas:

- ✅ **Visualización de usuarios** con filtros y búsqueda
- ✅ **Edición de usuarios** (nombre, email, rol, estado)
- ✅ **Eliminación de usuarios** con confirmación
- ✅ **Cambio de estado** (activo/inactivo)
- ✅ **Pull-to-refresh** para actualizar datos
- ✅ **Interfaz responsive** y moderna

## Próximos Pasos

1. **Backend:** Implementar el endpoint `/users` en WordPress
2. **Frontend:** Reemplazar datos de ejemplo por llamadas reales al API
3. **Testing:** Probar todas las funcionalidades con datos reales
4. **Documentación:** Actualizar esta documentación una vez implementado

## Notas Técnicas

- La estructura de datos está preparada para la integración real
- Los mapeos de campos están configurados según la estructura de WordPress
- El manejo de errores está implementado para fallos de red
- La interfaz de usuario es completamente funcional

---

**Estado:** ⚠️ Pendiente implementación del endpoint en backend
**Prioridad:** Alta
**Estimación:** 2-3 días de desarrollo backend