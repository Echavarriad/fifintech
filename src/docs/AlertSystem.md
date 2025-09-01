# Sistema de Alertas para FiFintech

Este documento explica cómo utilizar el sistema de alertas personalizado en la aplicación FiFintech.

## Componentes del Sistema

### 1. AlertMessage

Componente visual que muestra la alerta. Soporta diferentes tipos de alertas con estilos específicos.

**Ubicación:** `src/components/AlertMessage.tsx`

**Props:**
- `visible`: Booleano que controla la visibilidad de la alerta
- `type`: Tipo de alerta ('success', 'error', 'warning', 'info')
- `title`: Título de la alerta
- `message`: Mensaje de la alerta
- `onClose`: Función que se ejecuta al cerrar la alerta

### 2. Hook useAlert

Hook personalizado para manejar el estado de las alertas en componentes individuales.

**Ubicación:** `src/hooks/useAlert.tsx`

**Uso:**
```jsx
const { alertState, showAlert, hideAlert } = useAlert();

// Mostrar una alerta
showAlert('success', 'Éxito', 'Operación completada');

// Renderizar el componente AlertMessage
<AlertMessage
  visible={alertState.visible}
  type={alertState.type}
  title={alertState.title}
  message={alertState.message}
  onClose={hideAlert}
/>
```

### 3. Contexto de Alertas

Contexto global para manejar alertas desde cualquier parte de la aplicación sin necesidad de pasar props.

**Ubicación:** `src/contexts/AlertContext.tsx`

**Uso:**
```jsx
import { useAlertContext } from '../contexts/AlertContext';

function MiComponente() {
  const { showAlert } = useAlertContext();
  
  const handleAction = () => {
    // Mostrar una alerta
    showAlert('success', 'Éxito', 'Operación completada');
  };
  
  return (
    <Button title="Realizar acción" onPress={handleAction} />
  );
}
```

### 4. Utilidades de Alerta

Utilidades para simplificar el uso de alertas con funciones específicas para cada tipo.

**Ubicación:** `src/utils/alertUtils.ts`

**Uso:**
```jsx
import { useAlertUtils } from '../utils/alertUtils';

function MiComponente() {
  const { showSuccess, showError, showWarning, showInfo } = useAlertUtils();
  
  const handleSuccess = () => {
    // Mostrar una alerta de éxito
    showSuccess('Operación completada');
    // También puedes personalizar el título
    // showSuccess('Operación completada', 'Título personalizado');
  };
  
  const handleError = () => {
    // Mostrar una alerta de error
    showError('Ha ocurrido un problema');
  };
  
  return (
    <View>
      <Button title="Éxito" onPress={handleSuccess} />
      <Button title="Error" onPress={handleError} />
    </View>
  );
}
```

## Tipos de Alertas

1. **Success (Éxito)**
   - Color: Verde (#48b783)
   - Icono: ✓
   - Uso: Confirmar que una operación se ha completado correctamente

2. **Error**
   - Color: Rojo (#e74c3c)
   - Icono: ✗
   - Uso: Informar sobre errores o problemas

3. **Warning (Advertencia)**
   - Color: Naranja (#f39c12)
   - Icono: ⚠
   - Uso: Advertir sobre posibles problemas o consecuencias

4. **Info (Información)**
   - Color: Azul (#3498db)
   - Icono: ℹ
   - Uso: Proporcionar información general

## Ejemplos de Uso

### Uso con el Hook useAlert

```jsx
import React from 'react';
import { View, Button } from 'react-native';
import AlertMessage from '../components/AlertMessage';
import useAlert from '../hooks/useAlert';

export default function MiComponente() {
  const { alertState, showAlert, hideAlert } = useAlert();
  
  return (
    <View>
      <Button 
        title="Mostrar Alerta de Éxito" 
        onPress={() => showAlert('success', 'Éxito', 'Operación completada')}
      />
      
      <AlertMessage
        visible={alertState.visible}
        type={alertState.type}
        title={alertState.title}
        message={alertState.message}
        onClose={hideAlert}
      />
    </View>
  );
}
```

### Uso con el Contexto de Alertas

```jsx
import React from 'react';
import { View, Button } from 'react-native';
import { useAlertContext } from '../contexts/AlertContext';

export default function MiComponente() {
  const { showAlert } = useAlertContext();
  
  return (
    <View>
      <Button 
        title="Mostrar Alerta de Error" 
        onPress={() => showAlert('error', 'Error', 'Ha ocurrido un problema')}
      />
      
      {/* No es necesario incluir el componente AlertMessage aquí */}
      {/* El AlertProvider ya lo incluye */}
    </View>
  );
}
```

### Uso con las Utilidades de Alerta

```jsx
import React from 'react';
import { View, Button } from 'react-native';
import { useAlertUtils } from '../utils/alertUtils';

export default function MiComponente() {
  const { showSuccess, showError, showWarning, showInfo } = useAlertUtils();
  
  return (
    <View>
      <Button 
        title="Éxito" 
        onPress={() => showSuccess('Operación completada')}
      />
      
      <Button 
        title="Error" 
        onPress={() => showError('Ha ocurrido un problema')}
      />
      
      <Button 
        title="Advertencia" 
        onPress={() => showWarning('Ten cuidado con esta acción')}
      />
      
      <Button 
        title="Información" 
        onPress={() => showInfo('Aquí tienes información importante')}
      />
    </View>
  );
}
```

## Recomendaciones

1. **Para componentes individuales**: Utiliza el hook `useAlert` cuando necesites un control más preciso sobre las alertas en un componente específico.

2. **Para uso general**: Utiliza el contexto `AlertContext` para mostrar alertas desde cualquier parte de la aplicación sin necesidad de pasar props.

3. **Para código más limpio**: Utiliza las utilidades de alerta `useAlertUtils` para un código más legible y funciones específicas para cada tipo de alerta.

4. **Personalización**: Si necesitas personalizar más el componente `AlertMessage`, puedes modificar sus estilos o añadir nuevas funcionalidades según sea necesario.

5. **Confirmaciones**: Para alertas que requieran confirmación del usuario, considera añadir botones adicionales al componente `AlertMessage`.

## Comparación de Métodos

| Método | Ventajas | Casos de uso recomendados |
|--------|----------|---------------------------|
| `useAlert` | Control total sobre el componente de alerta | Componentes aislados con lógica de alerta específica |
| `useAlertContext` | No requiere renderizar el componente AlertMessage | Uso general en toda la aplicación |
| `useAlertUtils` | API más simple y funciones específicas por tipo | Código más limpio y legible |