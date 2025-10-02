# Type Definition Updates - Supabase Schema Alignment

## Summary
Updated type definitions in `src/types/database.ts` to use consistent `id` field names for primary keys, matching the pattern used in Supabase types (`src/lib/supabase.ts`).

## Changes Made

### Primary Key Field Renaming
All entity types now use `id` as their primary key field instead of entity-specific ID fields:

| Type | Old Field | New Field | Status |
|------|-----------|-----------|--------|
| Task | `task_id` | `id` | ✓ Updated |
| Case | `caso_id` | `id` | ✓ Updated |
| Client | `cliente_id` | `id` | ✓ Updated |
| BMCBlock | `block_id` | `id` | ✓ Updated |
| Document | `document_id` | `id` | ✓ Updated |
| ChatMessage | `message_id` | `id` | ✓ Updated |
| Report | `report_id` | `id` | ✓ Updated |
| User | `user_id` | `id` | ✓ Updated |

### Foreign Key Fields
Foreign key fields remain unchanged and continue to use descriptive names:
- `caso_id` (references a case)
- `cliente_id` (references a client)
- `client_id` (references a client)
- `usuario_id` (references a user)

## Files Modified

### Type Definitions
- `src/types/database.ts` - Updated all interface definitions

### Mock Database
- `src/lib/mockDatabase.ts` - Updated seed data and methods to use new field names

### Components
- `src/components/dashboard/TaskKanban.tsx`
- `src/components/dashboard/TaskChatModal.tsx`
- `src/components/dashboard/TaskEditModal.tsx`
- `src/components/dashboard/NewTaskModal.tsx`
- `src/components/dashboard/Chat.tsx`
- `src/components/dashboard/DriveIntegration.tsx`
- `src/components/dashboard/Reports.tsx`
- `src/components/dashboard/RiskMatrix.tsx`

## Consistency with Supabase

The changes ensure consistency between:
1. **Supabase types** (`src/lib/supabase.ts`) - Used by main application components
   - Example: `Tarea` interface with `id` field
2. **Database types** (`src/types/database.ts`) - Used by dashboard/mock components
   - Example: `Task` interface with `id` field

Both now follow the same naming convention for primary keys.

## Verification

- ✓ Build successful (`npm run build`)
- ✓ TypeScript compilation successful (`npx tsc --noEmit`)
- ✓ No breaking changes to main application components
- ✓ Dashboard components updated and working

## Migration Notes

If you have existing localStorage data from the mock database, it will need to be cleared or migrated to use the new field names. The mock database will automatically reseed with the correct structure on first use.
