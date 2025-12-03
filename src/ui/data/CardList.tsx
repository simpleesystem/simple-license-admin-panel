import type { KeyboardEvent } from 'react'
import Card from 'react-bootstrap/Card'

import {
  UI_ARIA_LABEL_CARD_LIST,
  UI_CLASS_CARD_COLUMN_MAP,
  UI_CLASS_CARD_LIST_CARD,
  UI_CLASS_CARD_LIST_GRID,
  UI_CLASS_TEXT_MUTED,
  UI_TEST_ID_CARD_LIST,
  UI_FORM_ROW_COLUMNS_TWO,
} from '../constants'
import type { CardListProps } from '../types'
import { composeClassNames } from '../utils/classNames'
import { VisibilityGate } from '../utils/PermissionGate'

export function CardList({
  items,
  columns = UI_FORM_ROW_COLUMNS_TWO,
  className,
  testId,
  ability,
  permissionKey,
  permissionFallback,
}: CardListProps) {
  const handleCardKeyDown = (onClick: (() => void) | undefined) => (event: KeyboardEvent<HTMLDivElement>) => {
    if (!onClick) {
      return
    }
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onClick()
    }
  }

  return (
    <VisibilityGate ability={ability} permissionKey={permissionKey} permissionFallback={permissionFallback}>
      <div
        className={composeClassNames(UI_CLASS_CARD_LIST_GRID, className)}
        data-testid={testId ?? UI_TEST_ID_CARD_LIST}
        role="list"
        aria-label={UI_ARIA_LABEL_CARD_LIST}
      >
        {items.map((item) => (
          <div
            key={item.id}
            className={composeClassNames('col-12', UI_CLASS_CARD_COLUMN_MAP[columns])}
            role="listitem"
            aria-label={typeof item.title === 'string' ? item.title : undefined}
          >
            <Card
              className={UI_CLASS_CARD_LIST_CARD}
              onClick={item.onClick}
              role={item.onClick ? 'button' : undefined}
              tabIndex={item.onClick ? 0 : undefined}
              data-testid={item.testId}
              onKeyDown={handleCardKeyDown(item.onClick)}
            >
              <Card.Body>
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <Card.Title className="h5 mb-0">{item.title}</Card.Title>
                  {item.icon}
                </div>
                {item.subtitle ? <Card.Subtitle className={UI_CLASS_TEXT_MUTED}>{item.subtitle}</Card.Subtitle> : null}
                {item.body ? <Card.Text className="mt-3">{item.body}</Card.Text> : null}
              </Card.Body>
              {item.footer ? <Card.Footer>{item.footer}</Card.Footer> : null}
            </Card>
          </div>
        ))}
      </div>
    </VisibilityGate>
  )
}



