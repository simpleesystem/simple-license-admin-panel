import { Button, ButtonGroup } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'

import { useFeatureFlag } from '../config'
import {
  I18N_KEY_DEV_PERSONA_SUPERUSER,
  I18N_KEY_DEV_PERSONA_SUPPORT,
  I18N_KEY_DEV_PERSONA_VIEWER,
  I18N_KEY_DEV_TOOLBAR_HEADING,
  I18N_KEY_DEV_TOOLBAR_RESET,
  TEST_ID_DEV_TOOLBAR,
} from '../constants'
import { DEV_PERSONA_SUPERUSER, DEV_PERSONA_SUPPORT, DEV_PERSONA_VIEWER } from './constants'
import { applyDevPersona, canUseDevTools, clearDevPersona, DEV_PERSONA_KEYS, type DevPersonaKey } from './devScenarios'

export function DevToolbar() {
  const { t } = useTranslation()
  const enableDevTools = useFeatureFlag('enableDevTools')

  if (!canUseDevTools(enableDevTools)) {
    return null
  }

  const personaLabelMap: Record<DevPersonaKey, string> = {
    [DEV_PERSONA_SUPERUSER]: t(I18N_KEY_DEV_PERSONA_SUPERUSER),
    [DEV_PERSONA_SUPPORT]: t(I18N_KEY_DEV_PERSONA_SUPPORT),
    [DEV_PERSONA_VIEWER]: t(I18N_KEY_DEV_PERSONA_VIEWER),
  }

  return (
    <div
      className="position-fixed bottom-0 end-0 m-3 p-3 bg-body border rounded shadow-sm small"
      data-testid={TEST_ID_DEV_TOOLBAR}
    >
      <div className="d-flex flex-column gap-2">
        <strong>{t(I18N_KEY_DEV_TOOLBAR_HEADING)}</strong>
        <ButtonGroup size="sm">
          {DEV_PERSONA_KEYS.map((persona) => (
            <Button key={persona} variant="outline-primary" onClick={() => applyDevPersona(persona)}>
              {personaLabelMap[persona]}
            </Button>
          ))}
          <Button variant="outline-danger" onClick={clearDevPersona}>
            {t(I18N_KEY_DEV_TOOLBAR_RESET)}
          </Button>
        </ButtonGroup>
      </div>
    </div>
  )
}
