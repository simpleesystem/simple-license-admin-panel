import { faker } from '@faker-js/faker'
import { render } from '@testing-library/react'
import { describe, expect, test } from 'vitest'

import { AppShell } from '../../../src/ui/layout/AppShell'
import { Page } from '../../../src/ui/layout/Page'
import { PageHeader } from '../../../src/ui/layout/PageHeader'
import { SidebarLayout } from '../../../src/ui/layout/SidebarLayout'
import { Stack } from '../../../src/ui/layout/Stack'
import {
  UI_CLASS_APP_SHELL,
  UI_CLASS_PAGE_CONSTRAINED,
  UI_CLASS_PAGE_FULL_HEIGHT,
  UI_CLASS_PAGE_FULL_WIDTH,
  UI_CLASS_PAGE_HEADER_ACTIONS,
  UI_CLASS_SIDEBAR_LAYOUT,
  UI_CLASS_SIDEBAR_LAYOUT_SIDEBAR,
  UI_CLASS_SIDEBAR_STICKY,
  UI_CLASS_STACK_BASE,
  UI_CLASS_STACK_DIRECTION_MAP,
  UI_CLASS_STACK_GAP_MAP,
  UI_TEST_ID_APP_SHELL,
  UI_TEST_ID_PAGE,
  UI_TEST_ID_PAGE_HEADER,
  UI_TEST_ID_SIDEBAR_LAYOUT,
  UI_TEST_ID_STACK,
} from '../../../src/ui/constants'

describe('Layout primitives', () => {
  test('AppShell renders the provided content region', () => {
    const body = faker.lorem.words(2)
    const { getByText } = render(<AppShell>{body}</AppShell>)

    expect(getByText(body)).toBeInTheDocument()
  })

  test('AppShell attaches default test id to root element', () => {
    const { getByTestId } = render(<AppShell>{faker.lorem.words(2)}</AppShell>)

    expect(getByTestId(UI_TEST_ID_APP_SHELL)).toHaveClass(UI_CLASS_APP_SHELL, { exact: false })
  })

  test('AppShell renders sidebar content when provided', () => {
    const sidebar = faker.lorem.words(2)
    const { getByText } = render(<AppShell sidebar={<div>{sidebar}</div>}>{faker.lorem.words(2)}</AppShell>)

    expect(getByText(sidebar)).toBeInTheDocument()
  })

  test('AppShell renders top and bottom bars with custom sidebar width', () => {
    const topBar = faker.lorem.words(2)
    const bottomBar = faker.lorem.words(2)
    const sidebar = faker.lorem.word()
    const { getByText } = render(
      <AppShell
        topBar={<div>{topBar}</div>}
        bottomBar={<div>{bottomBar}</div>}
        sidebar={<div>{sidebar}</div>}
        sidebarWidthClass="w-25"
      >
        body
      </AppShell>
    )

    expect(getByText(topBar)).toBeInTheDocument()
    expect(getByText(bottomBar)).toBeInTheDocument()
    expect(getByText(sidebar).parentElement).toHaveClass('w-25', { exact: false })
  })

  test('Page uses constrained container by default', () => {
    const { getByTestId } = render(<Page>{faker.lorem.words(2)}</Page>)

    expect(getByTestId(UI_TEST_ID_PAGE)).toHaveClass(UI_CLASS_PAGE_CONSTRAINED, { exact: false })
  })

  test('Page switches to full width variant when requested', () => {
    const { getByTestId } = render(
      <Page variant="fullWidth" fullHeight>
        {faker.lorem.words(2)}
      </Page>
    )

    expect(getByTestId(UI_TEST_ID_PAGE)).toHaveClass(UI_CLASS_PAGE_FULL_WIDTH, UI_CLASS_PAGE_FULL_HEIGHT, {
      exact: false,
    })
  })

  test('PageHeader renders title content', () => {
    const title = faker.lorem.words(3)
    const { getByText } = render(<PageHeader title={title} />)

    expect(getByText(title)).toBeInTheDocument()
  })

  test('PageHeader exposes default test id', () => {
    const { getByTestId } = render(<PageHeader title={faker.lorem.words(2)} />)

    expect(getByTestId(UI_TEST_ID_PAGE_HEADER)).toBeInTheDocument()
  })

  test('PageHeader renders eyebrow, subtitle, breadcrumbs, and actions', () => {
    const eyebrow = faker.lorem.word()
    const subtitle = faker.lorem.words(2)
    const breadcrumb = faker.lorem.word()
    const action = faker.lorem.word()
    const { getByText } = render(
      <PageHeader
        title="Header"
        eyebrow={eyebrow}
        subtitle={subtitle}
        breadcrumbs={<span>{breadcrumb}</span>}
        actions={<button type="button">{action}</button>}
      />
    )

    expect(getByText(eyebrow)).toBeInTheDocument()
    expect(getByText(subtitle)).toBeInTheDocument()
    expect(getByText(breadcrumb)).toBeInTheDocument()
    const actionsNode = getByText(action).parentElement
    expect(actionsNode).not.toBeNull()
    expect(actionsNode).toHaveClass(...UI_CLASS_PAGE_HEADER_ACTIONS.split(' '), { exact: false })
  })

  test('Stack composes direction and gap classes', () => {
    const { getByTestId } = render(
      <Stack gap="medium" direction="column">
        {faker.lorem.words(2)}
      </Stack>
    )

    expect(getByTestId(UI_TEST_ID_STACK)).toHaveClass(
      UI_CLASS_STACK_BASE,
      UI_CLASS_STACK_DIRECTION_MAP.column,
      UI_CLASS_STACK_GAP_MAP.medium,
      { exact: false }
    )
  })

  test('Stack allows custom html element through as prop', () => {
    const label = faker.lorem.word()
    const { container } = render(
      <Stack as="section" testId={label}>
        content
      </Stack>
    )

    expect(container.querySelector('section')).toBeTruthy()
  })

  test('Stack supports wrap, alignment, and justification options', () => {
    const { getByTestId } = render(
      <Stack direction="row" gap="large" align="center" justify="between" wrap>
        <span>child</span>
      </Stack>
    )

    expect(getByTestId(UI_TEST_ID_STACK)).toHaveClass('flex-wrap', { exact: false })
  })

  test('SidebarLayout renders sidebar section', () => {
    const sidebar = faker.lorem.words(2)
    const { getByText } = render(
      <SidebarLayout sidebar={<div>{sidebar}</div>}>{faker.lorem.words(2)}</SidebarLayout>
    )

    expect(getByText(sidebar).closest('aside')).toHaveClass(UI_CLASS_SIDEBAR_LAYOUT_SIDEBAR, { exact: false })
  })

  test('SidebarLayout root exposes layout classes', () => {
    const { getByTestId } = render(
      <SidebarLayout sidebar={<div>{faker.lorem.words(2)}</div>}>{faker.lorem.words(2)}</SidebarLayout>
    )

    expect(getByTestId(UI_TEST_ID_SIDEBAR_LAYOUT)).toHaveClass(UI_CLASS_SIDEBAR_LAYOUT, { exact: false })
  })

  test('SidebarLayout supports sticky sidebars', () => {
    const { getByTestId } = render(
      <SidebarLayout sidebar={<div>sidebar</div>} stickySidebar>
        content
      </SidebarLayout>
    )

    const sidebar = getByTestId(UI_TEST_ID_SIDEBAR_LAYOUT).querySelector('aside')
    expect(sidebar).toHaveClass(...UI_CLASS_SIDEBAR_STICKY.split(' '), { exact: false })
  })
})


