import type { ReactNode } from 'react'

import { UI_CLASS_TABLE_CONTROL_GROUP } from '../constants'
import { TableSearchInput } from './TableSearchInput'
import { TableToolbar } from './TableToolbar'

export type TableControlsSearch = {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
}

export type TableControlsProps = {
  search?: TableControlsSearch
  filters?: ReactNode
  actions?: ReactNode
}

export function TableControls({ search, filters, actions }: TableControlsProps) {
  return (
    <TableToolbar
      start={
        <div className={UI_CLASS_TABLE_CONTROL_GROUP}>
          {search ? <TableSearchInput {...search} /> : null}
          {filters}
        </div>
      }
      end={actions}
    />
  )
}
