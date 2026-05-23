import { useState } from 'react'
import Button from 'react-bootstrap/Button'

import {
  UI_BUTTON_VARIANT_OUTLINE_DANGER,
  UI_BUTTON_VARIANT_OUTLINE_SECONDARY,
  UI_BUTTON_VARIANT_SECONDARY,
  UI_CLASS_TABLE_BATCH_ACTIONS,
  UI_CLASS_TABLE_BATCH_META,
  UI_TABLE_BATCH_CLEAR_SELECTION,
  UI_TABLE_BATCH_HINT,
  UI_TABLE_BATCH_SELECTED_COUNT_LABEL,
} from '../constants'
import { ModalDialog } from '../overlay/ModalDialog'
import type { UiTableBatchAction } from '../types'
import { composeClassNames } from '../utils/classNames'

export type TableBatchActionsProps<TData> = {
  selectedCount: number
  selectedRows: readonly TData[]
  actions: readonly UiTableBatchAction<TData>[]
  onClearSelection: () => void
  className?: string
}

export function TableBatchActions<TData>({
  selectedCount,
  selectedRows,
  actions,
  onClearSelection,
  className,
}: TableBatchActionsProps<TData>) {
  const [pendingActionId, setPendingActionId] = useState<string | null>(null)
  const [confirmAction, setConfirmAction] = useState<UiTableBatchAction<TData> | null>(null)

  if (selectedCount === 0) {
    return (
      <output className={composeClassNames(UI_CLASS_TABLE_BATCH_ACTIONS, className)} aria-live="polite">
        <span className={UI_CLASS_TABLE_BATCH_META}>{UI_TABLE_BATCH_HINT}</span>
      </output>
    )
  }

  const handleConfirm = async () => {
    if (!confirmAction) {
      return
    }
    setPendingActionId(confirmAction.id)
    try {
      await confirmAction.onExecute(selectedRows)
      onClearSelection()
    } finally {
      setPendingActionId(null)
      setConfirmAction(null)
    }
  }

  return (
    <fieldset className={composeClassNames(UI_CLASS_TABLE_BATCH_ACTIONS, className)} aria-live="polite">
      <span className={UI_CLASS_TABLE_BATCH_META}>
        {selectedCount} {UI_TABLE_BATCH_SELECTED_COUNT_LABEL}
      </span>
      {actions.map((action) => {
        const isPending = pendingActionId === action.id
        const variant = action.variant ?? UI_BUTTON_VARIANT_OUTLINE_DANGER
        return (
          <Button
            key={action.id}
            variant={variant}
            size="sm"
            disabled={action.disabled || isPending}
            onClick={() => setConfirmAction(action)}
          >
            {isPending && action.pendingLabel ? action.pendingLabel : action.label}
          </Button>
        )
      })}
      <Button variant={UI_BUTTON_VARIANT_OUTLINE_SECONDARY} size="sm" onClick={onClearSelection}>
        {UI_TABLE_BATCH_CLEAR_SELECTION}
      </Button>

      {confirmAction ? (
        <ModalDialog
          show={Boolean(confirmAction)}
          onClose={() => setConfirmAction(null)}
          title={confirmAction.confirmTitle}
          body={confirmAction.confirmBody}
          primaryAction={{
            id: `${confirmAction.id}-confirm`,
            label:
              pendingActionId === confirmAction.id && confirmAction.pendingLabel
                ? confirmAction.pendingLabel
                : confirmAction.confirmLabel,
            onClick: () => {
              void handleConfirm()
            },
            disabled: pendingActionId === confirmAction.id,
            variant: confirmAction.variant === 'danger' ? 'danger' : UI_BUTTON_VARIANT_OUTLINE_DANGER,
          }}
          secondaryAction={{
            id: `${confirmAction.id}-cancel`,
            label: confirmAction.cancelLabel,
            onClick: () => setConfirmAction(null),
            variant: UI_BUTTON_VARIANT_SECONDARY,
          }}
        />
      ) : null}
    </fieldset>
  )
}
