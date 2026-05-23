import { UI_TABLE_PAGE_SIZE_LABEL, UI_TABLE_PAGE_SIZE_OPTIONS } from '../constants'
import { TablePaginationFooter, type TablePaginationFooterProps } from './TablePaginationFooter'

type StandardTablePaginationFooterProps = Omit<TablePaginationFooterProps, 'pageSizeOptions' | 'pageSizeLabel'> & {
  enabled?: boolean
  pageSizeOptions?: readonly number[]
  pageSizeLabel?: string
}

export function StandardTablePaginationFooter({
  enabled = true,
  pageSizeOptions = UI_TABLE_PAGE_SIZE_OPTIONS,
  pageSizeLabel = UI_TABLE_PAGE_SIZE_LABEL,
  ...props
}: StandardTablePaginationFooterProps) {
  if (!enabled) {
    return null
  }

  return <TablePaginationFooter {...props} pageSizeOptions={pageSizeOptions} pageSizeLabel={pageSizeLabel} />
}
