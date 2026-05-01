import type { ChangeEvent, ReactNode } from 'react'
import { useId } from 'react'
import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'

import {
  UI_BUTTON_VARIANT_SECONDARY,
  UI_TABLE_PAGE_STATUS_SEPARATOR,
  UI_TABLE_PAGINATION_LABEL,
  UI_TABLE_PAGINATION_NEXT,
  UI_TABLE_PAGINATION_PREVIOUS,
} from '../constants'

export type TablePaginationFooterProps = {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
  pageSize?: number
  pageSizeOptions?: readonly number[]
  onPageSizeChange?: (size: number) => void
  pageSizeLabel?: string
  summary?: ReactNode
}

export function TablePaginationFooter({
  page,
  totalPages,
  onPageChange,
  pageSize,
  pageSizeOptions,
  onPageSizeChange,
  pageSizeLabel,
  summary,
}: TablePaginationFooterProps) {
  const safeTotalPages = Math.max(1, totalPages)
  const safePage = Math.min(Math.max(1, page), safeTotalPages)
  const pageSizeId = useId()

  const showPageSize = Boolean(pageSize !== undefined && pageSizeOptions?.length && onPageSizeChange)

  const handlePageSizeChange = (event: ChangeEvent<HTMLSelectElement>) => {
    onPageSizeChange?.(Number(event.currentTarget.value))
  }

  return (
    <nav
      className="d-flex flex-column flex-lg-row align-items-start align-items-lg-center justify-content-between gap-3"
      aria-label={UI_TABLE_PAGINATION_LABEL}
    >
      {showPageSize || summary ? (
        <div className="d-flex flex-wrap align-items-center gap-2">
          {showPageSize ? (
            <>
              {pageSizeLabel ? (
                <Form.Label htmlFor={pageSizeId} className="mb-0 small text-muted">
                  {pageSizeLabel}
                </Form.Label>
              ) : null}
              <Form.Select
                id={pageSizeId}
                size="sm"
                value={pageSize}
                onChange={handlePageSizeChange}
                className="w-auto"
              >
                {pageSizeOptions?.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </Form.Select>
            </>
          ) : null}
          {summary ? <span className="text-muted small">{summary}</span> : null}
        </div>
      ) : null}

      <div className="d-flex flex-wrap align-items-center gap-2 ms-lg-auto">
        <Button
          variant={UI_BUTTON_VARIANT_SECONDARY}
          onClick={() => onPageChange(safePage - 1)}
          disabled={safePage <= 1}
        >
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
      </div>
    </nav>
  )
}
