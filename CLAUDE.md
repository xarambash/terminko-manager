# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Start Vite dev server (default port 5173)
npm run build      # tsc -b && vite build
npm run lint       # ESLint (flat config, strict TypeScript rules)
npm run preview    # Preview production build
```

No test framework is configured. Jest is in devDependencies but has no scripts.

Environment variables (`.env`):
- `VITE_API_URL` — backend base URL (default `http://localhost:5000`)
- `VITE_TENANT_SLUG` — tenant identifier for the running instance (e.g. `salon-demo`)

## Architecture

**Terminko Manager** is a salon appointment-management SPA. Core domain entities: **Appointments**, **Services**, **Resources** (staff), **Guests**, **Tenant**, and **ResourceScheduling** (working hours/free days per resource).

### Layer structure

| Layer | Location | Role |
|-------|----------|------|
| API client | `src/api/*.ts` | Pure async functions calling Axios; one file per domain entity |
| Custom hooks | `src/hooks/*.ts` | Wrap API functions in TanStack Query (`useQuery`/`useMutation`) |
| Pages | `src/pages/` | Route-level components; import hooks, render UI |
| Components | `src/components/` | Shared UI — modals, layout, data tables, shadcn wrappers |
| Types | `src/types/` | TypeScript interfaces for all API contracts and component props |
| Contexts | `src/contexts/` | `AuthContext` (user, token, login, logout) backed by localStorage |

### Data fetching pattern

1. `src/api/*.ts` — raw Axios call (e.g. `getAppointments(tenantId, params)`)
2. `src/hooks/*.ts` — `useQuery` wrapper with typed query key (e.g. `useAppointments`)
3. Component — destructures `{ data, isPending, isError, error }` from the hook
4. `QueryStatusBanner` — shared component that renders loading/error states

### Authentication

- Login posts `{ email, password, tenantSlug }` to `/auth/login` → `{ token, user }`
- `AuthProvider` stores both in `localStorage` and React Context
- Axios request interceptor injects `Authorization: Bearer <token>` on every request
- Axios response interceptor clears auth and redirects to `/login` on 401

### Role-based routing

- `ProtectedRoute` — redirects unauthenticated users to `/login`
- `OwnerRoute` — wraps `ProtectedRoute`; shows a placeholder modal for non-owners
- Only owners can access `/services`, `/guests`, `/resources`

### Key technologies

- **React 19** with **React Router DOM v7**
- **TypeScript 5.9** — strict mode (`noUnusedLocals`, `noUnusedParameters`); path alias `@/*` → `src/*`
- **Vite 8** with `@vitejs/plugin-react` (Oxc transform) and `@tailwindcss/vite`
- **TanStack React Query v5** for all server state
- **shadcn** components (Radix Nova style, CSS variables) + **Lucide** icons
- **React Hook Form + Zod** for forms and validation
- **i18next** — Serbian (`sr`) and English (`en`), language stored in localStorage
- **Sonner** for toast notifications
- Dark/light theme via `document.documentElement` class + CSS variables; initialized before render to avoid flicker
