import Badge from 'react-bootstrap/Badge'
import Spinner from 'react-bootstrap/Spinner'

import {
  UI_ARIA_HIDDEN,
  UI_ARIA_LABEL_SECTION_STATUS,
  UI_ARIA_LIVE_POLITE,
  UI_BADGE_VARIANT_DANGER,
  UI_BADGE_VARIANT_INFO,
  UI_BADGE_VARIANT_SUCCESS,
  UI_BADGE_VARIANT_WARNING,
  UI_CLASS_ALERT_ACTIONS,
  UI_CLASS_INLINE_GAP,
  UI_CLASS_SECTION_STATUS,
  UI_CLASS_SECTION_STATUS_CONTENT,
  UI_CLASS_TEXT_MUTED,
  UI_SECTION_STATUS_ERROR,
  UI_SECTION_STATUS_INFO,
  UI_SECTION_STATUS_LOADING,
  UI_SECTION_STATUS_SUCCESS,
  UI_SECTION_STATUS_WARNING,
  UI_TEST_ID_SECTION_STATUS,
} from '../constants'
import type { SectionStatusProps, UiSectionStatusVariant } from '../types'
import { composeClassNames } from '../utils/classNames'
import { VisibilityGate } from '../utils/PermissionGate'

const STATUS_VARIANT_MAP: Record<Exclude<UiSectionStatusVariant, typeof UI_SECTION_STATUS_LOADING>, string> = {
  [UI_SECTION_STATUS_SUCCESS]: UI_BADGE_VARIANT_SUCCESS,
  [UI_SECTION_STATUS_INFO]: UI_BADGE_VARIANT_INFO,
  [UI_SECTION_STATUS_WARNING]: UI_BADGE_VARIANT_WARNING,
  [UI_SECTION_STATUS_ERROR]: UI_BADGE_VARIANT_DANGER,
}

export function SectionStatus({
  status,
  title,
  message,
  meta,
  actions,
  className,
  testId,
  ability,
  permissionKey,
  permissionFallback,
}: SectionStatusProps) {
  const isLoading = status === UI_SECTION_STATUS_LOADING
  const renderIndicator = () => {
    if (isLoading) {
      return <Spinner animation="border" size="sm" aria-hidden={UI_ARIA_HIDDEN} />
    }
    const badgeVariant = STATUS_VARIANT_MAP[status] ?? UI_BADGE_VARIANT_INFO
    return <Badge bg={badgeVariant}>{status}</Badge>
  }

  return (
    <VisibilityGate ability={ability} permissionKey={permissionKey} permissionFallback={permissionFallback}>
      <section
        className={composeClassNames(UI_CLASS_SECTION_STATUS, className)}
        data-testid={testId ?? UI_TEST_ID_SECTION_STATUS}
        role="status"
        aria-live={UI_ARIA_LIVE_POLITE}
        aria-busy={isLoading ? true : undefined}
        aria-label={UI_ARIA_LABEL_SECTION_STATUS}
      >
        <div className={UI_CLASS_INLINE_GAP}>{renderIndicator()}</div>
        <div className={UI_CLASS_SECTION_STATUS_CONTENT}>
          <strong>{title}</strong>
          {message ? <p className={UI_CLASS_TEXT_MUTED}>{message}</p> : null}
          {meta?.timestamp ? <p className={UI_CLASS_TEXT_MUTED}>{meta.timestamp}</p> : null}
          {meta?.helperText ? <p className={UI_CLASS_TEXT_MUTED}>{meta.helperText}</p> : null}
        </div>
        {actions ? <div className={UI_CLASS_ALERT_ACTIONS}>{actions}</div> : null}
      </section>
    </VisibilityGate>
  )
}



