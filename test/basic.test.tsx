/**
 * Basic Sanity Tests
 * Verifies that the application can start and basic React functionality works
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from '@/App'

describe('Application Startup', () => {
  it('should render the application without crashing', () => {
    render(<App />)
    expect(document.body).toBeInTheDocument()
  })

  it('should render the main App component', () => {
    const { container } = render(<App />)
    expect(container).toBeInTheDocument()
  })
})

describe('React Functionality', () => {
  it('should support React rendering', () => {
    render(<App />)
    const heading = screen.getByRole('heading', { name: /vite \+ react/i })
    expect(heading).toBeInTheDocument()
  })

  it('should support user interactions', async () => {
    const userEvent = (await import('@testing-library/user-event')).default

    render(<App />)
    const button = screen.getByRole('button', { name: /count is/i })
    expect(button).toBeInTheDocument()

    const user = userEvent.setup()
    await user.click(button)
    expect(button).toHaveTextContent(/count is 1/i)
  })
})

describe('Environment Configuration', () => {
  it('should have jsdom environment configured', () => {
    expect(window).toBeDefined()
    expect(document).toBeDefined()
  })

  it('should support DOM queries', () => {
    const { container } = render(<App />)
    expect(container).toBeInTheDocument()
    expect(container.querySelector('h1')).toBeInTheDocument()
  })
})

