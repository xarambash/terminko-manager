# Terminko Manager

Web app for salon appointment management. Built for owners and staff to manage appointments, resources, services, guests, and resource scheduling.

## Stack

- React 19 + TypeScript + Vite
- TanStack React Query v5
- React Hook Form + Zod
- shadcn/ui + Tailwind CSS
- i18next (Serbian + English)
- Sonner (toast notifications)

## Setup

```bash
cp .env.example .env   # set VITE_API_URL and VITE_TENANT_SLUG
npm install
npm run dev
```

## Commands

```bash
npm run dev       # dev server (port 5173)
npm run build     # tsc + vite build
npm run lint      # ESLint
npm run preview   # preview production build
```

## Environment variables

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend base URL (e.g. `http://localhost:5000`) |
| `VITE_TENANT_SLUG` | Tenant identifier (e.g. `salon-demo`) |

## Architecture

| Layer | Location | Role |
|-------|----------|------|
| API client | `src/api/` | Axios calls, one file per domain |
| Hooks | `src/hooks/` | TanStack Query wrappers |
| Pages | `src/pages/` | Route-level components |
| Components | `src/components/` | Shared UI and modals |
| Types | `src/types/` | TypeScript interfaces |
| Contexts | `src/contexts/` | Auth context (JWT, localStorage) |

## Features

### Owner
- Appointments overview with resource and date filters
- Resource management — create, delete, edit profile (name, email, phone, photo)
- Service management — CRUD with duration and description
- Resource scheduling — working hours (inline weekly form), free days (date range), service assignments with price and duration override; edit and unassign existing assignments
- Guest list

### Staff
- Own appointments view with date filter
