# Simple License System - TypeScript React SDK

TypeScript React SDK for client applications using the Simple License System. This SDK provides full API coverage for both public and admin endpoints, built with React Query for optimal state management and caching.

## Features

- ✅ **Full API Coverage** - Public and admin endpoints
- ✅ **React Query Integration** - Built-in hooks with caching and state management
- ✅ **TypeScript First** - Complete type safety with strict mode
- ✅ **Zero Hardcoded Values** - All values from constants
- ✅ **Comprehensive Error Handling** - Typed exceptions for all error scenarios
- ✅ **Plugin-First Architecture** - Uses battle-tested libraries (Axios, React Query)
- ✅ **Framework Agnostic** - Works with any React application

## Installation

```bash
npm install @simple-license/react-sdk
# or
yarn add @simple-license/react-sdk
# or
pnpm add @simple-license/react-sdk
```

### Peer Dependencies

This SDK requires React 19+ and React DOM 19+. Make sure you have these installed:

```bash
npm install react@^19.0.0 react-dom@^19.0.0
```

## Quick Start

### 1. Setup React Query Provider

```tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Client } from '@simple-license/react-sdk'

const queryClient = new QueryClient()

function App() {
  const client = new Client('https://your-license-server.com')

  return (
    <QueryClientProvider client={queryClient}>
      {/* Your app */}
    </QueryClientProvider>
  )
}
```

### 2. Use Public API Hooks

```tsx
import { useLicenseActivate, useLicenseValidate } from '@simple-license/react-sdk'

function LicenseManager() {
  const activate = useLicenseActivate(client)

  const handleActivate = async () => {
    try {
      const result = await activate.mutateAsync({
        licenseKey: 'YOUR-LICENSE-KEY',
        domain: 'example.com',
      })
      console.log('Activated:', result.license)
    } catch (error) {
      console.error('Activation failed:', error)
    }
  }

  return <button onClick={handleActivate}>Activate License</button>
}
```

### 3. Use Admin API Hooks

```tsx
import { useAdminLicenses, useLogin } from '@simple-license/react-sdk'

function AdminDashboard() {
  const client = new Client('https://your-license-server.com')
  const login = useLogin(client)
  const { data: licenses, isLoading } = useAdminLicenses(client)

  // Login first
  const handleLogin = async () => {
    await login.mutateAsync({
      username: 'admin',
      password: 'password',
    })
  }

  if (isLoading) return <div>Loading...</div>

  return (
    <div>
      <h1>Licenses</h1>
      {licenses?.licenses.map((license) => (
        <div key={license.id}>{license.licenseKey}</div>
      ))}
    </div>
  )
}
```

## Public API Usage

### License Activation

```tsx
import { useLicenseActivate } from '@simple-license/react-sdk'

const activate = useLicenseActivate(client)

await activate.mutateAsync({
  licenseKey: 'YOUR-LICENSE-KEY',
  domain: 'example.com',
  site_name: 'My Site',
  os: 'Linux',
  region: 'us-east-1',
  client_version: '1.0.0',
})
```

### License Validation

```tsx
import { useLicenseValidate } from '@simple-license/react-sdk'

const validate = useLicenseValidate(client)

await validate.mutateAsync({
  licenseKey: 'YOUR-LICENSE-KEY',
  domain: 'example.com',
})
```

### Get License Data

```tsx
import { useLicenseData } from '@simple-license/react-sdk'

const { data: licenseData, isLoading } = useLicenseData(client, 'YOUR-LICENSE-KEY')

if (isLoading) return <div>Loading...</div>
console.log(licenseData?.license)
```

### Get License Features

```tsx
import { useLicenseFeatures } from '@simple-license/react-sdk'

const { data: features } = useLicenseFeatures(client, 'YOUR-LICENSE-KEY')

console.log(features?.features) // Record<string, FeatureValue>
console.log(features?.tier) // ProductTier
```

### Deactivate License

```tsx
import { useLicenseDeactivate } from '@simple-license/react-sdk'

const deactivate = useLicenseDeactivate(client)

await deactivate.mutateAsync({
  licenseKey: 'YOUR-LICENSE-KEY',
  domain: 'example.com',
})
```

### Report Usage

```tsx
import { useLicenseUsage } from '@simple-license/react-sdk'

const reportUsage = useLicenseUsage(client)

await reportUsage.mutateAsync({
  licenseKey: 'YOUR-LICENSE-KEY',
  domain: 'example.com',
  month: '2024-01',
  conversations_count: 1000,
  voice_count: 500,
  text_count: 1500,
})
```

### Check for Updates

```tsx
import { useUpdateCheck } from '@simple-license/react-sdk'

const checkUpdate = useUpdateCheck(client)

await checkUpdate.mutateAsync({
  license_key: 'YOUR-LICENSE-KEY',
  domain: 'example.com',
  product_slug: 'my-product',
  current_version: '1.0.0',
})
```

## Admin API Usage

### Authentication

```tsx
import { useLogin, useLogout } from '@simple-license/react-sdk'

const client = new Client('https://your-license-server.com')
const login = useLogin(client)
const logout = useLogout(client)

// Login
await login.mutateAsync({
  username: 'admin',
  password: 'password',
})

// Logout
await logout.mutateAsync()
```

### License Management

```tsx
import {
  useAdminLicenses,
  useAdminLicense,
  useCreateLicense,
  useUpdateLicense,
  useSuspendLicense,
  useResumeLicense,
  useFreezeLicense,
  useRevokeLicense,
} from '@simple-license/react-sdk'

// List licenses
const { data: licenses } = useAdminLicenses(client, {
  status: 'ACTIVE',
  limit: 10,
  offset: 0,
})

// Get single license
const { data: license } = useAdminLicense(client, 'license-id-or-key')

// Create license
const create = useCreateLicense(client)
await create.mutateAsync({
  license_key: 'NEW-LICENSE-KEY',
  customer_email: 'customer@example.com',
  tier_code: 'PROFESSIONAL',
})

// Update license
const update = useUpdateLicense(client)
await update.mutateAsync('license-id', {
  customer_email: 'newemail@example.com',
})

// Suspend/Resume
const suspend = useSuspendLicense(client)
await suspend.mutateAsync('license-id')

const resume = useResumeLicense(client)
await resume.mutateAsync('license-id')

// Freeze
const freeze = useFreezeLicense(client)
await freeze.mutateAsync('license-id', {
  freeze_entitlements: true,
  freeze_tier: false,
})

// Revoke
const revoke = useRevokeLicense(client)
await revoke.mutateAsync('license-id')
```

### Product Management

```tsx
import {
  useAdminProducts,
  useAdminProduct,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
} from '@simple-license/react-sdk'

// List products
const { data: products } = useAdminProducts(client)

// Get product
const { data: product } = useAdminProduct(client, 'product-id')

// Create product
const create = useCreateProduct(client)
await create.mutateAsync({
  slug: 'my-product',
  name: 'My Product',
  description: 'Product description',
})

// Update product
const update = useUpdateProduct(client)
await update.mutateAsync('product-id', {
  name: 'Updated Product Name',
})

// Delete product
const deleteProduct = useDeleteProduct(client)
await deleteProduct.mutateAsync('product-id')
```

### User Management

```tsx
import {
  useAdminUsers,
  useAdminUser,
  useCreateUser,
  useUpdateUser,
  useDeleteUser,
  useCurrentUser,
  useChangePassword,
} from '@simple-license/react-sdk'

// List users
const { data: users } = useAdminUsers(client)

// Get current user
const { data: currentUser } = useCurrentUser(client)

// Create user
const create = useCreateUser(client)
await create.mutateAsync({
  username: 'newuser',
  email: 'user@example.com',
  password: 'password123',
  role: 'ADMIN',
})

// Change password
const changePassword = useChangePassword(client)
await changePassword.mutateAsync({
  current_password: 'oldpassword',
  new_password: 'newpassword',
})
```

### Analytics

```tsx
import {
  useAdminSystemStats,
  useAdminUsageSummaries,
  useAdminUsageTrends,
} from '@simple-license/react-sdk'

// System stats
const { data: stats } = useAdminSystemStats(client)

// Usage summaries
const { data: summaries } = useAdminUsageSummaries(client)

// Usage trends
const { data: trends } = useAdminUsageTrends(client)
```

## Direct Client Usage (Without React Query)

You can also use the Client class directly without React Query hooks:

```tsx
import { Client } from '@simple-license/react-sdk'

const client = new Client('https://your-license-server.com')

// Login first (for admin endpoints)
await client.login('username', 'password')

// Use client methods directly
const license = await client.getLicenseData('LICENSE-KEY')
const licenses = await client.listLicenses({ status: 'ACTIVE' })
```

## Error Handling

The SDK provides typed exceptions for all error scenarios:

```tsx
import {
  LicenseExpiredException,
  ActivationLimitExceededException,
  LicenseNotFoundException,
  ValidationException,
  NetworkException,
  AuthenticationException,
  ApiException,
} from '@simple-license/react-sdk'

try {
  await activate.mutateAsync({ licenseKey: 'KEY', domain: 'example.com' })
} catch (error) {
  if (error instanceof LicenseExpiredException) {
    console.error('License has expired:', error.errorDetails)
  } else if (error instanceof ActivationLimitExceededException) {
    console.error('Activation limit reached')
  } else if (error instanceof LicenseNotFoundException) {
    console.error('License not found')
  } else if (error instanceof ValidationException) {
    console.error('Validation failed:', error.errorDetails?.validationErrors)
  } else if (error instanceof NetworkException) {
    console.error('Network error:', error.message)
  } else if (error instanceof AuthenticationException) {
    console.error('Authentication failed')
  } else if (error instanceof ApiException) {
    console.error('API error:', error.errorCode, error.message)
  }
}
```

## TypeScript Support

The SDK is fully typed with TypeScript strict mode. All types are exported:

```tsx
import type {
  License,
  LicenseActivation,
  Product,
  ProductTier,
  User,
  Tenant,
  LicenseStatus,
  LicenseTier,
  // ... and many more
} from '@simple-license/react-sdk'
```

## React Query Configuration

You can customize React Query options for each hook:

```tsx
const { data } = useLicenseData(client, 'KEY', {
  staleTime: 5 * 60 * 1000, // 5 minutes
  cacheTime: 10 * 60 * 1000, // 10 minutes
  retry: 3,
  retryDelay: 1000,
})
```

## Testing

The SDK includes comprehensive test utilities:

```tsx
import { createTestClient } from '@simple-license/react-sdk/tests/utils'
import { server } from '@simple-license/react-sdk/tests/msw/server'
import { createLicense } from '@simple-license/react-sdk/tests/factories'

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' })
})

afterEach(() => {
  server.resetHandlers()
})

afterAll(() => {
  server.close()
})

test('activate license', async () => {
  const client = createTestClient()
  const license = createLicense()
  // ... test implementation
})
```

Run tests:

```bash
npm run test
npm run test:coverage
npm run test:mutation
```

## Architecture

This SDK follows strict architectural principles:

- **DRY (Don't Repeat Yourself)** - No code duplication
- **SOLID Principles** - Single responsibility, dependency injection
- **Plugin-First** - Uses battle-tested libraries
- **Zero Hardcoded Values** - All from constants
- **Type Safety** - Full TypeScript strict mode
- **Test-Driven Development** - Tests written first

## API Reference

### Client Class

The main `Client` class provides all API methods. See source code for complete API documentation.

### React Query Hooks

All hooks follow React Query patterns:

- `useQuery` hooks for GET operations (auto-refetch, caching)
- `useMutation` hooks for POST/PUT/PATCH/DELETE (optimistic updates)

### Query Keys

Centralized query keys for cache invalidation:

```tsx
import { QUERY_KEYS } from '@simple-license/react-sdk'

QUERY_KEYS.licenses.all()
QUERY_KEYS.licenses.detail('key')
QUERY_KEYS.adminLicenses.all({ status: 'ACTIVE' })
```

## Requirements

- React 19+
- React DOM 19+
- Node.js 22+
- TypeScript 5.9+

## License

MIT

## Repository

https://github.com/simpleesystem/simple-license-react-sdk

