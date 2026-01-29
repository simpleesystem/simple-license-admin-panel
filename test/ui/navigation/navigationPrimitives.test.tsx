import { faker } from '@faker-js/faker'
import { fireEvent, render } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'
import {
  UI_CLASS_BREADCRUMBS,
  UI_CLASS_SIDEBAR_NAV,
  UI_CLASS_SIDEBAR_NAV_ACTIVE,
  UI_CLASS_TOP_NAV,
  UI_TEST_ID_BREADCRUMBS,
  UI_TEST_ID_SIDEBAR_NAV,
  UI_TEST_ID_TOP_NAV,
} from '../../../src/ui/constants'
import { Breadcrumbs } from '../../../src/ui/navigation/Breadcrumbs'
import { SidebarNav } from '../../../src/ui/navigation/SidebarNav'
import { TopNavBar } from '../../../src/ui/navigation/TopNavBar'
import { buildBreadcrumbItem, buildSidebarNavItem } from '../../ui/factories/uiFactories'

describe('Navigation primitives', () => {
  test('SidebarNav renders navigation links', () => {
    const items = [buildSidebarNavItem(), buildSidebarNavItem()]
    const { getByTestId } = render(<SidebarNav items={items} />)

    expect(getByTestId(UI_TEST_ID_SIDEBAR_NAV)).toHaveClass(UI_CLASS_SIDEBAR_NAV, { exact: false })
  })

  test('SidebarNav triggers onSelect and highlights active entries', () => {
    const activeItem = buildSidebarNavItem({ label: 'active', active: true })
    const inactiveItem = buildSidebarNavItem({ label: 'inactive', href: '#inactive' })
    const onSelect = vi.fn()
    const { getByText } = render(<SidebarNav items={[inactiveItem, activeItem]} onSelect={onSelect} />)

    fireEvent.click(getByText('inactive'))

    expect(onSelect).toHaveBeenCalledWith(inactiveItem)
    const activeLink = getByText('active').closest('a')
    expect(activeLink).toHaveClass(UI_CLASS_SIDEBAR_NAV_ACTIVE, { exact: false })
    expect(activeLink).toHaveAttribute('aria-current', 'page')
  })

  test('SidebarNav invokes item onClick handlers even when href is omitted', () => {
    const onClick = vi.fn()
    const item = buildSidebarNavItem({ label: 'custom', href: undefined, onClick })
    const { getByText } = render(<SidebarNav items={[item]} />)

    fireEvent.click(getByText('custom'))

    expect(onClick).toHaveBeenCalled()
  })

  test('TopNavBar applies nav styling', () => {
    const { getByTestId } = render(<TopNavBar brand={faker.company.name()} />)

    expect(getByTestId(UI_TEST_ID_TOP_NAV)).toHaveClass(UI_CLASS_TOP_NAV, { exact: false })
  })

  test('TopNavBar renders brand content', () => {
    const brand = faker.company.name()
    const { getByText } = render(<TopNavBar brand={brand} />)

    expect(getByText(brand)).toBeInTheDocument()
  })

  test('TopNavBar renders navigation and actions slots', () => {
    const navLabel = 'nav-slot'
    const actionLabel = 'action-slot'
    const { getByText } = render(
      <TopNavBar
        brand={faker.company.name()}
        navigation={<span>{navLabel}</span>}
        actions={<button type="button">{actionLabel}</button>}
      />
    )

    expect(getByText(navLabel)).toBeInTheDocument()
    expect(getByText(actionLabel)).toBeInTheDocument()
  })

  test('Breadcrumbs display provided trail', () => {
    const items = [buildBreadcrumbItem(), buildBreadcrumbItem()]
    const { getByTestId } = render(<Breadcrumbs items={items} />)

    expect(getByTestId(UI_TEST_ID_BREADCRUMBS)).toHaveClass(UI_CLASS_BREADCRUMBS, { exact: false })
  })

  test('Breadcrumbs invoke handlers for navigable items', () => {
    const onClick = vi.fn()
    const items = [
      buildBreadcrumbItem({ label: 'home', href: '#home', onClick }),
      buildBreadcrumbItem({ label: 'products', active: true }),
    ]
    const { getByText } = render(<Breadcrumbs items={items} />)

    fireEvent.click(getByText('home'))

    expect(onClick).toHaveBeenCalledOnce()
    expect(getByText('products').closest('li')).toHaveClass('active')
  })
})
