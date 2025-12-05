import type { ReactNode } from 'react'
import type { FieldValues } from 'react-hook-form'
import { ModalDialog } from '../overlay/ModalDialog'
import type { ModalDialogProps } from '../types'
import type { FormBlueprint } from './blueprint'
import { DynamicForm } from './DynamicForm'

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
    try {
      await onSubmit(values)
      if (closeOnSubmit) {
        onClose()
      }
    } catch (_error) {
      // Error already surfaced via mutation handler; keep modal open.
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
