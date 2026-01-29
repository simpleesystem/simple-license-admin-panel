import { render } from '@testing-library/react'
import type { ReactElement } from 'react'
import { useLayoutEffect } from 'react'
import type { FieldValues } from 'react-hook-form'
import { FormProvider, useForm } from 'react-hook-form'

type RenderWithFormOptions<TFieldValues extends FieldValues> = {
  defaultValues: TFieldValues
}

export const renderWithForm = <TFieldValues extends FieldValues>(
  ui: ReactElement,
  options: RenderWithFormOptions<TFieldValues>
) => {
  const methodsRef: { current: ReturnType<typeof useForm<TFieldValues>> | null } = { current: null }

  const FormHost = () => {
    const methods = useForm<TFieldValues>({ defaultValues: options.defaultValues })
    useLayoutEffect(() => {
      methodsRef.current = methods
    }, [methods])
    return <FormProvider {...methods}>{ui}</FormProvider>
  }

  const renderResult = render(<FormHost />)

  if (!methodsRef.current) {
    throw new Error('Form methods were not initialized')
  }

  return {
    ...renderResult,
    form: methodsRef.current,
  }
}
