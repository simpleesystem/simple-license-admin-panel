import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'

import { CardList } from '../../../src/ui/data/CardList'

describe('CardList', () => {
  test('renders card content and handles click', () => {
    const onClick = vi.fn()
    render(
      <CardList
        items={[
          {
            id: 'card-1',
            title: 'Card Title',
            subtitle: 'Card Subtitle',
            body: 'Card Body',
            footer: 'Card Footer',
            icon: <span>Icon</span>,
            onClick,
            testId: 'card-item',
          },
        ]}
      />
    )

    expect(screen.getByText('Card Title')).toBeInTheDocument()
    expect(screen.getByText('Card Subtitle')).toBeInTheDocument()
    expect(screen.getByText('Card Body')).toBeInTheDocument()
    expect(screen.getByText('Card Footer')).toBeInTheDocument()
    expect(screen.getByText('Icon')).toBeInTheDocument()

    fireEvent.click(screen.getByTestId('card-item'))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  test('invokes onClick from keyboard activation', () => {
    const onClick = vi.fn()
    render(
      <CardList
        items={[
          {
            id: 'card-1',
            title: 'Card Title',
            onClick,
            testId: 'card-item',
          },
        ]}
      />
    )

    const card = screen.getByTestId('card-item')
    fireEvent.keyDown(card, { key: 'Enter' })
    fireEvent.keyDown(card, { key: ' ' })
    fireEvent.keyDown(card, { key: 'Tab' })

    expect(onClick).toHaveBeenCalledTimes(2)
  })

  test('ignores non-activation keys when handler provided', () => {
    const onClick = vi.fn()
    render(
      <CardList
        items={[
          {
            id: 'card-3',
            title: 'Card Title',
            onClick,
            testId: 'keyboard-card',
          },
        ]}
      />
    )

    const card = screen.getByTestId('keyboard-card')
    fireEvent.keyDown(card, { key: 'Escape' })

    expect(onClick).not.toHaveBeenCalled()
  })

  test('renders non-interactive card without optional content', () => {
    render(
      <CardList
        items={[
          {
            id: 'card-2',
            title: 'Plain Title',
            testId: 'plain-card',
          },
        ]}
      />
    )

    const card = screen.getByTestId('plain-card')
    expect(card.getAttribute('role')).toBeNull()
    expect(card.getAttribute('tabIndex')).toBeNull()
    fireEvent.keyDown(card, { key: 'Enter' })
    expect(screen.queryByText('Card Subtitle')).toBeNull()
    expect(screen.queryByText('Card Body')).toBeNull()
    expect(screen.queryByText('Card Footer')).toBeNull()
  })
})
