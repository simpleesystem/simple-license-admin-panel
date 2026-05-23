import type { ReactNode } from 'react'
import Button from 'react-bootstrap/Button'

import { UI_BUTTON_VARIANT_SECONDARY, UI_CLASS_TABLE_CONTROL_GROUP, UI_TABLE_REFRESH_LABEL } from '../constants'
import { TableSearchInput } from './TableSearchInput'
import { TableToolbar } from './TableToolbar'

export type TableControlsSearch = {
  label?: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
}

export type TableControlsProps = {
  search?: TableControlsSearch
  filters?: ReactNode
  batch?: ReactNode
  refresh?: {
    onClick: () => void
    disabled?: boolean
    label?: string
  }
  actions?: ReactNode
}

export function TableControls({ search, filters, batch, refresh, actions }: TableControlsProps) {
  const toolbarActions =
    refresh || actions ? (
      <>
        {refresh ? (
          <Button variant={UI_BUTTON_VARIANT_SECONDARY} onClick={refresh.onClick} disabled={refresh.disabled}>
            {refresh.label ?? UI_TABLE_REFRESH_LABEL}
          </Button>
        ) : null}
        {actions}
      </>
    ) : null

  return (
    <>
      {batch}
      <TableToolbar
        start={
          <div className={UI_CLASS_TABLE_CONTROL_GROUP}>
            {search ? <TableSearchInput {...search} /> : null}
            {filters}
          </div>
        }
        end={toolbarActions}
      />
    </>
  )
}
