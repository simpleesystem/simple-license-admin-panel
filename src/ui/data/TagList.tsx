import Badge from 'react-bootstrap/Badge'

import {
  UI_ARIA_LABEL_TAG_LIST,
  UI_CLASS_TAG_LIST,
  UI_TAG_VARIANT_NEUTRAL,
  UI_TEST_ID_TAG_LIST,
} from '../constants'
import type { TagListProps } from '../types'
import { composeClassNames } from '../utils/classNames'
import { VisibilityGate } from '../utils/PermissionGate'

export function TagList({
  tags,
  className,
  testId,
  ability,
  permissionKey,
  permissionFallback,
}: TagListProps) {
  return (
    <VisibilityGate ability={ability} permissionKey={permissionKey} permissionFallback={permissionFallback}>
      <ul
        className={composeClassNames(UI_CLASS_TAG_LIST, className)}
        data-testid={testId ?? UI_TEST_ID_TAG_LIST}
        aria-label={UI_ARIA_LABEL_TAG_LIST}
      >
        {tags.map((tag) => (
          <li key={tag.id}>
            <Badge bg={tag.variant ?? UI_TAG_VARIANT_NEUTRAL}>{tag.label}</Badge>
          </li>
        ))}
      </ul>
    </VisibilityGate>
  )
}
