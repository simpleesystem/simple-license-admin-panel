import { ROUTE_PATH_DASHBOARD } from '@/app/constants'
import { useAppStore } from '@/app/state/store'
import {
  UI_CHANGE_PASSWORD_DESCRIPTION,
  UI_CHANGE_PASSWORD_HEADING,
  UI_CLASS_MARGIN_BOTTOM_SMALL,
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
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-md-8 col-lg-6 col-xl-5">
          <div className="card shadow-sm">
            <div className="card-body p-4">
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
