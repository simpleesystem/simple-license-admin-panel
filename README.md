# Simple License Admin — Pre-UI Foundation

The admin panel ships a non-UI foundation focused on configuration safety, authentication, RBAC, data/query infrastructure, observability, and developer ergonomics. React Bootstrap provides the eventual visual layer, but phase 2 concentrates on domain logic, providers, and testable helpers so feature teams can focus on business workflows.

## Prerequisites & Install

All commands must run from the workspace root's `license-server` directory to ensure the correct package.json is used.

```bash
cd /Users/caseycapps/code/simple-license-system/license-server
npm install
```

Environment variables (see `src/app/config/appConfig.ts`):

| Env var | Purpose | Example |
| --- | --- | --- |
| `VITE_API_BASE_URL` | Points the SDK to the backend gateway | `https://localhost:4000` |
| `VITE_SENTRY_DSN` | Optional error reporting DSN | *(empty for local)* |
| `VITE_FEATURE_DEV_TOOLS` | Enables dev personas + toolbar | `true` |
| `VITE_FEATURE_QUERY_CACHE_PERSISTENCE` | Opt-in React Query cache persistence | `false` |
| `VITE_FEATURE_EXPERIMENTAL_FILTERS` | Toggles experimental list filters | `false` |

## Dev Personas & Scenarios

- Helpers live in `src/app/dev/devScenarios.ts`.
- Dev tooling honours both `VITE_FEATURE_DEV_TOOLS=true` and `import.meta.env.MODE !== 'production'`.
- `applyDevPersona(personaKey)` seeds local storage (token + user) via the same persistence helpers used by the real auth flow. `clearDevPersona()` removes everything.
- `DevToolbar` renders automatically (bottom-right overlay) once the feature flag is enabled. Each persona button seeds auth state; the Reset button clears it. The toolbar never renders in production builds.
- Tests live in `test/app/dev/devScenarios.test.ts` to guarantee helpers are no-ops outside dev environments.

## Adding a Protected Route

1. Create the route file under `src/routes/**` using TanStack Router's file-based convention.
2. Import `assertAuthenticated` (and `assertPermission` when needed) from `src/app/router.tsx`.
3. Attach guards inside the route's `beforeLoad` hook:
   ```ts
   export const Route = createFileRoute('/tenants')({
     beforeLoad: (ctx) => {
       assertAuthenticated(ctx)
       assertPermission(ctx, 'canManageTenants')
     },
     component: TenantsScreen,
   })
   ```
4. Extend `ROLE_PERMISSION_MATRIX` in `src/app/auth/permissions.ts` if the feature introduces new permission concepts.
5. Cover the route through `test/app/router/guards.test.ts` (redirect behaviour) plus any scenario tests that exercise the new component(s).

## Wiring a New Query

1. Use React Query hooks from `@tanstack/react-query`. `createAppQueryClient` already injects retry strategy, error normalization, and toast notifications.
2. Throw API errors or `ApiException` objects—`handleQueryError` maps them into notification payloads automatically.
3. When fetching SDK collections, run the result through selectors in `src/utils/selectors.ts` to keep components presentation-focused.
4. Opt into cache persistence by enabling the `enableQueryCachePersistence` feature flag; `AppProviders` takes care of persister wiring.
5. Test pure data helpers in `test/utils/**` and wrap query hooks inside provider-aware tests with `renderWithProviders`.

## Adding or Updating Permissions

1. Extend `PERMISSION_KEYS` and the `Permissions` type in `src/app/auth/permissions.ts`.
2. Update `ROLE_PERMISSION_MATRIX` so each `AdminRole` explicitly declares the new capability.
3. Use `useCan('permissionKey')` inside components to gate interactions/rendering.
4. Secure routes with `assertPermission` (see above).
5. Add/adjust tests in `test/app/auth/permissions.test.ts` and `test/app/auth/AuthorizationProvider.test.tsx` to guarantee the new capability flows through contexts and hooks.

## Ability-Driven UI Gating

- Ability vocabulary (actions/subjects) and the permission-to-ability bridge live in `src/app/abilities/abilityMap.ts`. Update the map whenever a new permission needs UI affordances; constants originate from `src/app/constants.ts`.
- `AbilityProvider` (wired into `AppProviders`) derives a CASL ability instance from the current user’s permissions via `buildAbilityFromPermissions`. Consumers retrieve it through `useAbility()` or the convenience `useCanAbility(action, subject)`.
- Declarative helpers:
  - `IfCan` renders/disable/fallbacks based on an ability tuple.
  - `IfPermission` mirrors the older permission API for scenarios where you still reason about `PermissionKey`.
  - Example:
    ```tsx
    import { IfCan } from '@/app/abilities/IfCan'
    import { ABILITY_ACTION_MANAGE, ABILITY_SUBJECT_LICENSE } from '@/app/constants'

    export function LicenseToolbar() {
      return (
        <IfCan action={ABILITY_ACTION_MANAGE} subject={ABILITY_SUBJECT_LICENSE} fallback={null}>
          <Button variant="primary">Issue license</Button>
        </IfCan>
      )
    }
    ```
- Tests covering this stack live under `test/app/abilities/`:
  - Pure mapping and factory tests (`abilityMapping.test.ts`, `factory.test.ts`).
  - Hook/provider/component behavior (`useAbility.test.tsx`, `IfCan.test.tsx`).
  - Provider integration with Auth→Authorization→Ability (`integration.test.tsx`).

## QA & Tooling

Full hygiene suite (run from `license-server/`):

```bash
npm run lint
npm run build
npm run test:coverage
npm run test:mutation
```

## Additional References

- `src/app/query/**`: Shared retry/error strategies, cache persistence helpers, query-aware notification bus bridge.
- `src/app/logging/**` and `src/app/analytics/**`: Logger + tracking abstractions wired into `AppProviders`.
- `src/app/auth/SessionManager.tsx`: Idle detection, user warning toast, auto-logout, cross-tab storage sync.
- `src/app/lists/**`: Shared list state model for pagination, sorting, filtering, and query serialization.
