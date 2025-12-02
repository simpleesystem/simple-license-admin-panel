import { format } from 'date-fns'

import { DATE_FORMAT_SHORT, DATE_FORMAT_TIME } from '../app/constants'

export const formatDate = (value: Date | string | number): string => {
  const date = typeof value === 'string' || typeof value === 'number' ? new Date(value) : value
  return format(date, DATE_FORMAT_SHORT)
}

export const formatDateTime = (value: Date | string | number): string => {
  const date = typeof value === 'string' || typeof value === 'number' ? new Date(value) : value
  return `${formatDate(date)} ${format(date, DATE_FORMAT_TIME)}`
}

