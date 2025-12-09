import type { AppError } from '../errors/appErrors'
import { mapUnknownToAppError } from '../errors/appErrors'
import type { AppStore } from './store'
import type { ErrorScope } from './types'

type ErrorDispatch = AppStore['dispatch']

type RaiseParams = {
  error: unknown
  dispatch: ErrorDispatch
  scope?: ErrorScope
}

export const raiseError = (dispatch: ErrorDispatch, payload: AppError): AppError => {
  dispatch({
    type: 'error/raise',
    payload,
  })
  return payload
}

export const raiseErrorFromUnknown = ({ error, dispatch, scope }: RaiseParams): AppError => {
  const appError = mapUnknownToAppError(error, scope ?? 'global')
  dispatch({
    type: 'error/raise',
    payload: appError,
  })
  return appError
}
