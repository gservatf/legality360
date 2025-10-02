# Legality360

Legality360 es una plataforma de gestión legal colaborativa para estudios jurídicos, empresas y clientes, desarrollada con React, Vite, TypeScript, shadcn/ui, Tailwind CSS y Supabase.

---

![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-38BDF8?logo=tailwindcss&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?logo=supabase&logoColor=white)

---

## Tabla de Contenido

- [Demo / Screenshots](#demo--screenshots)
- [Tecnologías principales](#tecnologías-principales)
- [Documentación de Arquitectura](#documentación-de-arquitectura)
- [Estructura de Carpetas](#estructura-de-carpetas)
- [Principales funcionalidades](#principales-funcionalidades)
- [Instalación y configuración](#instalación-y-configuración)
- [Comandos útiles](#comandos-útiles)
- [Flujo funcional básico](#flujo-funcional-básico)
- [Roadmap / Próximos pasos](#roadmap--próximos-pasos)
- [Notas de desarrollo](#notas-de-desarrollo)
- [Licencia](#licencia)
- [Créditos](#créditos)

---

## Demo / Screenshots

![Demo](demo.png)
<!-- Puedes reemplazar demo.png por un GIF o varias capturas de pantalla de la app -->

---

## Tecnologías principales

- **Vite**: Bundler ultrarrápido para desarrollo y build de aplicaciones modernas.
- **React**: Librería para construir interfaces de usuario reactivas y componibles.
- **TypeScript**: Tipado estático que aporta robustez y autocompletado al desarrollo.
- **shadcn/ui**: Colección de componentes UI accesibles y personalizables.
- **Tailwind CSS**: Framework de utilidades CSS para estilos rápidos y consistentes.
- **Supabase**: Backend as a Service (autenticación, base de datos, API REST y tiempo real).

---

## Documentación de Arquitectura

📚 **Documentación Completa de Arquitectura**: [`ARCHITECTURE.md`](./ARCHITECTURE.md)

El proyecto mantiene un **Living Document** de arquitectura que se actualiza con cada cambio significativo del sistema. Este documento incluye:

- **Resumen Ejecutivo**: Overview del sistema y tecnologías core
- **Arquitectura General**: Diagramas de capas y patrones arquitectónicos
- **Servicios Implementados**: Documentación detallada de `database.ts`, `auth.ts`, `supabase.ts`
- **Componentes Principales**: Descripción de componentes React y hooks personalizados
- **Flujo de Datos**: Diagramas de flujo incluyendo real-time subscriptions
- **Patrones de Diseño**: Patrones detectados en el codebase
- **Decisiones de Diseño**: Historial de decisiones arquitectónicas con justificaciones
- **Registro de Cambios**: Timeline de cambios arquitectónicos significativos

### Características Recientes Documentadas

- ✅ **Suscripciones en Tiempo Real**: Sistema de actualizaciones automáticas usando Supabase Realtime
- ✅ **Custom Hooks**: Hooks para real-time subscriptions (`useCasosSubscription`, `useTareasSubscription`)
- ✅ **Gestión de Canales**: Map-based channel management en DatabaseService

### Guía de Mantenimiento

Para desarrolladores que contribuyan al proyecto: [`ARCHITECTURE_MAINTENANCE_GUIDE.md`](./ARCHITECTURE_MAINTENANCE_GUIDE.md)

Esta guía explica:
- Cuándo actualizar la documentación de arquitectura
- Cómo documentar nuevas decisiones de diseño
- Plantillas para entradas en el registro de cambios
- Checklist de revisión para PRs

---

## Estructura de Carpetas

```plaintext
legality360/
├── index.html
├── vite.config.ts
├── tailwind.config.js
├── package.json
├── src/
│   ├── app.tsx
│   ├── main.tsx
│   ├── index.css
│   ├── pages/
│   │   └── Index.tsx
│   ├── components/
│   │   ├── ui/                # Componentes shadcn/ui
│   │   ├── professional/
│   │   │   ├── ProfessionalPanel.tsx
│   │   │   └── RequestMoreHoursDialog.tsx
│   │   └── client/
│   │       └── ClientPanel.tsx
│   ├── lib/
│   │   ├── database.ts        # Acceso a datos y servicios Supabase
│   │   ├── auth.ts            # Autenticación y autorización
│   │   └── supabase.ts        # Inicialización y tipos de Supabase
│   └── ...
└── ...
```

---

## Principales funcionalidades

- **Gestión de usuarios**: Roles diferenciados (cliente, abogado, analista, administrador).
- **Gestión de empresas y casos**: Creación, edición y asignación de casos a empresas y clientes.
- **Gestión de tareas**: Asignación y seguimiento de tareas por caso y usuario.
- **Control y solicitud de horas extra**: Registro de horas presupuestadas/consumidas y flujo de aprobación de horas adicionales.
- **Paneles diferenciados**:
  - **Profesional**: Visualiza casos, tareas y puede solicitar horas extra.
  - **Cliente**: Visualiza casos, tareas y aprueba/rechaza solicitudes de horas extra.
- **Alertas y notificaciones**: Mensajes claros de éxito/error y estados visuales para cada acción.

---

## Instalación y configuración

1. **Clonar el repositorio**
   ```sh
   git clone https://github.com/tuusuario/legality360.git
   cd legality360
   ```

2. **Instalar dependencias**
   ```sh
   pnpm install
   ```

3. **Configurar variables de entorno**

   Crea un archivo `.env` en la raíz del proyecto con el siguiente contenido:

   ```
   VITE_SUPABASE_URL=https://xxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=xxxx
   ```

4. **Iniciar el servidor de desarrollo**
   ```sh
   pnpm run dev
   ```

---

## Comandos útiles

- **Iniciar desarrollo**
  ```sh
  pnpm run dev
  ```
- **Build de producción**
  ```sh
  pnpm run build
  ```
- **Agregar una nueva dependencia**
  ```sh
  pnpm add nombre_paquete
  ```

---

## Flujo funcional básico

1. **Crear empresa**
2. **Asignar cliente**
3. **Crear caso**
4. **Asignar profesionales (abogado/analista)**
5. **Registrar tareas y horas trabajadas**
6. **Solicitar horas extra (profesional)**
7. **Aprobar o rechazar horas extra (cliente)**

---

## Roadmap / Próximos pasos

- [ ] Panel de administrador completo
- [x] Suscripciones en tiempo real (Implementado - Ver ARCHITECTURE.md)
- [ ] Notificaciones push en UI
- [ ] Reportes PDF de horas y tareas
- [ ] Integración con facturación

---

## Notas de desarrollo

- El alias `@/` apunta a la carpeta `src/` para importaciones más limpias.
- La UI está basada en componentes shadcn/ui y utilidades Tailwind CSS.
- Personaliza la interfaz modificando los componentes en `@/components/ui` o la configuración de Tailwind.

---

## Licencia

MIT

---

## Créditos

Desarrollado con ❤️ por el equipo Legality360.
