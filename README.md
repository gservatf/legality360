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
- [ ] Notificaciones en tiempo real
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
