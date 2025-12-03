import {
  UI_CLASS_KEY_VALUE_ITEM,
  UI_CLASS_KEY_VALUE_LABEL,
  UI_CLASS_KEY_VALUE_LIST,
  UI_CLASS_KEY_VALUE_VALUE,
  UI_CLASS_TEXT_EMPHASIS,
  UI_TEST_ID_KEY_VALUE_LIST,
  UI_TEST_ID_KEY_VALUE_ITEM,
} from '../constants'
import type { KeyValueListProps } from '../types'
import { composeClassNames } from '../utils/classNames'
import { VisibilityGate } from '../utils/PermissionGate'

export function KeyValueList({
  items,
  className,
  testId,
  ability,
  permissionKey,
  permissionFallback,
}: KeyValueListProps) {
  return (
    <VisibilityGate ability={ability} permissionKey={permissionKey} permissionFallback={permissionFallback}>
      <dl className={composeClassNames(UI_CLASS_KEY_VALUE_LIST, className)} data-testid={testId ?? UI_TEST_ID_KEY_VALUE_LIST}>
        {items.map((item) => (
          <div key={item.id} className={UI_CLASS_KEY_VALUE_ITEM} data-testid={UI_TEST_ID_KEY_VALUE_ITEM}>
            <dt className={UI_CLASS_KEY_VALUE_LABEL}>{item.label}</dt>
            <dd className={composeClassNames(UI_CLASS_KEY_VALUE_VALUE, item.emphasize ? UI_CLASS_TEXT_EMPHASIS : undefined)}>
              {item.value}
            </dd>
          </div>
        ))}
      </dl>
    </VisibilityGate>
  )
}



