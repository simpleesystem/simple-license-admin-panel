import {
  UI_ARIA_LABEL_SUMMARY_LIST,
  UI_CLASS_FLEX_COLUMN_GAP_SMALL,
  UI_CLASS_SUMMARY_CARD,
  UI_CLASS_SUMMARY_HEADER,
  UI_CLASS_SUMMARY_LIST,
  UI_CLASS_SUMMARY_MULTILINE,
  UI_CLASS_SUMMARY_MULTILINE_CODE,
  UI_CLASS_SUMMARY_VALUE,
  UI_CLASS_TEXT_MUTED,
  UI_STYLE_SUMMARY_MULTILINE,
  UI_TEST_ID_SUMMARY_LIST,
  UI_VALUE_SEPARATOR,
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
      <ul
        className={composeClassNames(UI_CLASS_SUMMARY_LIST, className)}
        data-testid={testId ?? UI_TEST_ID_SUMMARY_LIST}
        aria-label={UI_ARIA_LABEL_SUMMARY_LIST}
      >
        {items.map((item) => (
          <li key={item.id}>
            <article
              className={UI_CLASS_SUMMARY_CARD}
              data-testid={item.testId}
              aria-labelledby={`${item.id}-summary-label`}
            >
              <div className={UI_CLASS_SUMMARY_HEADER}>
                <span className={UI_CLASS_TEXT_MUTED} id={`${item.id}-summary-label`}>
                  {item.label}
                </span>
                {item.icon}
              </div>
              {typeof item.value === 'string' && item.value.includes('\n') ? (
                <pre className={UI_CLASS_SUMMARY_MULTILINE} style={UI_STYLE_SUMMARY_MULTILINE}>
                  <code className={UI_CLASS_SUMMARY_MULTILINE_CODE}>{item.value}</code>
                </pre>
              ) : typeof item.value === 'string' && item.value.includes(UI_VALUE_SEPARATOR) ? (
                <div className={UI_CLASS_FLEX_COLUMN_GAP_SMALL}>
                  {item.value.split(UI_VALUE_SEPARATOR).map((part, index) => (
                    <strong key={`${item.id}-${index}`} className={UI_CLASS_SUMMARY_VALUE}>
                      {part.trim()}
                    </strong>
                  ))}
                </div>
              ) : (
                <strong className={UI_CLASS_SUMMARY_VALUE}>{item.value}</strong>
              )}
              {item.trend ? <div className={UI_CLASS_TEXT_MUTED}>{item.trend}</div> : null}
            </article>
          </li>
        ))}
      </ul>
    </VisibilityGate>
  )
}
