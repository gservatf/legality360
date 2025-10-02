# Guía de Mantenimiento de ARCHITECTURE.md

Este documento explica cómo mantener actualizado el archivo `ARCHITECTURE.md` como un Living Document.

## 🎯 Objetivo

`ARCHITECTURE.md` debe reflejar en tiempo real el estado actual del sistema, documentando su arquitectura, servicios, componentes, dependencias y decisiones de diseño.

## 📋 Cuándo Actualizar

El documento debe actualizarse cuando ocurre cualquiera de estos eventos:

### ✅ Cambios que REQUIEREN actualización:

1. **Nuevos Módulos o Servicios**
   - Se agrega un nuevo archivo en `/src/lib/`
   - Se crea un nuevo servicio (ej: `notificationService.ts`)
   - Se implementa un nuevo patrón arquitectónico

2. **Modificación de Servicios Existentes**
   - Se agregan métodos a `database.ts`, `auth.ts`, `supabaseService.ts`
   - Se cambia la estructura de datos o tipos
   - Se modifican flujos de datos importantes

3. **Nuevos Componentes Principales**
   - Se crean componentes de página o paneles principales
   - Se implementan nuevos componentes reutilizables importantes
   - Se modifican componentes existentes significativamente

4. **Cambios en Dependencias**
   - Se agregan nuevas librerías importantes (ej: nueva UI library)
   - Se actualizan versiones major de dependencias core
   - Se reemplazan tecnologías (ej: cambiar estado de Redux a Zustand)

5. **Decisiones Arquitectónicas**
   - Se decide usar un nuevo patrón de diseño
   - Se implementa una nueva estrategia (ej: caching, optimistic updates)
   - Se cambia enfoque técnico (ej: de REST a GraphQL)

6. **Deprecación de Módulos**
   - Se marca código como deprecated
   - Se elimina funcionalidad existente
   - Se reemplaza un servicio por otro

### ⚠️ Cambios que NO requieren actualización:

- Corrección de bugs menores sin impacto arquitectónico
- Cambios de estilos CSS/UI sin cambio de componentes
- Refactoring interno sin cambio de API pública
- Cambios en documentación inline (comentarios)
- Actualización de versiones patch de dependencias

## 📝 Cómo Actualizar

### 1. Actualizar Secciones Existentes

Cuando se modifique código existente, actualiza las secciones correspondientes:

#### Ejemplo: Agregar método a DatabaseService

**En `database.ts`:**
```typescript
async getNotificaciones(userId: string): Promise<Notification[]> {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
  return data || []
}
```

**En `ARCHITECTURE.md` → Sección "Servicios Implementados" → database.ts:**
```markdown
| **Notificaciones** | `getNotificaciones(userId)` | Obtiene notificaciones de un usuario |
| | `markAsRead(notificationId)` | Marca notificación como leída |
```

### 2. Agregar Nueva Decisión de Diseño

Cada decisión arquitectónica importante debe documentarse en la sección **"Decisiones de Diseño Recientes"**.

#### Plantilla para Nueva Decisión:

```markdown
### DDR-XXX: [Título de la Decisión]

**Fecha:** YYYY-MM-DD  
**Estado:** ✅ Implementado / 🚧 En Progreso / ❌ Rechazado

**Contexto:**
[Explica el problema o necesidad que motivó esta decisión]

**Decisión:**
[Describe qué se decidió hacer]

**Justificación:**
1. [Razón 1]
2. [Razón 2]
3. [Razón 3]

**Alternativas Consideradas:**
- **Opción A**: Rechazada porque [razón]
- **Opción B**: Rechazada porque [razón]

**Implementación:**
```typescript
// Código ejemplo o diagrama
```

**Impacto:**
- ✅ [Beneficio 1]
- ✅ [Beneficio 2]
- ⚠️ [Trade-off o consideración]

**Documentación:**
- [Links a documentación relacionada]

---
```

### 3. Actualizar Registro de Cambios

Cada actualización significativa debe registrarse en la sección **"Registro de Cambios"**.

#### Plantilla para Entrada de Cambio:

```markdown
### [YYYY-MM-DD] - [Título del Cambio]

**Agregado:**
- [Componente/Servicio/Feature nuevo]
- [Otro elemento agregado]

**Modificado:**
- [Elemento modificado]: [Descripción del cambio]

**Eliminado:**
- [Elemento deprecado o eliminado]

**Deprecado:**
- [Elemento marcado como deprecated]

**Contexto:**
[Explicación breve del por qué de los cambios]

**Impacto:**
- [Impacto en usuarios]
- [Impacto en desarrollo]
- [Impacto en performance/seguridad]

**Referencias:**
- PR #XX: [Link al Pull Request]
- Issue #YY: [Link al Issue]

---
```

### 4. Actualizar Metadatos

Al final del documento, actualiza:

```markdown
**Última actualización:** YYYY-MM-DD  
**Versión:** X.Y
```

Incrementa la versión:
- **Major (X.0)**: Cambios arquitectónicos fundamentales
- **Minor (X.Y)**: Nuevos servicios, componentes o features significativos

## 🔍 Checklist de Revisión

Antes de crear/aprobar un PR, verifica:

- [ ] ¿Se agregaron nuevos archivos en `/src/lib/`? → Actualizar "Servicios Implementados"
- [ ] ¿Se modificó `database.ts`, `auth.ts` o servicios core? → Actualizar tabla de métodos
- [ ] ¿Se crearon nuevos componentes de página? → Actualizar "Componentes Principales"
- [ ] ¿Se agregaron dependencias en `package.json`? → Actualizar "Dependencias Externas"
- [ ] ¿Se tomó una decisión arquitectónica importante? → Agregar en "Decisiones de Diseño"
- [ ] ¿El cambio es significativo? → Agregar entrada en "Registro de Cambios"
- [ ] ¿Se actualizaron los metadatos del documento? → Actualizar fecha y versión

## 🛠️ Herramientas de Ayuda

### Script para Detectar Cambios (Futuro)

```bash
# Detectar archivos modificados en /src/lib/
git diff --name-only origin/main | grep "src/lib/"

# Detectar cambios en package.json
git diff origin/main package.json
```

### Revisión Automatizada (Futuro)

Considerar implementar CI check que verifique:
- Si hay cambios en `src/lib/` o `src/components/`, verificar que ARCHITECTURE.md fue actualizado
- Si hay cambios en `package.json`, verificar actualización de dependencias en doc

## 📚 Recursos

- `ARCHITECTURE.md`: El documento principal
- `docs/REALTIME_SUBSCRIPTIONS.md`: Documentación específica de real-time
- `README.md`: Documentación general del proyecto

## 🤝 Responsabilidades

- **Developers**: Actualizar ARCHITECTURE.md al implementar cambios significativos
- **Reviewers**: Verificar que ARCHITECTURE.md está actualizado en PRs
- **Tech Lead**: Revisar periódicamente que el documento refleja la realidad del sistema

## 💡 Tips

1. **Escribe mientras desarrollas**: Es más fácil documentar mientras el código está fresco en tu mente
2. **Sé conciso pero completo**: Describe lo suficiente para entender, pero no sobredocumentes
3. **Usa ejemplos de código**: Un buen ejemplo vale más que mil palabras
4. **Mantén el formato**: Sigue el estilo existente del documento
5. **Enlaza recursos**: Referencia PRs, issues, y documentación relacionada

## 📞 Preguntas Frecuentes

**P: ¿Debo documentar cada función pequeña?**
R: No. Solo documenta cambios arquitectónicos significativos. Las funciones pequeñas deben documentarse en el código con JSDoc.

**P: ¿Qué tan detallada debe ser una Decisión de Diseño?**
R: Suficiente para que alguien nuevo al proyecto entienda el *por qué* de la decisión, no solo el *qué*.

**P: ¿Cada commit necesita actualizar ARCHITECTURE.md?**
R: No. Solo cambios significativos que afecten la arquitectura, servicios core o componentes principales.

**P: ¿Debo eliminar secciones viejas?**
R: No elimines, marca como deprecated. El historial es valioso.

---

**Este documento debe mantenerse actualizado junto con ARCHITECTURE.md**
