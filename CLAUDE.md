# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # start dev server (Vite, HMR)
npm run build      # tsc -b && vite build
npm run lint       # eslint
npm run preview    # preview production build
```

No test suite configured yet.

## Environment

Set `VITE_API_URL` to point at the backend. Falls back to `/api`.

```bash
# .env.local
VITE_API_URL=http://localhost:3000
```

## Architecture

**Stack:** React 19 + TypeScript + Vite. MUI v7 for UI, MUI X DataGrid for tables, React Router v7, Axios, dayjs.

### Layer structure

```
src/
  api/           # All backend calls — one file per resource
  pages/         # Route-level components, one folder per page
  layouts/       # MainLayout (sidebar + outlet)
  theme/         # ThemeContext — MUI theme + dark/light toggle
```

### API layer (`src/api/`)

- `axiosInstance.ts` — single Axios instance, reads `VITE_API_URL`, logs every request/response to console.
- `types.ts` — **single source of truth** for all domain types and DTOs. Add new types here.
- One file per resource: `students.api.ts`, `classes.api.ts`, `programs.api.ts`, etc. Functions return typed promises directly (`.then(r => r.data)` pattern).

### Routing (`src/App.tsx`)

All routes are children of `MainLayout` (permanent sidebar drawer). Pattern:

```
/ → Dashboard
/students, /contacts, /instructors, /classes, /programs, /locations, /management
```

### Pages

Each page folder owns its own sub-components (DataGrid, Dialog, Detail). Pages wire together state (`refreshTrigger` integer incremented on mutations, passed as prop to grids). Dialogs used for both create and edit — distinguished by whether a record prop is null.

- **Classes page** — card grid layout
- **Programs page** — MUI X DataGrid (`ProgramsDataGrid.tsx`)
- **Students page** — mixed: `.tsx` index with `.jsx` sub-components (DataGrid, Dialog, Detail) — `@ts-ignore` used for these imports

### Theme (`src/theme/ThemeContext.tsx`)

`ColorModeProvider` wraps the app. Persists mode to `localStorage`. Access via `useColorMode()` hook. Light primary: `#1A237E`, dark primary: `#3366FF`. All spacing uses rem in `sx` props, not MUI's numeric spacing scale.

## Key conventions

- **Soft delete vs hard delete:** Students have both `softDeleteStudent` (sets `isActive=false`) and `hardDeleteStudent`. Use soft delete in UI unless explicitly hard-deleting.
- **Typo in domain model:** `Program.capcaity` (not `capacity`) — matches backend. Don't fix without coordinating with the API.
- **Pagination:** `PaginatedResponse<T>` wraps list responses with `{ data, meta }`. Meta includes `total`, `page`, `lastPage`, `limit`.
- **`src/pages/instrucotrs/`** — directory name has a typo (missing 'u'). Matches the import in `App.tsx`.
