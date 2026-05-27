# Terminko Manager

Web app for salon appointment management. Built for owners and staff to manage appointments, resources, services, guests, and resource scheduling.

## Stack

- React 19 + TypeScript + Vite
- TanStack React Query v5
- Mantine v9 (`@mantine/core`, `@mantine/form`, `@mantine/dates`, `@mantine/notifications`)
- Tabler Icons (`@tabler/icons-react`)
- i18next (Serbian + English)

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
- Appointments overview with resource and date filters; responsive — table on desktop, timeline on mobile
- Resource management — create, delete, edit profile (name, email, phone, photo)
- Service management — CRUD with duration and description
- Resource scheduling — working hours (inline weekly form), free days (date range), service assignments with price and duration override; edit and unassign existing assignments
- Guest list

### Staff
- Own appointments view with date filter; responsive — table on desktop, timeline on mobile
- Profile photo displayed in the header (sourced from the linked Resource record via login response)

### Table interactions (all list pages)
- Rows are selectable via checkbox only — clicking outside the checkbox does nothing
- Checkbox column shows a pointer cursor; the rest of the row does not
- Row hover shows a subtle background highlight
- A floating action bar appears at the bottom of the viewport when rows are selected; it provides context-appropriate actions (cancel appointment, edit/delete service, ban/unban guest, view/delete resource)
- Table height is a maximum (not fixed): the table shrinks to fit its content when fewer than ~20 rows are loaded, and scrolls within the capped height when rows overflow
- A loading spinner renders inside the table body during data fetches; column headers are always visible

## Design System

Sizing and spacing rules are centralized in `src/theme.ts`.

**Component size** — `"sm"` is the global default for all interactive components (Button, TextInput, NumberInput, Select, DatePickerInput). Exceptions must be explicit.

**Spacing tokens:**

| Token | Use case |
|-------|----------|
| `"xs"` | Icon + label pairs, tightly related inline elements |
| `"sm"` | Between form fields in a Stack; between buttons in a Group |
| `"md"` | Between sections inside a card |
| `"lg"` | Between major page sections |

Numeric gap values are only for sub-`xs` intentional tightness (e.g. stacked text lines). All other spacing uses tokens.

**Icon sizes:** 16px (nav/header) · 14px (ActionIcon / inline) · 12px (icon inside button with label)

**Width constraints** — use Mantine style props (`miw`, `maw`, `w`) instead of inline `style={{ minWidth }}`.
