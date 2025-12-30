import Button from 'react-bootstrap/Button'
import ButtonGroup from 'react-bootstrap/ButtonGroup'
import Dropdown from 'react-bootstrap/Dropdown'

import {
  UI_ACTION_MENU_TOGGLE_ICON,
  UI_ACTION_MENU_TOGGLE_LABEL,
  UI_CLASS_ACTION_MENU,
  UI_TEST_ID_ACTION_MENU,
} from '../constants'
import type { ActionMenuProps } from '../types'
import { composeClassNames } from '../utils/classNames'
import { VisibilityGate } from '../utils/PermissionGate'

const ALIGN_MAP: Record<NonNullable<ActionMenuProps['align']>, 'start' | 'end'> = {
  start: 'start',
  end: 'end',
}

const VARIANT_MAP: Record<NonNullable<ActionMenuProps['variant']>, string> = {
  primary: 'primary',
  secondary: 'secondary',
  'outline-secondary': 'outline-secondary',
  link: 'link',
}

export function ActionMenu({
  items,
  buttonLabel = UI_ACTION_MENU_TOGGLE_ICON,
  variant = 'link',
  size,
  align = 'end',
  ariaLabel,
  className,
  testId,
  ability,
  permissionKey,
  permissionFallback,
}: ActionMenuProps) {
  const isIconToggle = buttonLabel === UI_ACTION_MENU_TOGGLE_ICON
  const resolvedAriaLabel = ariaLabel ?? (isIconToggle ? UI_ACTION_MENU_TOGGLE_LABEL : undefined)

  return (
    <VisibilityGate ability={ability} permissionKey={permissionKey} permissionFallback={permissionFallback}>
      <Dropdown
        as={ButtonGroup}
        className={composeClassNames(UI_CLASS_ACTION_MENU, className)}
        data-testid={testId ?? UI_TEST_ID_ACTION_MENU}
        align={ALIGN_MAP[align]}
      >
        <Dropdown.Toggle
          as={Button}
          variant={VARIANT_MAP[variant]}
          size={size}
          aria-label={resolvedAriaLabel}
          data-testid={`${testId ?? UI_TEST_ID_ACTION_MENU}-toggle`}
        >
          {buttonLabel}
        </Dropdown.Toggle>
        <Dropdown.Menu>
          {items.map((item) => (
            <VisibilityGate
              key={item.id}
              ability={item.ability}
              permissionKey={item.permissionKey}
              permissionFallback={item.permissionFallback}
            >
              <Dropdown.Item
                as="button"
                type="button"
                disabled={item.disabled}
                onClick={() => item.onSelect()}
                data-testid={item.testId}
              >
                {item.icon ? <span className="me-2">{item.icon}</span> : null}
                <span>{item.label}</span>
              </Dropdown.Item>
            </VisibilityGate>
          ))}
        </Dropdown.Menu>
      </Dropdown>
    </VisibilityGate>
  )
}
