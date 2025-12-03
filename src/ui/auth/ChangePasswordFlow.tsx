import { useMemo, useState } from 'react'
import Button from 'react-bootstrap/Button'
import Card from 'react-bootstrap/Card'
import Joi from 'joi'

import { useChangePassword } from '@simple-license/react-sdk'

import { AppForm } from '../../forms/Form'
import { useApiClient } from '../../api/apiContext'
import { InlineAlert } from '../feedback/InlineAlert'
import { FormSection } from '../forms/FormSection'
import { TextField } from '../forms/TextField'
import { FormActions } from '../forms/FormActions'
import { UI_FORM_CONTROL_TYPE_PASSWORD } from '../constants'

type ChangePasswordValues = {
  current_password: string
  new_password: string
  confirm_new_password: string
}

const DEFAULT_VALUES: ChangePasswordValues = {
  current_password: '',
  new_password: '',
  confirm_new_password: '',
}

const buildSchema = () =>
  Joi.object<ChangePasswordValues>({
    current_password: Joi.string().required().label('Current password'),
    new_password: Joi.string().min(8).required().label('New password'),
    confirm_new_password: Joi.any()
      .valid(Joi.ref('new_password'))
      .required()
      .messages({
        'any.only': 'Passwords must match',
        'any.required': 'Please confirm your password',
      }),
  })

type ChangePasswordFlowProps = {
  onSuccess?: () => void
}

export function ChangePasswordFlow({ onSuccess }: ChangePasswordFlowProps) {
  const client = useApiClient()
  const mutation = useChangePassword(client)
  const schema = useMemo(() => buildSchema(), [])
  const [submitError, setSubmitError] = useState<string | null>(null)

  const handleSubmit = async (values: ChangePasswordValues) => {
    try {
      setSubmitError(null)
      await mutation.mutateAsync({
        current_password: values.current_password,
        new_password: values.new_password,
      })
      onSuccess?.()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to update password'
      setSubmitError(message)
      throw error
    }
  }

  return (
    <Card>
      <Card.Body>
        <h1 className="h4 mb-3">Update your password</h1>
        <p className="text-muted mb-4">Your organization requires a password change before continuing.</p>

        {submitError ? (
          <div className="mb-3">
            <InlineAlert variant="danger" title="Password update failed">
              {submitError}
            </InlineAlert>
          </div>
        ) : null}

        <AppForm<ChangePasswordValues> schema={schema} defaultValues={DEFAULT_VALUES} onSubmit={handleSubmit}>
          <FormSection title="Security" description="Provide your current password and a new one that meets policy.">
            <TextField<ChangePasswordValues>
              name="current_password"
              label="Current password"
              type={UI_FORM_CONTROL_TYPE_PASSWORD}
              required
              autoComplete="current-password"
            />
            <TextField<ChangePasswordValues>
              name="new_password"
              label="New password"
              type={UI_FORM_CONTROL_TYPE_PASSWORD}
              required
              autoComplete="new-password"
            />
            <TextField<ChangePasswordValues>
              name="confirm_new_password"
              label="Confirm new password"
              type={UI_FORM_CONTROL_TYPE_PASSWORD}
              required
              autoComplete="new-password"
            />
          </FormSection>

          <FormActions>
            <Button type="submit" variant="primary" disabled={mutation.isPending}>
              {mutation.isPending ? 'Updating…' : 'Update password'}
            </Button>
          </FormActions>
        </AppForm>
      </Card.Body>
    </Card>
  )
}


