import { fireEvent, render } from '@testing-library/react'
import { afterEach, describe, expect, test } from 'vitest'

import { ROUTE_PATH_PRODUCTS } from '@/app/constants'
import { EntityCrossLink } from '@/app/navigation/EntityCrossLink'
import { ENTITY_LINK_KIND_PRODUCT } from '@/app/navigation/entityLinks'
import { useAppStore } from '@/app/state/store'
import { UI_TEST_ID_ENTITY_LINK, UI_VALUE_PLACEHOLDER } from '@/ui/constants'

afterEach(() => {
  const { dispatch } = useAppStore.getState()
  dispatch({ type: 'nav/intent', payload: null })
  dispatch({ type: 'table/clearSeed' })
})

describe('EntityCrossLink', () => {
  test('renders a cross-link to the destination route for the value', () => {
    const { getByTestId } = render(<EntityCrossLink kind={ENTITY_LINK_KIND_PRODUCT} value="acme-pro" />)

    const link = getByTestId(UI_TEST_ID_ENTITY_LINK)
    expect(link).toHaveAttribute('href', ROUTE_PATH_PRODUCTS)
    expect(link).toHaveTextContent('acme-pro')
  })

  test('seeds the destination search and raises a navigation intent on activation', () => {
    const { getByTestId } = render(<EntityCrossLink kind={ENTITY_LINK_KIND_PRODUCT} value="acme-pro" />)

    fireEvent.click(getByTestId(UI_TEST_ID_ENTITY_LINK))

    const state = useAppStore.getState()
    expect(state.tableSeed).toEqual({ path: ROUTE_PATH_PRODUCTS, term: 'acme-pro' })
    expect(state.navigationIntent).toEqual({ to: ROUTE_PATH_PRODUCTS })
  })

  test('renders a placeholder without a link when no value is provided', () => {
    const { queryByTestId, getByText } = render(<EntityCrossLink kind={ENTITY_LINK_KIND_PRODUCT} value={null} />)

    expect(queryByTestId(UI_TEST_ID_ENTITY_LINK)).toBeNull()
    expect(getByText(UI_VALUE_PLACEHOLDER)).toBeInTheDocument()
  })

  test('renders a custom label while still linking by the underlying value', () => {
    const { getByTestId, getByText } = render(
      <EntityCrossLink kind={ENTITY_LINK_KIND_PRODUCT} value="acme-pro" label="Acme Pro" />
    )

    expect(getByText('Acme Pro')).toBeInTheDocument()
    expect(getByTestId(UI_TEST_ID_ENTITY_LINK)).toHaveAttribute('href', ROUTE_PATH_PRODUCTS)
  })
})
