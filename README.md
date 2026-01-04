# Simple License System - Admin Panel

React-based admin interface for the Simple License System license management server.

## Status

**Current State**: Pre-UI foundation complete, ready for feature UI development

The admin panel infrastructure is complete, providing a solid
foundation for building feature UIs. The current implementation
focuses on authentication, authorization, routing, data fetching,
and ability-based UI gating.

## What's Built

### Core Infrastructure

- ✅ **Authentication & Authorization**: JWT-based auth with
  role-based permissions (RBAC)
- ✅ **Routing**: TanStack Router with file-based routes and route guards
- ✅ **Ability System**: CASL-based UI gating (`IfCan`, `IfPermission` components)
- ✅ **Data Fetching**: React Query with standardized error handling and retry logic
- ✅ **Form Infrastructure**: React Hook Form + Joi validation
- ✅ **State Management**: React Context for global state, React
  Query for server state
- ✅ **Error Handling**: Error boundaries, toast notifications, error mappers
- ✅ **Session Management**: Idle timeout, cross-tab sync, auto-logout
- ✅ **Observability**: Logger abstraction, analytics adapter, Sentry integration
- ✅ **Dev Tools**: Dev personas, seed helpers, feature flags

### What's Next

Feature UI components for:

- License management (create, edit, suspend, revoke)
- Product configuration (products, tiers, entitlements)
- Tenant administration (create, manage, suspend tenants)
- User management (create, edit, delete users)
- Analytics dashboards
- System monitoring

## Tech Stack

- **Framework**: React 18+ with TypeScript (strict mode)
- **UI Library**: React Bootstrap (theme-aware classes, no pixel units)
- **Routing**: TanStack Router (file-based, type-safe)
- **State**: React Query for server state, React Context +
  useReducer for client state
- **Forms**: React Hook Form + Joi validation
- **Authorization**: CASL (@casl/ability, @casl/react) for ability-based UI gating
- **Build**: Vite
- **Testing**: Vitest, React Testing Library, MSW

## Getting Started

### Prerequisites

- Node.js 22.x or later
- npm (comes with Node.js)
- Access to the license server API

### Installation

```bash
cd admin-panel
npm ci
```

### Environment Variables

Create a `.env` file in the `admin-panel/` directory:

```bash
# API Configuration
VITE_API_BASE_URL=http://localhost:3000/api/v1
VITE_API_TIMEOUT=30000

# Feature Flags
VITE_ENABLE_DEV_PERSONAS=true
VITE_ENABLE_FEATURE_FLAGS=true

# Observability (optional)
VITE_SENTRY_DSN=
VITE_ENABLE_ANALYTICS=false
```

### Development

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

The dev server will start on `http://localhost:5173` (or next available port).

## Architecture

The admin panel follows a **plugin-first, minimal-boilerplate** philosophy:

- Heavy reliance on battle-tested libraries (React Query, TanStack Router, CASL)
- Domain/business logic focus—minimal infrastructure code
- Type-safe throughout (TypeScript strict mode)
- Test-first development with comprehensive coverage requirements

### Project Structure

```text
admin-panel/
├── src/
│   ├── app/              # Core infrastructure
│   │   ├── auth/         # Authentication logic
│   │   ├── routing/      # Route configuration
│   │   ├── abilities/    # CASL ability definitions
│   │   └── context/      # React Context providers
│   ├── api/              # API client integration
│   ├── forms/            # Form infrastructure
│   ├── routes/           # TanStack Router routes
│   ├── ui/               # UI components
│   └── utils/            # Utility functions
├── test/                 # Test suites
└── public/               # Static assets
```

### Key Patterns

#### Adding Protected Routes

Routes are defined in `src/routes/` using TanStack Router's file-based routing:

```typescript
// src/routes/licenses.tsx
import { createFileRoute } from "@tanstack/react-router";
import { IfCan } from "@/app/abilities";
import { useLicenses } from "@/api/licenses";

export const Route = createFileRoute("/licenses")({
  component: LicensesPage,
});

function LicensesPage() {
  const { data, isLoading } = useLicenses();

  return (
    <IfCan action="read" subject="License">
      {/* License list UI */}
    </IfCan>
  );
}
```

#### Wiring API Queries

API queries use React Query with standardized error handling:

```typescript
// src/api/licenses.ts
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "./client";

export function useLicenses() {
  return useQuery({
    queryKey: ["licenses"],
    queryFn: () => apiClient.get("/admin/licenses"),
    retry: 2,
  });
}
```

#### Adding Permissions

Permissions are defined in CASL ability definitions:

```typescript
// src/app/abilities/definitions.ts
import { defineAbility } from "@casl/ability";

export function defineAbilitiesFor(user: User) {
  return defineAbility((can, cannot) => {
    if (user.role === "SUPERUSER") {
      can("manage", "all");
    } else if (user.role === "ADMIN") {
      can("read", "License");
      can("create", "License");
      can("update", "License");
    }
  });
}
```

#### Using Ability-Driven UI

Use `IfCan` and `IfPermission` components for UI gating:

```typescript
import { IfCan } from "@/app/abilities";

function LicenseActions({ license }: { license: License }) {
  return (
    <>
      <IfCan action="update" subject="License">
        <button>Edit License</button>
      </IfCan>
      <IfCan action="delete" subject="License">
        <button>Revoke License</button>
      </IfCan>
    </>
  );
}
```

## Development Guidelines

### Component Structure

Follow the Arrange-Act-Assert pattern:

1. Hooks (useState, useQuery, etc.)
2. Derived state (useMemo, useCallback)
3. Event handlers
4. Effects (useEffect)
5. Render

### State Management

- **Server State**: Use React Query for all API data
- **Global Client State**: Use React Context + useReducer
- **Local Component State**: Use useState

### Form Handling

Use React Hook Form with Joi validation:

```typescript
import { useForm } from "react-hook-form";
import { joiResolver } from "@hookform/resolvers/joi";
import Joi from "joi";

const schema = Joi.object({
  email: Joi.string().email().required(),
  domain: Joi.string().required(),
});

function LicenseForm() {
  const { register, handleSubmit } = useForm({
    resolver: joiResolver(schema),
  });

  // ...
}
```

### Testing

Tests use Vitest, React Testing Library, and MSW:

```typescript
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { createLicense } from "@test/factories";
import { LicenseCard } from "./LicenseCard";

describe("LicenseCard", () => {
  it("displays license information", () => {
    const license = createLicense();
    render(<LicenseCard license={license} />);
    expect(screen.getByText(license.customerEmail)).toBeInTheDocument();
  });
});
```

### Constants and Test Data

- **Constants**: Import from `@/config/constants` (no hardcoded values)
- **Test Data**: Use factories from `@test/factories` (no inline test data)

## API Integration

The admin panel communicates with the license server API at
`/api/v1/admin/*` endpoints. All requests require JWT
authentication via the `Authorization: Bearer <token>` header.

See `docs/ADMIN_GUIDE.md` for complete API reference.

## Documentation

- **Architecture Guide**: See `docs/ARCHITECTURE.md` for detailed frontend patterns
- **UI Primitives**: See `docs/ui-primitives.md` for component documentation
- **API Reference**: See `docs/ADMIN_GUIDE.md` for backend API documentation

## Contributing

When adding new features:

1. Write tests first (TDD approach)
2. Follow component structure patterns
3. Use constants (no hardcoded values)
4. Use factories for test data
5. Ensure TypeScript strict mode compliance
6. Run linting and type checking before committing

## Support

For questions or issues:

- Check `docs/ARCHITECTURE.md` for architectural patterns
- Review `docs/ADMIN_GUIDE.md` for API documentation
- See `license-server/README.md` for backend setup
