# Legality 360° Client Portal Module - MVP Todo

## Core Files to Create/Modify

### 1. Database Schema & Types
- `src/types/database.ts` - TypeScript interfaces for all entities
- `src/lib/mockDatabase.ts` - Mock database with seed data (localStorage-based)

### 2. Authentication & Security
- `src/components/auth/LoginForm.tsx` - Secure login component
- `src/lib/auth.ts` - Authentication utilities and session management

### 3. Main Dashboard Layout
- `src/pages/Dashboard.tsx` - Main client dashboard (replace Index.tsx)
- `src/components/layout/DashboardLayout.tsx` - Overall layout with sidebar/header
- `src/components/layout/Header.tsx` - Header with LEGALITY logo and user info

### 4. Core Dashboard Components
- `src/components/dashboard/ProgressTimeline.tsx` - Case progress tracking
- `src/components/dashboard/RiskMatrix.tsx` - 3x3 Business Model Canvas risk grid
- `src/components/dashboard/TaskKanban.tsx` - Kanban-style task management
- `src/components/dashboard/ClientAccount.tsx` - Account info and contracts
- `src/components/dashboard/DriveIntegration.tsx` - Google Drive folder access
- `src/components/dashboard/Chat.tsx` - Client-analyst messaging
- `src/components/dashboard/Reports.tsx` - Report generation interface

### 8. Updated Entry Points
- Update `index.html` - Set proper title and meta tags
- Update `src/App.tsx` - Add authentication routing

## Implementation Strategy
1. Create database schema and mock data first
2. Build authentication system
3. Create main dashboard layout
4. Implement each dashboard component with ClickUp-style design
5. Add responsive design and animations
6. Test with seed data

## Design Requirements
- ClickUp-inspired UI: clean cards, soft shadows, grid layouts
- Traffic light indicators (green/yellow/red) for risk levels
- Smooth animations and modern styling
- Responsive design for desktop and mobile
- LEGALITY branding integration