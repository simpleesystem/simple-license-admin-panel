import { useMutation, useQuery } from '@tanstack/react-query'
import Button from 'react-bootstrap/Button'
import { useAuth } from '@/app/auth/useAuth'
import { isSystemAdminUser } from '@/app/auth/userUtils'
import { type Client, QUERY_KEYS } from '@/simpleLicense'
import {
  EMAIL_AMBIGUOUS_CODES,
  EMAIL_OUTCOME_UNKNOWN,
  EMAIL_STATUS_UNAVAILABLE,
  type EmailTestResult,
} from '@/simpleLicense/email'
import { RefreshActionButton } from '../actions/RefreshActionButton'
import { UI_ARIA_LIVE_POLITE, UI_STACK_GAP_SMALL } from '../constants'
import { InlineAlert } from '../feedback/InlineAlert'
import { PanelHeader } from '../layout/PanelHeader'
import { Stack } from '../layout/Stack'
import {
  UI_EMAIL_ACCEPTED,
  UI_EMAIL_CHECKING,
  UI_EMAIL_DESCRIPTION,
  UI_EMAIL_DISABLED,
  UI_EMAIL_READY,
  UI_EMAIL_RECIPIENT,
  UI_EMAIL_REFERENCE,
  UI_EMAIL_REFRESH,
  UI_EMAIL_REFUSED,
  UI_EMAIL_REQUEST,
  UI_EMAIL_SEND,
  UI_EMAIL_SENDING,
  UI_EMAIL_STATUS_FAILED,
  UI_EMAIL_TITLE,
  UI_EMAIL_UNCONFIGURED,
  UI_EMAIL_UNKNOWN,
} from './emailDeliveryCopy'

function EmailTestOutcome({ result }: { result: EmailTestResult }) {
  const message = result.ok
    ? UI_EMAIL_ACCEPTED
    : EMAIL_AMBIGUOUS_CODES.has(result.code)
      ? UI_EMAIL_UNKNOWN
      : UI_EMAIL_REFUSED
  return (
    <InlineAlert variant={result.ok ? 'info' : 'warning'}>
      <p>{message}</p>
      {!result.ok && (
        <p>
          <code>{result.code}</code>
        </p>
      )}
      {result.reference && (
        <p>
          {UI_EMAIL_REFERENCE} <code>{result.reference}</code>
        </p>
      )}
      {result.requestId && (
        <p>
          {UI_EMAIL_REQUEST} <code>{result.requestId}</code>
        </p>
      )}
    </InlineAlert>
  )
}

function OperatorEmailDeliveryPanel({
  client,
  operatorId,
  email,
}: {
  client: Client
  operatorId: string
  email: string
}) {
  const status = useQuery({
    queryKey: QUERY_KEYS.adminSystem.email(operatorId),
    queryFn: () => client.getEmailDeliveryStatus(),
    retry: false,
    staleTime: 0,
    refetchOnWindowFocus: false,
    meta: { suppressErrorToast: true },
  })
  const test = useMutation({
    mutationFn: () => client.sendEmailDeliveryTest(),
    retry: false,
    meta: { suppressErrorToast: true },
  })
  const result = test.isError ? { ok: false, code: EMAIL_OUTCOME_UNKNOWN } : test.data
  const isUnknown = result && EMAIL_AMBIGUOUS_CODES.has(result.code)
  const statusMessage = status.isError
    ? UI_EMAIL_STATUS_FAILED
    : status.data?.configured
      ? UI_EMAIL_READY
      : status.data?.code === 'development_only'
        ? UI_EMAIL_DISABLED
        : UI_EMAIL_UNCONFIGURED
  return (
    <Stack direction="column" gap={UI_STACK_GAP_SMALL}>
      <PanelHeader
        title={UI_EMAIL_TITLE}
        description={UI_EMAIL_DESCRIPTION}
        actions={
          <RefreshActionButton
            onRefresh={() => {
              void status.refetch()
            }}
            isPending={status.isFetching}
            idleLabel={UI_EMAIL_REFRESH}
            pendingLabel={UI_EMAIL_CHECKING}
          />
        }
      />
      <div aria-live={UI_ARIA_LIVE_POLITE}>
        <p>{status.isPending ? UI_EMAIL_CHECKING : statusMessage}</p>
        {(status.isError || status.data?.configured === false) && (
          <p>
            <code>{status.isError ? EMAIL_STATUS_UNAVAILABLE : status.data?.code}</code>
          </p>
        )}
        {result && <EmailTestOutcome result={result} />}
      </div>
      <p>
        {UI_EMAIL_RECIPIENT} <strong>{email}</strong>
      </p>
      <div>
        <Button
          onClick={() => test.mutate()}
          disabled={
            !email ||
            !status.data?.configured ||
            status.isError ||
            status.isFetching ||
            test.isPending ||
            Boolean(isUnknown)
          }
          aria-busy={test.isPending}
        >
          {test.isPending ? UI_EMAIL_SENDING : UI_EMAIL_SEND}
        </Button>
      </div>
    </Stack>
  )
}

export function EmailDeliveryPanel({ client }: { client: Client }) {
  const { currentUser } = useAuth()
  if (!currentUser || !isSystemAdminUser(currentUser)) {
    return null
  }
  return (
    <OperatorEmailDeliveryPanel
      key={currentUser.id}
      client={client}
      operatorId={currentUser.id}
      email={currentUser.email}
    />
  )
}
