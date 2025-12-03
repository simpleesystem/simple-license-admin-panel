import type { FieldValues } from 'react-hook-form'
import type { ReactNode } from 'react'

import type { ModalDialogProps } from '../types'
import { ModalDialog } from '../overlay/ModalDialog'
import { DynamicForm } from './DynamicForm'
import type { FormBlueprint } from './blueprint'

export type FormModalProps<TFieldValues extends FieldValues> = Omit<
  ModalDialogProps,
  'body' | 'footer' | 'primaryAction' | 'secondaryAction'
> & {
  blueprint: FormBlueprint<TFieldValues>
  defaultValues: TFieldValues
  onSubmit: (values: TFieldValues) => Promise<void> | void
  submitLabel: ReactNode
  pendingLabel?: ReactNode
  cancelLabel?: ReactNode
  closeOnSubmit?: boolean
  secondaryActions?: ReactNode
}

export function FormModal<TFieldValues extends FieldValues>({
  blueprint,
  defaultValues,
  onSubmit,
  submitLabel,
  pendingLabel,
  cancelLabel,
  closeOnSubmit = true,
  secondaryActions,
  title,
  onClose,
  ...modalProps
}: FormModalProps<TFieldValues>) {
  const handleSubmit = async (values: TFieldValues) => {
    await onSubmit(values)
    if (closeOnSubmit) {
      onClose()
    }
  }

  return (
    <ModalDialog
      {...modalProps}
      onClose={onClose}
      title={title ?? blueprint.title}
      body={
        <DynamicForm
          blueprint={blueprint}
          defaultValues={defaultValues}
          onSubmit={handleSubmit}
          submitLabel={submitLabel}
          pendingLabel={pendingLabel}
          cancelLabel={cancelLabel}
          onCancel={onClose}
          secondaryActions={secondaryActions}
        />
      }
      footer={null}
    />
  )
}


