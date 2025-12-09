import { useEffect, useRef } from 'react'
import { Toaster, toast } from 'react-hot-toast'

import { selectLatestError, useAppStore } from './store'

export function SurfaceRenderer() {
  const error = useAppStore(selectLatestError)
  const lastId = useRef<string | null>(null)

  useEffect(() => {
    if (!error) {
      if (lastId.current) {
        toast.dismiss(lastId.current)
        lastId.current = null
      }
      return
    }
    const id = toast.error(error.message, {
      id: error.correlationId ?? error.code,
    })
    lastId.current = id
  }, [error])

  return <Toaster />
}
