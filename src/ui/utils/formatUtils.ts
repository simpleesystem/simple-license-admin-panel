import { UI_DATE_FORMAT_LOCALE, UI_DATE_FORMAT_OPTIONS, UI_VALUE_PLACEHOLDER } from '../constants'

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
