import type { PropsWithChildren } from 'react'
import type { DefaultValues, FieldValues } from 'react-hook-form'
import { FormProvider, useForm } from 'react-hook-form'
import type { ObjectSchema } from 'joi'
import { joiResolver } from '@hookform/resolvers/joi'

import {
  FORM_REVALIDATION_MODE,
  FORM_VALIDATION_MODE,
} from '../app/constants'

type AppFormSubmitHandler<TFieldValues extends FieldValues> = (values: TFieldValues) => void | Promise<void>

type AppFormProps<TFieldValues extends FieldValues> = PropsWithChildren<{
  schema: ObjectSchema<TFieldValues>
  defaultValues: DefaultValues<TFieldValues>
  onSubmit: AppFormSubmitHandler<TFieldValues>
}>

export function AppForm<TFieldValues extends FieldValues>({
  schema,
  defaultValues,
  onSubmit,
  children,
}: AppFormProps<TFieldValues>) {
  const methods = useForm<TFieldValues>({
    defaultValues,
    resolver: joiResolver(schema),
    mode: FORM_VALIDATION_MODE,
    reValidateMode: FORM_REVALIDATION_MODE,
  })

  const handleSubmit = methods.handleSubmit(async (values) => {
    await onSubmit(values)
  })

  return (
    <FormProvider {...methods}>
      <form noValidate onSubmit={handleSubmit}>
        {children}
      </form>
    </FormProvider>
  )
}
