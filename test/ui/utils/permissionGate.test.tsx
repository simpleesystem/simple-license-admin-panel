import { describe, expect, test, vi } from 'vitest'
import { render } from '@testing-library/react'
import type { ReactNode } from 'react'

const permissionState = vi.hoisted(() => ({ allowed: true }))
const abilityState = vi.hoisted(() => ({ allowed: true }))

const resolveFallback = (fallback: ReactNode | (() => ReactNode)) => {
  if (typeof fallback === 'function') {
    return fallback()
  }
  return fallback
}

vi.mock('../../../src/app/abilities/IfPermission', () => ({
  IfPermission: ({
    children,
    fallback,
  }: {
    children: ReactNode
    fallback?: ReactNode | (() => ReactNode)
  }) => {
    if (permissionState.allowed) {
      return <>{children}</>
    }
    return <>{fallback ? resolveFallback(fallback) : null}</>
  },
}))

vi.mock('../../../src/app/abilities/IfCan', () => ({
  IfCan: ({
    children,
    fallback,
    mode,
  }: {
    children: ReactNode
    fallback?: ReactNode | ((isAllowed: boolean) => ReactNode)
    mode?: string
  }) => {
    if (abilityState.allowed) {
      return <>{children}</>
    }
    if (mode === 'disable') {
      return (
        <button type="button" disabled>
          disabled
        </button>
      )
    }
    return <>{fallback ? (typeof fallback === 'function' ? fallback(false) : fallback) : null}</>
  },
}))

import { VisibilityGate } from '../../../src/ui/utils/PermissionGate'

describe('VisibilityGate', () => {
  test('renders children when no gating props provided', () => {
    const { getByText } = render(<VisibilityGate>content</VisibilityGate>)

    expect(getByText('content')).toBeInTheDocument()
  })

  test('renders permission fallback when permission check fails', () => {
    permissionState.allowed = false
    const { getByText } = render(
      <VisibilityGate permissionKey="manageLicenses" permissionFallback="fallback">
        should-hide
      </VisibilityGate>
    )

    expect(getByText('fallback')).toBeInTheDocument()
  })

  test('uses ability fallback when ability block occurs', () => {
    abilityState.allowed = false
    const { getByText } = render(
      <VisibilityGate
        ability={{
          action: 'view',
          subject: 'dashboard',
          fallback: () => 'ability-fallback',
        }}
      >
        hidden-child
      </VisibilityGate>
    )

    expect(getByText('ability-fallback')).toBeInTheDocument()
  })
})


