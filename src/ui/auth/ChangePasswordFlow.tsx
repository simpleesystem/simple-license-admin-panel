import { useNavigate } from '@tanstack/react-router'
import { Heading } from '@/ui/typography/Heading'
import { ROUTE_PATH_DASHBOARD } from '@/app/constants'
import {
  UI_CHANGE_PASSWORD_HEADING,
  UI_CHANGE_PASSWORD_DESCRIPTION,
} from '@/ui/constants'
import { ChangePasswordForm } from './ChangePasswordForm'

export function ChangePasswordFlow() {
  const navigate = useNavigate()

  const handlePasswordChangeSuccess = async () => {
    await navigate({ to: ROUTE_PATH_DASHBOARD })
  }

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-md-8 col-lg-6 col-xl-5">
          <div className="card shadow-sm">
            <div className="card-body p-4">
              <Heading level={2} className="mb-2">{UI_CHANGE_PASSWORD_HEADING}</Heading>
              <p className="text-muted mb-4">{UI_CHANGE_PASSWORD_DESCRIPTION}</p>
              <ChangePasswordForm onSuccess={handlePasswordChangeSuccess} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
