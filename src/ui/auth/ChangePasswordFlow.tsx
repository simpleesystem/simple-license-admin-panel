import { ROUTE_PATH_DASHBOARD } from '@/app/constants'
import { useAppStore } from '@/app/state/store'
import {
  UI_CHANGE_PASSWORD_DESCRIPTION,
  UI_CHANGE_PASSWORD_HEADING,
  UI_CLASS_AUTH_FLOW_CARD,
  UI_CLASS_AUTH_FLOW_CARD_BODY,
  UI_CLASS_AUTH_FLOW_CONTAINER,
  UI_CLASS_AUTH_FLOW_ROW,
  UI_CLASS_MARGIN_BOTTOM_SMALL,
  UI_CLASS_SECTION_COLUMN_AUTH,
  UI_CLASS_TEXT_MUTED_MARGIN_BOTTOM_LARGE,
} from '@/ui/constants'
import { Heading } from '@/ui/typography/Heading'
import { ChangePasswordForm } from './ChangePasswordForm'

export function ChangePasswordFlow() {
  const dispatch = useAppStore((state) => state.dispatch)

  const handlePasswordChangeSuccess = () => {
    // Use navigation intent system to ensure router context is updated before navigation
    dispatch({
      type: 'nav/intent',
      payload: { to: ROUTE_PATH_DASHBOARD, replace: true },
    })
  }

  return (
    <div className={UI_CLASS_AUTH_FLOW_CONTAINER}>
      <div className={UI_CLASS_AUTH_FLOW_ROW}>
        <div className={UI_CLASS_SECTION_COLUMN_AUTH}>
          <div className={UI_CLASS_AUTH_FLOW_CARD}>
            <div className={UI_CLASS_AUTH_FLOW_CARD_BODY}>
              <Heading level={2} className={UI_CLASS_MARGIN_BOTTOM_SMALL}>
                {UI_CHANGE_PASSWORD_HEADING}
              </Heading>
              <p className={UI_CLASS_TEXT_MUTED_MARGIN_BOTTOM_LARGE}>{UI_CHANGE_PASSWORD_DESCRIPTION}</p>
              <ChangePasswordForm onSuccess={handlePasswordChangeSuccess} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
