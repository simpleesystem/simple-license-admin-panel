import {
  ACCESS_AUTHORIZATION_DENIED_ACTION,
  ACCESS_AUTHORIZATION_DENIED_DESCRIPTION,
  ACCESS_AUTHORIZATION_DENIED_HEADING,
  ACCESS_LOGOUT_LABEL,
} from '@/app/constants'
import { ACCESS_LOGOUT_PATH } from '@/simpleLicense'
import {
  UI_CLASS_ALERT_DANGER,
  UI_CLASS_AUTH_FLOW_CARD,
  UI_CLASS_AUTH_FLOW_CARD_BODY,
  UI_CLASS_AUTH_FLOW_CONTAINER,
  UI_CLASS_BUTTON_PRIMARY_FULL_WIDTH,
  UI_STACK_GAP_LARGE,
} from '@/ui/constants'
import { Stack } from '@/ui/layout/Stack'
import { Heading } from '@/ui/typography/Heading'

interface AccessAuthorizationBarrierProps {
  errorMessage: string
}

export function AccessAuthorizationBarrier({ errorMessage }: AccessAuthorizationBarrierProps) {
  return (
    <main className={UI_CLASS_AUTH_FLOW_CONTAINER}>
      <div className={UI_CLASS_AUTH_FLOW_CARD}>
        <div className={UI_CLASS_AUTH_FLOW_CARD_BODY}>
          <Stack gap={UI_STACK_GAP_LARGE}>
            <Heading level={1}>{ACCESS_AUTHORIZATION_DENIED_HEADING}</Heading>
            <p>{ACCESS_AUTHORIZATION_DENIED_DESCRIPTION}</p>
            <div className={UI_CLASS_ALERT_DANGER} role="alert">
              {errorMessage}
            </div>
            <p>{ACCESS_AUTHORIZATION_DENIED_ACTION}</p>
            <a className={UI_CLASS_BUTTON_PRIMARY_FULL_WIDTH} href={ACCESS_LOGOUT_PATH}>
              {ACCESS_LOGOUT_LABEL}
            </a>
          </Stack>
        </div>
      </div>
    </main>
  )
}
