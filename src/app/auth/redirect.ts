import { ROUTE_PATH_DASHBOARD } from '@/app/constants'

export const LOGIN_REDIRECT_QUERY_PARAM = 'redirect' as const

export const resolvePostLoginRedirect = (search: string, fallbackPath: string = ROUTE_PATH_DASHBOARD): string => {
  const redirectCandidate = new URLSearchParams(search).get(LOGIN_REDIRECT_QUERY_PARAM)
  if (!redirectCandidate) {
    return fallbackPath
  }

  const normalizedRedirect = redirectCandidate.trim()
  if (!normalizedRedirect.startsWith('/')) {
    return fallbackPath
  }
  if (normalizedRedirect.startsWith('//')) {
    return fallbackPath
  }

  return normalizedRedirect
}
