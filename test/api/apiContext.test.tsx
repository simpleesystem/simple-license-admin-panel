import { render } from '@testing-library/react'
import { useEffect } from 'react'
import { vi } from 'vitest'

import { ERROR_MESSAGE_API_CONTEXT_UNAVAILABLE } from '../../src/app/constants'
import { ApiContext, useApiClient } from '../../src/api/apiContext'

const HookConsumer = ({ onCapture }: { onCapture: (client: unknown) => void }) => {
  const client = useApiClient()

  useEffect(() => {
    onCapture(client)
  }, [client, onCapture])

  return null
}

describe('ApiContext', () => {
  it('throws when the hook is used without a provider', () => {
    expect(() => render(<HookConsumer onCapture={vi.fn()} />)).toThrow(ERROR_MESSAGE_API_CONTEXT_UNAVAILABLE)
  })

  it('returns the provided client instance', () => {
    const mockClient = { identifier: 'client' }
    const handleCapture = vi.fn()
    render(
      <ApiContext.Provider value={mockClient as never}>
        <HookConsumer onCapture={handleCapture} />
      </ApiContext.Provider>,
    )

    expect(handleCapture).toHaveBeenCalledWith(mockClient)
  })
})
