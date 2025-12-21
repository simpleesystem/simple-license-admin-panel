import { faker } from '@faker-js/faker'
import { screen } from '@testing-library/react'
import { describe, expect, test } from 'vitest'

import { AppShell } from '../../../../src/ui/layout/AppShell'
import { SidebarNav } from '../../../../src/ui/navigation/SidebarNav'
import { TopNavBar } from '../../../../src/ui/navigation/TopNavBar'
import { buildSidebarNavItem } from '../../factories/uiFactories'
import { renderWithProviders } from '../../utils'

vi.mock('../../../../src/app/auth/AuthProvider', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

vi.mock('../../../../src/app/auth/useAuth', () => ({
  useAuth: () => ({
    isAuthenticated: true,
    isLoading: false,
    user: { role: 'SUPERUSER', email: 'test@example.com' },
  }),
}))

const navItems = [
  buildSidebarNavItem({ label: 'Dashboard' }),
  buildSidebarNavItem({ label: 'Licenses' }),
  buildSidebarNavItem({ label: 'Products' }),
  buildSidebarNavItem({ label: 'Users' }),
]

describe('Navigation guards and visibility', () => {
  test('SUPERUSER sees all nav items', () => {
    renderWithProviders(
      <AppShell
        sidebar={<SidebarNav items={navItems} />}
        topBar={<TopNavBar brand="Brand" userMenu={null} />}
        currentUser={{ role: 'SUPERUSER', vendorId: faker.string.uuid() }}
      >
        content
      </AppShell>,
    )

    navItems.forEach((item) => {
      expect(screen.getByText(item.label)).toBeInTheDocument()
    })
  })

  test('VIEWER sees limited nav', () => {
    const restrictedItems = navItems.filter((item) => item.label !== 'Users')

    renderWithProviders(
      <AppShell
        sidebar={<SidebarNav items={restrictedItems} />}
        topBar={<TopNavBar brand="Brand" userMenu={null} />}
        currentUser={{ role: 'VIEWER', vendorId: faker.string.uuid() }}
      >
        content
      </AppShell>,
    )

    expect(screen.queryByText('Users')).toBeNull()
    restrictedItems.forEach((item) => {
      expect(screen.getByText(item.label)).toBeInTheDocument()
    })
  })
})

