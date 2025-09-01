# Documentación de FiFintech

Este directorio contiene la documentación técnica del proyecto FiFintech, una aplicación de inteligencia financiera.

## Índice de Documentación

### Guías de Sistema

- [Sistema de Alertas](./AlertSystem.md) - Documentación sobre el sistema de alertas de la aplicación.
- [Sistema de Autenticación](./AuthenticationGuide.md) - Guía completa sobre el sistema de autenticación y gestión de usuarios.

### Arquitectura

- *Próximamente* - Documentación sobre la arquitectura general del proyecto.

### Componentes

- *Próximamente* - Documentación sobre los componentes reutilizables.

### Flujos de Trabajo

- *Próximamente* - Documentación sobre los principales flujos de trabajo de la aplicación.

## Convenciones de Código

### TypeScript

- Utilizar interfaces para definir modelos de datos.
- Utilizar enumeraciones para valores constantes relacionados.
- Documentar funciones y métodos con comentarios JSDoc.

### React Native

- Componentes funcionales con hooks.
- Estilos definidos con StyleSheet.
- Navegación con React Navigation.

### Estado Global

- Contextos de React para estado global.
- Servicios para lógica de negocio y comunicación con APIs.

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

## Contribución

Para contribuir a la documentación:

1. Crear archivos Markdown (.md) en la carpeta `docs/`.
2. Seguir el formato existente para mantener consistencia.
3. Actualizar este índice cuando se agregue nueva documentación.
4. Utilizar enlaces relativos para referenciar otros documentos.