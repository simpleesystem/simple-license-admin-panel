export type Lifecycle = {
  readonly signal: AbortSignal
  addCleanup: (cleanup: () => void) => void
  addAbortListener: (listener: () => void) => void
  dispose: () => void
}

export const createLifecycle = (): Lifecycle => {
  let controller = new AbortController()

  const addCleanup = (cleanup: () => void) => {
    controller.signal.addEventListener(
      'abort',
      () => {
        try {
          cleanup()
        } catch {
          // swallow cleanup errors to avoid abort cascade issues
        }
      },
      { once: true }
    )
  }

  const addAbortListener = (listener: () => void) => {
    controller.signal.addEventListener('abort', listener, { once: true })
  }

  const dispose = () => {
    if (!controller.signal.aborted) {
      controller.abort()
    }
    controller = new AbortController()
  }

  return {
    get signal() {
      return controller.signal
    },
    addCleanup,
    addAbortListener,
    dispose,
  }
}













