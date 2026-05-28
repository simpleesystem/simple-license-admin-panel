export const ZERO_METRIC_COLLAPSE_MODE_KEEP_FIRST = 'keep-first' as const
export const ZERO_METRIC_COLLAPSE_MODE_KEEP_LAST = 'keep-last' as const
export const ZERO_METRIC_COLLAPSE_MODE_SUMMARY_ROW = 'summary-row' as const

export type ZeroMetricCollapseMode =
  | typeof ZERO_METRIC_COLLAPSE_MODE_KEEP_FIRST
  | typeof ZERO_METRIC_COLLAPSE_MODE_KEEP_LAST
  | typeof ZERO_METRIC_COLLAPSE_MODE_SUMMARY_ROW

type ZeroMetricRunDescriptor<TRow> = {
  runLength: number
  firstRow: TRow
  lastRow: TRow
  runRows: readonly TRow[]
}

type CollapseZeroMetricRunsOptions<TRow> = {
  mode?: ZeroMetricCollapseMode
  createSummaryRow?: (run: ZeroMetricRunDescriptor<TRow>) => TRow
}

export const collapseZeroMetricRuns = <TRow>(
  rows: readonly TRow[],
  isZeroMetricsRow: (row: TRow) => boolean,
  options?: CollapseZeroMetricRunsOptions<TRow>
): readonly TRow[] => {
  const mode = options?.mode ?? ZERO_METRIC_COLLAPSE_MODE_KEEP_FIRST
  if (mode === ZERO_METRIC_COLLAPSE_MODE_KEEP_LAST) {
    const reversedRows = rows.slice().reverse()
    const reversedCollapsedRows = collapseZeroMetricRuns(reversedRows, isZeroMetricsRow, {
      mode: ZERO_METRIC_COLLAPSE_MODE_KEEP_FIRST,
    })
    return [...reversedCollapsedRows].reverse()
  }

  if (mode === ZERO_METRIC_COLLAPSE_MODE_SUMMARY_ROW) {
    const collapsed: TRow[] = []
    let cursor = 0

    while (cursor < rows.length) {
      const row = rows[cursor]
      if (row === undefined) {
        break
      }

      if (!isZeroMetricsRow(row)) {
        collapsed.push(row)
        cursor += 1
        continue
      }

      const runStart = cursor
      while (cursor < rows.length && isZeroMetricsRow(rows[cursor] as TRow)) {
        cursor += 1
      }

      const runRows = rows.slice(runStart, cursor)
      const firstRow = runRows[0]
      const lastRow = runRows[runRows.length - 1]
      if (!firstRow || !lastRow) {
        continue
      }

      if (runRows.length <= 1 || !options?.createSummaryRow) {
        collapsed.push(lastRow)
        continue
      }

      collapsed.push(
        options.createSummaryRow({
          runLength: runRows.length,
          firstRow,
          lastRow,
          runRows,
        })
      )
    }

    return collapsed
  }

  const collapsed: TRow[] = []
  let previousWasZeroMetricsRow = false

  for (const row of rows) {
    const isZeroRow = isZeroMetricsRow(row)
    if (isZeroRow && previousWasZeroMetricsRow) {
      continue
    }

    collapsed.push(row)
    previousWasZeroMetricsRow = isZeroRow
  }

  return collapsed
}
