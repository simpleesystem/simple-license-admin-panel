import Button from 'react-bootstrap/Button'

import {
  UI_BUTTON_VARIANT_SECONDARY,
  UI_TABLE_PAGE_STATUS_SEPARATOR,
  UI_TABLE_PAGINATION_LABEL,
  UI_TABLE_PAGINATION_NEXT,
  UI_TABLE_PAGINATION_PREVIOUS,
} from '../constants'
import { Stack } from '../layout/Stack'

export type TablePaginationFooterProps = {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function TablePaginationFooter({ page, totalPages, onPageChange }: TablePaginationFooterProps) {
  const safeTotalPages = Math.max(1, totalPages)
  const safePage = Math.min(Math.max(1, page), safeTotalPages)

  return (
    <Stack direction="row" gap="small" justify="end" aria-label={UI_TABLE_PAGINATION_LABEL}>
      <Button variant={UI_BUTTON_VARIANT_SECONDARY} onClick={() => onPageChange(safePage - 1)} disabled={safePage <= 1}>
        {UI_TABLE_PAGINATION_PREVIOUS}
      </Button>
      <div className="d-flex align-items-center px-2">
        <span>
          {safePage} {UI_TABLE_PAGE_STATUS_SEPARATOR} {safeTotalPages}
        </span>
      </div>
      <Button
        variant={UI_BUTTON_VARIANT_SECONDARY}
        onClick={() => onPageChange(safePage + 1)}
        disabled={safePage >= safeTotalPages}
      >
        {UI_TABLE_PAGINATION_NEXT}
      </Button>
    </Stack>
  )
}
