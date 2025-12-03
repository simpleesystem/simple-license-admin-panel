import {
  UI_ARIA_LABEL_SUMMARY_LIST,
  UI_CLASS_SUMMARY_CARD,
  UI_CLASS_SUMMARY_LIST,
  UI_CLASS_SUMMARY_VALUE,
  UI_CLASS_TEXT_MUTED,
  UI_TEST_ID_SUMMARY_LIST,
} from '../constants'
import type { SummaryListProps } from '../types'
import { composeClassNames } from '../utils/classNames'
import { VisibilityGate } from '../utils/PermissionGate'

export function SummaryList({
  items,
  className,
  testId,
  ability,
  permissionKey,
  permissionFallback,
}: SummaryListProps) {
  return (
    <VisibilityGate ability={ability} permissionKey={permissionKey} permissionFallback={permissionFallback}>
      <section
        className={composeClassNames(UI_CLASS_SUMMARY_LIST, className)}
        data-testid={testId ?? UI_TEST_ID_SUMMARY_LIST}
        role="list"
        aria-label={UI_ARIA_LABEL_SUMMARY_LIST}
      >
        {items.map((item) => (
          <div key={item.id} role="presentation">
            <article
              className={UI_CLASS_SUMMARY_CARD}
              data-testid={item.testId}
              role="listitem"
              aria-labelledby={`${item.id}-summary-label`}
            >
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className={UI_CLASS_TEXT_MUTED} id={`${item.id}-summary-label`}>
                  {item.label}
                </span>
                {item.icon}
              </div>
              <strong className={UI_CLASS_SUMMARY_VALUE}>{item.value}</strong>
              {item.trend ? <div className={UI_CLASS_TEXT_MUTED}>{item.trend}</div> : null}
            </article>
          </div>
        ))}
      </section>
    </VisibilityGate>
  )
}



