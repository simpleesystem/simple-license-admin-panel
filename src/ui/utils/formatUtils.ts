import { formatDate } from '../../utils/date'
import {
  UI_DATE_FORMAT_LOCALE,
  UI_DATE_FORMAT_OPTIONS,
  UI_RELEASE_BYTES_UNIT,
  UI_VALUE_PLACEHOLDER,
} from '../constants'

export const formatTenantCreatedAt = (createdAt: string | Date | undefined): string => {
  if (!createdAt) {
    return UI_VALUE_PLACEHOLDER
  }
  const parsedDate = new Date(createdAt)
  if (Number.isNaN(parsedDate.getTime())) {
    return UI_VALUE_PLACEHOLDER
  }
  return new Intl.DateTimeFormat(UI_DATE_FORMAT_LOCALE, UI_DATE_FORMAT_OPTIONS).format(parsedDate)
}

export const formatBytes = (value: number | string | null | undefined): string => {
  if (value == null || value === '') {
    return UI_VALUE_PLACEHOLDER
  }
  const numeric = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(numeric)) {
    return UI_VALUE_PLACEHOLDER
  }
  return `${numeric.toLocaleString()} ${UI_RELEASE_BYTES_UNIT}`
}

export const formatDateSafe = (value: string | Date | number | null | undefined): string => {
  if (value == null || (typeof value === 'string' && value.trim().length === 0)) {
    return UI_VALUE_PLACEHOLDER
  }
  try {
    return formatDate(value)
  } catch {
    return typeof value === 'string' ? value : UI_VALUE_PLACEHOLDER
  }
}
